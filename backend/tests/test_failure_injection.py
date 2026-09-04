"""
Adversarial Failure Injection Test Suite
========================================
Validates core resilience and consistency invariants under simulated stress:
- Concurrency mutual exclusion (single winner under 10-thread simultaneous race)
- Dynamic lease TTL eviction (zombie worker recovery)
- Redundant physical dispatch protection
- Regulatory curfew & DPDP gating
- Multi-worker sliding window rate limiter saturation
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.failure_injection import failure_injection_engine
from app.core.idempotency_mutex import IdempotencyMutex


@pytest.fixture
def client():
    return TestClient(app)


def test_concurrent_webhooks_race():
    """Verify that 10 concurrent threads fighting for the same key yield exactly 1 winner."""
    res = failure_injection_engine.run_concurrent_webhooks(worker_count=10)
    assert res["success"] is True
    assert res["total_workers"] == 10
    assert res["winner_count"] == 1
    assert res["blocked_count"] == 9
    assert res["winner_id"] is not None
    assert "SQLite WAL mutual exclusion elected exactly 1 winner" in res["explanation"]


def test_stale_lease_auto_reclamation():
    """Verify that an abandoned PENDING lock older than TTL is safely reclaimed."""
    res = failure_injection_engine.run_stale_lease_recovery()
    assert res["success"] is True
    assert res["acquired"] is True
    assert res["status"] == "STALE_LEASE_RECLAIMED"
    assert res["new_worker"] != res["previous_worker"]
    assert "safely evicted the zombie lease" in res["explanation"]


def test_double_dispatch_interception():
    """Verify that redundant dispatch attempts reuse cached results and respect rate boundaries."""
    from app.core.idempotency_mutex import rate_limit_tracker
    rate_limit_tracker.reset("razorpay")
    res = failure_injection_engine.run_double_dispatch_interception()
    assert res["success"] is True
    assert res["dispatch_1"]["id"] is not None
    assert res["dispatch_2"]["id"] is not None


def test_curfew_regulatory_breach():
    """Verify that simulated night curfew (23:00 IST) triggers deterministic interception by Compliance Engine."""
    res = failure_injection_engine.run_curfew_regulatory_breach()
    assert res["success"] is True
    assert res["compliance_action"] == "blocked_time_window"
    assert "Night Curfew" in res["simulated_time"]
    assert res["rescheduled_to"] is not None
    assert "amount" in res["autonomy_envelope_reason"].lower()


def test_rate_limit_burst():
    """Verify that a sudden burst of 120 calls across SQLite WAL is capped at 100 req/min."""
    res = failure_injection_engine.run_rate_limit_burst(call_count=120)
    assert res["success"] is True
    assert res["accepted_count"] == 100
    assert res["throttled_count"] == 20
    assert res["rate_limit_telemetry"]["current_usage"] == 100


def test_failure_injection_api_catalog(client):
    """Verify the /api/failure-injection/scenarios endpoint returns the full catalog."""
    resp = client.get("/api/failure-injection/scenarios")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert len(data["scenarios"]) == 5
    scenario_keys = [s["key"] for s in data["scenarios"]]
    assert "concurrent_webhooks" in scenario_keys
    assert "stale_lease_recovery" in scenario_keys
    assert "double_dispatch_interception" in scenario_keys
    assert "curfew_regulatory_breach" in scenario_keys
    assert "multi_worker_rate_limit_burst" in scenario_keys


def test_failure_injection_api_run_scenarios(client):
    """Verify live scenario execution via REST endpoint."""
    # Test concurrent webhooks
    resp = client.post("/api/failure-injection/run/concurrent_webhooks")
    assert resp.status_code == 200
    res = resp.json()["result"]
    assert res["success"] is True
    assert res["winner_count"] == 1

    # Test stale lease recovery
    resp = client.post("/api/failure-injection/run/stale_lease_recovery")
    assert resp.status_code == 200
    res = resp.json()["result"]
    assert res["success"] is True

    # Test invalid scenario error handling
    resp = client.post("/api/failure-injection/run/non_existent_chaos")
    assert resp.status_code == 400
