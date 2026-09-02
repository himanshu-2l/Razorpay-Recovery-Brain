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
from datetime import datetime, timezone
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
