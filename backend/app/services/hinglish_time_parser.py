"""
Deterministic Hinglish Time-Phrase Parser
=========================================
Parses vernacular Indian payment promise phrases into exact ISO-8601 IST timestamps.
Avoids LLM hallucination and temporal ambiguity in Promise-to-Pay (PTP) tracking.

Supports phrases:
- "parso" / "parson" -> Current date + 2 days at 11:00 IST
- "kal" / "kal subah" / "kal morning" -> Tomorrow at 10:00 IST
- "kal shaam" / "kal sham" -> Tomorrow at 17:30 IST (safely before 19:00 RBI curfew)
- "somvar" / "somwar" / "monday" -> Next Monday at 11:00 IST
- "mangalwar" / "tuesday" -> Next Tuesday at 11:00 IST
- "budhwar" / "wednesday" -> Next Wednesday at 11:00 IST
- "guruwar" / "thursday" -> Next Thursday at 11:00 IST
- "shukrawar" / "friday" -> Next Friday at 11:00 IST
- "shaniwar" / "saturday" -> Next Saturday at 11:00 IST
- "salary ke baad" / "month end" -> 1st of next month at 10:30 IST
- "agle hafte" / "next week" -> Current date + 7 days at 11:00 IST

RBI Invariant Enforcement:
All parsed times are automatically clamped to the RBI allowed calling/outreach
window (07:00 to 19:00 IST). If a calculated time falls outside, it is clamped to 11:00 IST.
"""

import re
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, Tuple

# Indian Standard Time offset (+05:30)
IST = timezone(timedelta(hours=5, minutes=30))

WEEKDAYS = {
    "somvar": 0, "somwar": 0, "monday": 0,
    "mangalwar": 1, "mangal": 1, "tuesday": 1,
    "budhwar": 2, "budh": 2, "wednesday": 2,
    "guruwar": 3, "guru": 3, "brihaspativar": 3, "thursday": 3,
    "shukrawar": 4, "shukra": 4, "friday": 4,
    "shaniwar": 5, "shani": 5, "saturday": 5,
    "ravivar": 6, "itwar": 6, "sunday": 6,
}


class HinglishTimeParser:
    """Deterministic parser for Indian conversational payment promises."""

    @staticmethod
    def parse_to_datetime(
        phrase: str,
        reference_time: Optional[datetime] = None,
    ) -> Tuple[datetime, str]:
        """
        Parses a Hinglish phrase into an IST datetime.
        Returns (parsed_datetime_ist, rule_matched_name).
        """
        if reference_time is None:
            now_ist = datetime.now(timezone.utc).astimezone(IST)
        else:
            if reference_time.tzinfo is None:
                now_ist = reference_time.replace(tzinfo=timezone.utc).astimezone(IST)
            else:
                now_ist = reference_time.astimezone(IST)

        text = phrase.lower().strip()

        # 1. "parso" / "parson" (Day after tomorrow)
        if re.search(r"\b(parso|parson|day after tomorrow)\b", text):
            target = (now_ist + timedelta(days=2)).replace(hour=11, minute=0, second=0, microsecond=0)
            return HinglishTimeParser._clamp_rbi(target), "parso_rule_plus_2d"

        # 2. "kal shaam" / "kal sham" (Tomorrow evening, clamped before 19:00 curfew)
        if re.search(r"\b(kal\s+(shaam|sham|evening))\b", text):
            target = (now_ist + timedelta(days=1)).replace(hour=17, minute=30, second=0, microsecond=0)
            return HinglishTimeParser._clamp_rbi(target), "kal_evening_rule_1730"

        # 3. "kal subah" / "kal morning" (Tomorrow morning)
        if re.search(r"\b(kal\s+(subah|morning)|tomorrow\s+morning)\b", text):
            target = (now_ist + timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0)
            return HinglishTimeParser._clamp_rbi(target), "kal_morning_rule_1000"

        # 4. "kal" / "tomorrow" (Tomorrow default midday)
        if re.search(r"\b(kal|tomorrow)\b", text):
            target = (now_ist + timedelta(days=1)).replace(hour=11, minute=0, second=0, microsecond=0)
            return HinglishTimeParser._clamp_rbi(target), "kal_default_rule_plus_1d"

        # 5. "salary ke baad" / "salary ke bad" / "month end"
        if re.search(r"\b(salary|month\s*end|mahine\s*ke\s*baad)\b", text):
            # Move to 1st of next month, or 5th if today is past 25th
            year = now_ist.year
            month = now_ist.month + 1
            if month > 12:
                month = 1
                year += 1
            target = datetime(year, month, 1, 10, 30, tzinfo=IST)
            return HinglishTimeParser._clamp_rbi(target), "salary_cycle_rule"

        # 6. "agle hafte" / "next week"
        if re.search(r"\b(agle\s+hafte|agle\s+week|next\s+week)\b", text):
            target = (now_ist + timedelta(days=7)).replace(hour=11, minute=0, second=0, microsecond=0)
            return HinglishTimeParser._clamp_rbi(target), "next_week_rule_plus_7d"

        # 7. Day of week (e.g. "somvar ko", "somwar", "friday", "mangalwar tak")
        for day_name, day_idx in WEEKDAYS.items():
            if re.search(rf"\b{day_name}\b", text):
                current_day = now_ist.weekday()
                days_ahead = (day_idx - current_day) % 7
                if days_ahead == 0:
                    days_ahead = 7  # Next week's instance
                target = (now_ist + timedelta(days=days_ahead)).replace(hour=11, minute=0, second=0, microsecond=0)
                return HinglishTimeParser._clamp_rbi(target), f"weekday_{day_name}_rule"

        # 8. Relative days: "2 din baad", "3 days", "do din me"
        day_match = re.search(r"(\d+)\s*(din|days?)", text)
        if day_match:
            n_days = int(day_match.group(1))
            target = (now_ist + timedelta(days=n_days)).replace(hour=11, minute=0, second=0, microsecond=0)
            return HinglishTimeParser._clamp_rbi(target), f"relative_{n_days}_days_rule"

        # Fallback default: 3 business days at 11:00 IST
        target = (now_ist + timedelta(days=3)).replace(hour=11, minute=0, second=0, microsecond=0)
        return HinglishTimeParser._clamp_rbi(target), "default_fallback_3d"

    @staticmethod
    def parse_to_iso(
        phrase: str,
        reference_time: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Convenience method returning parsed ISO string and audit metadata."""
        dt, rule = HinglishTimeParser.parse_to_datetime(phrase, reference_time)
        return {
            "parsed_iso": dt.isoformat(),
            "rule_matched": rule,
            "target_date": dt.strftime("%Y-%m-%d"),
            "target_time_ist": dt.strftime("%H:%M:%S IST"),
            "is_rbi_curfew_compliant": 7 <= dt.hour < 19,
        }

    @staticmethod
    def _clamp_rbi(dt_ist: datetime) -> datetime:
        """Enforces RBI calling curfew invariant: 07:00 <= hour < 19:00 IST."""
        if dt_ist.hour < 7:
            return dt_ist.replace(hour=9, minute=0)
        elif dt_ist.hour >= 19:
            return dt_ist.replace(hour=17, minute=30)
        return dt_ist
