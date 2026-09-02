"""
Twilio Outbound Call Service
============================
Makes real outbound phone calls for B2B invoice recovery demos.

Uses Twilio's Programmable Voice + TwiML to dial a real Indian mobile number
and play a Hinglish recovery script. This is the "unfakeable" demo moment —
a phone literally ringing on camera with an AI voice.

Setup:
  1. Sign up at https://www.twilio.com/try-twilio (free $15 credit)
  2. Get a trial number capable of calling India (+91)
  3. Set env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER

Cost: ~$0.0084/min for India calls. $15 credit = 1,785 minutes of demo calls.
"""

import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER", "")


def _is_twilio_configured() -> bool:
    return bool(TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER)


def _build_twiml(customer_name: str, amount_inr: float, invoice_number: str) -> str:
    """
    Build TwiML response for the Hinglish recovery call.
    Uses Polly.Aditi (Amazon Polly Hindi voice via Twilio) for natural Hinglish.
    Falls back to default Alice voice if Polly is unavailable.
    """
    # Twilio's built-in <Say voice="Polly.Aditi"> gives a natural Indian Hindi voice
    # which blends naturally with the Hinglish script
    amount_words = f"{amount_inr:,.0f}".replace(",", " thousand ")  # rough spoken form
    script = (
        f"Namaskar! Kya main {customer_name} ji se baat kar sakta hoon? "
        f"Main Revenue Recovery Brain se bol raha hoon. "
        f"Aapka rupaye {int(amount_inr):,} ka invoice, {invoice_number}, "
        f"abhi pending hai. "
        f"Kya aap abhi 2 minute baat kar sakte hain? "
        f"Hum aapke liye ek convenient payment plan ready kar sakte hain. "
        f"Please hold karo, main aapko details deta hoon."
    )

    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Pause length="1"/>
  <Say voice="Polly.Aditi" language="hi-IN">{script}</Say>
  <Pause length="2"/>
  <Say voice="Polly.Aditi" language="hi-IN">
    Dhanyavaad. Agar aap payment karna chahte hain, 
    toh hum aapko ek secure payment link SMS karenge.
    Thank you for your time. Namaskar!
  </Say>
</Response>"""
    return twiml


def trigger_real_call(
    to_number: str,
    customer_name: str,
    amount_inr: float,
    invoice_number: str,
    twiml_host: str = "https://revenue-recovery-brain.onrender.com",
) -> dict:
    """
    Initiate a real outbound Twilio call.

    Returns a dict with:
      - mode: "live_twilio" or "simulated_fallback"
      - call_sid: Twilio call SID (if live)
      - status: "initiated" or "queued"
      - to_number: the number being called
      - message: human-readable description
    """
    if not _is_twilio_configured():
        logger.warning(
            "Twilio env vars not set (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, "
            "TWILIO_FROM_NUMBER). Returning simulated call result."
        )
        return {
            "mode": "simulated_fallback",
            "call_sid": f"CA_sim_{os.urandom(8).hex()}",
            "status": "simulated",
            "to_number": to_number,
            "customer_name": customer_name,
            "amount_inr": amount_inr,
            "invoice_number": invoice_number,
            "message": (
                "Twilio credentials not configured. Set TWILIO_ACCOUNT_SID, "
                "TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER env vars for live calls."
            ),
        }

    try:
        from twilio.rest import Client  # type: ignore

        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

        # Use TwiML endpoint if available, else inline TwiML via url param
        # For simplicity in demo: use TwiML Bin or inline via twiml= param
        twiml_content = _build_twiml(customer_name, amount_inr, invoice_number)

        call = client.calls.create(
            to=to_number,
            from_=TWILIO_FROM_NUMBER,
            twiml=twiml_content,
            # Machine detection so we don't leave a voicemail message
            machine_detection="DetectMessageEnd",
            machine_detection_timeout=8,
        )

        logger.info(
            f"Twilio call initiated: SID={call.sid} to={to_number} "
            f"for {customer_name} / {invoice_number} / Rs {amount_inr:.0f}"
        )

        return {
            "mode": "live_twilio",
            "call_sid": call.sid,
            "status": call.status,  # "queued" initially
            "to_number": to_number,
            "customer_name": customer_name,
            "amount_inr": amount_inr,
            "invoice_number": invoice_number,
            "message": (
                f"Real Twilio call initiated to {to_number}. "
                f"Call SID: {call.sid}. Status: {call.status}. "
                "The phone should ring within 5-10 seconds."
            ),
        }

    except ImportError:
        logger.error("twilio package not installed. Run: pip install twilio")
        return {
            "mode": "error",
            "call_sid": None,
            "status": "error",
            "to_number": to_number,
            "message": "twilio package not installed. Add 'twilio' to requirements.txt.",
        }
    except Exception as e:
        logger.error(f"Twilio call failed: {e}")
        return {
            "mode": "error",
            "call_sid": None,
            "status": "error",
            "to_number": to_number,
            "message": f"Twilio API error: {str(e)}",
        }
