"""
Razorpay Service — Rate Limit Defense & Circuit Breaker Wrapper
================================================================
Guards all outbound Razorpay API operations with:
1. RateLimitTracker (100 req/min sliding window)
2. Razorpay CircuitBreaker (5 failures in 60s -> 30s OPEN fast-fail)
3. Exponential backoff queuing (2^retry * 60s) when limits or upstream congestion occur
"""

import time
import logging
from typing import Dict, Any, Optional

from app.core.idempotency_mutex import rate_limit_tracker
from app.core.circuit_breaker import razorpay_breaker
from app.services.razorpay_client import razorpay_client

logger = logging.getLogger(__name__)


class RazorpayService:
    """
    Resilient facade over RazorpayClientWrapper.
    Enforces upstream rate limit ceilings and circuit breaker trip detection.
    """

    def __init__(self):
        self.client = razorpay_client
        self.rate_limiter = rate_limit_tracker
        self.breaker = razorpay_breaker

    def get_rate_limit_status(self) -> Dict[str, Any]:
        """Returns live telemetry on remaining Razorpay calls per minute."""
        return self.rate_limiter.get_rate_limit_status("razorpay")

    def create_payment_link(
        self,
        amount_inr: float,
        description: str,
        customer_name: str,
        customer_phone: str,
        customer_email: str,
        invoice_number: str,
        expiry_hours: int = 72,
        retry_count: int = 0,
    ) -> Dict[str, Any]:
        """
        Creates a payment link protected by rate limiter and circuit breaker.
        If rate limit hit: queues with exponential backoff (2^retry * 60s).
        """
        # 1. Rate Limit Defense
        if not self.rate_limiter.check_limit("razorpay"):
            backoff_delay = (2 ** retry_count) * 60
            logger.warning(
                f"Razorpay rate limit reached (100/min). Queuing request for invoice {invoice_number} "
                f"with exponential backoff delay of {backoff_delay}s (Retry #{retry_count + 1})."
            )
            return {
                "status": "queued_rate_limited",
                "backoff_seconds": backoff_delay,
                "retry_count": retry_count + 1,
                "invoice_number": invoice_number,
                "message": f"Rate limit threshold (100/min) exceeded. Enqueued with {backoff_delay}s backoff.",
            }

        # 2. Record call in sliding window
        self.rate_limiter.record_call("razorpay")

        # 3. Circuit Breaker Execution
        return self.breaker.execute(
            func=self.client.create_payment_link,
            amount_inr=amount_inr,
            description=description,
            customer_name=customer_name,
            customer_phone=customer_phone,
            customer_email=customer_email,
            invoice_number=invoice_number,
            expiry_hours=expiry_hours,
            fallback=lambda *args, **kwargs: {
                "id": f"plink_fallback_{invoice_number}",
                "short_url": f"https://rzp.io/i/fallback_{invoice_number}",
                "status": "circuit_breaker_fallback",
                "message": "Razorpay upstream circuit OPEN. Instant cached fallback link generated.",
            }
        )

    def cancel_payment_link(self, link_id: str) -> bool:
        if not self.rate_limiter.check_limit("razorpay"):
            return False
        self.rate_limiter.record_call("razorpay")
        return self.breaker.execute(
            func=self.client.cancel_payment_link,
            link_id=link_id,
            fallback=lambda *args, **kwargs: False
        )

    def verify_webhook_signature(self, raw_body: bytes, signature: str) -> bool:
        return self.client.verify_webhook_signature(raw_body, signature)


razorpay_service = RazorpayService()
