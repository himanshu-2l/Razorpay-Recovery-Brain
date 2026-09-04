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
    case = {
        "id": "case_full_receipt_test",
        "amount_at_risk": 12000.0,
        "amount_recovered": 12000.0,
        "root_cause": "td_bank_down",
        "chosen_intervention": "smart_retry",
        "status": "recovered",
        "compliance_status": "allowed",
    }

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
