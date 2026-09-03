"""
Central Application Configuration Module
========================================
Single source of truth for all database connections, external API credentials,
telephony gateways, LLM endpoints, and regulatory/financial policy thresholds.

Supports local development fallbacks and enterprise production overrides via environment variables.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Automatically load environment variables from .env file if present
_BASE_DIR = Path(__file__).resolve().parent.parent.parent
_ENV_FILE = _BASE_DIR / ".env"
if _ENV_FILE.exists():
    load_dotenv(_ENV_FILE)
else:
    load_dotenv()

# ==============================================================================
# Database & Mutex Store Configuration
# ==============================================================================
DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres_secure_password@localhost:5432/revenue_recovery"
)

SQLITE_MUTEX_PATH: str = os.getenv("SQLITE_MUTEX_PATH", "./idempotency_store.db")
APP_ENV: str = os.getenv("APP_ENV", "development")
PORT: int = int(os.getenv("PORT", "8000"))

# ==============================================================================
# Razorpay Payment Gateway Credentials (Test Mode Sandbox)
# ==============================================================================
RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_TWnp4ewYt2QzQX")
RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "lBqXbMLDSpK7qFzkA3UWHhfV")
RAZORPAY_WEBHOOK_SECRET: str = os.getenv("RAZORPAY_WEBHOOK_SECRET", "mock_webhook_secret")
RAZORPAY_API_BASE: str = os.getenv("RAZORPAY_API_BASE", "https://api.razorpay.com/v1")

# ==============================================================================
# Telephony & Voice Notification Gateway (Twilio / Vapi)
# ==============================================================================
TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_FROM_NUMBER: str = os.getenv("TWILIO_FROM_NUMBER", "")

VAPI_API_KEY: str = os.getenv("VAPI_API_KEY", "")
VAPI_PHONE_NUMBER_ID: str = os.getenv("VAPI_PHONE_NUMBER_ID", "")

# ==============================================================================
# LLM & Local Inference Gateway (Ollama / Anthropic)
# ==============================================================================
LLM_SERVER_URL: str = os.getenv("LLM_SERVER_URL", "http://localhost:11434")
LLM_DIAGNOSIS_MODEL: str = os.getenv("LLM_DIAGNOSIS_MODEL", "mistral:7b-instruct-q4_K_M")
LLM_DIALOGUE_MODEL: str = os.getenv("LLM_DIALOGUE_MODEL", "llama3:8b-instruct-q4_K_M")
LLM_TIMEOUT_SECONDS: float = float(os.getenv("LLM_TIMEOUT_SECONDS", "8.0"))
ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")

# ==============================================================================
# Regulatory & Financial Autonomy Policy Thresholds
# ==============================================================================
# Bank rail circuit breaker trip threshold (< 30% success rate trips the breaker)
OUTAGE_THRESHOLD: float = float(os.getenv("OUTAGE_THRESHOLD", "0.30"))

# Maximum autonomous single-transaction recovery cap in normal mode (in INR)
AUTONOMY_MAX_AMOUNT_NORMAL: float = float(os.getenv("AUTONOMY_MAX_AMOUNT_NORMAL", "25000.0"))

# Contracted autonomous recovery cap during bank rail outages or error spikes (in INR)
AUTONOMY_MAX_AMOUNT_CONTRACTED: float = float(os.getenv("AUTONOMY_MAX_AMOUNT_CONTRACTED", "5000.0"))

# Minimum Expected Net Recoverable Value (ENRV) required to trigger outreach (in INR)
ECONOMIC_FLOOR_INR: float = float(os.getenv("ECONOMIC_FLOOR_INR", "100.0"))

# High-stakes intervention threshold requiring human approval before dispatch (in INR)
HIGH_STAKES_THRESHOLD_INR: float = float(os.getenv("HIGH_STAKES_THRESHOLD_INR", "50000.0"))

# Maximum permitted outbound voice recovery attempts per debtor per week (RBI limit)
MAX_VOICE_CALLS_PER_WEEK: int = int(os.getenv("MAX_VOICE_CALLS_PER_WEEK", "2"))

# Maximum permitted digital nudges (WhatsApp/SMS) per debtor per week
MAX_DIGITAL_NUDGES_PER_WEEK: int = int(os.getenv("MAX_DIGITAL_NUDGES_PER_WEEK", "3"))

# Mandatory quiet cooling-off period in hours after a debtor disputes or complains
DISPUTE_COOLDOWN_HOURS: int = int(os.getenv("DISPUTE_COOLDOWN_HOURS", "48"))
