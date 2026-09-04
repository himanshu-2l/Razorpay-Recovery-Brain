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

# Exact forbidden credential terms under RBI Digital Payment Security Guidelines
# Supports English, Hinglish, transliterated variants, and Devanagari equivalents
FORBIDDEN_KEYWORDS = [
    # English & Transliterated Core Credentials
    "pin",
    "otp",
    "password",
    "passcode",
    "pass code",
    "cvv",
    "cvc",
    "upi pin",
    "upipin",
    "enter code",
    "card number",
    "cardnumber",
    "expiry date",
    "expirydate",
    "mpin",
    "atm pin",
    "atmpin",
    "security code",
    "securitycode",
    "one time password",
    "onetimepassword",
    # Hindi / Devanagari Credential Terms
    "पिन",
    "ओटीपी",
    "पासवर्ड",
    "पासकोड",
    "सीवीवी",
    "सीवीसी",
    "यूपीआई पिन",
    "यूपीआईपिन",
    "एमपिन",
    "एटीएम पिन",
    "एटीएमपिन",
    "कार्ड नंबर",
    "कार्ड संख्या",
    "एक्सपायरी डेट",
    "समाप्ति तिथि",
    "गुप्त कोड",
    "गोपनीय कोड",
    "सुरक्षा कोड",
    "वन टाइम पासवर्ड",
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
    def normalize_script(cls, script: str) -> str:
        """
        Normalizes script by stripping evasive punctuation and collapsing
        spaced-out letters (e.g. 'o.t.p.' -> 'otp', 'p-i-n' -> 'pin', 'p i n' -> 'pin').
        """
        if not script:
            return ""

        text = script.lower()

        # 1. Strip non-word punctuation symbols that break word boundaries
        cleaned = re.sub(r"[\.\-\_\,\;\:\/\*\#\@\+\=\~\|\^\(\)\[\]\{\}\<\>\?\"\'\!]", "", text)

        # 2. Collapse spaced-out single Latin letters (e.g. "o t p" -> "otp", "p i n" -> "pin", "p a s s w o r d" -> "password")
        collapsed = re.sub(r"(?<=\b[a-zA-Z])\s+(?=[a-zA-Z]\b)", "", cleaned)
        while True:
            nxt = re.sub(r"(?<=\b[a-zA-Z])\s+(?=[a-zA-Z]\b)", "", collapsed)
            if nxt == collapsed:
                break
            collapsed = nxt

        # 3. Collapse common spaced-out Devanagari credential terms (e.g. "ओ टी पी" -> "ओटीपी", "सी वी वी" -> "सीवीवी")
        devanagari_spaced = [
            (r"ओ\s+टी\s+पी", "ओटीपी"),
            (r"सी\s+वी\s+वी", "सीवीवी"),
            (r"यू\s+पी\s+आई", "यूपीआई"),
            (r"पि\s+न|प\s+िन|प\s+ि\s+न", "पिन"),
            (r"पा\s+स\s+व\s+र्ड|पास\s+वर्ड", "पासवर्ड"),
        ]
        for pattern, repl in devanagari_spaced:
            collapsed = re.sub(pattern, repl, collapsed)

        return collapsed

    @classmethod
    def validate_script(cls, script: str) -> bool:
        """
        Returns True if the script is strictly clean of any forbidden credential requests.
        Returns False if any forbidden keyword is found in original or normalized script.
        """
        if not script:
            return True

        normalized = cls.normalize_script(script)
        targets = [script.lower(), normalized]

        for target in targets:
            for keyword in FORBIDDEN_KEYWORDS:
                # Boundary regex compatible with both Latin and Unicode/Devanagari characters
                pattern = rf"(?:^|[^\w\u0900-\u097F]){re.escape(keyword)}(?:$|[^\w\u0900-\u097F])"
                if re.search(pattern, target):
                    logger.warning(
                        f"VoiceSafetyFilter VIOLATION: Forbidden keyword '{keyword}' detected in script."
                    )
                    return False

        return True

    @classmethod
    def validate_turn(cls, text: str, speaker: str = "agent") -> bool:
        """
        Per-turn conversational guardrail: validates an individual dialogue turn.
        Enforces that agent turns never request sensitive credentials.
        """
        if speaker.lower() == "agent":
            return cls.validate_script(text)
        return True

    @classmethod
    def sanitize_turn(cls, text: str, speaker: str = "agent") -> str:
        """
        Sanitizes an individual conversational turn if it contains forbidden credential terms.
        """
        if speaker.lower() == "agent" and not cls.validate_script(text):
            logger.info("VoiceSafetyFilter: Sanitizing agent conversational turn.")
            return (
                "Aapko ek secure payment link bheja gaya hai WhatsApp pe. "
                "Kripya us link par click karke payment karein. "
                "Koi bhi sensitive jankari phone par share nahi karein."
            )
        return text

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
        if isinstance(effective_time, (int, float)):
            now_ist = datetime.now(IST).replace(hour=int(effective_time), minute=int((effective_time % 1) * 60))
        elif hasattr(effective_time, "astimezone"):
            if effective_time.tzinfo is None:
                effective_time = pytz.utc.localize(effective_time)
            now_ist = effective_time.astimezone(IST)
        else:
            now_ist = datetime.now(IST)
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
