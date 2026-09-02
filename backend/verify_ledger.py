#!/usr/bin/env python3
"""
Standalone Cryptographic Audit Ledger Independent Verifier
==========================================================
Zero-dependency cryptographic verification tool.

Allows third-party auditors, merchants, and compliance officers to independently
verify the mathematical integrity of the SHA-256 hash sequence from Genesis to Head
without trusting the backend server or in-memory state.

Usage:
  1. Verify in-memory/local ledger:
     python verify_ledger.py

  2. Verify an exported ledger JSON file:
     python verify_ledger.py exported_ledger.json

  3. Verify against a live HTTP API endpoint:
     python verify_ledger.py http://localhost:8000/api/audit-ledger/export
"""

import sys
import json
import hashlib
import urllib.request
from typing import List, Dict, Any, Tuple


def canonical_string(
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


def verify_chain(records: List[Dict[str, Any]]) -> Tuple[bool, int, List[str]]:
    """
    Independently recalculates and verifies SHA-256 hashes across all blocks.
    Returns: (is_valid, verified_count, logs)
    """
    logs = []
    if not records:
        return False, 0, ["Error: Ledger record set is empty."]

    logs.append(f"Starting verification of {len(records)} cryptographic audit blocks...")

    for i, rec in enumerate(records):
        seq = rec.get("sequence", i + 1)
        event_type = rec.get("event_type", "UNKNOWN")
        case_id = rec.get("case_id", "unknown")
        ts = rec.get("timestamp", "")
        prev_hash = rec.get("prev_hash", "")
        content_hash = rec.get("content_hash", "")
        payload = rec.get("payload", {})
        merchant_id = rec.get("merchant_id", "mid_default")

        # 1. Verify previous hash chaining
        if i > 0:
            expected_prev = records[i - 1].get("content_hash")
            if prev_hash != expected_prev:
                logs.append(f"[FAIL] TAMPER DETECTED at Block #{seq}: prev_hash mismatch!")
                logs.append(f"   Expected: {expected_prev}")
                logs.append(f"   Actual:   {prev_hash}")
                return False, i, logs

        # 2. Recompute content hash from canonical serialized bytes
        canonical = canonical_string(seq, event_type, case_id, ts, prev_hash, payload, merchant_id)
        recomputed_hash = hashlib.sha256(canonical.encode("utf-8")).hexdigest()

        if content_hash != recomputed_hash:
            logs.append(f"[FAIL] CRYPTOGRAPHIC MISMATCH at Block #{seq} ({event_type}): Content was altered!")
            logs.append(f"   Stored Hash:     {content_hash}")
            logs.append(f"   Calculated Hash: {recomputed_hash}")
            return False, i, logs

        # Sample preview
        if i == 0:
            logs.append(f"  [Genesis] Block #1: {content_hash[:16]}... (Genesis Validated)")
        elif i == len(records) - 1 or i < 5:
            logs.append(f"  [Verified] Block #{seq:03d} | {event_type:<28} | Hash: {content_hash[:16]}...")

    logs.append(f"[OK] MATHEMATICAL PROOF CONFIRMED: All {len(records)} blocks verified tamper-free.")
    logs.append(f"   Genesis Block Hash: {records[0].get('content_hash')}")
    logs.append(f"   Current Head Hash:  {records[-1].get('content_hash')}")
    return True, len(records), logs


def main():
    target = sys.argv[1] if len(sys.argv) > 1 else None

    print("=" * 70)
    print("  RAZORPAY REVENUE RECOVERY BRAIN -- CRYPTOGRAPHIC LEDGER AUDITOR")
    print("=" * 70)

    records = []

    if target and (target.startswith("http://") or target.startswith("https://")):
        print(f"Fetching ledger export from live endpoint: {target}")
        try:
            req = urllib.request.Request(target, headers={"User-Agent": "LedgerVerifier/1.0"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                records = data.get("records", data) if isinstance(data, dict) else data
        except Exception as e:
            print(f"Failed to fetch from URL: {e}")
            sys.exit(1)
    elif target:
        print(f"Reading ledger export from file: {target}")
        try:
            with open(target, "r", encoding="utf-8") as f:
                data = json.load(f)
                records = data.get("records", data) if isinstance(data, dict) else data
        except Exception as e:
            print(f"Failed to read file: {e}")
            sys.exit(1)
    else:
        print("Importing local in-memory ledger instance...")
        try:
            from app.core.audit_ledger import audit_ledger
            records = audit_ledger.export_chain()
        except ImportError:
            print("Could not import app.core.audit_ledger. Specify a JSON file or URL target.")
            sys.exit(1)

    is_valid, verified_count, logs = verify_chain(records)

    for line in logs:
        print(line)

    print("=" * 70)
    if is_valid:
        print(f"VERDICT: PASSED (100% Chain Integrity | {verified_count} Blocks Verified)")
        sys.exit(0)
    else:
        print(f"VERDICT: FAILED (Chain Broken at Block #{verified_count})")
        sys.exit(1)


if __name__ == "__main__":
    main()
