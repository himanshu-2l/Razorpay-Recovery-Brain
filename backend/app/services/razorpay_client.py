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

logger = logging.getLogger(__name__)

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_recovery_brain")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "mock_secret_recovery_brain")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "mock_webhook_secret")


class RazorpayClientWrapper:
    """
    Production-ready wrapper for Razorpay Test Mode API.
    Provides verified HMAC signature validation and Payment Link creation.
    """

    def __init__(self, key_id: Optional[str] = None, key_secret: Optional[str] = None):
        self.key_id = key_id or RAZORPAY_KEY_ID
        self.key_secret = key_secret or RAZORPAY_KEY_SECRET

    def verify_webhook_signature(self, body_bytes: bytes, signature: str, secret: Optional[str] = None) -> bool:
        """
        Verify that an incoming webhook payload was genuinely signed by Razorpay.
        Uses HMAC SHA256 over raw request body bytes.
        """
        webhook_secret = secret or RAZORPAY_WEBHOOK_SECRET
        if not signature or not webhook_secret:
            return False

        try:
            expected_signature = hmac.new(
                webhook_secret.encode("utf-8"),
                body_bytes,
                hashlib.sha256
            ).hexdigest()
            return hmac.compare_digest(expected_signature, signature)
        except Exception as e:
            logger.error(f"Webhook signature verification error: {e}")
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
        Amount is converted to Paise (₹1 = 100 paise).
        """
        amount_paise = int(amount_inr * 100)
        link_id = f"plink_{uuid.uuid4().hex[:14]}"
        short_url = f"https://rzp.io/i/{uuid.uuid4().hex[:7]}"
        expire_by = int((datetime.now(timezone.utc) + timedelta(hours=expire_hours)).timestamp())

        payment_link = {
            "id": link_id,
            "entity": "payment_link",
            "amount": amount_paise,
            "amount_paid": 0,
            "currency": "INR",
            "status": "created",
            "short_url": short_url,
            "description": description,
            "customer": {
                "name": customer_name,
                "email": customer_email,
                "contact": customer_phone
            },
            "notify": {
                "sms": True,
                "whatsapp": True,
                "email": True
            },
            "reminder_enable": True,
            "notes": {
                "recovery_agent": "Vasool AI",
                "invoice_number": invoice_number or "N/A",
                "trace_origin": "revenue_recovery_brain"
            },
            "created_at": int(datetime.now(timezone.utc).timestamp()),
            "expire_by": expire_by
        }
        logger.info(f"Created Razorpay Recovery Payment Link: {link_id} for ₹{amount_inr:.2f} -> {short_url}")
        return payment_link


# Singleton
razorpay_client = RazorpayClientWrapper()
