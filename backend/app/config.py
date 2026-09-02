"""
Application Configuration
=========================
Centralized settings for database connections, idempotency store, and service credentials.
Supports enterprise PostgreSQL 15 with asyncpg and localized SQLite fallback.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# PostgreSQL Async Engine URL (Production) / SQLite Async Fallback (Local Test)
# When POSTGRES_USER/DB is set or DATABASE_URL begins with postgresql, uses asyncpg.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/revenue_recovery"
)

# SQLite Mutex Path: Isolated solely for the file-level atomic idempotency lock
SQLITE_MUTEX_PATH = os.getenv("SQLITE_MUTEX_PATH", "./idempotency_store.db")

# Telephony & Gateway Credentials
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_mock_1234567890")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "mock_secret_abcdef1234567890")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER", "")
