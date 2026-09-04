"""
Cryptographic Audit Ledger — Tamper-Resistant Decision Proof
============================================================
Chains every recovery intent, compliance check, and execution event into an
immutable cryptographic SHA-256 hash sequence (prev_hash -> content_hash).

Guarantees:
1. Intent-before-execution logging (no retroactive ledger tampering).
2. Verifiable mathematical integrity from Genesis Block to current head.
3. Machine-readable audit verification for evaluators and compliance officers.
4. SQLite-backed persistence: audit history survives process restarts and is
   verifiable by standalone out-of-process tools (verify_ledger.py) without
   requiring a running server.
"""

import hashlib
import json
import sqlite3
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

# DB lives next to this module file — stable path regardless of cwd
_DB_PATH = Path(__file__).parent / "audit_ledger.db"


class AuditRecord:
    def __init__(
        self,
        sequence: int,
        event_type: str,
        case_id: str,
        timestamp: str,
        prev_hash: str,
        payload: Dict[str, Any],
        content_hash: str,
        merchant_id: str = "mid_default"
    ):
        self.sequence = sequence
        self.event_type = event_type
        self.case_id = case_id
        self.timestamp = timestamp
        self.prev_hash = prev_hash
        self.payload = payload
        self.content_hash = content_hash
        self.merchant_id = merchant_id

    def to_dict(self) -> Dict[str, Any]:
        return {
            "sequence": self.sequence,
            "merchant_id": self.merchant_id,
            "event_type": self.event_type,
            "case_id": self.case_id,
            "timestamp": self.timestamp,
            "prev_hash": self.prev_hash,
            "content_hash": self.content_hash,
            "payload": self.payload,
        }


class CryptographicAuditLedger:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(CryptographicAuditLedger, cls).__new__(cls)
                cls._instance._init_ledger()
            return cls._instance

    def _init_ledger(self):
        self._records: List[AuditRecord] = []
        self._mutex = threading.Lock()
        self._db_path = _DB_PATH
        self._ensure_db_schema()
        # Seed Genesis Block only on first-ever run (empty DB).
        # If DB already has rows, reload them immediately so in-memory state is populated.
        if self._db_row_count() == 0:
            self._append_genesis()
        else:
            self.reload_from_db()

    def reset(self):
        """Reset in-memory and database state (for test isolation)."""
        with self._mutex:
            self._records = []
            if self._db_path.exists():
                try:
                    conn = sqlite3.connect(str(self._db_path))
                    conn.execute("DELETE FROM audit_records")
                    conn.commit()
                    conn.close()
                except Exception:
                    pass
            self._append_genesis()


    def _ensure_db_schema(self):
        """Create the audit_records table if it doesn't already exist."""
        conn = sqlite3.connect(str(self._db_path))
        try:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS audit_records (
                    sequence     INTEGER PRIMARY KEY,
                    event_type   TEXT NOT NULL,
                    case_id      TEXT NOT NULL,
                    timestamp    TEXT NOT NULL,
                    prev_hash    TEXT NOT NULL,
                    payload      TEXT NOT NULL,
                    content_hash TEXT NOT NULL,
                    merchant_id  TEXT NOT NULL
                )
            """)
            conn.commit()
        finally:
            conn.close()

    def _db_row_count(self) -> int:
        self._ensure_db_schema()
        conn = sqlite3.connect(str(self._db_path))
        try:
            row = conn.execute("SELECT COUNT(*) FROM audit_records").fetchone()
            return row[0] if row else 0
        finally:
            conn.close()

    def _write_to_db(self, record: "AuditRecord"):
        """Persist one AuditRecord to SQLite. Must be called while _mutex is held."""
        self._ensure_db_schema()
        conn = sqlite3.connect(str(self._db_path))
        try:
            conn.execute(
                """INSERT OR IGNORE INTO audit_records
                   (sequence, event_type, case_id, timestamp, prev_hash,
                    payload, content_hash, merchant_id)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    record.sequence,
                    record.event_type,
                    record.case_id,
                    record.timestamp,
                    record.prev_hash,
                    json.dumps(record.payload, sort_keys=True),
                    record.content_hash,
                    record.merchant_id,
                )
            )
            conn.commit()
        finally:
            conn.close()

    def reload_from_db(self) -> int:
        """
        Load persisted audit history from SQLite into in-memory state.
        Call this on server startup so history survives process restarts.
        Returns the number of blocks loaded (0 if DB is empty or not found).
        """
        with self._mutex:
            if not self._db_path.exists():
                return 0
            conn = sqlite3.connect(str(self._db_path))
            try:
                rows = conn.execute(
                    "SELECT sequence, event_type, case_id, timestamp, prev_hash, "
                    "payload, content_hash, merchant_id "
                    "FROM audit_records ORDER BY sequence ASC"
                ).fetchall()
            finally:
                conn.close()

            if not rows:
                return 0

            self._records = []
            for row in rows:
                seq, event_type, case_id, ts, prev_hash, payload_json, content_hash, mid = row
                self._records.append(AuditRecord(
                    sequence=seq,
                    event_type=event_type,
                    case_id=case_id,
                    timestamp=ts,
                    prev_hash=prev_hash,
                    payload=json.loads(payload_json),
                    content_hash=content_hash,
                    merchant_id=mid,
                ))
            return len(self._records)

    def _canonical_string(
        self,
        sequence: int,
        event_type: str,
        case_id: str,
        timestamp: str,
        prev_hash: str,
        payload: Dict[str, Any],
        merchant_id: str = "mid_default"
    ) -> str:
        data = {
            "seq": sequence,
            "mid": merchant_id,
            "event": event_type,
            "case_id": case_id,
            "ts": timestamp,
            "prev": prev_hash,
            "data": payload,
        }
        return json.dumps(data, sort_keys=True, separators=(",", ":"))

    def _append_genesis(self):
        now = datetime.now(timezone.utc).isoformat()
        genesis_prev = "0" * 64
        genesis_payload = {"system": "Razorpay Revenue Recovery Brain", "genesis_at": now}
        canonical = self._canonical_string(1, "GENESIS_BLOCK", "system_root", now, genesis_prev, genesis_payload, "mid_system")
        genesis_hash = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
        record = AuditRecord(
            sequence=1,
            event_type="GENESIS_BLOCK",
            case_id="system_root",
            timestamp=now,
            prev_hash=genesis_prev,
            payload=genesis_payload,
            content_hash=genesis_hash,
            merchant_id="mid_system"
        )
        self._records.append(record)
        self._write_to_db(record)

    def record_event(
        self,
        event_type: str,
        case_id: str,
        payload: Dict[str, Any],
        merchant_id: str = "mid_default"
    ) -> AuditRecord:
        """
        Append a new tamper-evident record to the cryptographic ledger.
        Writes to both the in-memory chain and SQLite for persistence.
        """
        with self._mutex:
            if not self._records:
                self.reload_from_db()
                if not self._records:
                    self._append_genesis()
            now = datetime.now(timezone.utc).isoformat()
            sequence = len(self._records) + 1
            prev_hash = self._records[-1].content_hash
            canonical = self._canonical_string(sequence, event_type, case_id, now, prev_hash, payload, merchant_id)
            content_hash = hashlib.sha256(canonical.encode("utf-8")).hexdigest()

            record = AuditRecord(
                sequence=sequence,
                event_type=event_type,
                case_id=case_id,
                timestamp=now,
                prev_hash=prev_hash,
                payload=payload,
                content_hash=content_hash,
                merchant_id=merchant_id
            )
            self._records.append(record)
            self._write_to_db(record)  # Persist to disk
            return record

    def verify_integrity(self) -> Tuple[bool, int, Optional[str]]:
        """
        Walk the internal hash chain from block 1 to head.
        Returns: (is_valid: bool, total_verified: int, error_reason: Optional[str])
        """
        with self._mutex:
            if not self._records:
                return False, 0, "Empty ledger"

            for i, record in enumerate(self._records):
                # Verify previous hash link
                if i > 0:
                    expected_prev = self._records[i - 1].content_hash
                    if record.prev_hash != expected_prev:
                        return False, i, f"Broken chain at block {record.sequence}: prev_hash mismatch"

                # Recompute content hash
                canonical = self._canonical_string(
                    record.sequence,
                    record.event_type,
                    record.case_id,
                    record.timestamp,
                    record.prev_hash,
                    record.payload,
                    record.merchant_id
                )
                recomputed_hash = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
                if record.content_hash != recomputed_hash:
                    return False, i, f"Hash mismatch at block {record.sequence}: content tampered"

            return True, len(self._records), None

    def export_chain(self, merchant_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Export full cryptographic chain for third-party independent verification."""
        with self._mutex:
            if merchant_id:
                return [r.to_dict() for r in self._records if r.merchant_id in (merchant_id, "mid_system")]
            return [r.to_dict() for r in self._records]

    def get_records(self, case_id: Optional[str] = None, merchant_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve recent ledger records with optional filtering."""
        with self._mutex:
            filtered = self._records
            if merchant_id:
                filtered = [r for r in filtered if r.merchant_id == merchant_id]
            if case_id:
                filtered = [r for r in filtered if r.case_id == case_id]
            return [r.to_dict() for r in filtered[-limit:]]


# Singleton instance
audit_ledger = CryptographicAuditLedger()
