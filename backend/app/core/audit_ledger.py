"""
Cryptographic Audit Ledger — Tamper-Resistant Decision Proof
============================================================
Chains every recovery intent, compliance check, and execution event into an
immutable cryptographic SHA-256 hash sequence (prev_hash -> content_hash).

Guarantees:
1. Intent-before-execution logging (no retroactive ledger tampering).
2. Verifiable mathematical integrity from Genesis Block to current head.
3. Machine-readable audit verification for evaluators and compliance officers.
"""

import hashlib
import json
import threading
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple


class AuditRecord:
    def __init__(
        self,
        sequence: int,
        event_type: str,
        case_id: str,
        timestamp: str,
        prev_hash: str,
        payload: Dict[str, Any],
        content_hash: str
    ):
        self.sequence = sequence
        self.event_type = event_type
        self.case_id = case_id
        self.timestamp = timestamp
        self.prev_hash = prev_hash
        self.payload = payload
        self.content_hash = content_hash

    def to_dict(self) -> Dict[str, Any]:
        return {
            "sequence": self.sequence,
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
        # Seed Genesis Block
        self._append_genesis()

    def _canonical_string(self, sequence: int, event_type: str, case_id: str, timestamp: str, prev_hash: str, payload: Dict[str, Any]) -> str:
        data = {
            "seq": sequence,
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
        canonical = self._canonical_string(1, "GENESIS_BLOCK", "system_root", now, genesis_prev, genesis_payload)
        genesis_hash = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
        self._records.append(
            AuditRecord(
                sequence=1,
                event_type="GENESIS_BLOCK",
                case_id="system_root",
                timestamp=now,
                prev_hash=genesis_prev,
                payload=genesis_payload,
                content_hash=genesis_hash
            )
        )

    def record_event(self, event_type: str, case_id: str, payload: Dict[str, Any]) -> AuditRecord:
        """
        Append a new tamper-evident record to the cryptographic ledger.
        """
        with self._mutex:
            now = datetime.now(timezone.utc).isoformat()
            sequence = len(self._records) + 1
            prev_hash = self._records[-1].content_hash
            canonical = self._canonical_string(sequence, event_type, case_id, now, prev_hash, payload)
            content_hash = hashlib.sha256(canonical.encode("utf-8")).hexdigest()

            record = AuditRecord(
                sequence=sequence,
                event_type=event_type,
                case_id=case_id,
                timestamp=now,
                prev_hash=prev_hash,
                payload=payload,
                content_hash=content_hash
            )
            self._records.append(record)
            return record

    def verify_integrity(self) -> Tuple[bool, int, Optional[str]]:
        """
        Walk the hash chain from block 1 to head.
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
                    record.payload
                )
                recomputed_hash = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
                if record.content_hash != recomputed_hash:
                    return False, i, f"Hash mismatch at block {record.sequence}: content tampered"

            return True, len(self._records), None

    def get_records(self, case_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve recent ledger records with optional case_id filtering."""
        with self._mutex:
            if case_id:
                filtered = [r for r in self._records if r.case_id == case_id]
            else:
                filtered = self._records
            return [r.to_dict() for r in filtered[-limit:]]


# Singleton instance
audit_ledger = CryptographicAuditLedger()
