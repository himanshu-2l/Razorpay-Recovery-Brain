"""
Test Suite: Competitive Innovations & Uncontested Moat
======================================================
Verifies competitor-inspired architectural breakthroughs:
1. Deterministic Hinglish Time-Phrase Parsing (recoup)
2. 3-Phase PTP Lifecycle with Webhook-Gated Settlement (urudhi)
3. Gap-Payment Defense Double-Check Stopping Rule (HappyGarg8o)
4. Cross-Leak Unification Engine (Our Primary Uncontested Moat)
"""

import pytest
from datetime import datetime, timezone, timedelta
from app.services.hinglish_time_parser import HinglishTimeParser
from app.services.ptp_tracker import PTPTracker
from app.services.recovery_pipeline import RecoveryPipeline
from app.core.audit_ledger import audit_ledger


def test_hinglish_time_parser_deterministic():
    """Verify vernacular time phrases convert to exact calendar dates without LLM hallucination."""
    # 1. Parso (Day after tomorrow)
    p_parso = HinglishTimeParser.parse_to_iso("Parso shaam ko pakka transfer kar dunga")
    assert p_parso["rule_matched"] == "parso_rule_plus_2d"
    now_ist = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
    expected_parso = (now_ist + timedelta(days=2)).strftime("%Y-%m-%d")
    assert p_parso["target_date"] == expected_parso

    # 2. Kal morning (Tomorrow)
    p_kal = HinglishTimeParser.parse_to_iso("Kal subah 10 baje tak payment ho jayega")
    assert p_kal["rule_matched"] == "kal_morning_rule_1000"
    expected_kal = (now_ist + timedelta(days=1)).strftime("%Y-%m-%d")
    assert p_kal["target_date"] == expected_kal

    # 3. Agle Hafte (Next week)
    p_week = HinglishTimeParser.parse_to_iso("Agle hafte tak adjust kar lo please")
    assert p_week["rule_matched"] == "next_week_rule_plus_7d"

    # 4. RBI curfew clamp: time between 07:00 and 19:00 IST
    assert p_parso["is_rbi_curfew_compliant"] is True


def test_ptp_3_phase_lifecycle_and_webhook_settlement():
    """Verify 3-stage lifecycle: Promise -> Commitment Accepted -> Payment via Webhook."""
    tracker = PTPTracker()
    case_id = f"test_ptp_{datetime.now().timestamp()}"

    # Stage 1 & 2: Customer promise accepted and bounded by policy
    ptp = tracker.record_commitment(
        case_id=case_id,
        customer_id="cust_comp_001",
        customer_name="Vikramaditya Mills",
        amount_promised=45000.0,
        raw_phrase="parso",
        channel="voice_call",
    )
    assert ptp.status == "PENDING_DUE"
    assert ptp.lifecycle_phase == "COMMITMENT_ACCEPTED"
    assert ptp.payment_link_id.startswith("plink_")
    assert "rzp.io/i/" in ptp.payment_link_url

    # Stage 3: Payment fulfilled STRICTLY via signed Razorpay webhook
    fulfilled = tracker.fulfill_with_webhook(
        case_id=case_id,
        amount_paid=45000.0,
        webhook_event_id="evt_rzp_test_hook_999",
        signature_verified=True,
    )
    assert fulfilled is not None
    assert fulfilled.status == "FULFILLED"
    assert fulfilled.lifecycle_phase == "FULFILLED_PAYMENT"
    assert fulfilled.webhook_verified is True
    assert fulfilled.fulfilled_at is not None


def test_gap_payment_defense_suppresses_outreach():
    """Verify HappyGarg8o Gap-Payment Defense: aborts action if customer paid in interim gap."""
    pipeline = RecoveryPipeline()
    customer = {
        "id": "cust_gap_payer_001",
        "name": "Anil Agarwal",
        "email": "anil@agarwal.in",
        "phone": "+919876543210",
        "company": "Agarwal Spices",
    }
    invoice = {
        "id": "inv_gap_test_101",
        "amount": 25000.0,
        "days_overdue": 12,
        "is_msme": True,
        "gap_payment_confirmed": True,  # Customer paid 2 minutes ago via UPI in the gap!
    }

    result = pipeline.process_overdue_invoice(
        invoice=invoice,
        customer=customer,
    )

    # Action must be intercepted and suppressed!
    assert result["status"] == "recovered"
    assert result["amount_recovered"] == 25000.0

    # Must log defense interception event in audit logs
    gap_logs = [log for log in result["audit_logs"] if log.get("action") == "gap_payment_intercepted"]
    assert len(gap_logs) >= 1
    assert gap_logs[0]["details"]["defense_policy"] == "HappyGarg8o_DoubleCheck_T1"


def test_cross_leak_unification_moat():
    """Verify our primary differentiator: cross-leak profile unification across customer silos."""
    from app.services.cross_leak_state import cross_leak_store

    customer_id = "cust_test_unified_rohit"

    # Simulate 3 leaks from 3 different business silos
    cross_leak_store.record_leak_event(
        customer_id=customer_id,
        leak_type_value="b2b_receivable",
        data={"invoice_id": "inv_001", "amount": 240000, "msme_days_remaining": 7},
    )
    cross_leak_store.record_leak_event(
        customer_id=customer_id,
        leak_type_value="checkout_dropoff",
        data={"cart_id": "cart_002", "amount": 12000},
    )
    profile = cross_leak_store.record_leak_event(
        customer_id=customer_id,
        leak_type_value="subscription_failure",
        data={"sub_id": "sub_003", "amount": 4999},
    )

    # Customer profile must contain all 3 leaks unified
    p_dict = profile.to_dict()
    assert p_dict["total_b2b_overdue_inr"] == 240000.0
    assert p_dict["abandonment_count_7d"] == 1
    assert p_dict["mandate_failure_count"] == 1
    assert p_dict["cross_leak_risk_score"] > 0.15
    assert "240,000" in p_dict["cross_leak_summary"]
