"""
Promise-to-Pay (PTP) Lifecycle Tracker
======================================
Formal state machine tracking customer payment commitments across voice and digital channels.

Lifecycle States:
- PROMISED: Customer committed to a specific date & amount.
- PENDING_DUE: Active waiting period (quiet period enforced on outreach).
- FULFILLED: Payment captured on or before promised date.
- BROKEN_ESCALATED: Promised date elapsed without payment -> auto-escalates to human agent.
"""

import threading
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from app.core.audit_ledger import audit_ledger


class PromiseToPay:
    def __init__(
        self,
        promise_id: str,
        case_id: str,
        customer_id: str,
        customer_name: str,
        amount_promised: float,
        promised_date: str,
        channel: str = "voice_call",
        status: str = "PENDING_DUE",
    ):
        self.promise_id = promise_id
        self.case_id = case_id
        self.customer_id = customer_id
        self.customer_name = customer_name
        self.amount_promised = amount_promised
        self.promised_date = promised_date
        self.channel = channel
        self.status = status  # PENDING_DUE, FULFILLED, BROKEN_ESCALATED
        self.created_at = datetime.now(timezone.utc).isoformat()
        self.fulfilled_at = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "promise_id": self.promise_id,
            "case_id": self.case_id,
            "customer_id": self.customer_id,
            "customer_name": self.customer_name,
            "amount_promised": self.amount_promised,
            "promised_date": self.promised_date,
            "channel": self.channel,
            "status": self.status,
            "created_at": self.created_at,
            "fulfilled_at": self.fulfilled_at,
        }


class PTPTracker:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(PTPTracker, cls).__new__(cls)
                cls._instance._init_tracker()
            return cls._instance

    def _init_tracker(self):
        self._mutex = threading.Lock()
        self._promises: Dict[str, PromiseToPay] = {}

    def record_promise(
        self,
        case_id: str,
        customer_id: str,
        customer_name: str,
        amount_promised: float,
        promised_days_ahead: int = 3,
        channel: str = "voice_call",
    ) -> PromiseToPay:
        """Record a newly negotiated Promise-to-Pay."""
        with self._mutex:
            promise_id = f"ptp_{uuid.uuid4().hex[:10]}"
            now = datetime.now(timezone.utc)
            promised_date = (now + timedelta(days=promised_days_ahead)).strftime("%Y-%m-%d")

            ptp = PromiseToPay(
                promise_id=promise_id,
                case_id=case_id,
                customer_id=customer_id,
                customer_name=customer_name,
                amount_promised=amount_promised,
                promised_date=promised_date,
                channel=channel,
                status="PENDING_DUE",
            )
            self._promises[promise_id] = ptp

            audit_ledger.record_event(
                event_type="PROMISE_TO_PAY_RECORDED",
                case_id=case_id,
                payload={
                    "promise_id": promise_id,
                    "amount": amount_promised,
                    "promised_date": promised_date,
                    "channel": channel,
                }
            )

            return ptp

    def fulfill_promise(self, case_id: str, amount_paid: float) -> Optional[PromiseToPay]:
        """Mark a promise as fulfilled when matching payment is received."""
        with self._mutex:
            for ptp in self._promises.values():
                if ptp.case_id == case_id and ptp.status == "PENDING_DUE":
                    ptp.status = "FULFILLED"
                    ptp.fulfilled_at = datetime.now(timezone.utc).isoformat()

                    audit_ledger.record_event(
                        event_type="PROMISE_TO_PAY_FULFILLED",
                        case_id=case_id,
                        payload={"promise_id": ptp.promise_id, "amount_paid": amount_paid}
                    )
                    return ptp
            return None

    def check_broken_promises(self) -> List[PromiseToPay]:
        """Check for elapsed promises and transition to BROKEN_ESCALATED."""
        broken = []
        with self._mutex:
            now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            for ptp in self._promises.values():
                if ptp.status == "PENDING_DUE" and ptp.promised_date < now_str:
                    ptp.status = "BROKEN_ESCALATED"
                    broken.append(ptp)

                    audit_ledger.record_event(
                        event_type="PROMISE_TO_PAY_BROKEN",
                        case_id=ptp.case_id,
                        payload={"promise_id": ptp.promise_id, "escalated": True}
                    )
        return broken

    def get_all(self) -> List[Dict[str, Any]]:
        with self._mutex:
            return [ptp.to_dict() for ptp in self._promises.values()]


ptp_tracker = PTPTracker()
