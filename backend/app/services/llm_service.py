"""
LLM Service — Ollama Client for GPU Server
==========================================

Connects to your on-premise 6× RTX 2080 Ti server running Ollama.
Exposes three capabilities:

1. resolve_ambiguous_case()   — Mistral-7B reasons over low-confidence diagnoses
2. generate_hinglish_call()   — Llama-3-8B generates adaptive per-debtor dialogue
3. analyze_dispute_text()     — Llama-3-8B classifies B2B invoice disputes

Design contract:
- ALL methods return a result even if the GPU server is offline (graceful fallback)
- Timeout: 8 seconds per call (tuned for Mistral-7B on 2080 Ti)
- If GPU server unreachable → method returns None → caller uses rule-based result
"""

import json
import logging
import os
from typing import Any, Dict, List, Optional

import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

from app.core.config import (
    LLM_SERVER_URL,
    LLM_DIAGNOSIS_MODEL as DIAGNOSIS_MODEL,
    LLM_DIALOGUE_MODEL as DIALOGUE_MODEL,
    LLM_TIMEOUT_SECONDS as TIMEOUT_SECONDS,
)

OLLAMA_API_URL = f"{LLM_SERVER_URL}/api/generate"
OLLAMA_CHAT_URL = f"{LLM_SERVER_URL}/api/chat"
OLLAMA_TAGS_URL = f"{LLM_SERVER_URL}/api/tags"

_client: Optional[httpx.AsyncClient] = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(timeout=httpx.Timeout(TIMEOUT_SECONDS))
    return _client


# ── Health Check ───────────────────────────────────────────────────────────────

async def is_server_available() -> bool:
    """Ping Ollama to check if the GPU server is reachable."""
    try:
        client = _get_client()
        resp = await client.get(OLLAMA_TAGS_URL, timeout=2.0)
        return resp.status_code == 200
    except Exception:
        return False


async def get_server_info() -> Dict[str, Any]:
    """Return server status, loaded models, and VRAM info if available."""
    try:
        client = _get_client()
        resp = await client.get(OLLAMA_TAGS_URL, timeout=3.0)
        if resp.status_code == 200:
            data = resp.json()
            models = [m["name"] for m in data.get("models", [])]
            return {
                "status": "online",
                "server_url": LLM_SERVER_URL,
                "loaded_models": models,
                "diagnosis_model_ready": any(DIAGNOSIS_MODEL.split(":")[0] in m for m in models),
                "dialogue_model_ready": any(DIALOGUE_MODEL.split(":")[0] in m for m in models),
            }
    except Exception as e:
        logger.debug(f"GPU server health check failed: {e}")
    return {"status": "offline", "server_url": LLM_SERVER_URL}


# ── Core: Ambiguous Case Resolver ─────────────────────────────────────────────

async def resolve_ambiguous_case(
    error_code: str,
    error_description: str,
    error_source: str,
    amount: int,
    attempt_count: int,
    method: str,
    customer_history_summary: str = "",
) -> Optional[Dict[str, Any]]:
    """
    Use Mistral-7B to reason over a payment failure the rule engine couldn't classify.

    Returns dict with: root_cause, confidence (0.0–1.0), reasoning_chain
    Returns None if GPU server unreachable (caller should keep rule-engine result).
    """
    prompt = f"""You are an expert Razorpay payment failure analyst.
Classify the root cause of this payment failure as one of:
- TD_BANK_DOWN (bank/NPCI infrastructure down — retry WILL help)
- TD_NPCI_TIMEOUT (UPI switch timeout — immediate retry helps)
- BD_INSUFFICIENT_FUNDS (customer has no money — retry useless)
- BD_WRONG_PIN (wrong PIN/OTP — customer needs guidance)
- BD_LIMIT_EXCEEDED (daily/monthly limit — customer needs to retry later)
- CARD_EXPIRED (card expired — need card update)
- MANDATE_REAUTH (autopay mandate expired — need re-authorization)
- CHECKOUT_FRICTION (UX/friction issue — checkout improvement needed)
- UNKNOWN (genuinely unclear)

Payment details:
- Error Code: {error_code}
- Error Description: {error_description}
- Error Source: {error_source}
- Amount: ₹{amount / 100:,.0f}
- Payment Method: {method}
- Attempt Count: {attempt_count}
{f"- Customer History: {customer_history_summary}" if customer_history_summary else ""}

Respond ONLY with valid JSON, no explanation outside JSON:
{{
  "root_cause": "<one of the values above>",
  "confidence": <float between 0.0 and 1.0>,
  "reasoning": "<one sentence explaining the classification>"
}}"""

    try:
        client = _get_client()
        resp = await client.post(
            OLLAMA_API_URL,
            json={
                "model": DIAGNOSIS_MODEL,
                "prompt": prompt,
                "stream": False,
                "format": "json",
                "options": {"temperature": 0.1, "top_p": 0.9, "num_predict": 200},
            },
        )
        if resp.status_code != 200:
            logger.warning(f"Ollama diagnosis returned HTTP {resp.status_code}")
            return None

        raw = resp.json().get("response", "")
        data = json.loads(raw)

        # Validate expected fields
        if "root_cause" not in data or "confidence" not in data:
            logger.warning(f"Ollama returned unexpected structure: {data}")
            return None

        # Clamp confidence to [0, 1]
        data["confidence"] = max(0.0, min(1.0, float(data["confidence"])))
        logger.info(
            f"LLM resolved ambiguous case: {data['root_cause']} "
            f"(confidence={data['confidence']:.2f})"
        )
        return data

    except json.JSONDecodeError as e:
        logger.warning(f"LLM returned non-JSON for diagnosis: {e}")
        return None
    except (httpx.TimeoutException, httpx.ConnectError) as e:
        logger.info(f"GPU server unreachable for diagnosis (falling back to rules): {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected LLM service error: {e}", exc_info=True)
        return None


# ── Core: Dynamic Hinglish Dialogue Generator ─────────────────────────────────

async def generate_hinglish_call(
    debtor_name: str,
    debtor_company: str,
    invoice_number: str,
    amount: float,
    days_overdue: int,
    prior_contact_count: int = 0,
    dispute_flag: bool = False,
    language_preference: str = "hinglish",
) -> Optional[List[Dict[str, Any]]]:
    """
    Use Llama-3-8B to generate a unique, context-adaptive Hinglish debt recovery conversation.

    Returns a list of dialogue steps:
    [{"step": 1, "speaker": "agent", "text": "...", "translation": "..."}]
    Returns None if GPU server unreachable (caller falls back to scripted dialogue).
    """
    tone = "firm but respectful" if days_overdue > 60 else "warm and empathetic"
    prior_context = (
        f"This is contact attempt #{prior_contact_count + 1}."
        if prior_contact_count > 0
        else "This is the first contact."
    )
    dispute_context = (
        "The business has indicated they may have a dispute. Handle carefully — do NOT threaten."
        if dispute_flag
        else ""
    )

    amount_words = _format_amount_in_words(amount)

    prompt = f"""Generate a realistic Hinglish (Hindi + English mix) phone conversation for recovering an overdue B2B invoice.

Context:
- Debtor: {debtor_name}, {debtor_company}
- Invoice: {invoice_number}
- Amount: ₹{amount:,.0f} ({amount_words})
- Days Overdue: {days_overdue} days
- Tone: {tone}
- {prior_context}
{dispute_context}

Rules:
- Agent speaks natural Hinglish (mix Hindi words naturally into English sentences, like Indian professionals speak)
- Debtor responds realistically — initially hesitant, eventually commits to a date
- NEVER use threatening language
- ALWAYS end with a specific Promise-to-Pay date
- Exactly 6 exchanges (3 agent, 3 debtor)
- Each line MUST have a translation

Respond ONLY with valid JSON array:
[
  {{"step": 1, "speaker": "agent", "text": "<Hinglish text>", "translation": "<English translation>"}},
  {{"step": 2, "speaker": "debtor", "text": "<Hinglish response>", "translation": "<English translation>"}},
  {{"step": 3, "speaker": "agent", "text": "<Hinglish>", "translation": "<English>"}},
  {{"step": 4, "speaker": "debtor", "text": "<Hinglish>", "translation": "<English>"}},
  {{"step": 5, "speaker": "agent", "text": "<Hinglish>", "translation": "<English>"}},
  {{"step": 6, "speaker": "debtor", "text": "<Hinglish PTP commitment>", "translation": "<English>"}}
]"""

    try:
        client = _get_client()
        resp = await client.post(
            OLLAMA_API_URL,
            json={
                "model": DIALOGUE_MODEL,
                "prompt": prompt,
                "stream": False,
                "format": "json",
                "options": {"temperature": 0.7, "top_p": 0.95, "num_predict": 800},
            },
        )
        if resp.status_code != 200:
            return None

        raw = resp.json().get("response", "")
        flow = json.loads(raw)

        if not isinstance(flow, list) or len(flow) < 4:
            logger.warning(f"LLM dialogue returned invalid structure: {flow}")
            return None

        logger.info(
            f"LLM generated dynamic Hinglish dialogue for {debtor_name} "
            f"({days_overdue}d overdue, {len(flow)} steps)"
        )
        return flow

    except json.JSONDecodeError as e:
        logger.warning(f"LLM returned non-JSON for dialogue: {e}")
        return None
    except (httpx.TimeoutException, httpx.ConnectError) as e:
        logger.info(f"GPU server unreachable for dialogue gen (using scripted): {e}")
        return None
    except Exception as e:
        logger.error(f"LLM dialogue generation error: {e}", exc_info=True)
        return None


# ── Core: B2B Dispute Analyzer ─────────────────────────────────────────────────

async def analyze_dispute_text(
    dispute_text: str,
    invoice_number: str,
    amount: float,
    vendor_name: str,
) -> Optional[Dict[str, Any]]:
    """
    Classify a B2B dispute free-text into actionable categories.

    Returns:
    {
      "category": "legitimate_dispute" | "cash_flow_delay" | "evasion_pattern" | "unclear",
      "confidence": float,
      "recommended_action": "stop_recovery" | "soft_ptp" | "escalate_to_human" | "continue_normal",
      "reasoning": str,
      "risk_score": int (1-10, 10 = highest risk of non-payment)
    }
    """
    prompt = f"""You are an expert B2B accounts receivable analyst specializing in Indian SME payment behavior.

Analyze this invoice dispute and classify it:

Vendor: {vendor_name}
Invoice: {invoice_number}
Amount: ₹{amount:,.0f}
Dispute Text: "{dispute_text}"

Categories:
- "legitimate_dispute": Genuine product/service quality issue. Stop recovery, escalate to account manager.
- "cash_flow_delay": Business genuinely short on cash, no bad intent. Negotiate payment plan.
- "evasion_pattern": Vague excuses, pattern suggests deliberate delay. Escalate to collections.
- "unclear": Cannot determine from text alone.

Respond ONLY with valid JSON:
{{
  "category": "<category>",
  "confidence": <0.0 to 1.0>,
  "recommended_action": "<stop_recovery|soft_ptp|escalate_to_human|continue_normal>",
  "reasoning": "<one sentence>",
  "risk_score": <1-10>
}}"""

    try:
        client = _get_client()
        resp = await client.post(
            OLLAMA_API_URL,
            json={
                "model": DIALOGUE_MODEL,
                "prompt": prompt,
                "stream": False,
                "format": "json",
                "options": {"temperature": 0.1, "top_p": 0.9, "num_predict": 300},
            },
        )
        if resp.status_code != 200:
            return None

        raw = resp.json().get("response", "")
        data = json.loads(raw)

        if "category" not in data:
            return None

        data["confidence"] = max(0.0, min(1.0, float(data.get("confidence", 0.5))))
        data["risk_score"] = max(1, min(10, int(data.get("risk_score", 5))))
        logger.info(
            f"LLM dispute analysis: {data['category']} "
            f"(risk={data['risk_score']}/10, action={data['recommended_action']})"
        )
        return data

    except json.JSONDecodeError:
        return None
    except (httpx.TimeoutException, httpx.ConnectError):
        return None
    except Exception as e:
        logger.error(f"LLM dispute analysis error: {e}", exc_info=True)
        return None


# ── Helpers ────────────────────────────────────────────────────────────────────

def _format_amount_in_words(amount: float) -> str:
    """Format ₹ amount in Indian numbering words (lakhs/crores)."""
    if amount >= 10_000_000:
        return f"{amount / 10_000_000:.1f} crore"
    elif amount >= 100_000:
        return f"{amount / 100_000:.1f} lakh"
    elif amount >= 1_000:
        return f"{amount / 1_000:.0f} thousand"
    return str(int(amount))
