"""
Rakshak Recovery Agent — DPDP Consent & Compliance Gate
======================================================
Coordinates autonomous B2B and B2C collection outreach with mandatory DPDP Act 2023
consent verification and RBI Fair Practices Code enforcement.
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone

from app.core.dpdp_compliance import dpdp_consent_manager
from app.core.audit_ledger import audit_ledger
from app.services.voice_safety import VoiceSafetyFilter

logger = logging.getLogger(__name__)


class RakshakRecoveryAgent:
    """
    Autonomous collection agent enforcing:
    1. DPDP Act 2023 Consent verification before ANY outreach.
    2. Consent acquisition workflows (request consent before demanding payment).
    3. Voice safety and credential solicitation prohibition.
    """

    def __init__(self):
        self.consent_manager = dpdp_consent_manager

    def evaluate_outreach(
        self,
        customer_id: str,
        channel: str,  # 'voice', 'whatsapp', 'email'
        amount_inr: float,
        invoice_number: str,
        customer_meta: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Gating check before initiating outreach.
        Returns:
          - allowed: bool
          - action: PROCEED, SEND_CONSENT_OPT_IN, or BLOCK_CONSENT_REVOKED
          - message: str
        """
        # 1. DPDP Consent Check
        has_consent = self.consent_manager.check_consent(customer_id, channel)
        if not has_consent:
            audit_ledger.record_event(
                event_type="DPDP_OUTREACH_HALTED_NO_CONSENT",
                case_id=invoice_number,
                payload={
                    "customer_id": customer_id,
                    "channel": channel,
                    "reason": f"No active DPDP consent for channel {channel}. Swapping to opt-in flow.",
                }
            )
            return {
                "allowed": False,
                "action": "SEND_CONSENT_OPT_IN_WHATSAPP",
                "channel": "whatsapp",
                "message": (
                    "Aapke invoice settlement ke sambhandh mein hum aapse sampark karna chahte hain. "
                    "Kripya 'AGREE' reply karke communication consent pradan karein (DPDP Act 2023)."
                ),
                "statutory_basis": "DPDP Act 2023 Section 6 Notice & Consent",
            }

        # 2. Voice-specific safety gating
        if channel == "voice":
            meta = customer_meta or {"id": customer_id}
            pre_check = VoiceSafetyFilter.pre_call_check(meta, call_time=meta.get("call_time"))
            if not pre_check["allowed"]:
                return {
                    "allowed": False,
                    "action": pre_check["action"],
                    "channel": "whatsapp_payment_link",
                    "message": pre_check["reason"],
                    "statutory_basis": "RBI Fair Practices Code & Dispute Gating",
                }

        return {
            "allowed": True,
            "action": "PROCEED_WITH_OUTREACH",
            "channel": channel,
            "message": "Customer has active valid DPDP consent and passes all compliance gates.",
            "statutory_basis": "COMPLIANT_ACTIVE",
        }


rakshak_agent = RakshakRecoveryAgent()
# Backward-compatibility aliases
vasool_agent = rakshak_agent
VasoolRecoveryAgent = RakshakRecoveryAgent
