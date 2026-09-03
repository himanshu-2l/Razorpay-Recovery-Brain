"""
Cross-Leak Customer Risk Profile Store
======================================
Unified state store linking customer signals across all 4 recovery funnels:
1. Retail Payment Failures
2. Checkout Abandonments
3. Subscription Mandates
4. B2B Receivables & Broken Promise-to-Pay (PTP)

Provides concrete, demonstrable cross-leak unification where events in one
funnel actively inform diagnosis, risk scoring, and routing in all others.
"""

from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from threading import Lock


@dataclass
class CustomerRiskProfile:
    customer_id: str
    customer_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

    # 1. B2B Receivables Context
    active_b2b_invoices: List[Dict[str, Any]] = field(default_factory=list)
    total_b2b_overdue_inr: float = 0.0
    broken_promises_count: int = 0
    max_days_overdue: int = 0

    # 2. Payment Failure Context
    failed_payment_count_30d: int = 0
    last_payment_failure_root_cause: Optional[str] = None
    last_payment_failure_ts: Optional[str] = None

    # 3. Checkout Abandonment Context
    recent_abandonments: List[Dict[str, Any]] = field(default_factory=list)
    abandonment_count_7d: int = 0
    last_abandonment_stage: Optional[str] = None

    # 4. Subscription Mandate Context
    has_active_mandate: bool = False
    mandate_failure_count: int = 0

    # 5. Composite Risk Assessment
    cross_leak_risk_score: float = 0.15
    cross_leak_summary: str = "Standard Profile: Single-funnel activity."
    updated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def update_summary(self):
        """Recompute composite cross-leak risk and human-readable explanation."""
        signals = []
        if self.total_b2b_overdue_inr > 0:
            signals.append(f"₹{self.total_b2b_overdue_inr:,.0f} overdue B2B trade debt ({self.max_days_overdue}d overdue)")
        if self.broken_promises_count > 0:
            signals.append(f"{self.broken_promises_count} broken PTP(s)")
        if self.failed_payment_count_30d > 1:
            signals.append(f"{self.failed_payment_count_30d} recent payment failures")
        if self.abandonment_count_7d > 0:
            signals.append(f"abandoned cart at {self.last_abandonment_stage or 'checkout'}")

        if signals:
            self.cross_leak_summary = f"CROSS-LEAK UNIFIED: Active multi-funnel exposure ({'; '.join(signals)})."
            # Composite risk calculation
            score = 0.20
            if self.total_b2b_overdue_inr > 25000:
                score += 0.35
            elif self.total_b2b_overdue_inr > 0:
                score += 0.20
            if self.broken_promises_count > 0:
                score += min(0.30, self.broken_promises_count * 0.15)
            if self.failed_payment_count_30d >= 2:
                score += 0.15
            self.cross_leak_risk_score = min(0.99, round(score, 2))
        else:
            self.cross_leak_summary = "Standard Profile: Single-funnel transaction."
            self.cross_leak_risk_score = 0.15

        self.updated_at = datetime.now(timezone.utc).isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class CustomerRiskProfileStore:
    """Thread-safe in-memory store for cross-leak customer intelligence."""

    def __init__(self):
        self._profiles: Dict[str, CustomerRiskProfile] = {}
        self._lock = Lock()

    def get_or_create(
        self,
        customer_id: str,
        customer_name: Optional[str] = None,
        email: Optional[str] = None,
        phone: Optional[str] = None,
    ) -> CustomerRiskProfile:
        with self._lock:
            if customer_id not in self._profiles:
                self._profiles[customer_id] = CustomerRiskProfile(
                    customer_id=customer_id,
                    customer_name=customer_name,
                    email=email,
                    phone=phone,
                )
            profile = self._profiles[customer_id]
            if customer_name and not profile.customer_name:
                profile.customer_name = customer_name
            if email and not profile.email:
                profile.email = email
            if phone and not profile.phone:
                profile.phone = phone
            return profile

    def get(self, customer_id: str) -> Optional[CustomerRiskProfile]:
        with self._lock:
            return self._profiles.get(customer_id)

    def record_leak_event(
        self,
        customer_id: str,
        leak_type_value: str,
        data: Dict[str, Any],
    ) -> CustomerRiskProfile:
        """Update cross-leak profile based on incoming failure/abandonment/invoice event."""
        with self._lock:
            if customer_id not in self._profiles:
                cust_info = data.get("customer") if isinstance(data.get("customer"), dict) else {}
                self._profiles[customer_id] = CustomerRiskProfile(
                    customer_id=customer_id,
                    customer_name=data.get("customer_name") or cust_info.get("name"),
                    email=data.get("customer_email") or cust_info.get("email"),
                    phone=data.get("customer_phone") or cust_info.get("phone"),
                )

            profile = self._profiles[customer_id]

            lt = str(leak_type_value).lower()
            if "b2b" in lt or "receivable" in lt:
                amount = float(data.get("amount_inr") or data.get("amount", 0.0))
                days = int(data.get("days_overdue", 0))
                broken_ptp = int(data.get("broken_promises", 0))
                invoice_num = data.get("invoice_number", f"INV-{len(profile.active_b2b_invoices)+1}")

                # Avoid duplicate invoice records
                if not any(inv.get("invoice_number") == invoice_num for inv in profile.active_b2b_invoices):
                    profile.active_b2b_invoices.append({
                        "invoice_number": invoice_num,
                        "amount_inr": amount,
                        "days_overdue": days,
                        "recorded_at": datetime.now(timezone.utc).isoformat(),
                    })
                    profile.total_b2b_overdue_inr += amount
                profile.broken_promises_count = max(profile.broken_promises_count, broken_ptp)
                profile.max_days_overdue = max(profile.max_days_overdue, days)

            elif "payment_failure" in lt:
                profile.failed_payment_count_30d += 1
                profile.last_payment_failure_root_cause = data.get("error_code") or data.get("root_cause")
                profile.last_payment_failure_ts = datetime.now(timezone.utc).isoformat()

            elif "checkout" in lt or "abandon" in lt:
                profile.abandonment_count_7d += 1
                profile.last_abandonment_stage = data.get("abandonment_stage") or data.get("step")
                profile.recent_abandonments.append({
                    "stage": profile.last_abandonment_stage,
                    "cart_value": data.get("cart_value", 0),
                    "recorded_at": datetime.now(timezone.utc).isoformat(),
                })

            elif "sub" in lt or "mandate" in lt:
                profile.has_active_mandate = True
                profile.mandate_failure_count += 1

            profile.update_summary()
            return profile

    def reset(self):
        """Clear store for tests."""
        with self._lock:
            self._profiles.clear()


cross_leak_store = CustomerRiskProfileStore()
