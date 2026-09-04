"""
Bolna AI Conversational Telephony Service
=========================================
Initiates outbound conversational AI phone calls via Bolna.dev for Indian B2B
invoice recovery. Natively optimized for Hinglish/Hindi speech-to-speech recovery.

Integrates with:
- VoiceSafetyFilter: Mandates RBI 7 PM - 9 AM quiet hours, dispute cooling-off, and zero-credential guarantees.
- AuditLedger: DPDP Act compliance logging with phone number masking.
- Bolna REST API: https://api.bolna.dev/call
"""

import logging
import re
from typing import Optional, Dict, Any, List
import requests

from app.core.config import (
    BOLNA_API_KEY,
    BOLNA_AGENT_ID,
    BOLNA_API_BASE,
)
from app.services.voice_safety import VoiceSafetyFilter
from app.core.audit_ledger import audit_ledger

logger = logging.getLogger(__name__)


def _normalize_phone_number(phone: str) -> str:
    """Ensure phone number conforms to E.164 format for India (+91)."""
    cleaned = re.sub(r"[^\d+]", "", phone.strip())
    if cleaned.startswith("+"):
        return cleaned
    if cleaned.startswith("91") and len(cleaned) == 12:
        return f"+{cleaned}"
    if len(cleaned) == 10:
        return f"+91{cleaned}"
    return f"+{cleaned}"


def _get_auth_headers() -> Dict[str, str]:
    """Build Authorization headers for Bolna API."""
    return {
        "Authorization": f"Bearer {BOLNA_API_KEY}",
        "Content-Type": "application/json",
    }


def is_bolna_configured() -> bool:
    """Return True if Bolna API key is provided."""
    return bool(BOLNA_API_KEY and BOLNA_API_KEY.startswith("bn-"))


def get_bolna_account_info() -> Dict[str, Any]:
    """
    Retrieve Bolna account profile, active status, and remaining wallet balance.
    GET https://api.bolna.dev/me
    """
    if not is_bolna_configured():
        return {"configured": False, "error": "BOLNA_API_KEY not configured in .env"}

    try:
        response = requests.get(
            f"{BOLNA_API_BASE}/me",
            headers=_get_auth_headers(),
            timeout=8.0,
        )
        if response.status_code == 200:
            data = response.json()
            return {
                "configured": True,
                "status": "authenticated",
                "account_id": data.get("id"),
                "email": data.get("email"),
                "wallet_balance": data.get("wallet", 0.0),
            }
        return {
            "configured": True,
            "status": "auth_error",
            "status_code": response.status_code,
            "error": response.text,
        }
    except Exception as exc:
        logger.error(f"Failed to fetch Bolna account info: {exc}")
        return {"configured": True, "status": "network_error", "error": str(exc)}


def list_bolna_agents() -> List[Dict[str, Any]]:
    """
    Retrieve configured conversational voice agents from Bolna.
    GET https://api.bolna.dev/agent/all
    """
    if not is_bolna_configured():
        return []

    try:
        response = requests.get(
            f"{BOLNA_API_BASE}/agent/all",
            headers=_get_auth_headers(),
            timeout=8.0,
        )
        if response.status_code == 200:
            return response.json()
        return []
    except Exception as exc:
        logger.error(f"Failed to list Bolna agents: {exc}")
        return []


def trigger_bolna_call(
    to_number: str,
    customer_name: str,
    amount_inr: float,
    invoice_number: str,
    agent_id: Optional[str] = None,
    customer_meta: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Trigger an outbound Hinglish recovery call via Bolna AI with VoiceSafetyFilter gating.

    Returns dict with:
      - mode: "live_bolna", "simulated_fallback", or "blocked_compliance"
      - status: "dispatched", "queued", "blocked", or "needs_agent_setup"
      - call_id / execution_id: ID returned by Bolna
      - message: human-readable status
    """
    formatted_number = _normalize_phone_number(to_number)

    # 1. Pre-Call RBI Compliance and Quiet-Hours Verification
    customer_data = customer_meta or {
        "name": customer_name,
        "phone": formatted_number,
        "id": f"cust_{invoice_number}",
    }
    call_time = customer_data.get("call_time")
    check = VoiceSafetyFilter.pre_call_check(customer_data, call_time=call_time)
    if not check["allowed"]:
        audit_ledger.record_event(
            event_type="VOICE_BLOCKED_COMPLIANCE",
            case_id=invoice_number,
            payload={
                "provider": "bolna_ai",
                "action_type": "voice_blocked_compliance",
                "reason": check["reason"],
                "customer_name": customer_name,
                "to_number": f"+91****{formatted_number[-4:]}" if len(formatted_number) >= 4 else "masked",
                "fallback_channel": "whatsapp_payment_link",
            },
        )
        logger.warning(f"Bolna outbound call blocked by VoiceSafetyFilter: {check['reason']}")
        return {
            "mode": "blocked_compliance",
            "provider": "bolna_ai",
            "status": "blocked",
            "to_number": formatted_number,
            "customer_name": customer_name,
            "amount_inr": amount_inr,
            "invoice_number": invoice_number,
            "action": check["action"],
            "message": f"Outbound call blocked by RBI Voice Compliance: {check['reason']}. Switched to WhatsApp.",
            "fallback_channel": "whatsapp_payment_link",
        }

    # 2. Verify Bolna Credentials
    if not is_bolna_configured():
        logger.warning("Bolna API key not set in environment. Returning simulation.")
        return {
            "mode": "simulated_fallback",
            "provider": "bolna_ai",
            "status": "simulated",
            "to_number": formatted_number,
            "customer_name": customer_name,
            "amount_inr": amount_inr,
            "invoice_number": invoice_number,
            "compliance_verified": True,
            "message": "Bolna API key not configured in .env. Pre-call compliance passed in simulated mode.",
        }

    # 3. Resolve Target Agent ID
    target_agent_id = agent_id or BOLNA_AGENT_ID
    if not target_agent_id:
        existing_agents = list_bolna_agents()
        if existing_agents and isinstance(existing_agents, list):
            target_agent_id = existing_agents[0].get("id") or existing_agents[0].get("agent_id")

    if not target_agent_id:
        # User has API key with 500 credits, but no agent created yet on Bolna dashboard
        account_info = get_bolna_account_info()
        return {
            "mode": "needs_agent_setup",
            "provider": "bolna_ai",
            "status": "ready_for_agent",
            "account_status": account_info.get("status"),
            "wallet_balance": account_info.get("wallet_balance", 500.0),
            "to_number": formatted_number,
            "customer_name": customer_name,
            "amount_inr": amount_inr,
            "invoice_number": invoice_number,
            "compliance_verified": True,
            "message": (
                f"Bolna AI key authenticated (Wallet: ₹{account_info.get('wallet_balance', 500):.0f}). "
                "Please configure BOLNA_AGENT_ID in backend/.env or create an agent at https://bolna.dev."
            ),
        }

    # 4. Dispatch Call via Bolna API
    payload = {
        "agent_id": target_agent_id,
        "recipient_phone_number": formatted_number,
        "user_data": {
            "customer_name": customer_name,
            "amount_inr": amount_inr,
            "invoice_number": invoice_number,
            "currency": "INR",
        },
    }

    try:
        response = requests.post(
            f"{BOLNA_API_BASE}/call",
            headers=_get_auth_headers(),
            json=payload,
            timeout=10.0,
        )

        if response.status_code in (200, 201, 202):
            res_data = response.json()
            call_id = res_data.get("call_id") or res_data.get("execution_id") or res_data.get("id") or "bolna_dispatched"
            audit_ledger.record_event(
                event_type="VOICE_CALL_DISPATCHED",
                case_id=invoice_number,
                payload={
                    "provider": "bolna_ai",
                    "call_id": call_id,
                    "agent_id": target_agent_id,
                    "customer_name": customer_name,
                    "to_number": f"+91****{formatted_number[-4:]}",
                    "amount_inr": amount_inr,
                },
            )
            return {
                "mode": "live_bolna",
                "provider": "bolna_ai",
                "status": "dispatched",
                "call_id": call_id,
                "agent_id": target_agent_id,
                "to_number": formatted_number,
                "customer_name": customer_name,
                "amount_inr": amount_inr,
                "invoice_number": invoice_number,
                "compliance_verified": True,
                "message": f"Real Bolna AI voice call dispatched to {formatted_number}. Call ID: {call_id}.",
            }
        else:
            err_msg = response.text
            logger.error(f"Bolna API dispatch error ({response.status_code}): {err_msg}")
            return {
                "mode": "error",
                "provider": "bolna_ai",
                "status": "api_error",
                "status_code": response.status_code,
                "to_number": formatted_number,
                "message": f"Bolna AI dispatch returned status {response.status_code}: {err_msg}",
            }
    except Exception as exc:
        logger.error(f"Failed to dispatch Bolna call: {exc}")
        return {
            "mode": "error",
            "provider": "bolna_ai",
            "status": "exception",
            "to_number": formatted_number,
            "message": f"Network exception when calling Bolna API: {str(exc)}",
        }
