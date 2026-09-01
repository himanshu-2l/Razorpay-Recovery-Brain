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


if __name__ == "__main__":
    print("=================================================================")
    print("  REVENUE RECOVERY BRAIN -- ARCHITECTURAL VERIFICATION SUITE")
    print("=================================================================")
    
    test_1_idempotency_race_condition()
    test_2_rbi_compliance_time_window()
    test_3_economic_floor_stopping_rule()
    test_4_diagnosis_engine_benchmark()
    test_5_razorpay_payment_link_generation()

    print("\n=================================================================")
    print("  ALL 5 ARCHITECTURAL VERIFICATION TESTS PASSED (100%)")
    print("=================================================================\n")
