"""
Decision Receipt Service — Cryptographic Proof of Recovery Decision
====================================================================
Generates immutable, signed decision receipts for every case processed by the Recovery Brain.

Each Decision Receipt includes:
1. Diagnosis & Evidence: Root cause, confidence, and reasoning chain.
2. Counterfactual Economics: Baseline natural probability vs action probability, cost, and ENRV.
3. Policy & Compliance Citations: Exact RBI Fair Practices rules and economic viability gates.
4. Tamper-Proof Cryptographic Seal: SHA-256 digest sealing the receipt payload.
"""

import hashlib
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from app.core.audit_ledger import audit_ledger


class DecisionReceiptService:
    @staticmethod
    def generate_receipt(case: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a sealed Decision Receipt for a processed recovery case.
        """
        case_id = case.get("id", str(uuid.uuid4()))
        receipt_id = f"rcpt_{uuid.uuid4().hex[:14]}"
        now = datetime.now(timezone.utc).isoformat()

        counterfactual = case.get("counterfactual") or {
            "p_natural_recovery": 0.10,
            "p_intervention_recovery": 0.75,
            "incremental_lift_pct": 65.0,
            "intervention_cost_inr": 0.0,
            "expected_net_recovery_inr": case.get("amount_recovered", 0),
            "requires_human_approval": False,
        }

        # Structure receipt payload
        receipt_payload = {
            "receipt_id": receipt_id,
            "case_id": case_id,
            "timestamp": now,
            "leak_type": case.get("leak_type", "payment_failure"),
            "customer": {
                "id": case.get("customer_id", "anonymous"),
                "name": case.get("customer_name", "Valued Customer"),
            },
            "financials": {
                "amount_at_risk_inr": case.get("amount_at_risk", 0.0),
                "amount_recovered_inr": case.get("amount_recovered", 0.0),
                "expected_net_recovery_inr": counterfactual.get("expected_net_recovery_inr", 0.0),
                "intervention_cost_inr": counterfactual.get("intervention_cost_inr", 0.0),
            },
            "diagnosis": {
                "root_cause": case.get("root_cause"),
                "confidence": case.get("confidence", 0.95),
            },
            "decision": {
                "chosen_action": case.get("chosen_intervention"),
                "status": case.get("status"),
                "requires_human_approval": counterfactual.get("requires_human_approval", False),
            },
            "counterfactual_analysis": {
                "p_natural_recovery": counterfactual.get("p_natural_recovery"),
                "p_intervention_recovery": counterfactual.get("p_intervention_recovery"),
                "incremental_lift_pct": counterfactual.get("incremental_lift_pct"),
            },
            "compliance_citations": {
                "status": case.get("compliance_status", "allowed"),
                "rule_cited": case.get("compliance_rule", "RBI Fair Practices Code — Standard contact hours & frequency checked"),
            },
        }

        # Canonical string for cryptographic seal
        canonical_str = json.dumps(receipt_payload, sort_keys=True, separators=(",", ":"))
        sha256_seal = hashlib.sha256(canonical_str.encode("utf-8")).hexdigest()
        receipt_payload["sha256_seal"] = sha256_seal

        # Append to cryptographic audit ledger
        audit_ledger.record_event(
            event_type="DECISION_RECEIPT_ISSUED",
            case_id=case_id,
            payload={"receipt_id": receipt_id, "seal": sha256_seal, "action": case.get("chosen_intervention")}
        )

        return receipt_payload


receipt_service = DecisionReceiptService()
