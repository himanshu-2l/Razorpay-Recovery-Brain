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


def test_late_authorization_webhook_e2e():
    """Verify late payment authorization webhook intercepts in-flight case and cancels pending dunning."""
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)
    unique_pay_id = f"pay_late_test_{int(datetime.now().timestamp())}"
    unique_event_id = f"evt_hook_{unique_pay_id}"

    payload = {
        "event": "payment.captured",
        "id": unique_event_id,
        "created_at": int(datetime.now().timestamp()),
        "payload": {
            "payment": {
                "entity": {
                    "id": unique_pay_id,
                    "order_id": f"order_late_{unique_pay_id[4:]}",
                    "amount": 249900,
                    "method": "upi",
                    "customer_id": "cust_test_late_auth",
                    "email": "aarav.mehta@example.com",
                    "contact": "+919876543210",
                    "notes": {"customer_name": "Aarav Mehta"},
                }
            }
        }
    }

    # 1. Fire webhook: should intercept and reconcile
    response = client.post("/api/webhook/razorpay", json=payload, headers={"X-Razorpay-Event-Id": unique_event_id})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "reconciled"
    assert data["case"]["status"] == "reconciled_late_auth"
    assert data["case"]["reconciliation"]["pending_actions_cancelled"] is True
    assert data["case"]["amount_recovered"] == 2499.0

    # 2. Fire identical webhook: must be rejected by idempotency guard (409)
    dup_response = client.post("/api/webhook/razorpay", json=payload, headers={"X-Razorpay-Event-Id": unique_event_id})
    assert dup_response.status_code == 409
    dup_data = dup_response.json()
    assert dup_data["status"] == "duplicate_rejected"


def test_whatsapp_service_and_api_key_initialization():
    """Verify WhatsApp outreach service and Twilio API key configuration."""
    from app.services.whatsapp_service import send_whatsapp_recovery, build_whatsapp_message, is_whatsapp_configured
    from app.services.twilio_caller import _get_twilio_client
    from fastapi.testclient import TestClient
    from app.main import app

    # 1. Message building
    msg = build_whatsapp_message("Rohit Mehta", 85000.0, "INV-2026-TEST", "https://rzp.io/i/test123")
    assert "₹85,000.00" in msg
    assert "https://rzp.io/i/test123" in msg
    assert "PIN, OTP" in msg  # compliance security disclaimer

    # 2. Simulated / fallback dispatch
    res = send_whatsapp_recovery(
        to_number="+919876543210",
        customer_name="Rohit Mehta",
        amount_inr=85000.0,
        invoice_number="INV-2026-TEST",
    )
    assert res["status"] in ("sent", "simulated", "blocked")
    assert res["to_number"] == "+919876543210"

    # With daytime call_time (2 PM IST)
    res_daytime = send_whatsapp_recovery(
        to_number="+919876543210",
        customer_name="Rohit Mehta",
        amount_inr=85000.0,
        invoice_number="INV-2026-TEST",
        customer_meta={"call_time": 14.0},
    )
    assert res_daytime["status"] in ("sent", "simulated")

    # 3. Web API endpoint test
    client = TestClient(app)
    api_res = client.post("/api/demo/trigger-real-whatsapp", json={
        "to_number": "+919876543210",
        "customer_name": "Rohit Mehta",
        "amount_inr": 85000,
        "invoice_number": "INV-2026-TEST",
    })
    assert api_res.status_code == 200
    data = api_res.json()
    assert "status" in data


def test_bolna_telephony_service_and_status():
    """Verify Bolna AI service integration, phone normalization, and telephony status endpoint."""
    from app.services.bolna_caller import (
        is_bolna_configured,
        _normalize_phone_number,
        trigger_bolna_call,
    )
    from fastapi.testclient import TestClient
    from app.main import app

    # 1. Configured check & phone normalization
    assert is_bolna_configured() is True
    assert _normalize_phone_number("9876543210") == "+919876543210"
    assert _normalize_phone_number("+919876543210") == "+919876543210"

    # 2. Compliance gating & call dispatch
    res = trigger_bolna_call(
        to_number="9876543210",
        customer_name="Sanjay Singhania",
        amount_inr=125000.0,
        invoice_number="INV-BOLNA-TEST",
        customer_meta={"name": "Sanjay Singhania", "phone": "+919876543210", "call_time": 14.0}, # 2 PM IST is inside RBI allowed window
    )
    # Since agent_id is not yet created on Bolna dashboard, it should cleanly return needs_agent_setup with verified wallet
    assert res["status"] in ("ready_for_agent", "dispatched", "simulated", "blocked")
    assert res["to_number"] == "+919876543210"
    assert res["provider"] == "bolna_ai"

    # 3. Telephony status endpoint
    client = TestClient(app)
    status_res = client.get("/api/demo/telephony-status")
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert "twilio" in status_data
    assert "bolna" in status_data
    assert "whatsapp" in status_data
    assert status_data["bolna"]["configured"] is True

    # 4. Outbound call routing endpoint with provider="bolna"
    call_res = client.post("/api/demo/trigger-real-call", json={
        "to_number": "+919876543210",
        "customer_name": "Sanjay Singhania",
        "amount_inr": 125000,
        "invoice_number": "INV-BOLNA-TEST",
        "provider": "bolna",
    })
    assert call_res.status_code == 200
    call_data = call_res.json()
    assert call_data["provider"] == "bolna_ai"


def test_strategy_tournament_matrix_evaluation():
    """Verify Counterfactual Strategy Tournament evaluates candidates across CATE lift, cost, and ENRV."""
    from app.services.intervention_router import InterventionRouter
    from app.models.database import RootCause, LeakType, InterventionType

    router = InterventionRouter()
    res = router.route(
        root_cause=RootCause.SUB_BALANCE,
        leak_type=LeakType.SUBSCRIPTION_FAILURE,
        data={
            "amount": 1499.0,
            "broken_promises": 0,
            "lifetime_value": 15000.0,
            "diagnosis_confidence": 0.88,
        },
    )

    tournament = res.get("strategy_tournament", [])
    assert len(tournament) == 8, f"Expected 8 tournament candidates, got {len(tournament)}"

    # Check top-ranked winner
    winner = tournament[0]
    assert winner["status"] == "SELECTED"
    assert winner["rank"] == 1
    assert winner["strategy"] == res["intervention"].value
    assert winner["expected_net_recovery_inr"] > 0

    # Check that all rejected candidates have valid rationales
    for entry in tournament[1:]:
        assert entry["status"] == "REJECTED"
        assert entry["rejection_reason"] != ""
        assert "expected_net_recovery_inr" in entry
        assert "operational_cost_inr" in entry


def test_autonomous_bounded_margin_concession():
    """Verify checkout price shock triggers bounded discount nudge when LTV is high."""
    from app.services.recovery_pipeline import RecoveryPipeline

    pipeline = RecoveryPipeline()
    cart_dropoff = {
        "id": "cart_price_shock_001",
        "amount": 4999.0,
        "items": [{"name": "Premium Wireless Noise-Cancelling Headphones", "price": 4999.0}],
        "abandonment_stage": "price_reveal",
        "drop_reason": "price_shock_high_tax",
    }
    customer = {
        "id": "cust_high_ltv_99",
        "name": "Rohan Sharma",
        "lifetime_value": 25000.0,
        "email": "rohan@example.com",
        "phone": "+919876543210",
    }
    from app.services.compliance_engine import IST
    day_time_ist = datetime.now(IST).replace(hour=14, minute=0, second=0, microsecond=0)
    day_time_utc = day_time_ist.astimezone(timezone.utc)

    case = pipeline.process_checkout_abandonment(cart_dropoff, customer, current_time=day_time_utc)
    assert case["chosen_intervention"] == "discount_nudge"
    assert case["status"] in ("recovered", "intervening", "simulated", "pending", "failed", "partially_recovered")
    
    # Check that tournament contains discount_nudge as winner
    tournament = case.get("strategy_tournament", [])
    assert len(tournament) > 0
    winner = tournament[0]
    assert winner["strategy"] == "discount_nudge"
    assert winner["status"] == "SELECTED"


def test_zero_io_hitl_quarantine_and_1click_action():
    """Verify high-value transactions (> ₹50k) are quarantined and merchant 1-click approve works."""
    from fastapi.testclient import TestClient
    import app.main as m
    from app.main import app

    client = TestClient(app)

    # Inject high-value case into batch_results
    test_case_id = "case_hitl_test_999"
    mock_case = {
        "id": test_case_id,
        "status": "approval_pending",
        "amount_at_risk": 75000.0,
        "leak_type": "b2b_receivable",
        "chosen_intervention": "voice_call",
        "hitl_quarantine": {
            "is_quarantined": True,
            "quarantine_reason": "HIGH_VALUE_THRESHOLD (> ₹50,000)",
        },
        "customer": {"name": "Titanium Heavy Engineering", "phone": "+919876543210"},
    }
    if m.batch_results is None:
        m.batch_results = {"cases": [mock_case], "summary": {}}
    else:
        m.batch_results["cases"].append(mock_case)

    # 1. Approve case
    approve_res = client.post(f"/api/cases/{test_case_id}/approve", json={"note": "Approved by Head of Treasury"})
    assert approve_res.status_code == 200
    res_data = approve_res.json()
    assert res_data["status"] == "approved"
    assert res_data["amount_recovered"] == 75000.0
    assert "receipt" in res_data
    assert res_data["receipt"]["case_id"] == test_case_id

    # 2. Test reject case with another test case
    test_reject_id = "case_hitl_reject_888"
    mock_case_2 = {
        "id": test_reject_id,
        "status": "approval_pending",
        "amount_at_risk": 90000.0,
        "customer": {"name": "Apex Infra", "phone": "+919876543210"},
    }
    m.batch_results["cases"].append(mock_case_2)

    reject_res = client.post(f"/api/cases/{test_reject_id}/reject", json={"reason": "Customer undergoing insolvency"})
    assert reject_res.status_code == 200
    assert reject_res.json()["status"] == "rejected"



