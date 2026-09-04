"""
Stateful Idempotency Mutex — Atomic Guardrail
=============================================
Isolates SQLite WAL strictly for thread-safe and process-safe atomic idempotency leasing.
While primary business transactions live in PostgreSQL, file-level atomic locking with
SQLite WAL provides a zero-network, sub-millisecond local mutual exclusion lock.
"""

import sqlite3
import threading
import os
import hashlib
from datetime import datetime, timezone, timedelta
from typing import Tuple, Optional, Dict, Any
from app.config import SQLITE_MUTEX_PATH


class IdempotencyMutex:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(IdempotencyMutex, cls).__new__(cls)
                cls._instance._init_db()
            return cls._instance

    def _init_db(self):
        self.conn = sqlite3.connect(SQLITE_MUTEX_PATH, check_same_thread=False, timeout=10.0)
        self.conn.execute("PRAGMA journal_mode=WAL;")
        self.conn.execute("PRAGMA synchronous=NORMAL;")
        with self.conn:
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS idempotency_keys (
                    key TEXT PRIMARY KEY,
                    event_type TEXT,
                    status TEXT, -- PENDING, COMPLETED, FAILED
                    trace_id TEXT,
                    created_at TEXT,
                    completed_at TEXT,
                    response_json TEXT
                )
            """)
        self._mutex = threading.Lock()

    def try_acquire(
        self,
        key: str,
        event_type: str = "webhook",
        trace_id: Optional[str] = None
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Atomically tries to acquire execution lock for an event key.
        Returns:
            (acquired: bool, status: str, cached_response: Optional[dict])
        """
        now = datetime.now(timezone.utc).isoformat()
        with self._mutex:
            try:
                cursor = self.conn.cursor()
                cursor.execute(
                    "SELECT status, response_json, trace_id FROM idempotency_keys WHERE key = ?",
                    (key,)
                )
                row = cursor.fetchone()
                if row:
                    status, resp_json, existing_trace = row
                    return False, status, {"cached_status": status, "trace_id": existing_trace}

                cursor.execute(
                    """
                    INSERT INTO idempotency_keys (key, event_type, status, trace_id, created_at)
                    VALUES (?, ?, 'PENDING', ?, ?)
                    """,
                    (key, event_type, trace_id or "", now)
                )
                self.conn.commit()
                return True, "PENDING", None
            except sqlite3.IntegrityError:
                return False, "DUPLICATE_RACE_BLOCKED", None
            except Exception as e:
                return False, f"ERROR: {str(e)}", None

    def mark_completed(self, key: str, response_summary: str = ""):
        """Mark an idempotency key as successfully executed."""
        now = datetime.now(timezone.utc).isoformat()
        with self._mutex:
            try:
                self.conn.execute(
                    """
                    UPDATE idempotency_keys
                    SET status = 'COMPLETED', completed_at = ?, response_json = ?
                    WHERE key = ?
                    """,
                    (now, response_summary, key)
                )
                self.conn.commit()
            except Exception:
                pass

    def get_stats(self) -> Dict[str, Any]:
        """Get telemetry on processed idempotency keys."""
        with self._mutex:
            try:
                cursor = self.conn.cursor()
                cursor.execute("SELECT status, count(*) FROM idempotency_keys GROUP BY status")
                rows = cursor.fetchall()
                counts = {r[0]: r[1] for r in rows}
                return {
                    "total_keys": sum(counts.values()),
                    "pending": counts.get("PENDING", 0),
                    "completed": counts.get("COMPLETED", 0),
                    "storage_engine": "SQLite WAL Mutex (Sub-ms Atomic Lock)",
                }
            except Exception:
                return {"total_keys": 0, "storage_engine": "SQLite WAL Mutex"}


idempotency_mutex = IdempotencyMutex()


# ─── Webhook Idempotency Store (Temporal Duplicates & 7-Day TTL) ─────────────

class WebhookIdempotencyStore:
    """
    Handles Razorpay webhook delivery retries and temporal duplicates.
    Distinguishes identical payloads from unique retried webhook events
    by indexing on SHA256(event_id + ':' + event_timestamp).
    Enforces a statutory 7-day TTL auto-expiration.
    """
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(WebhookIdempotencyStore, cls).__new__(cls)
                cls._instance._init_db()
            return cls._instance

    def _init_db(self):
        self.conn = sqlite3.connect(SQLITE_MUTEX_PATH, check_same_thread=False, timeout=10.0)
        self.conn.execute("PRAGMA journal_mode=WAL;")
        with self.conn:
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS webhook_idempotency (
                    composite_key TEXT PRIMARY KEY,
                    event_id TEXT,
                    event_timestamp TEXT,
                    payload_hash TEXT,
                    processed_at TEXT,
                    expires_at TEXT
                )
            """)
            self.conn.execute("CREATE INDEX IF NOT EXISTS idx_webhook_expires ON webhook_idempotency(expires_at);")
            self.conn.execute("CREATE INDEX IF NOT EXISTS idx_webhook_event ON webhook_idempotency(event_id);")
        self._mutex = threading.Lock()

    @staticmethod
    def compute_composite_key(event_id: str, event_timestamp: str) -> str:
        return hashlib.sha256(f"{event_id}:{event_timestamp}".encode("utf-8")).hexdigest()

    def is_processed(self, event_id: str, event_timestamp: str) -> bool:
        """
        Returns True if this exact (event_id + event_timestamp) was processed before and not expired.
        Returns False if new (even if event_id was previously received with a different timestamp).
        """
        comp_key = self.compute_composite_key(event_id, event_timestamp)
        now = datetime.now(timezone.utc).isoformat()
        with self._mutex:
            cursor = self.conn.cursor()
            cursor.execute(
                "SELECT 1 FROM webhook_idempotency WHERE composite_key = ? AND expires_at > ?",
                (comp_key, now)
            )
            return cursor.fetchone() is not None

    def mark_processed(self, event_id: str, event_timestamp: str, payload_hash: str = ""):
        """
        Stores event with a 7-day TTL and purges any expired historical webhook entries.
        """
        comp_key = self.compute_composite_key(event_id, event_timestamp)
        now_dt = datetime.now(timezone.utc)
        now = now_dt.isoformat()
        expires_at = (now_dt + timedelta(days=7)).isoformat()

        with self._mutex:
            try:
                self.conn.execute(
                    """
                    INSERT OR REPLACE INTO webhook_idempotency
                    (composite_key, event_id, event_timestamp, payload_hash, processed_at, expires_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (comp_key, event_id, event_timestamp, payload_hash, now, expires_at)
                )
                # Purge expired entries older than 7 days
                self.conn.execute("DELETE FROM webhook_idempotency WHERE expires_at <= ?", (now,))
                self.conn.commit()
            except Exception as e:
                pass


webhook_idempotency_store = WebhookIdempotencyStore()


# ─── Rate Limit Defense Tracker (Sliding Window Counter) ─────────────────────

class RateLimitTracker:
    """
    Cross-process sliding window rate limit defense for external APIs:
    - Razorpay: 100 requests / minute
    - Twilio: 50 requests / minute
    - SendGrid: 100 requests / minute

    Persists atomic bucket counters in SQLite WAL to prevent multi-worker quota multiplication.
    """
    _instance = None
    _lock = threading.Lock()

    DEFAULT_LIMITS = {
        "razorpay": 100,
        "twilio": 50,
        "sendgrid": 100,
    }

    def __new__(cls, db_path: Optional[str] = None):
        with cls._lock:
            if db_path is None or db_path == SQLITE_MUTEX_PATH:
                if cls._instance is None:
                    cls._instance = super(RateLimitTracker, cls).__new__(cls)
                    cls._instance._init_db(SQLITE_MUTEX_PATH)
                return cls._instance
            instance = super(RateLimitTracker, cls).__new__(cls)
            instance._init_db(db_path)
            return instance

    def __init__(self, db_path: Optional[str] = None):
        pass

    def _init_db(self, db_path: str = SQLITE_MUTEX_PATH):
        self.db_path = db_path
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False, timeout=15.0, isolation_level=None)
        self.conn.execute("PRAGMA journal_mode=WAL;")
        self.conn.execute("PRAGMA synchronous=NORMAL;")
        self.conn.execute("PRAGMA busy_timeout=15000;")
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS rate_limits (
                api_name TEXT NOT NULL,
                window_bucket INTEGER NOT NULL,
                call_count INTEGER NOT NULL DEFAULT 1,
                PRIMARY KEY (api_name, window_bucket)
            )
        """)
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(api_name, window_bucket);")
        self._mutex = threading.Lock()

    def check_limit(self, api_name: str) -> bool:
        """Returns True if within rate limit, False if threshold exceeded."""
        api_key = api_name.lower()
        limit = self.DEFAULT_LIMITS.get(api_key, 100)
        now = int(datetime.now(timezone.utc).timestamp())
        cutoff = now - 60
        with self._mutex:
            try:
                cursor = self.conn.cursor()
                cursor.execute(
                    "SELECT COALESCE(SUM(call_count), 0) FROM rate_limits WHERE api_name = ? AND window_bucket > ?",
                    (api_key, cutoff)
                )
                row = cursor.fetchone()
                current_usage = row[0] if row else 0
                return current_usage < limit
            except Exception:
                return True

    def record_call(self, api_name: str) -> bool:
        """
        Records an API call. Returns True if accepted, False if rate limited.
        Atomically inspects and increments within an immediate write transaction.
        """
        api_key = api_name.lower()
        limit = self.DEFAULT_LIMITS.get(api_key, 100)
        now = datetime.now(timezone.utc).timestamp()
        now_bucket = int(now)
        cutoff = now_bucket - 60

        with self._mutex:
            cursor = self.conn.cursor()
            try:
                cursor.execute("BEGIN IMMEDIATE")
                cursor.execute(
                    "SELECT COALESCE(SUM(call_count), 0) FROM rate_limits WHERE api_name = ? AND window_bucket > ?",
                    (api_key, cutoff)
                )
                row = cursor.fetchone()
                current_usage = row[0] if row else 0

                if current_usage >= limit:
                    cursor.execute("ROLLBACK")
                    return False

                cursor.execute(
                    """
                    INSERT INTO rate_limits (api_name, window_bucket, call_count)
                    VALUES (?, ?, 1)
                    ON CONFLICT(api_name, window_bucket) DO UPDATE SET call_count = call_count + 1
                    """,
                    (api_key, now_bucket)
                )
                # Purge obsolete buckets older than 2 minutes
                cursor.execute(
                    "DELETE FROM rate_limits WHERE api_name = ? AND window_bucket <= ?",
                    (api_key, cutoff - 60)
                )
                cursor.execute("COMMIT")
                return True
            except Exception:
                try:
                    cursor.execute("ROLLBACK")
                except Exception:
                    pass
                return False

    def get_rate_limit_status(self, api_name: str) -> Dict[str, Any]:
        """Telemetry on API rate limit headroom and reset countdown."""
        api_key = api_name.lower()
        limit = self.DEFAULT_LIMITS.get(api_key, 100)
        now = datetime.now(timezone.utc).timestamp()
        now_bucket = int(now)
        cutoff = now_bucket - 60

        with self._mutex:
            try:
                cursor = self.conn.cursor()
                cursor.execute(
                    "SELECT COALESCE(SUM(call_count), 0), MIN(window_bucket) FROM rate_limits WHERE api_name = ? AND window_bucket > ?",
                    (api_key, cutoff)
                )
                row = cursor.fetchone()
                current_count = row[0] if row else 0
                min_bucket = row[1] if row and row[1] is not None else None
                remaining = max(0, limit - current_count)
                reset_seconds = max(0, int(60 - (now - min_bucket))) if (current_count > 0 and min_bucket is not None) else 0
                return {
                    "api_name": api_name,
                    "limit_per_min": limit,
                    "current_usage": current_count,
                    "remaining": remaining,
                    "reset_seconds": reset_seconds,
                    "is_rate_limited": current_count >= limit,
                }
            except Exception:
                return {
                    "api_name": api_name,
                    "limit_per_min": limit,
                    "current_usage": 0,
                    "remaining": limit,
                    "reset_seconds": 0,
                    "is_rate_limited": False,
                }

    def close(self):
        """Close database connection."""
        with self._mutex:
            try:
                self.conn.close()
            except Exception:
                pass


rate_limit_tracker = RateLimitTracker()
