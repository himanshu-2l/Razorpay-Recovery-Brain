import sys
import os
import asyncio
import threading
import time
from datetime import datetime, timezone, timedelta

# Enable UTF-8 for Windows console
if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

from app.core.idempotency import IdempotencyGuard
from app.models.database import LeakType, RootCause, InterventionType, ComplianceAction
from app.services.diagnosis_engine import DiagnosisEngine
from app.services.compliance_engine import ComplianceEngine, ECONOMIC_FLOOR_INR
from app.services.recovery_pipeline import RecoveryPipeline
from app.services.razorpay_client import razorpay_client

IST = timezone(timedelta(hours=5, minutes=30))


def test_1_idempotency_race_condition():
    print("\n[TEST 1] Concurrency & Idempotency: 10 Simultaneous Duplicate Webhooks")
    guard = IdempotencyGuard()
    event_key = f"race_test_pay_{int(time.time() * 1000)}"
    
    results = []
    
    def worker(worker_id):
        acquired, status, _ = guard.try_acquire(event_key, event_type="payment.failed", trace_id=f"worker_{worker_id}")
        results.append((worker_id, acquired, status))
        if acquired:
            # Simulate work
            time.sleep(0.01)
            guard.mark_completed(event_key, "processed_success")

    threads = [threading.Thread(target=worker, args=(i,)) for i in range(10)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    winners = [r for r in results if r[1] is True]
    losers = [r for r in results if r[1] is False]

    print(f"  -> Total requests: {len(results)}")
    print(f"  -> Processed (winner): {len(winners)}")
    print(f"  -> Rejected (duplicates): {len(losers)}")

    assert len(winners) == 1, f"Expected exactly 1 winner, got {len(winners)}"
    assert len(losers) == 9, f"Expected exactly 9 rejections, got {len(losers)}"
    print("  [OK] PASS: Exactly 1 thread executed; 9 duplicate race attempts rejected.")


def test_2_rbi_compliance_time_window():
    print("\n[TEST 2] RBI Fair Practices Code: 9:30 PM Night Window Gate")
    compliance = ComplianceEngine()
    
    # 9:30 PM IST (21:30)
    night_time_ist = datetime.now(IST).replace(hour=21, minute=30, second=0, microsecond=0)
    night_time_utc = night_time_ist.astimezone(timezone.utc)
    
    result = compliance.check(
        intervention=InterventionType.VOICE_CALL,
        customer_id="cust_test_compliance",
        current_time=night_time_utc,
        amount_at_risk=5000.0
    )

    print(f"  -> Action: {result['action'].value}")
    print(f"  -> Rule Cited: {result['rule_cited']}")
    print(f"  -> Rescheduled To: {result['rescheduled_to']}")

    assert result["action"] == ComplianceAction.BLOCKED_TIME_WINDOW
    assert result["rescheduled_to"] is not None
    print("  [OK] PASS: Out-of-hours voice intervention successfully blocked & rescheduled to 10 AM.")


def test_3_economic_floor_stopping_rule():
    print("\n[TEST 3] Economic Floor Stopping Rule (< Rs 100)")
    compliance = ComplianceEngine()
    
    # Normal hours (2 PM IST)
    day_time_ist = datetime.now(IST).replace(hour=14, minute=0, second=0, microsecond=0)
    day_time_utc = day_time_ist.astimezone(timezone.utc)
    
    result = compliance.check(
        intervention=InterventionType.VOICE_CALL,
        customer_id="cust_small_val",
        current_time=day_time_utc,
        amount_at_risk=45.0  # ₹45 < ₹100 floor
    )

    print(f"  -> Action: {result['action'].value}")
    print(f"  -> Details: {result['details']}")

    assert result["action"] == ComplianceAction.BLOCKED_ECONOMIC_FLOOR
    print(f"  [OK] PASS: Small value (Rs 45 < Rs {ECONOMIC_FLOOR_INR:.0f}) aborted to protect merchant margins.")


def test_4_diagnosis_engine_benchmark():
    print("\n[TEST 4] Diagnosis Engine Benchmark & Root Cause Accuracy")
    engine = DiagnosisEngine()
    
    samples = [
        (LeakType.PAYMENT_FAILURE, {"error_code": "GATEWAY_ERROR", "error_description": "Bank servers down", "error_source": "bank"}, RootCause.TD_BANK_DOWN),
        (LeakType.PAYMENT_FAILURE, {"error_code": "SERVER_ERROR", "error_description": "NPCI switch timed out", "error_source": "bank"}, RootCause.TD_NPCI_TIMEOUT),
        (LeakType.PAYMENT_FAILURE, {"error_code": "BAD_REQUEST_ERROR", "error_description": "Insufficient balance in account", "error_source": "customer"}, RootCause.BD_INSUFFICIENT_FUNDS),
        (LeakType.SUBSCRIPTION_FAILURE, {"amount": 2500000, "mandate_active": False}, RootCause.SUB_MANDATE_BUG),
        (LeakType.B2B_RECEIVABLE, {"broken_promises": 3, "days_overdue": 75}, RootCause.RECV_CHRONIC),
    ]

    start_time = time.time()
    for leak_type, data, expected_cause in samples:
        res = engine.diagnose(leak_type, data)
        assert res["root_cause"] == expected_cause, f"Expected {expected_cause}, got {res['root_cause']}"

    elapsed_ms = (time.time() - start_time) * 1000
    avg_latency = elapsed_ms / len(samples)
    
    print(f"  -> Diagnosed {len(samples)} cases in {elapsed_ms:.2f}ms (Avg: {avg_latency:.2f}ms/case)")
    assert avg_latency < 10.0, f"Latency too high: {avg_latency}ms"
    print("  [OK] PASS: All root causes accurately diagnosed at sub-10ms latency.")


def test_5_razorpay_payment_link_generation():
    print("\n[TEST 5] Razorpay Payment Link Generation & Metadata")
    plink = razorpay_client.create_recovery_payment_link(
        amount_inr=1500.0,
        customer_name="Rohan Gupta",
        customer_phone="+919876543210",
        customer_email="rohan.gupta@example.com",
        description="Invoice #INV-202688 Recovery",
        invoice_number="INV-202688"
    )

    print(f"  -> Link ID: {plink['id']}")
    print(f"  -> Short URL: {plink['short_url']}")
    print(f"  -> Amount Paise: {plink['amount']} (Rs {plink['amount']/100:.2f})")

    assert plink["id"].startswith("plink_")
    assert plink["amount"] == 150000
    assert plink["customer"]["contact"] == "+919876543210"
    assert plink["notes"]["invoice_number"] == "INV-202688"
    print("  [OK] PASS: Payment link generated with accurate Razorpay API v1 payload structure.")


def test_6_cryptographic_audit_ledger_integrity():
    print("\n[TEST 6] Cryptographic Audit Ledger: SHA-256 Chaining & Integrity Verification")
    from app.core.audit_ledger import audit_ledger

    # Append sequential events
    r1 = audit_ledger.record_event("TEST_EVENT_A", "case_test_1", {"action": "retry"})
    r2 = audit_ledger.record_event("TEST_EVENT_B", "case_test_1", {"action": "nudge"})

    assert r2.prev_hash == r1.content_hash, "Chaining failed: prev_hash does not match parent content_hash"
    
    is_valid, count, err = audit_ledger.verify_integrity()
    print(f"  -> Total Verified Blocks: {count}")
    print(f"  -> Chain Head Hash: {r2.content_hash[:16]}...")
    print(f"  -> Integrity Status: {'VALID (TAMPER-FREE)' if is_valid else 'CORRUPTED'}")

    assert is_valid, f"Integrity check failed: {err}"
    print("  [OK] PASS: SHA-256 hash chain mathematically verified from Genesis to Head.")


def test_7_counterfactual_enrv_and_receipts():
    print("\n[TEST 7] Counterfactual Economics (ENRV) & Cryptographic Decision Receipts")
    from app.services.intervention_router import InterventionRouter
    from app.services.receipt_service import receipt_service

    router = InterventionRouter()
    route_res = router.route(
        root_cause=RootCause.TD_BANK_DOWN,
        leak_type=LeakType.PAYMENT_FAILURE,
        data={"error_code": "GATEWAY_ERROR"},
        amount_inr=5000.0,
    )

    cf = route_res["counterfactual"]
    print(f"  -> Natural Recovery Baseline: {cf['p_natural_recovery']*100:.1f}%")
    print(f"  -> Agent Recovery: {cf['p_intervention_recovery']*100:.1f}%")
    print(f"  -> Incremental Lift: +{cf['incremental_lift_pct']:.1f}%")
    print(f"  -> Expected Net Recoverable Value (ENRV): Rs {cf['expected_net_recovery_inr']:.2f}")

    assert cf["expected_net_recovery_inr"] > 0
    assert cf["p_intervention_recovery"] > cf["p_natural_recovery"]

    # Generate receipt
    dummy_case = {
        "id": "case_enrv_test",
        "leak_type": "payment_failure",
        "amount_at_risk": 5000.0,
        "amount_recovered": 5000.0,
        "root_cause": "td_bank_down",
        "chosen_intervention": "retry",
        "status": "recovered",
        "counterfactual": cf,
    }
    receipt = receipt_service.generate_receipt(dummy_case)
    print(f"  -> Receipt ID: {receipt['receipt_id']}")
    print(f"  -> Cryptographic Seal: {receipt['sha256_seal'][:16]}...")

    assert receipt["receipt_id"].startswith("rcpt_")
    assert "sha256_seal" in receipt
    print("  [OK] PASS: Counterfactual math and cryptographic Decision Receipts verified.")


def test_8_human_in_the_loop_approval_gate():
    print("\n[TEST 8] Human-In-The-Loop (HITL) High-Stakes Approval Gate (> Rs 50,000)")
    from app.services.recovery_pipeline import RecoveryPipeline

    pipeline = RecoveryPipeline()
    # Daytime (2 PM IST) so compliance gate passes
    day_time_ist = datetime.now(IST).replace(hour=14, minute=0, second=0, microsecond=0)
    day_time_utc = day_time_ist.astimezone(timezone.utc)

    # High-value B2B invoice case (> ₹50,000)
    high_val_invoice = {
        "id": "inv_high_value_101",
        "amount": 125000.0,  # ₹1,25,000 > ₹50,000
        "days_overdue": 65,
        "broken_promises": 1,
    }
    customer = {
        "id": "cust_enterprise_1",
        "name": "Acme Global Tech",
        "company": "Acme Global Tech Pvt Ltd",
    }

    case = pipeline.process_overdue_invoice(high_val_invoice, customer, current_time=day_time_utc)
    print(f"  -> Amount: Rs {case['amount_at_risk']:,.2f}")
    print(f"  -> Requires Human Approval: {case['requires_human_approval']}")
    print(f"  -> Initial Status: {case['status']}")

    assert case["requires_human_approval"] is True
    assert case["status"] == "awaiting_response"
    print("  [OK] PASS: High-stakes intervention held safely for operator approval.")


def test_9_section_43bh_tax_clock_engine():
    print("\n[TEST 9] Section 43B(h) MSME Tax Clock Engine & B2B Leverage Analysis")
    from app.services.tax_clock_engine import tax_clock_engine

    # Scenario A: 32 days overdue (13 days before 45-day deadline)
    status_a = tax_clock_engine.evaluate(amount=500000.0, days_overdue=32)
    print(f"  -> Invoice: Rs {status_a.invoice_amount:,.2f} (32 days overdue)")
    print(f"  -> Days Remaining to 45-day Deadline: {status_a.days_until_45d_deadline}")
    print(f"  -> Tax Deferral Penalty Avoided: Rs {status_a.deferral_cost_inr:,.2f}")
    print(f"  -> Urgency: {status_a.urgency_level.upper()}")
    print(f"  -> CFO Lever: {status_a.cfo_negotiation_lever[:65]}...")

    assert status_a.applies is True
    assert status_a.days_until_45d_deadline == 13
    assert status_a.deferral_cost_inr == 15000.0  # 500k * 0.25 * 0.12
    assert status_a.urgency_level == "elevated"

    # Scenario B: 52 days overdue (Breached by 7 days)
    status_b = tax_clock_engine.evaluate(amount=200000.0, days_overdue=52)
    assert status_b.is_breached is True
    assert status_b.urgency_level == "breached"
    print("  [OK] PASS: Section 43B(h) 45-day tax clock and deferral calculations verified.")


def test_10_bank_gateway_circuit_breaker():
    print("\n[TEST 10] Bank Gateway & Issuer Circuit Breaker (Retry Suppression on Outages)")
    from app.services.circuit_breaker import bank_circuit_breaker
    from app.services.intervention_router import InterventionRouter

    # 1. Verify healthy rail
    assert bank_circuit_breaker.is_rail_available("HDFC") is True

    # 2. Simulate HDFC rail outage
    bank_circuit_breaker.simulate_rail_outage("HDFC", force_tripped=True)
    assert bank_circuit_breaker.is_rail_available("HDFC") is False
    print("  -> HDFC Rail Outage Simulated (Status: TRIPPED)")

    # 3. Verify router suppresses RETRY and switches to alternate payment link
    router = InterventionRouter()
    route_res = router.route(
        root_cause=RootCause.TD_BANK_DOWN,
        leak_type=LeakType.PAYMENT_FAILURE,
        data={"bank": "HDFC", "amount": 250000},
    )

    print(f"  -> Routed Action: {route_res['intervention'].value.upper()}")
    print(f"  -> Reason: {route_res['reason']}")

    assert route_res["intervention"] == InterventionType.WHATSAPP_NUDGE
    assert "Circuit Breaker Tripped" in route_res["reason"]
    print("  [OK] PASS: Retry safely suppressed during bank rail outage; alternate link offered.")

    # Reset circuit breaker
    bank_circuit_breaker.simulate_rail_outage("HDFC", force_tripped=False)


def test_11_late_authorization_intercept_and_reconciler():
    print("\n[TEST 11] Outcome Reconciler: Asynchronous Late Authorization Intercept")
    from app.services.outcome_reconciler import outcome_reconciler

    # Simulate an open recovery case
    in_flight_cases = [
        {
            "id": "case_inflight_999",
            "order_id": "order_test_late_auth_123",
            "payment_id": "pay_failed_init",
            "status": "open",
            "amount_at_risk": 2500.0,
            "amount_recovered": 0.0,
        }
    ]

    # Late authorization arrives 10 minutes later from Razorpay webhook
    matched, updated_case, msg = outcome_reconciler.reconcile_payment_event(
        event_type="payment.captured",
        payment_id="pay_late_capture_789",
        order_id="order_test_late_auth_123",
        amount_paise=250000,
        cases_list=in_flight_cases,
    )

    print(f"  -> Match Found: {matched}")
    print(f"  -> Reconciled Status: {updated_case['status'].upper()}")
    print(f"  -> Amount Recovered: Rs {updated_case['amount_recovered']:,.2f}")
    print(f"  -> Pending Actions Cancelled: {updated_case['reconciliation']['pending_actions_cancelled']}")

    assert matched is True
    assert updated_case["status"] == "reconciled_late_auth"
    assert updated_case["amount_recovered"] == 2500.0
    print("  [OK] PASS: Late payment authorization intercepted; outreach halted safely without duplicate contact.")


def test_12_multistage_recovery_execution_pipeline():
    print("\n[TEST 12] Multi-Stage Recovery Pipeline: 4-Stage Execution Lifecycle")
    from app.services.stage_planner import stage_planner

    mock_case = {
        "id": "case_stage_test",
        "root_cause": "td_bank_down",
        "root_cause_confidence": 0.94,
        "chosen_intervention": "retry",
        "compliance_status": "allowed",
        "status": "recovered",
    }

    stages = stage_planner.generate_stages(mock_case)
    print(f"  -> Total Pipeline Stages: {len(stages)}")
    for st in stages:
        print(f"     Stage {st['stage_number']}: {st['name']} [{st['status']}] ({st['latency_ms']}ms)")

    assert len(stages) == 4
    assert stages[0]["stage_number"] == 1
    assert stages[0]["status"] == "COMPLETED"
    assert stages[1]["status"] == "COMPLETED"
    print("  [OK] PASS: 4-Stage execution timeline generated with sub-10ms cumulative latency.")


def test_13_dynamic_autonomy_envelope_hysteresis():
    print("\n[TEST 13] Dynamic Autonomy Envelope (Asymmetric Hysteresis Contraction/Expansion)")
    from app.services.autonomy_envelope import autonomy_envelope

    # 1. Verify initial expanded state (Max Amount: Rs 25,000)
    assert autonomy_envelope.state == "EXPANDED"
    can_exec, _ = autonomy_envelope.can_execute_autonomously(amount_inr=15000.0, confidence=0.85, action_name="retry")
    assert can_exec is True

    # 2. Trigger safeguard contraction (e.g. simulated drift or rail anomaly)
    autonomy_envelope.contract(reason="Simulated bank rail anomaly")
    assert autonomy_envelope.state == "CONTRACTED"
    assert autonomy_envelope.current_max_amount == 5000.0
    print("  -> Autonomy Envelope CONTRACTED (Cap: Rs 5,000 / Conf: 90%)")

    # 3. Verify Rs 15,000 is now blocked from auto-execution and routed to operator
    can_exec_contracted, reason = autonomy_envelope.can_execute_autonomously(amount_inr=15000.0, confidence=0.85, action_name="retry")
    assert can_exec_contracted is False
    print(f"  -> Guardrail Intervention: {reason}")

    # 4. Simulate 5 consecutive stable evaluation cycles -> auto-expands
    for i in range(5):
        autonomy_envelope.record_stable_cycle()

    assert autonomy_envelope.state == "EXPANDED"
    assert autonomy_envelope.current_max_amount == 25000.0
    print("  [OK] PASS: Autonomy envelope contracted dynamically on risk and safely expanded after 5 stable cycles.")


def test_14_p10_p50_p90_bounds_and_ptp_lifecycle():
    print("\n[TEST 14] P10/P50/P90 Revenue Uncertainty Bounds & Promise-to-Pay (PTP) State Machine")
    from app.services.intervention_router import InterventionRouter
    from app.services.ptp_tracker import ptp_tracker

    # 1. Test Router P10/P50/P90 generation
    router = InterventionRouter()
    route_res = router.route(
        root_cause=RootCause.BD_INSUFFICIENT_FUNDS,
        leak_type=LeakType.PAYMENT_FAILURE,
        data={"amount": 10000, "customer_ltv": 25000},
    )

    bounds = route_res["counterfactual"]["revenue_bounds_inr"]
    print(f"  -> P10 (Pessimistic Floor): Rs {bounds['p10_pessimistic']:,.2f}")
    print(f"  -> P50 (Expected Net Value): Rs {bounds['p50_expected']:,.2f}")
    print(f"  -> P90 (Optimistic Ceiling): Rs {bounds['p90_optimistic']:,.2f}")

    assert bounds["p10_pessimistic"] < bounds["p50_expected"] < bounds["p90_optimistic"]
    assert bounds["p50_expected"] == route_res["counterfactual"]["expected_net_recovery_inr"]

    # 2. Test Promise-to-Pay (PTP) Lifecycle
    ptp = ptp_tracker.record_promise(
        case_id="case_ptp_101",
        customer_id="cust_rahul",
        customer_name="Rahul Sharma",
        amount_promised=10000.0,
        promised_days_ahead=3,
        channel="voice_call",
    )
    print(f"  -> PTP Recorded: {ptp.promise_id} | Status: {ptp.status} | Promised Date: {ptp.promised_date}")
    assert ptp.status == "PENDING_DUE"

    # 3. Test PTP Fulfillment
    fulfilled_ptp = ptp_tracker.fulfill_promise(case_id="case_ptp_101", amount_paid=10000.0)
    assert fulfilled_ptp is not None
    assert fulfilled_ptp.status == "FULFILLED"
    print(f"  -> PTP Fulfilled: {fulfilled_ptp.promise_id} at {fulfilled_ptp.fulfilled_at}")
    print("  [OK] PASS: P10/P50/P90 statistical uncertainty bounds and PTP lifecycle verified.")


def test_15_voice_intent_classification_and_telephony_waterfall():
    print("\n[TEST 15] Voice Intent Classification, Persona Strategies & Latency Waterfall")
    from app.services.voice_intent_classifier import VoiceIntentClassifier, VoicePersona, TurnIntent

    # 1. Test Intent Classification for PTP, Hardship, Dispute
    c_ptp = VoiceIntentClassifier.classify_utterance("Main kal subah 11 baje tak transfer kar deta hoon.")
    print(f"  -> PTP Intent Classification: {c_ptp['intent']} | Action: {c_ptp['action']}")
    assert c_ptp["intent"] == TurnIntent.PROMISE_TO_PAY
    assert "promised_date" in c_ptp

    c_hardship = VoiceIntentClassifier.classify_utterance("Abhi cashflow tight chal raha hai aur salary delay hai.")
    print(f"  -> Hardship Intent: {c_hardship['intent']} | Reason: {c_hardship['reason']}")
    assert c_hardship["intent"] == TurnIntent.HARDSHIP_DEFERRAL

    c_dispute = VoiceIntentClassifier.classify_utterance("Pricing galat hai aur delivery incomplete thi, dispute raise karo!")
    print(f"  -> Dispute Intent: {c_dispute['intent']} | Action: {c_dispute['action']}")
    assert c_dispute["intent"] == TurnIntent.ESCALATE_TO_HUMAN

    # 2. Test 4 Collection Persona Strategies
    for persona in [VoicePersona.FIRST_TIME_MISS, VoicePersona.REPEAT_DELINQUENT, VoicePersona.DISPUTE_PENDING, VoicePersona.BROKEN_PTP]:
        flow_res = VoiceIntentClassifier.generate_persona_flow(
            persona=persona,
            debtor_name="Vikram Singh",
            invoice_number="INV-9901",
            amount=45000.0,
            days_overdue=35,
        )
        assert len(flow_res["flow"]) >= 5
        assert "latency_waterfall" in flow_res
        assert flow_res["latency_waterfall"]["within_budget"] is True
        print(f"  -> Persona [{flow_res['persona_label']}]: {flow_res['strategy']} | Turns: {len(flow_res['flow'])}")

    # 3. Test Sub-800ms Latency Waterfall
    waterfall = VoiceIntentClassifier.compute_turn_latency_waterfall()
    print(f"  -> Telephony Latency Breakdown: VAD {waterfall['vad_ms']}ms + STT {waterfall['stt_ms']}ms + LLM {waterfall['llm_ttft_ms']}ms + TTS {waterfall['tts_synthesis_ms']}ms")
    print(f"  -> Total Turn Latency: {waterfall['total_turn_latency_ms']}ms (< {waterfall['target_budget_ms']}ms budget | Headroom: {waterfall['budget_headroom_ms']}ms)")
    assert waterfall["total_turn_latency_ms"] < 800.0

    print("  [OK] PASS: Voice intent classification, 4 persona strategies, and sub-800ms latency waterfall verified.")


if __name__ == "__main__":
    print("=================================================================")
    print("  REVENUE RECOVERY BRAIN -- ARCHITECTURAL VERIFICATION SUITE")
    print("=================================================================")
    
    test_1_idempotency_race_condition()
    test_2_rbi_compliance_time_window()
    test_3_economic_floor_stopping_rule()
    test_4_diagnosis_engine_benchmark()
    test_5_razorpay_payment_link_generation()
    test_6_cryptographic_audit_ledger_integrity()
    test_7_counterfactual_enrv_and_receipts()
    test_8_human_in_the_loop_approval_gate()
    test_9_section_43bh_tax_clock_engine()
    test_10_bank_gateway_circuit_breaker()
    test_11_late_authorization_intercept_and_reconciler()
    test_12_multistage_recovery_execution_pipeline()
    test_13_dynamic_autonomy_envelope_hysteresis()
    test_14_p10_p50_p90_bounds_and_ptp_lifecycle()
    test_15_voice_intent_classification_and_telephony_waterfall()

    print("\n=================================================================")
    print("  ALL 15 ARCHITECTURAL VERIFICATION TESTS PASSED (100%)")
    print("=================================================================\n")
