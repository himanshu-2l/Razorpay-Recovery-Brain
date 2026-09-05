"""
Unit Tests for RAILS Verification-Native Clearing Engine
=========================================================
Verifies formal mathematical properties benchmarked from:
"RAILS: Verification-Native Clearing For Agentic Commerce" (arXiv:2606.08790).
"""

import pytest
import hashlib
import json
from app.services.rails_clearing import (
    AdmissibilityClass,
    is_admissible,
    meet,
    join,
    ObligationObject,
    EvidenceItem,
    EvidenceEnvelope,
    rails_clearing,
)
from app.services.receipt_service import receipt_service


def test_poset_partial_ordering_and_soundness():
    """
    Test Poset Λ: SELF ≺ SIGN ≺ {WIT, REC} ≺ ATT ≺ PROOF.
    Verify the fundamental financial clearing rule:
    Customer promise (SIGN) or Agent claim (SELF) CANNOT satisfy financial settlement (REC).
    """
    # 1. Floor = REC (The statutory standard for financial clearing)
    assert is_admissible(AdmissibilityClass.PROOF, AdmissibilityClass.REC) is True
    assert is_admissible(AdmissibilityClass.ATT, AdmissibilityClass.REC) is True
    assert is_admissible(AdmissibilityClass.REC, AdmissibilityClass.REC) is True

    # Critical Soundness tests: Agent self-report & Debtor promise FAIL financial floor
    assert is_admissible(AdmissibilityClass.SELF, AdmissibilityClass.REC) is False
    assert is_admissible(AdmissibilityClass.SIGN, AdmissibilityClass.REC) is False
    assert is_admissible(AdmissibilityClass.WIT, AdmissibilityClass.REC) is False  # Incomparable: audio ≠ bank switch

    # 2. Floor = SIGN (Acceptable for soft promise logging)
    assert is_admissible(AdmissibilityClass.SIGN, AdmissibilityClass.SIGN) is True
    assert is_admissible(AdmissibilityClass.WIT, AdmissibilityClass.SIGN) is True
    assert is_admissible(AdmissibilityClass.REC, AdmissibilityClass.SIGN) is True
    assert is_admissible(AdmissibilityClass.SELF, AdmissibilityClass.SIGN) is False

    # 3. Meet (∧, weakest link in chain) & Join (∨, strongest surviving proof)
    chain = [AdmissibilityClass.PROOF, AdmissibilityClass.REC, AdmissibilityClass.SIGN]
    assert meet(chain) == AdmissibilityClass.SIGN
    assert join(chain) == AdmissibilityClass.PROOF


def test_obligation_contract_compilation():
    """
    Test Obligation Object O = ⟨P, A, d, A^c, φ_O, h_O⟩.
    Verify deterministic cryptographic anchor h_O.
    """
    case = {
        "id": "case_test_rails_001",
        "merchant_id": "mid_hDFC_corp",
        "customer_id": "cust_rahul_sharma",
        "amount_at_risk": 15000.0,
    }

    obligation = rails_clearing.compile_obligation(case)

    assert obligation.case_id == "case_test_rails_001"
    assert obligation.amount_at_risk_inr == 15000.0
    assert obligation.admissibility_floor == AdmissibilityClass.REC
    assert len(obligation.hash_anchor) == 64  # Valid SHA-256
    
    # Recomputing the canonical hash matches h_O
    canonical = json.dumps(
        {
            "obligation_id": obligation.obligation_id,
            "case_id": obligation.case_id,
            "merchant_id": obligation.merchant_id,
            "customer_id": obligation.customer_id,
            "amount": obligation.amount_at_risk_inr,
            "floor": obligation.admissibility_floor.value,
            "created_at": obligation.created_at,
        },
        sort_keys=True,
        separators=(",", ":")
    )
    expected_hash = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    assert obligation.hash_anchor == expected_hash


def test_evidence_envelope_assembly_and_finality():
    """
    Test Evidence Envelope assembly:
    - Case in progress (unrecovered) -> aggregate admissibility < REC -> PROVISIONAL
    - Case recovered with webhook -> aggregate admissibility >= REC -> FINAL
    """
    # Scenario A: In-progress PTP negotiation (not yet paid)
    case_pending = {
        "id": "case_ptp_pending",
        "status": "awaiting_response",
        "amount_at_risk": 7500.0,
        "amount_recovered": 0.0,
        "chosen_intervention": "negotiate",
        "ptp_logged": True,
        "compliance_status": "allowed",
    }
    obl_pending = rails_clearing.compile_obligation(case_pending)
    env_pending = rails_clearing.assemble_evidence_envelope(case_pending, obl_pending)
    eval_pending = rails_clearing.evaluate_clearing(case_pending, obl_pending, env_pending)

    assert eval_pending["finality_status"] == "PROVISIONAL"
    assert len(eval_pending["envelope_hash"]) == 64

    # Scenario B: Fully recovered with Razorpay HMAC webhook
    case_recovered = {
        "id": "case_webhook_cleared",
        "status": "recovered",
        "amount_at_risk": 7500.0,
        "amount_recovered": 7500.0,
        "chosen_intervention": "retry",
        "compliance_status": "allowed",
    }
    obl_rec = rails_clearing.compile_obligation(case_recovered)
    env_rec = rails_clearing.assemble_evidence_envelope(case_recovered, obl_rec)
    eval_rec = rails_clearing.evaluate_clearing(case_recovered, obl_rec, env_rec)

    assert eval_rec["finality_status"] == "FINAL"
    assert eval_rec["soundness_verified"] is True
    assert eval_rec["admissibility_floor"] == "REC"
    assert "Soundness Certified" in eval_rec["soundness_statement"]


def test_decision_receipt_contains_rails_clearing():
    """
    Test that DecisionReceiptService embeds the full RAILS clearing payload
    into the sealed receipt.
    """
    from app.core.audit_ledger import audit_ledger

    case = {
        "id": "case_full_receipt_test",
        "amount_at_risk": 12000.0,
        "amount_recovered": 12000.0,
        "root_cause": "td_bank_down",
        "chosen_intervention": "smart_retry",
        "status": "recovered",
        "compliance_status": "allowed",
    }

    audit_ledger.record_event(
        event_type="ACTION_INTENT",
        case_id=case["id"],
        payload={"root_cause": case["root_cause"], "amount": case["amount_at_risk"]}
    )

    receipt = receipt_service.generate_receipt(case)

    # Core receipt checks
    assert receipt["receipt_id"].startswith("rcpt_")
    assert "sha256_seal" in receipt
    assert "rails_clearing" in receipt

    # RAILS specific checks
    clearing = receipt["rails_clearing"]
    assert "obligation_hash" in clearing
    assert "envelope_hash" in clearing
    assert clearing["admissibility_floor"] == "REC"
    assert clearing["soundness_verified"] is True
    assert clearing["finality_status"] == "FINAL"

    # Evidence items inside envelope
    evidence_items = clearing["evidence_envelope"]["evidence_items"]
    assert len(evidence_items) >= 3
    sources = [e["source"] for e in evidence_items]
    assert "RecoveryBrainClassifier" in sources
    assert "RazorpayPaymentGatewayWebhook" in sources
    assert "TamperResistantAuditLedger" in sources


def test_distinct_merkle_anchors_across_cases_no_hardcoded_fallback():
    """
    Regression Test: Ensure that assemble_evidence_envelope:
    1. Returns NO PROOF-class item if a case has no audit ledger records (honest fallback).
    2. Returns distinct, real SHA-256 hash-chain heads when cases have ledger entries.
    3. Never falls back to the deprecated static 'c1fd6cfa023e19803bd' string.
    """
    from app.core.audit_ledger import audit_ledger

    # Case A: No ledger records yet -> should have NO PROOF item
    case_empty = {
        "id": "case_unrecorded_ledger_test",
        "merchant_id": "mid_test",
        "customer_id": "cust_empty",
        "amount_at_risk": 5000.0,
    }
    obl_empty = rails_clearing.compile_obligation(case_empty)
    env_empty = rails_clearing.assemble_evidence_envelope(case_empty, obl_empty)
    proof_items_empty = [
        item for item in env_empty.evidence_items
        if item.admissibility == AdmissibilityClass.PROOF
    ]
    assert len(proof_items_empty) == 0, "Unrecorded case must NOT emit a fabricated PROOF-class item"

    # Case 1: Record event in ledger
    case_1 = {
        "id": "case_crypto_anchor_001",
        "merchant_id": "mid_test_1",
        "customer_id": "cust_001",
        "amount_at_risk": 25000.0,
        "root_cause": "td_bank_down",
        "chosen_intervention": "smart_retry",
    }
    rec_1 = audit_ledger.record_event(
        event_type="ACTION_INTENT",
        case_id=case_1["id"],
        payload={"step": "diagnosis", "amount": 25000.0}
    )
    obl_1 = rails_clearing.compile_obligation(case_1)
    env_1 = rails_clearing.assemble_evidence_envelope(case_1, obl_1)

    # Case 2: Record event in ledger
    case_2 = {
        "id": "case_crypto_anchor_002",
        "merchant_id": "mid_test_2",
        "customer_id": "cust_002",
        "amount_at_risk": 75000.0,
        "root_cause": "insufficient_funds",
        "chosen_intervention": "whatsapp",
    }
    rec_2 = audit_ledger.record_event(
        event_type="ACTION_INTENT",
        case_id=case_2["id"],
        payload={"step": "diagnosis", "amount": 75000.0}
    )
    obl_2 = rails_clearing.compile_obligation(case_2)
    env_2 = rails_clearing.assemble_evidence_envelope(case_2, obl_2)

    # Extract PROOF items
    proof_1 = [i for i in env_1.evidence_items if i.admissibility == AdmissibilityClass.PROOF]
    proof_2 = [i for i in env_2.evidence_items if i.admissibility == AdmissibilityClass.PROOF]

    assert len(proof_1) == 1, "Case 1 must have exactly 1 PROOF item"
    assert len(proof_2) == 1, "Case 2 must have exactly 1 PROOF item"

    anchor_1 = proof_1[0].payload_data.get("merkle_anchor")
    anchor_2 = proof_2[0].payload_data.get("merkle_anchor")

    # Assertions
    assert anchor_1 is not None and anchor_2 is not None
    assert len(anchor_1) == 64, "merkle_anchor must be a 64-char hex SHA-256 string"
    assert len(anchor_2) == 64, "merkle_anchor must be a 64-char hex SHA-256 string"
    assert anchor_1 == rec_1.content_hash, "Case 1 anchor must equal Case 1 audit record hash"
    assert anchor_2 == rec_2.content_hash, "Case 2 anchor must equal Case 2 audit record hash"

    # CRITICAL: anchors must NOT be equal across different cases
    assert anchor_1 != anchor_2, "Two different cases must NOT have identical merkle_anchor values"

    # Regression defense: neither anchor is the old hardcoded string
    assert anchor_1 != "c1fd6cfa023e19803bd"
    assert anchor_2 != "c1fd6cfa023e19803bd"
