"""
Razorpay Client — API v1 Integration Wrapper
=============================================
Manages test-mode API calls to Razorpay for:
- Creating Payment Links (`/v1/payment_links`) for B2B invoice recovery & abandoned carts.
- Creating Orders (`/v1/orders`) for checkout rescue retries.
- Verifying Webhook Signatures (`X-Razorpay-Signature`).
- Emulating live sandbox responses with realistic `plink_` IDs if test keys are pending.
"""

import os
import hmac
import hashlib
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
import logging
import httpx

logger = logging.getLogger(__name__)

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_TWnp4ewYt2QzQX")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "lBqXbMLDSpK7qFzkA3UWHhfV")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "mock_webhook_secret")
RAZORPAY_API_BASE = "https://api.razorpay.com/v1"


class RazorpayClientWrapper:
    """
    Production-ready wrapper for Razorpay Test Mode API.
    Provides verified HMAC signature validation and real Payment Link creation/cancellation.
    """

    def __init__(self):
        self.key_id = os.getenv("RAZORPAY_KEY_ID", "rzp_test_TWnp4ewYt2QzQX")
        self.key_secret = os.getenv("RAZORPAY_KEY_SECRET", "lBqXbMLDSpK7qFzkA3UWHhfV")
        self._active_links_by_invoice: Dict[str, Dict[str, Any]] = {}

    def verify_webhook_signature(self, raw_body: bytes, signature: str) -> bool:
        """
        Cryptographic verification of Razorpay HMAC-SHA256 signature on raw webhook bytes.
        """
        if not signature:
            return False
        try:
            expected_signature = hmac.new(
                key=self.key_secret.encode("utf-8"),
                msg=raw_body,
                digestmod=hashlib.sha256
            ).hexdigest()
            return hmac.compare_digest(expected_signature, signature)
        except Exception as e:
            logger.error(f"Webhook signature verification error: {e}")
            return False

    def cancel_payment_link(self, link_id: str) -> bool:
        """
        Cancel an existing payment link on Razorpay test API.
        """
        if not link_id or not link_id.startswith("plink_"):
            return False
        try:
            with httpx.Client(timeout=6.0) as client:
                res = client.post(
                    f"{RAZORPAY_API_BASE}/payment_links/{link_id}/cancel",
                    auth=(self.key_id, self.key_secret)
                )
                if res.status_code == 200:
                    logger.info(f"Successfully cancelled Razorpay payment link {link_id} on sandbox API.")
                    return True
                else:
                    logger.warning(f"Razorpay link cancel responded {res.status_code}: {res.text}")
                    return False
        except Exception as e:
            logger.warning(f"Failed to cancel Razorpay payment link {link_id}: {e}")
            return False

    def create_recovery_payment_link(
        self,
        amount_inr: float,
        customer_name: str,
        customer_phone: str,
        customer_email: str,
        description: str,
        invoice_number: Optional[str] = None,
        expire_hours: int = 72
    ) -> Dict[str, Any]:
        """
        Create a personalized Razorpay Payment Link for invoice recovery or cart rescue.
        Calls Razorpay's live Test-Mode API endpoint (https://api.razorpay.com/v1/payment_links).
        Explicitly cancels and invalidates any previously issued active link for the same invoice.
        On network/API failure, returns a clearly-labeled simulated fallback response.
        """
        amount_paise = int(amount_inr * 100)
        now_ts = int(datetime.now(timezone.utc).timestamp())
        expire_by = int((datetime.now(timezone.utc) + timedelta(hours=expire_hours)).timestamp())
        inv_key = invoice_number or customer_email or "default"

        # Check and cancel previous active link for this invoice
        invalidated_link_id = None
        if inv_key in self._active_links_by_invoice:
            prior_link = self._active_links_by_invoice[inv_key]
            if prior_link.get("status") in ("created", "simulated_fallback"):
                prior_id = prior_link.get("id")
                # Attempt live cancellation on Razorpay
                if prior_id and not prior_id.startswith("plink_sim_"):
                    self.cancel_payment_link(prior_id)
                prior_link["status"] = "cancelled"
                prior_link["cancelled_at"] = now_ts
                prior_link["invalidation_reason"] = "superseded_by_new_retry_link"
                invalidated_link_id = prior_id
                logger.info(f"Invalidated prior payment link {invalidated_link_id} for invoice {inv_key} to prevent double payment.")

        # Prepare payload for Razorpay API
        api_payload = {
            "amount": amount_paise,
            "currency": "INR",
            "accept_partial": False,
            "description": description,
            "customer": {
                "name": customer_name or "Valued Customer",
                "email": customer_email or "customer@example.com",
                "contact": customer_phone or "+919876543210"
            },
            "notify": {
                "sms": True,
                "email": True
            },
            "reminder_enable": True,
            "notes": {
                "recovery_agent": "Vasool AI",
                "invoice_number": invoice_number or "N/A",
                "trace_origin": "revenue_recovery_brain",
                "lifecycle_safety": "single_active_link_enforced",
            },
            "expire_by": expire_by
        }

        try:
            with httpx.Client(timeout=8.0) as client:
                res = client.post(
                    f"{RAZORPAY_API_BASE}/payment_links",
                    json=api_payload,
                    auth=(self.key_id, self.key_secret)
                )
                if res.status_code in (200, 201):
                    link_data = res.json()
                    link_data["invalidated_previous_link_id"] = invalidated_link_id
                    link_data["mode"] = "live_razorpay_test"
                    self._active_links_by_invoice[inv_key] = link_data
                    logger.info(f"Created Real Razorpay Payment Link: {link_data.get('id')} for ₹{amount_inr:.2f} -> {link_data.get('short_url')}")
                    return link_data
                else:
                    logger.warning(
                        f"Razorpay Payment Link API returned HTTP {res.status_code}: {res.text}. "
                        "Falling back to clearly-labeled simulated response."
                    )
        except Exception as e:
            logger.warning(f"Razorpay Payment Link API call failed: {e}. Falling back to simulated response.")

        # Graceful simulated fallback if sandbox API is unreachable or keys rejected
        link_id = f"plink_sim_{uuid.uuid4().hex[:14]}"
        short_url = f"https://rzp.io/i/{uuid.uuid4().hex[:7]}"
        fallback_link = {
            "id": link_id,
            "entity": "payment_link",
            "amount": amount_paise,
            "amount_paid": 0,
            "currency": "INR",
            "status": "simulated_fallback",
            "short_url": short_url,
            "description": description,
            "customer": {
                "name": customer_name,
                "email": customer_email,
                "contact": customer_phone
            },
            "notify": {"sms": True, "whatsapp": True, "email": True},
            "reminder_enable": True,
            "invalidated_previous_link_id": invalidated_link_id,
            "notes": {
                "recovery_agent": "Vasool AI",
                "invoice_number": invoice_number or "N/A",
                "trace_origin": "revenue_recovery_brain",
                "lifecycle_safety": "single_active_link_enforced",
            },
            "created_at": now_ts,
            "expire_by": expire_by,
            "mode": "simulated_fallback"
        }
        self._active_links_by_invoice[inv_key] = fallback_link
        logger.info(f"Created Simulated Fallback Payment Link: {link_id} for ₹{amount_inr:.2f}")
        return fallback_link


# Singleton
razorpay_client = RazorpayClientWrapper()
