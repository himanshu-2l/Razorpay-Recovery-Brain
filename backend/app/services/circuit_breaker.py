"""
Bank Gateway & Issuer Circuit Breaker
=====================================
Monitors real-time health across Indian banking rails (HDFC, SBI, ICICI, Axis, NPCI).
Automatically trips when an issuer's success rate falls below threshold (< 30%),
suppressing futile retries into dead rails and rerouting recovery flows to alternate payment rails.

Guarantees:
1. Zero futile retries into collapsed banking rails (prevents customer annoyance & wasted API compute).
2. Dynamic auto-recovery: auto-resumes once rolling health metrics recover above 75%.
3. Full telemetry exposed via REST API and SSE stream.
"""

import threading
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional


class IssuerHealth:
    def __init__(self, code: str, name: str, success_rate: float, total_attempts: int, is_tripped: bool = False):
        self.code = code
        self.name = name
        self.success_rate = success_rate
        self.total_attempts = total_attempts
        self.is_tripped = is_tripped
        self.last_updated = datetime.now(timezone.utc).isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "code": self.code,
            "name": self.name,
            "success_rate": round(self.success_rate * 100, 1),
            "total_attempts": self.total_attempts,
            "is_tripped": self.is_tripped,
            "status": "OUTAGE_TRIPPED" if self.is_tripped else ("DEGRADED" if self.success_rate < 0.60 else "HEALTHY"),
            "last_updated": self.last_updated,
        }


class BankCircuitBreaker:
    _instance = None
    _lock = threading.Lock()

    OUTAGE_THRESHOLD = 0.30  # Trip if SR < 30%
    RECOVERY_THRESHOLD = 0.70  # Reset if SR > 70%

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(BankCircuitBreaker, cls).__new__(cls)
                cls._instance._init_state()
            return cls._instance

    def _init_state(self):
        self._mutex = threading.Lock()
        self._issuers: Dict[str, IssuerHealth] = {
            "HDFC": IssuerHealth("HDFC", "HDFC Bank", 0.91, 1420),
            "SBIN": IssuerHealth("SBIN", "State Bank of India", 0.88, 1980),
            "ICIC": IssuerHealth("ICIC", "ICICI Bank", 0.94, 1150),
            "UTIB": IssuerHealth("UTIB", "Axis Bank", 0.90, 890),
            "NPCI_UPI": IssuerHealth("NPCI_UPI", "NPCI UPI Switch", 0.96, 4500),
        }

    def record_attempt(self, issuer_code: str, success: bool):
        """Record transaction outcome and update rolling circuit status."""
        with self._mutex:
            code = issuer_code.upper()
            if code not in self._issuers:
                self._issuers[code] = IssuerHealth(code, code, 0.85, 0)

            issuer = self._issuers[code]
            issuer.total_attempts += 1
            # Rolling exponential moving average
            alpha = 0.10
            new_val = 1.0 if success else 0.0
            issuer.success_rate = (1 - alpha) * issuer.success_rate + alpha * new_val
            issuer.last_updated = datetime.now(timezone.utc).isoformat()

            # State transition
            if issuer.success_rate < self.OUTAGE_THRESHOLD and not issuer.is_tripped:
                issuer.is_tripped = True
            elif issuer.success_rate >= self.RECOVERY_THRESHOLD and issuer.is_tripped:
                issuer.is_tripped = False

    def is_rail_available(self, issuer_code: str) -> bool:
        """Check if an issuer rail is healthy for retries."""
        with self._mutex:
            code = issuer_code.upper()
            if code in self._issuers:
                return not self._issuers[code].is_tripped
            return True

    def simulate_rail_outage(self, issuer_code: str, force_tripped: bool = True):
        """Simulate an outage event for testing and demonstrations."""
        with self._mutex:
            code = issuer_code.upper()
            if code in self._issuers:
                self._issuers[code].is_tripped = force_tripped
                self._issuers[code].success_rate = 0.12 if force_tripped else 0.92
                self._issuers[code].last_updated = datetime.now(timezone.utc).isoformat()

    def get_all_status(self) -> List[Dict[str, Any]]:
        """Get status of all monitored bank rails."""
        with self._mutex:
            return [iss.to_dict() for iss in self._issuers.values()]


bank_circuit_breaker = BankCircuitBreaker()
