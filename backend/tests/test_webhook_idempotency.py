"""
Webhook Idempotency & Rate Limit Defense Tests
==============================================
Verifies:
1. Temporal Webhook Idempotency: Same event_id with different timestamp -> processed twice
2. Temporal Webhook Deduplication: Same event_id with same timestamp -> second request ignored
3. API Rate Limit Defense: 100 rapid Razorpay calls trigger rate limit & backoff queuing
4. API Circuit Breaker: 5 rapid failures trip the breaker to OPEN
"""

import sys
import os
import time
from datetime import datetime, timezone

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.idempotency_mutex import webhook_idempotency_store, rate_limit_tracker, RateLimitTracker
from app.services.razorpay_service import razorpay_service
from app.core.circuit_breaker import CircuitBreaker, CircuitState


def test_temporal_webhook_duplicates():
    """
    Test 1: Same event_id, same timestamp -> second request recognized as duplicate
    Test 2: Same event_id, different timestamp -> processed as unique retry/update event
    """
    event_id = f"evt_retry_test_{int(time.time())}"
    ts1 = "1725321600"  # Initial webhook delivery
    ts2 = "1725325200"  # Retry 1 hour later with updated state

    # First delivery: should not be processed yet
    assert webhook_idempotency_store.is_processed(event_id, ts1) is False
    webhook_idempotency_store.mark_processed(event_id, ts1, "payload_hash_1")

    # Immediate duplicate of first delivery: must be recognized as duplicate
    assert webhook_idempotency_store.is_processed(event_id, ts1) is True

    # Same event_id, but with new timestamp (retry delivery with new temporal context):
    # Must be recognized as NOT processed for ts2
    assert webhook_idempotency_store.is_processed(event_id, ts2) is False
    webhook_idempotency_store.mark_processed(event_id, ts2, "payload_hash_2")

    # Now both are stored
    assert webhook_idempotency_store.is_processed(event_id, ts1) is True
    assert webhook_idempotency_store.is_processed(event_id, ts2) is True
    print("  [OK] Temporal duplicate detection verified (same ID+ts rejected, same ID+new ts accepted).")


def test_rate_limiter_rapid_calls():
    """
    Test 3: Rapid API calls hit sliding window limit (100 req/min) and trigger backoff queuing
    """
    api = f"razorpay_test_api_{int(time.time())}"
    # Configure custom limit in tracker for testing
    rate_limit_tracker.DEFAULT_LIMITS[api] = 100

    # Execute 100 calls -> all should succeed
    for i in range(100):
        recorded = rate_limit_tracker.record_call(api)
        assert recorded is True

    # Call #101 must be rate limited
    assert rate_limit_tracker.check_limit(api) is False
    assert rate_limit_tracker.record_call(api) is False

    status = rate_limit_tracker.get_rate_limit_status(api)
    assert status["is_rate_limited"] is True
    assert status["remaining"] == 0
    print(f"  [OK] Rate limiter verified: 100 calls allowed, call #101 rejected (remaining={status['remaining']}).")


def test_circuit_breaker_trip():
    """
    Test 4: Circuit breaker trips from CLOSED to OPEN after 5 failures in 60s
    """
    breaker = CircuitBreaker("TestRail", failure_threshold=5, window_seconds=60.0, cooldown_seconds=2.0)
    assert breaker.state == CircuitState.CLOSED
    assert breaker.allow_request() is True

    # Record 4 failures -> still CLOSED
    for i in range(4):
        breaker.record_failure("simulated error")
        assert breaker.state == CircuitState.CLOSED

    # 5th failure -> trips to OPEN
    breaker.record_failure("5th failure error")
    assert breaker.state == CircuitState.OPEN
    assert breaker.allow_request() is False
    print("  [OK] Circuit breaker verified: tripped to OPEN upon 5th failure.")


def test_live_endpoint_rate_limit_defense():
    """
    Test 5: Verify that the real /api/razorpay/payment-link endpoint routes through
    RazorpayService and respects the RateLimitTracker by returning queued_rate_limited
    with exponential backoff delay when check_limit returns False.
    """
    from unittest.mock import patch
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)

    # 1. Normal call (under limit) -> should succeed with rate_limit_applied: True
    res_normal = client.post(
        "/api/razorpay/payment-link",
        json={"amount": 2500, "customer_name": "Test User", "invoice_number": "INV-RL-OK-01"}
    )
    assert res_normal.status_code == 200
    data_normal = res_normal.json()
    assert data_normal.get("rate_limit_applied") is True
    assert data_normal.get("circuit_breaker_applied") is True
    assert data_normal.get("status") in ("created", "simulated_fallback")

    # 2. Rate limited call -> mock rate_limit_tracker.check_limit to return False
    with patch.object(rate_limit_tracker, "check_limit", return_value=False):
        res_limited = client.post(
            "/api/razorpay/payment-link",
            json={"amount": 5000, "customer_name": "Test User 2", "invoice_number": "INV-RL-BLOCK-01"}
        )
        assert res_limited.status_code == 200
        data_limited = res_limited.json()
        assert data_limited.get("status") == "queued_rate_limited"
        plink = data_limited.get("payment_link", {})
        assert plink.get("status") == "queued_rate_limited"
        assert plink.get("backoff_seconds") == 60
        assert "Rate limit threshold" in plink.get("message", "")
        print(f"  [OK] Live endpoint rate limit defense verified: returned {plink.get('status')} with backoff={plink.get('backoff_seconds')}s.")


def test_rate_limiter_multiprocess_sliding_window():
    """
    Test 5: Multi-Process Rate Limit Concurrency:
    Spawns multiple isolated OS processes hitting the same shared SQLite WAL database file.
    Asserts the combined count across all worker processes strictly respects the quota limit.
    """
    import subprocess
    import tempfile

    db_fd, temp_db = tempfile.mkstemp(suffix=".db")
    os.close(db_fd)

    try:
        api = f"multi_proc_api_{int(time.time())}"
        limit = 15
        num_workers = 3
        attempts_per_worker = 10  # Total 30 attempts across 3 processes for limit of 15

        main_tracker = RateLimitTracker(db_path=temp_db)
        main_tracker.DEFAULT_LIMITS[api] = limit

        backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        worker_code = f"""
import sys, os
sys.path.insert(0, {repr(backend_dir)})
from app.core.idempotency_mutex import RateLimitTracker

tracker = RateLimitTracker(db_path={repr(temp_db)})
tracker.DEFAULT_LIMITS[{repr(api)}] = {limit}

accepted = 0
for _ in range({attempts_per_worker}):
    if tracker.record_call({repr(api)}):
        accepted += 1

print(accepted)
"""

        procs = [
            subprocess.Popen(
                [sys.executable, "-c", worker_code],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            for _ in range(num_workers)
        ]

        results = []
        for p in procs:
            stdout, stderr = p.communicate(timeout=15.0)
            assert p.returncode == 0, f"Worker process crashed: {stderr}"
            results.append(int(stdout.strip()))

        total_accepted = sum(results)
        assert total_accepted == limit, (
            f"Expected exactly {limit} total accepted calls across {num_workers} processes, "
            f"got {total_accepted} (per-process results: {results})"
        )

        # Primary process verification
        assert main_tracker.check_limit(api) is False
        assert main_tracker.record_call(api) is False

        status = main_tracker.get_rate_limit_status(api)
        assert status["current_usage"] == limit
        assert status["remaining"] == 0
        assert status["is_rate_limited"] is True

        main_tracker.close()
        print(f"  [OK] Multi-process rate limit verified: {results} sum to {total_accepted}/{limit} across {num_workers} processes.")
    finally:
        for suffix in ["", "-wal", "-shm"]:
            fpath = temp_db + suffix
            if os.path.exists(fpath):
                try:
                    os.remove(fpath)
                except OSError:
                    pass


if __name__ == "__main__":
    print("Running Webhook Idempotency & Rate Limit Tests...")
    test_temporal_webhook_duplicates()
    test_rate_limiter_rapid_calls()
    test_circuit_breaker_trip()
    test_live_endpoint_rate_limit_defense()
    test_rate_limiter_multiprocess_sliding_window()
    print("ALL TESTS PASSED!")
