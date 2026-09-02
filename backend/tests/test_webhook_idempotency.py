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

from app.core.idempotency_mutex import webhook_idempotency_store, rate_limit_tracker
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


if __name__ == "__main__":
    print("Running Webhook Idempotency & Rate Limit Tests...")
    test_temporal_webhook_duplicates()
    test_rate_limiter_rapid_calls()
    test_circuit_breaker_trip()
    print("ALL TESTS PASSED!")
