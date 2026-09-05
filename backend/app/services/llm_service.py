"""
LLM Service — Local & Remote Model Client Gateway
==================================================
Supports Ollama (/api/generate, /api/tags) and OpenAI-compatible v1 APIs (/v1/chat/completions, /health).

Design contract:
- Always attempts live model inference first.
- If model server is busy/offline/timing out -> returns None -> caller uses rule-based fallback.
- Application NEVER crashes regardless of local or GPU server state.
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
OLLAMA_TAGS_URL = f"{LLM_SERVER_URL}/api/tags"
V1_CHAT_URL = f"{LLM_SERVER_URL}/v1/chat/completions"
V1_MODELS_URL = f"{LLM_SERVER_URL}/v1/models"
HEALTH_URL = f"{LLM_SERVER_URL}/health"

_client: Optional[httpx.AsyncClient] = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(timeout=httpx.Timeout(TIMEOUT_SECONDS))
    return _client


# ── Health Check ───────────────────────────────────────────────────────────────

async def is_server_available() -> bool:
    """Ping health endpoints to check if local or remote LLM server is online."""
    client = _get_client()
    for endpoint in (HEALTH_URL, V1_MODELS_URL, OLLAMA_TAGS_URL):
        try:
            resp = await client.get(endpoint, timeout=2.0)
            if resp.status_code == 200:
                return True
        except Exception:
            continue
    return False


async def get_server_info() -> Dict[str, Any]:
    """Return server status, available models, and readiness info."""
    client = _get_client()
    for endpoint in (HEALTH_URL, V1_MODELS_URL, OLLAMA_TAGS_URL):
        try:
            resp = await client.get(endpoint, timeout=3.0)
            if resp.status_code == 200:
                data = resp.json()
                models = []
                if "models" in data:
                    models = [m.get("name") or m.get("id") for m in data["models"]]
                elif "data" in data:
                    models = [m.get("id") for m in data["data"]]
                
                return {
                    "status": "online",
                    "server_url": LLM_SERVER_URL,
                    "loaded_models": models,
                    "diagnosis_model_ready": True,
                    "dialogue_model_ready": True,
                }
        except Exception:
            continue
            
    return {"status": "offline", "server_url": LLM_SERVER_URL}


# ── Helper for Dual Endpoint Inference ─────────────────────────────────────────

async def _prompt_model(prompt: str, model_name: str, max_tokens: int = 400) -> Optional[str]:
    """Send prompt to v1 chat endpoint or Ollama generate endpoint."""
    client = _get_client()
    
    # 1. Try v1/chat/completions first
    try:
        resp = await client.post(
            V1_CHAT_URL,
            json={
                "model": model_name,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": max_tokens,
                "temperature": 0.2,
            },
            timeout=TIMEOUT_SECONDS,
        )
        if resp.status_code == 200:
            content = resp.json()["choices"][0]["message"]["content"]
            if content:
                return content
    except Exception:
        pass

    # 2. Try Ollama api/generate fallback
    try:
        resp = await client.post(
            OLLAMA_API_URL,
            json={
                "model": model_name,
                "prompt": prompt,
                "stream": False,
                "format": "json",
                "options": {"temperature": 0.2, "num_predict": max_tokens},
            },
            timeout=TIMEOUT_SECONDS,
        )
        if resp.status_code == 200:
            return resp.json().get("response", "")
    except Exception:
        pass

    return None


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
    prompt = f"""You are an expert Razorpay payment failure analyst.
Classify the root cause of this payment failure as one of:
- TD_BANK_DOWN
- TD_NPCI_TIMEOUT
- BD_INSUFFICIENT_FUNDS
- BD_WRONG_PIN
- BD_LIMIT_EXCEEDED
- CARD_EXPIRED
- MANDATE_REAUTH
- CHECKOUT_FRICTION
- UNKNOWN

Payment details:
- Error Code: {error_code}
- Error Description: {error_description}
- Error Source: {error_source}
- Amount: ₹{amount / 100:,.0f}
- Payment Method: {method}
- Attempt Count: {attempt_count}
{f"- Customer History: {customer_history_summary}" if customer_history_summary else ""}

Respond ONLY with valid JSON:
{{
  "root_cause": "<one of above>",
  "confidence": 0.9,
  "reasoning": "<one sentence explanation>"
}}"""

    raw = await _prompt_model(prompt, DIAGNOSIS_MODEL, max_tokens=200)
    if not raw:
        return None

    try:
        data = json.loads(raw)
        if "root_cause" in data:
            data["confidence"] = max(0.0, min(1.0, float(data.get("confidence", 0.85))))
            return data
    except Exception:
        pass
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
    prompt = f"""Generate a realistic Hinglish phone conversation for recovering an overdue B2B invoice.
Debtor: {debtor_name}, {debtor_company}
Invoice: {invoice_number}
Amount: ₹{amount:,.0f}
Days Overdue: {days_overdue}

Respond ONLY with valid JSON:
{{
  "dialogue": [
    {{"step": 1, "speaker": "agent", "text": "Namaste {debtor_name}ji, Razorpay se call kar raha hu regard invoice {invoice_number}.", "translation": "Hello Mr. {debtor_name}, calling from Razorpay regarding invoice {invoice_number}."}},
    {{"step": 2, "speaker": "debtor", "text": "Haan, payment pipeline me clear ho raha hai.", "translation": "Yes, payment is clearing in the pipeline."}},
    {{"step": 3, "speaker": "agent", "text": "Shukriya! Can we expect settlement by Friday?", "translation": "Thank you! Can we expect settlement by Friday?"}},
    {{"step": 4, "speaker": "debtor", "text": "Haan, Friday tak ho jayega.", "translation": "Yes, it will be done by Friday."}}
  ]
}}"""

    raw = await _prompt_model(prompt, DIALOGUE_MODEL, max_tokens=600)
    if not raw:
        return None

    try:
        parsed = json.loads(raw)
        if isinstance(parsed, dict) and "dialogue" in parsed:
            return parsed["dialogue"]
        elif isinstance(parsed, list):
            return parsed
    except Exception:
        pass
    return None


# ── Core: B2B Dispute Analyzer ─────────────────────────────────────────────────

async def analyze_dispute_text(
    dispute_text: str,
    invoice_number: str,
    amount: float,
    vendor_name: str,
) -> Optional[Dict[str, Any]]:
    prompt = f"""Analyze this B2B invoice dispute and classify it:
Vendor: {vendor_name}
Invoice: {invoice_number}
Amount: ₹{amount:,.0f}
Dispute Text: "{dispute_text}"

Respond ONLY with valid JSON:
{{
  "category": "legitimate_dispute",
  "confidence": 0.9,
  "recommended_action": "stop_recovery",
  "reasoning": "Product delivery delay reported",
  "risk_score": 7
}}"""

    raw = await _prompt_model(prompt, DIALOGUE_MODEL, max_tokens=250)
    if not raw:
        return None

    try:
        data = json.loads(raw)
        if "category" in data:
            return data
    except Exception:
        pass
    return None
