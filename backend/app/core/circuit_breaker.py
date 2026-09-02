"""
API Circuit Breaker — External Service Resilience
=================================================
Protects external payment and messaging rails (Razorpay, Twilio, SendGrid) from cascade failures.
Implements canonical 3-state finite state machine:
- CLOSED: Normal operation, tracking failures in 60s sliding window
- OPEN: Tripped after 5 consecutive failures; fast-fails all requests for 30 seconds
- HALF_OPEN: Probe state allowing a canary request to test upstream recovery
"""

import time
import threading
import logging
from enum import Enum
from typing import Dict, Any, Callable, Optional

logger = logging.getLogger(__name__)


class CircuitState(str, Enum):
    CLOSED = "CLOSED"
    OPEN = "OPEN"
    HALF_OPEN = "HALF_OPEN"


class CircuitBreaker:
    """
    Thread-safe circuit breaker with failure threshold and cooldown recovery:
    - Failure threshold: 5 failures within 60s
    - Recovery cooldown: 30s in OPEN before probing HALF_OPEN
    """

    def __init__(
        self,
        service_name: str,
        failure_threshold: int = 5,
        window_seconds: float = 60.0,
        cooldown_seconds: float = 30.0,
    ):
        self.service_name = service_name
        self.failure_threshold = failure_threshold
        self.window_seconds = window_seconds
        self.cooldown_seconds = cooldown_seconds

        self._state = CircuitState.CLOSED
        self._failures: list = []  # list of failure timestamps
        self._last_state_change = time.time()
        self._mutex = threading.Lock()

    @property
    def state(self) -> CircuitState:
        with self._mutex:
            now = time.time()
            if self._state == CircuitState.OPEN:
                if now - self._last_state_change >= self.cooldown_seconds:
                    self._state = CircuitState.HALF_OPEN
                    self._last_state_change = now
                    logger.info(f"CircuitBreaker[{self.service_name}] cooled down: transitioning to HALF_OPEN probe.")
            return self._state

    def allow_request(self) -> bool:
        """Returns True if the external call is permitted, False if fast-failed."""
        current_state = self.state
        if current_state == CircuitState.CLOSED:
            return True
        if current_state == CircuitState.HALF_OPEN:
            return True  # Canary test allowed
        return False  # Fast-fail OPEN

    def record_success(self):
        """Record successful upstream response. Resets to CLOSED if in HALF_OPEN."""
        with self._mutex:
            if self._state in (CircuitState.HALF_OPEN, CircuitState.OPEN):
                logger.info(f"CircuitBreaker[{self.service_name}] upstream recovered: resetting to CLOSED.")
            self._state = CircuitState.CLOSED
            self._failures.clear()
            self._last_state_change = time.time()

    def record_failure(self, error: Optional[str] = None):
        """Record upstream error. If threshold met or in HALF_OPEN, trips to OPEN."""
        now = time.time()
        with self._mutex:
            if self._state == CircuitState.HALF_OPEN:
                # Canary probe failed: immediately trip back to OPEN
                self._state = CircuitState.OPEN
                self._last_state_change = now
                logger.warning(f"CircuitBreaker[{self.service_name}] canary probe failed: returning to OPEN. Reason: {error}")
                return

            cutoff = now - self.window_seconds
            self._failures = [t for t in self._failures if t > cutoff]
            self._failures.append(now)

            if len(self._failures) >= self.failure_threshold:
                self._state = CircuitState.OPEN
                self._last_state_change = now
                logger.error(
                    f"CircuitBreaker[{self.service_name}] TRIPPED to OPEN ({len(self._failures)} failures in {self.window_seconds}s). "
                    f"Fast-failing for {self.cooldown_seconds}s."
                )

    def execute(self, func: Callable, *args, fallback: Optional[Callable] = None, **kwargs) -> Any:
        """
        Execute function within circuit breaker protection.
        If OPEN and fallback provided, invokes fallback.
        """
        if not self.allow_request():
            if fallback:
                return fallback(*args, **kwargs)
            raise RuntimeError(f"CircuitBreaker[{self.service_name}] is OPEN. Fast-failing external call.")

        try:
            result = func(*args, **kwargs)
            self.record_success()
            return result
        except Exception as e:
            self.record_failure(str(e))
            if fallback:
                return fallback(*args, **kwargs)
            raise

    def get_status(self) -> Dict[str, Any]:
        """Telemetry on circuit state, failure counts, and cooldown."""
        with self._mutex:
            now = time.time()
            cooldown_remaining = max(0.0, self.cooldown_seconds - (now - self._last_state_change)) if self._state == CircuitState.OPEN else 0.0
            return {
                "service_name": self.service_name,
                "state": self._state.value,
                "recent_failures": len(self._failures),
                "threshold": self.failure_threshold,
                "cooldown_remaining_sec": round(cooldown_remaining, 1),
            }


# Dedicated circuit breakers for external rails
razorpay_breaker = CircuitBreaker("Razorpay", failure_threshold=5, window_seconds=60.0, cooldown_seconds=30.0)
twilio_breaker = CircuitBreaker("Twilio", failure_threshold=5, window_seconds=60.0, cooldown_seconds=30.0)
sendgrid_breaker = CircuitBreaker("SendGrid", failure_threshold=5, window_seconds=60.0, cooldown_seconds=30.0)
