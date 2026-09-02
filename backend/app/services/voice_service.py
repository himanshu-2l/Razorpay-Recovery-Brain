"""
Voice Service — Outbound Telephony & DPDP Retention Lifecycle
=============================================================
Manages voice calls, script sanitization, Polly TTS generation,
and schedules 90-day audio deletion and 180-day transcript retention per DPDP Act 2023.
"""

import logging
from typing import Dict, Any, Optional
from app.services.twilio_caller import trigger_real_call
from app.core.dpdp_compliance import dpdp_data_retention

logger = logging.getLogger(__name__)


class VoiceService:
    """
    High-level telephony service managing call execution and statutory retention scheduling.
    """

    @staticmethod
    def initiate_call(
        to_number: str,
        customer_name: str,
        amount_inr: float,
        invoice_number: str,
        customer_meta: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Initiates call via twilio_caller, then schedules:
        - 90-day retention for raw voice recording
        - 180-day retention for transcript text
        """
        result = trigger_real_call(
            to_number=to_number,
            customer_name=customer_name,
            amount_inr=amount_inr,
            invoice_number=invoice_number,
            customer_meta=customer_meta,
        )

        call_sid = result.get("call_sid") or f"sim_call_{invoice_number}"

        # Schedule DPDP retention deletions
        recording_sched = dpdp_data_retention.schedule_deletion(
            entity_type="voice_recording",
            entity_id=call_sid,
            retention_days=90,
        )
        transcript_sched = dpdp_data_retention.schedule_deletion(
            entity_type="call_transcript",
            entity_id=call_sid,
            retention_days=180,
        )

        result["retention_schedules"] = {
            "voice_recording_days": 90,
            "call_transcript_days": 180,
            "scheduled_recording_purge": recording_sched["delete_after"],
            "scheduled_transcript_purge": transcript_sched["delete_after"],
        }
        return result


voice_service = VoiceService()
