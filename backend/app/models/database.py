"""
Database models for Revenue Recovery Brain.

Five core entities:
- Customer: the person/business behind the revenue leak
- Transaction: payment attempts (from Razorpay webhooks)
- Invoice: B2B receivables (synthetic batch)
- Case: the recovery case (diagnosis + intervention + outcome)
- AuditLog: every decision logged for compliance
"""

import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text,
    Enum, ForeignKey, JSON, Index, create_engine
)
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import uuid

Base = declarative_base()


def generate_uuid():
    return str(uuid.uuid4())


def utcnow():
    return datetime.now(timezone.utc)


# ─── Enums ───────────────────────────────────────────────────────────────

class LeakType(str, enum.Enum):
    PAYMENT_FAILURE = "payment_failure"
    CHECKOUT_ABANDONMENT = "checkout_abandonment"
    SUBSCRIPTION_FAILURE = "subscription_failure"
    B2B_RECEIVABLE = "b2b_receivable"


class RootCause(str, enum.Enum):
    # Payment failure causes
    TD_BANK_DOWN = "td_bank_down"           # Technical Decline - bank infra
    TD_NPCI_TIMEOUT = "td_npci_timeout"     # Technical Decline - NPCI
    BD_INSUFFICIENT_FUNDS = "bd_insufficient_funds"  # Business Decline
    BD_WRONG_PIN = "bd_wrong_pin"           # Business Decline - auth
    BD_LIMIT_EXCEEDED = "bd_limit_exceeded" # Business Decline - limits
    MANDATE_REAUTH = "mandate_reauth"       # RBI mandate re-auth needed
    CARD_EXPIRED = "card_expired"           # Payment method expired

    # Checkout causes
    CHECKOUT_PAYMENT_MISMATCH = "checkout_payment_mismatch"
    CHECKOUT_3DS_FAILURE = "checkout_3ds_failure"
    CHECKOUT_PRICE_SHOCK = "checkout_price_shock"
    CHECKOUT_FRICTION = "checkout_friction"

    # Subscription causes
    SUB_MANDATE_BUG = "sub_mandate_bug"     # The documented RBI >15K bug
    SUB_CARD_EXPIRED = "sub_card_expired"
    SUB_BALANCE = "sub_balance"

    # Receivable causes
    RECV_CASH_FLOW = "recv_cash_flow"       # Genuine cash flow issue
    RECV_DISPUTE = "recv_dispute"           # Invoice disputed
    RECV_OVERSIGHT = "recv_oversight"       # Just forgot / chasing failure
    RECV_CHRONIC = "recv_chronic"           # Chronic late payer

    UNKNOWN = "unknown"


class InterventionType(str, enum.Enum):
    RETRY = "retry"
    REAUTH = "reauth"
    WHATSAPP_NUDGE = "whatsapp_nudge"
    EMAIL_NUDGE = "email_nudge"
    VOICE_CALL = "voice_call"
    ESCALATE_HUMAN = "escalate_human"
    STOP = "stop"
    NONE = "none"


class CaseStatus(str, enum.Enum):
    OPEN = "open"
    DIAGNOSING = "diagnosing"
    INTERVENING = "intervening"
    AWAITING_RESPONSE = "awaiting_response"
    RECOVERED = "recovered"
    PARTIALLY_RECOVERED = "partially_recovered"
    FAILED = "failed"
    ESCALATED = "escalated"
    STOPPED = "stopped"  # Compliance or exhaustion


class ComplianceAction(str, enum.Enum):
    ALLOWED = "allowed"
    BLOCKED_TIME_WINDOW = "blocked_time_window"
    BLOCKED_FREQUENCY = "blocked_frequency"
    BLOCKED_EXHAUSTED = "blocked_exhausted"
    BLOCKED_DUPLICATE = "blocked_duplicate"
    BLOCKED_ECONOMIC_FLOOR = "blocked_economic_floor"
    RESCHEDULED = "rescheduled"


# ─── Models ──────────────────────────────────────────────────────────────

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String)
    phone = Column(String)
    company = Column(String)  # For B2B
    customer_type = Column(String, default="individual")  # individual / business
    razorpay_customer_id = Column(String)  # From Razorpay
    total_lifetime_value = Column(Float, default=0.0)
    risk_score = Column(Float, default=0.0)  # 0-1, higher = riskier
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    transactions = relationship("Transaction", back_populates="customer")
    invoices = relationship("Invoice", back_populates="customer")
    cases = relationship("Case", back_populates="customer")

    __table_args__ = (
        Index("idx_customer_phone", "phone"),
        Index("idx_customer_email", "email"),
    )


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=generate_uuid)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    razorpay_payment_id = Column(String)
    razorpay_order_id = Column(String)
    amount = Column(Float, nullable=False)  # In paise
    currency = Column(String, default="INR")
    payment_method = Column(String)  # card / upi / netbanking / wallet
    status = Column(String)  # created / authorized / captured / failed
    error_code = Column(String)  # Razorpay error code
    error_description = Column(String)
    error_source = Column(String)  # bank / gateway / customer
    gateway_response = Column(JSON)  # Full gateway response for classifier
    is_recurring = Column(Boolean, default=False)
    subscription_id = Column(String)
    attempt_count = Column(Integer, default=1)
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    customer = relationship("Customer", back_populates="transactions")

    __table_args__ = (
        Index("idx_txn_payment_id", "razorpay_payment_id"),
        Index("idx_txn_customer", "customer_id"),
        Index("idx_txn_created", "created_at"),
    )


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String, primary_key=True, default=generate_uuid)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    invoice_number = Column(String, nullable=False)
    amount = Column(Float, nullable=False)  # In INR
    due_date = Column(DateTime, nullable=False)
    days_overdue = Column(Integer, default=0)
    aging_bucket = Column(String)  # 0-30 / 31-60 / 61-90 / 91-120 / 120+
    payment_terms = Column(String, default="NET30")
    status = Column(String, default="overdue")  # paid / overdue / partially_paid / disputed
    partial_amount_paid = Column(Float, default=0.0)
    promise_to_pay_date = Column(DateTime)
    promise_to_pay_amount = Column(Float)
    broken_promises = Column(Integer, default=0)
    last_contact_date = Column(DateTime)
    contact_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    customer = relationship("Customer", back_populates="invoices")

    __table_args__ = (
        Index("idx_invoice_status_due_date", "status", "due_date"),
        Index("idx_invoice_customer", "customer_id"),
    )


class Case(Base):
    __tablename__ = "cases"

    id = Column(String, primary_key=True, default=generate_uuid)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    transaction_id = Column(String, ForeignKey("transactions.id"))
    invoice_id = Column(String, ForeignKey("invoices.id"))

    leak_type = Column(Enum(LeakType), nullable=False)
    amount_at_risk = Column(Float, nullable=False)  # INR
    amount_recovered = Column(Float, default=0.0)

    # Diagnosis
    root_cause = Column(Enum(RootCause))
    root_cause_confidence = Column(Float)  # 0-1
    reasoning_chain = Column(Text)  # LLM's explanation of why this root cause
    diagnosis_timestamp = Column(DateTime)

    # Intervention
    chosen_intervention = Column(Enum(InterventionType))
    intervention_reason = Column(Text)  # Why this action over alternatives
    alternatives_rejected = Column(JSON)  # List of {action, reason_rejected}
    intervention_timestamp = Column(DateTime)

    # Compliance
    compliance_status = Column(Enum(ComplianceAction))
    compliance_rule_cited = Column(String)  # Which rule blocked/allowed
    rescheduled_to = Column(DateTime)

    # Outcome
    status = Column(Enum(CaseStatus), default=CaseStatus.OPEN)
    outcome_notes = Column(Text)

    # Cross-reference
    related_case_ids = Column(JSON)  # Other cases for same customer

    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    customer = relationship("Customer", back_populates="cases")
    transaction = relationship("Transaction")
    invoice = relationship("Invoice")
    audit_logs = relationship("AuditLog", back_populates="case")

    __table_args__ = (
        Index("idx_case_leak_status", "leak_type", "status"),
        Index("idx_case_customer", "customer_id"),
        Index("idx_case_created", "created_at"),
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    case_id = Column(String, ForeignKey("cases.id"), nullable=False)
    timestamp = Column(DateTime, default=utcnow)
    action = Column(String, nullable=False)  # diagnosed / intervened / compliance_check / outcome
    actor = Column(String, default="system")  # system / voice_agent / human
    details = Column(JSON, nullable=False)
    # Example details:
    # {"step": "diagnosis", "root_cause": "bd_insufficient_funds", "confidence": 0.92, "reasoning": "..."}
    # {"step": "compliance_check", "rule": "contact_window", "result": "blocked", "reason": "21:04 IST outside 8AM-7PM"}
    # {"step": "intervention", "type": "whatsapp_nudge", "message": "...", "delivery_status": "simulated"}
    # {"step": "voice_call", "transcript": "...", "promise_to_pay": "2026-09-15", "amount": 85000}

    case = relationship("Case", back_populates="audit_logs")

    __table_args__ = (
        Index("idx_audit_case_time", "case_id", "timestamp"),
        Index("idx_audit_action", "action"),
    )


# ─── Database Setup ──────────────────────────────────────────────────────

async def init_db(database_url: str = "sqlite+aiosqlite:///./recovery_brain.db"):
    """Create all tables."""
    engine = create_async_engine(database_url, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    return engine


def get_session_factory(engine):
    """Get async session factory."""
    return sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
