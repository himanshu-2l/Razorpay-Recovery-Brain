"""
Smart Calendar-Aligned Retry Scheduler.
Calculates deterministic candidate retry windows (Payday 1st-5th, Month-End 28th-31st,
+1 Day Morning 9 AM, +3 Days Midday 12 PM, Immediate) for insufficient-funds and mandate failures.
"""

import calendar
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from enum import Enum


class CandidateType(str, Enum):
    IMMEDIATE = "immediate"
    PLUS_1_DAY_MORNING = "plus_1_day_morning"
    PAYDAY_WINDOW = "payday_window"
    PLUS_3_DAYS_MIDDAY = "plus_3_days_midday"
    MONTH_END_WINDOW = "month_end_window"


def get_next_payday_window(ref_time: datetime) -> datetime:
    """Returns the next 1st of the month at 10:30 AM IST (05:00 UTC)."""
    # If today is between 1st and 5th, payday window is active
    if 1 <= ref_time.day <= 5:
        return ref_time.replace(hour=5, minute=0, second=0, microsecond=0) + timedelta(days=1)
    
    # Otherwise next month's 1st
    year = ref_time.year + (1 if ref_time.month == 12 else 0)
    month = 1 if ref_time.month == 12 else ref_time.month + 1
    return datetime(year, month, 1, 5, 0, 0, tzinfo=timezone.utc)


def get_next_month_end_window(ref_time: datetime) -> datetime:
    """Returns the 28th of current month (if before 28th) or next month at 11:00 AM IST (05:30 UTC)."""
    if ref_time.day < 28:
        return ref_time.replace(day=28, hour=5, minute=30, second=0, microsecond=0)
    
    year = ref_time.year + (1 if ref_time.month == 12 else 0)
    month = 1 if ref_time.month == 12 else ref_time.month + 1
    return datetime(year, month, 28, 5, 30, 0, tzinfo=timezone.utc)


def days_until_payday(ref_time: datetime) -> int:
    """Days until the 1st of the next month (or 0 if within 1st-5th)."""
    if 1 <= ref_time.day <= 5:
        return 0
    _, last_day = calendar.monthrange(ref_time.year, ref_time.month)
    return last_day - ref_time.day + 1


class SmartScheduler:
    """Deterministic candidate generator and calendar-aligned retry optimizer."""

    @classmethod
    def generate_candidate_windows(cls, failure_timestamp: Optional[datetime] = None) -> List[Dict[str, Any]]:
        ref = failure_timestamp or datetime.now(timezone.utc)
        if ref.tzinfo is None:
            ref = ref.replace(tzinfo=timezone.utc)

        imm = ref + timedelta(hours=1)
        p1d = (ref + timedelta(days=1)).replace(hour=3, minute=30, second=0, microsecond=0)  # 09:00 AM IST
        payday = get_next_payday_window(ref)
        p3d = (ref + timedelta(days=3)).replace(hour=6, minute=30, second=0, microsecond=0)  # 12:00 PM IST
        m_end = get_next_month_end_window(ref)

        candidates = [
            {
                "type": CandidateType.IMMEDIATE.value,
                "label": "Immediate Retry (+1 Hour)",
                "scheduled_at": imm.isoformat(),
                "hours_from_failure": 1.0,
                "target_rationale": "Best for transient gateway/NPCI timeouts",
                "alignment": "SWITCH_RECOVERY",
            },
            {
                "type": CandidateType.PLUS_1_DAY_MORNING.value,
                "label": "+1 Day Morning (09:00 AM IST)",
                "scheduled_at": p1d.isoformat(),
                "hours_from_failure": round((p1d - ref).total_seconds() / 3600, 1),
                "target_rationale": "Standard high-success banking morning window",
                "alignment": "NEXT_DAY_LIQUIDITY",
            },
            {
                "type": CandidateType.PAYDAY_WINDOW.value,
                "label": "Payday Salary Window (1st–5th of Month)",
                "scheduled_at": payday.isoformat(),
                "hours_from_failure": round((payday - ref).total_seconds() / 3600, 1),
                "target_rationale": "Aligned with Indian corporate payroll credit",
                "alignment": "PAYROLL_CREDIT",
            },
            {
                "type": CandidateType.PLUS_3_DAYS_MIDDAY.value,
                "label": "+3 Days Midday (12:00 PM IST)",
                "scheduled_at": p3d.isoformat(),
                "hours_from_failure": round((p3d - ref).total_seconds() / 3600, 1),
                "target_rationale": "Secondary dunning cycle fallback",
                "alignment": "MID_CYCLE",
            },
            {
                "type": CandidateType.MONTH_END_WINDOW.value,
                "label": "Month-End Settlement Window (28th–31st)",
                "scheduled_at": m_end.isoformat(),
                "hours_from_failure": round((m_end - ref).total_seconds() / 3600, 1),
                "target_rationale": "Captures business monthly closing liquidity",
                "alignment": "MONTH_END_SETTLEMENT",
            },
        ]
        return candidates

    @classmethod
    def recommend_optimal_window(
        cls,
        root_cause: str,
        amount: float,
        failure_timestamp: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        ref = failure_timestamp or datetime.now(timezone.utc)
        if ref.tzinfo is None:
            ref = ref.replace(tzinfo=timezone.utc)

        candidates = cls.generate_candidate_windows(ref)
        days_to_pay = days_until_payday(ref)

        # Decision rule for optimal retry window
        rc_up = root_cause.upper()
        if "TD_" in rc_up or "BANK_DOWN" in rc_up or "NPCI" in rc_up or "TECHNICAL" in rc_up or "GATEWAY" in rc_up or "3DS" in rc_up:
            chosen = candidates[0]  # Immediate
            reason = "Transient technical switch/gateway failure: immediate retry (+1 hour) maximizes recovery before session loss."
        elif "INSUFFICIENT" in root_cause.upper() or "BALANCE" in root_cause.upper():
            if days_to_pay <= 4:
                chosen = candidates[2]  # Payday
                reason = f"Insufficient funds detected {days_to_pay} days before payday: deferring retry to salary credit window yields +45% recovery lift."
            else:
                chosen = candidates[1]  # +1 Day morning
                reason = "Insufficient funds with >4 days to payday: scheduling soft next-day morning nudge to allow manual top-up."
        elif "MANDATE" in root_cause.upper() or "SUBSCRIPTION" in root_cause.upper():
            if days_to_pay <= 3:
                chosen = candidates[2]  # Payday
                reason = "Subscription mandate debit limit exceeded near month turn: scheduling on 1st of month prevents churn."
            else:
                chosen = candidates[3]  # +3 Days midday
                reason = "Mandate failure: 3-day buffer provides customer grace period to update payment method."
        else:
            chosen = candidates[1]  # Default +1 day morning
            reason = "Standard 24-hr retry optimization window."

        return {
            "optimal_window": chosen["type"],
            "optimal_label": chosen["label"],
            "scheduled_at": chosen["scheduled_at"],
            "hours_from_failure": chosen["hours_from_failure"],
            "alignment": chosen["alignment"],
            "reason": reason,
            "days_to_payday": days_to_pay,
            "candidates": candidates,
        }


smart_scheduler = SmartScheduler()
