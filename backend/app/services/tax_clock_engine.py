"""
Section 43B(h) MSME Tax Clock Engine
====================================
Leverages Section 43B(h) of the Income Tax Act (effective AY 2024-25) &
Section 15 of the MSMED Act 2006 to provide mathematical B2B negotiation leverage.

Key Regulatory Mechanics:
1. Buyer Payment Window: 45 days (with written contract) / 15 days (without contract).
2. Tax Consequence: If unpaid within 45 days, buyer CANNOT deduct the invoice expense
   in the financial year incurred. Deduction is deferred to the year actually paid.
3. Deferral Cost: Time value of deferred tax deduction = Amount * Corporate Tax Rate (25%) * Annual Discount Rate (12%).
4. Negotiation Inversion: Transforms a dunning call into a consultative tax-saving conversation.
"""

from dataclasses import dataclass
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional


# Section 15, MSMED Act 2006
MSME_STATUTORY_WINDOW_DAYS = 45

# Standard corporate tax rate & cost of capital in India
ASSUMED_CORPORATE_TAX_RATE = 0.25
ASSUMED_ANNUAL_DISCOUNT_RATE = 0.12


@dataclass(frozen=True)
class TaxClockStatus:
    applies: bool
    invoice_amount: float
    due_date: str
    deadline_date: str
    days_overdue: int
    days_until_45d_deadline: int
    is_breached: bool
    deferral_cost_inr: float
    urgency_level: str  # 'routine', 'elevated', 'critical', 'breached', 'not_applicable'
    cfo_negotiation_lever: str
    hinglish_script_snippet: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "applies": self.applies,
            "invoice_amount": self.invoice_amount,
            "due_date": self.due_date,
            "deadline_date": self.deadline_date,
            "days_overdue": self.days_overdue,
            "days_until_45d_deadline": self.days_until_45d_deadline,
            "is_breached": self.is_breached,
            "deferral_cost_inr": round(self.deferral_cost_inr, 2),
            "urgency_level": self.urgency_level,
            "cfo_negotiation_lever": self.cfo_negotiation_lever,
            "hinglish_script_snippet": self.hinglish_script_snippet,
        }


class TaxClockEngine:
    """
    Evaluates Section 43B(h) compliance exposure and generates B2B leverage insights.
    """

    @staticmethod
    def evaluate(
        amount: float,
        days_overdue: int,
        is_msme_supplier: bool = True,
        has_written_contract: bool = True,
        tax_rate: float = ASSUMED_CORPORATE_TAX_RATE,
        discount_rate: float = ASSUMED_ANNUAL_DISCOUNT_RATE,
    ) -> TaxClockStatus:
        """
        Evaluate Section 43B(h) tax status for an invoice.
        """
        if not is_msme_supplier or amount <= 0:
            return TaxClockStatus(
                applies=False,
                invoice_amount=amount,
                due_date="",
                deadline_date="",
                days_overdue=days_overdue,
                days_until_45d_deadline=0,
                is_breached=False,
                deferral_cost_inr=0.0,
                urgency_level="not_applicable",
                cfo_negotiation_lever="Section 43B(h) does not apply to non-MSME transactions.",
                hinglish_script_snippet="Standard invoice recovery follow-up.",
            )

        window_limit_days = MSME_STATUTORY_WINDOW_DAYS if has_written_contract else 15
        days_until_deadline = window_limit_days - days_overdue
        is_breached = days_until_deadline < 0

        # Calculate time-value deferral cost: Amount * Tax Rate * Discount Rate
        deferral_cost = amount * tax_rate * discount_rate

        # Determine urgency level
        if is_breached:
            urgency = "breached"
        elif days_until_deadline <= 7:
            urgency = "critical"
        elif days_until_deadline <= 20:
            urgency = "elevated"
        else:
            urgency = "routine"

        # Generate CFO negotiation guidance
        if is_breached:
            cfo_lever = (
                f"The {window_limit_days}-day MSMED statutory window closed {abs(days_until_deadline)} days ago. "
                f"Under Section 43B(h), this ₹{amount:,.0f} expense is no longer deductible in the current FY; "
                f"settling immediately allows claiming the deduction in the upcoming audit cycle."
            )
            hinglish_script = (
                f"Sir, Section 43B(h) ke compliance ke mutabik 45 days ka window cross ho chuka hai. "
                f"Agar aap aaj ₹{amount:,.0f} settle karte hain toh hum formal confirmation bhej denge taaki aapke CA ko audit deduction me issue na aaye."
            )
        else:
            cfo_lever = (
                f"{days_until_deadline} days remain before the 45-day MSME window closes. "
                f"Settling before the deadline preserves ₹{amount:,.0f} deduction in the current FY, "
                f"avoiding ~₹{deferral_cost:,.0f} in tax deferral penalty."
            )
            hinglish_script = (
                f"Namaste Sir, invoice ₹{amount:,.0f} ke 45 days complete hone me sirf {days_until_deadline} din bache hain. "
                f"Section 43B(h) ke tehat time par payment karne se aapki company ka ₹{deferral_cost:,.0f} ka tax deduction benefit preserve rahega."
            )

        now = datetime.now(timezone.utc)
        due_date_str = (now - timedelta(days=days_overdue)).strftime("%Y-%m-%d")
        deadline_date_str = (now + timedelta(days=days_until_deadline)).strftime("%Y-%m-%d")

        return TaxClockStatus(
            applies=True,
            invoice_amount=amount,
            due_date=due_date_str,
            deadline_date=deadline_date_str,
            days_overdue=days_overdue,
            days_until_45d_deadline=days_until_deadline,
            is_breached=is_breached,
            deferral_cost_inr=deferral_cost,
            urgency_level=urgency,
            cfo_negotiation_lever=cfo_lever,
            hinglish_script_snippet=hinglish_script,
        )


tax_clock_engine = TaxClockEngine()
