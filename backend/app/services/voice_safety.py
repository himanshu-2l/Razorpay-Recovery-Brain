"""
Voice Safety Filter & Regulatory Guardrail
==========================================
Enforces strict adherence to:
1. RBI Master Direction on Digital Payment Security Controls:
   - Zero credential collection over voice (no OTP, UPI PIN, CVV, passwords).
   - Voice agent is strictly consultative — never asks the user to authenticate a transaction over the phone.
2. Responsible Collections & Dispute Sensitivity:
   - Pre-call check blocks calls to customers with pending disputes or sensitive regulatory flags.
   - Fallback to self-service payment links (SMS/WhatsApp).
"""

import re
import logging
from typing import Dict, Any, Optional
from datetime import datetime
import pytz

logger = logging.getLogger(__name__)

IST = pytz.timezone("Asia/Kolkata")

# Exact forbidden credential terms under RBI security guidelines
FORBIDDEN_KEYWORDS = [
    "pin",
    "otp",
    "password",
    "cvv",
    "upi pin",
    "enter code",
    "card number",
    "expiry date",
    "mpin",
    "atm pin",
    "passcode",
]

SAFE_FALLBACK_TEXT = (
    "Aapko ek secure payment link bheja gaya hai WhatsApp pe. "
    "Kripya us link par click karke payment karein. "
    "Koi bhi sensitive jankari phone par share nahi karein."
)

MANDATORY_CLOSING_DISCLAIMER = (
    "Aapko ek secure payment link bheja gaya hai. "
    "Kripya usi se pay karein. "
    "Koi PIN ya OTP phone par share nahi karein."
)


class VoiceSafetyFilter:
    """
    Validates and sanitizes all outbound conversational scripts and governs pre-call eligibility.
    """

    @classmethod
    def validate_script(cls, script: str) -> bool:
        """
        Returns True if the script is strictly clean of any forbidden credential requests.
        Returns False if any forbidden keyword is found.
        """
        if not script:
            return True

        text_lower = script.lower()
        for keyword in FORBIDDEN_KEYWORDS:
            # Word boundary regex to avoid false positives on words like "spin" or "pine"
            pattern = rf"\b{re.escape(keyword)}\b"
            if re.search(pattern, text_lower):
                logger.warning(
                    f"VoiceSafetyFilter VIOLATION: Forbidden keyword '{keyword}' detected in script."
                )
                return False

        return True

    @classmethod
    def sanitize_script(cls, script: str) -> str:
        """
        If forbidden credential keywords are found, replaces with compliant self-service instruction.
        Ensures the mandatory compliance closing disclaimer is appended.
        """
        if not cls.validate_script(script):
            logger.info("VoiceSafetyFilter: Sanitizing script with compliant payment link notice.")
            sanitized = SAFE_FALLBACK_TEXT
        else:
            sanitized = script.strip()

        if MANDATORY_CLOSING_DISCLAIMER not in sanitized:
            sanitized = f"{sanitized} {MANDATORY_CLOSING_DISCLAIMER}"

        return sanitized

    @classmethod
    def pre_call_check(
        cls,
        customer: Dict[str, Any],
        call_time: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """
        Evaluates pre-call eligibility before dialing:
        1. Checks if customer is flagged as 'disputed_charge' or 'regulatory_sensitive'
        2. Checks statutory contact window (8:00 AM – 7:00 PM IST)
        3. Returns {'allowed': bool, 'reason': str, 'action': str}
        """
        customer_id = customer.get("id", customer.get("customer_id", "unknown"))
        customer_status = customer.get("status", "").lower()
        tags = [t.lower() for t in customer.get("tags", [])]

        # 1. Dispute / regulatory sensitivity checks
        if "dispute" in customer_status or "disputed_charge" in tags or customer.get("has_active_dispute"):
            return {
                "allowed": False,
                "reason": "Customer has an active disputed charge. Collection calls halted per policy.",
                "action": "HALT_CALL_ASSIGN_DISPUTE_DESK",
                "customer_id": customer_id,
            }

        if "regulatory_sensitive" in tags or customer.get("regulatory_sensitive"):
            return {
                "allowed": False,
                "reason": "Customer flagged as regulatory sensitive. Outbound telephony prohibited.",
                "action": "ROUTE_TO_HUMAN_COMPLIANCE_OFFICER",
                "customer_id": customer_id,
            }

        # 2. RBI Fair Practices Code contact window check (8 AM - 7 PM IST)
        effective_time = call_time or customer.get("call_time") or datetime.now(pytz.utc)
        now_ist = effective_time.astimezone(IST)
        hour = now_ist.hour
        minute = now_ist.minute
        time_minutes = hour * 60 + minute

        # 8:00 AM = 480 minutes, 7:00 PM = 1140 minutes
        if time_minutes < 480 or time_minutes > 1140:
            return {
                "allowed": False,
                "reason": (
                    f"Current time ({now_ist.strftime('%I:%M %p')} IST) is outside the statutory "
                    f"8:00 AM – 7:00 PM IST window."
                ),
                "action": "RESCHEDULE_NEXT_BUSINESS_MORNING",
                "customer_id": customer_id,
            }

        return {
            "allowed": True,
            "reason": "Customer pre-call checks verified. Telephony permitted.",
            "action": "PROCEED",
            "customer_id": customer_id,
        }
