"""
Compliance + Audit Layer — Every action passes through this gate.

Implements a Responsible Collections Policy inspired by RBI Fair Practices Code principles:
- Contact window: 8 AM – 7 PM IST only
- Max contact frequency per customer per week
- No abusive/coercive language
- Exhaustion rules (max attempts → escalate, never repeat)
- Full audit trail per case

The compliance layer saying NO is more impressive than the agent saying YES.
"""

from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional

from app.models.database import ComplianceAction, InterventionType

IST = timezone(timedelta(hours=5, minutes=30))

# Responsible Collections Policy parameters (inspired by RBI Fair Practices principles)
CONTACT_WINDOW_START = 8   # 8 AM IST
CONTACT_WINDOW_END = 19    # 7 PM IST
MAX_CONTACTS_PER_WEEK = 3  # Per customer
MAX_CONTACTS_PER_DAY = 1   # Per customer
MAX_TOTAL_ATTEMPTS = 7     # Before mandatory human escalation
VOICE_CALL_COOLDOWN_HOURS = 48  # Min hours between voice calls to same person
ECONOMIC_FLOOR_INR = 100.0  # Min recoverable value before triggering expensive AI/telephony outreach


class ComplianceEngine:
    """
    Gatekeeper that checks every intervention against Responsible Collections Policy
    (grounded in RBI Fair Practices principles) and internal stopping rules before allowing execution.
    """

    def check(
        self,
        intervention: InterventionType,
        customer_id: str,
        contact_history: Optional[List[Dict]] = None,
        current_time: Optional[datetime] = None,
        amount_at_risk: float = 0.0,
    ) -> Dict[str, Any]:
        """
        Run all compliance checks on a proposed intervention.

        Returns:
        {
            "action": ComplianceAction (allowed/blocked_*/rescheduled),
            "rule_cited": str,
            "details": str,
            "rescheduled_to": Optional[datetime],
        }
        """
        if contact_history is None:
            contact_history = []

        if current_time is None:
            current_time = datetime.now(timezone.utc)

        # Non-contact interventions pass through (RETRY, REAUTH, NONE, STOP)
        if intervention in (
            InterventionType.RETRY,
            InterventionType.REAUTH,
            InterventionType.NONE,
            InterventionType.STOP,
        ):
            return {
                "action": ComplianceAction.ALLOWED,
                "rule_cited": "Non-outreach intervention — no customer contact restrictions apply",
                "details": f"{intervention.value} is an automated/system action, allowed immediately.",
                "rescheduled_to": None,
            }

        # Check 0: Economic Floor Stopping Rule (Minimum Viable Recovery Value)
        # Prevents spending ₹15 telephony or ₹2.5 WhatsApp compute to chase ₹45 invoices
        if amount_at_risk > 0 and amount_at_risk < ECONOMIC_FLOOR_INR:
            return {
                "action": ComplianceAction.BLOCKED_ECONOMIC_FLOOR,
                "rule_cited": "Economic Floor Rule — Minimum viable recovery threshold ₹100",
                "details": (
                    f"Amount at risk (₹{amount_at_risk:.2f}) is below the ₹{ECONOMIC_FLOOR_INR:.0f} economic viability threshold. "
                    f"Outreach compute/telephony cost exceeds expected recovery. Action aborted by policy engine."
                ),
                "rescheduled_to": None,
            }

        # Check 1: Time of day (8 AM – 7 PM IST only)
        ist_time = current_time.astimezone(IST)
        hour = ist_time.hour

        if hour < CONTACT_WINDOW_START or hour >= CONTACT_WINDOW_END:
            if hour >= CONTACT_WINDOW_END:
                # After 7 PM → tomorrow 10 AM
                next_day = ist_time + timedelta(days=1)
                next_allowed = next_day.replace(
                    hour=10, minute=0, second=0, microsecond=0
                )
            else:
                # Before 8 AM → same day 10 AM
                next_allowed = ist_time.replace(
                    hour=10, minute=0, second=0, microsecond=0
                )

            return {
                "action": ComplianceAction.BLOCKED_TIME_WINDOW,
                "rule_cited": "Responsible Collections Policy (RBI FPC Principles) — Contact permitted only 8 AM – 7 PM IST",
                "details": (
                    f"Current time: {ist_time.strftime('%I:%M %p IST')}. "
                    f"Contact blocked outside 8 AM – 7 PM window. "
                    f"Action rescheduled to: {next_allowed.strftime('%B %d, %I:%M %p IST')}"
                ),
                "rescheduled_to": next_allowed.astimezone(timezone.utc),
            }

        # Check 2: Daily contact limit
        today_contacts = self._count_contacts_today(contact_history, current_time)
        if today_contacts >= MAX_CONTACTS_PER_DAY:
            tomorrow_10am = (ist_time + timedelta(days=1)).replace(
                hour=10, minute=0, second=0, microsecond=0
            )
            return {
                "action": ComplianceAction.BLOCKED_DUPLICATE,
                "rule_cited": f"Daily contact limit — max {MAX_CONTACTS_PER_DAY} contact(s) per customer per day",
                "details": (
                    f"Customer already contacted {today_contacts} time(s) today. "
                    f"Rescheduled to tomorrow."
                ),
                "rescheduled_to": tomorrow_10am.astimezone(timezone.utc),
            }

        # Check 3: Weekly contact limit
        week_contacts = self._count_contacts_this_week(contact_history, current_time)
        if week_contacts >= MAX_CONTACTS_PER_WEEK:
            return {
                "action": ComplianceAction.BLOCKED_FREQUENCY,
                "rule_cited": f"Weekly contact limit — max {MAX_CONTACTS_PER_WEEK} contacts per customer per week",
                "details": (
                    f"Customer contacted {week_contacts} times this week "
                    f"(limit: {MAX_CONTACTS_PER_WEEK}). Hold until next week."
                ),
                "rescheduled_to": None,  # Don't auto-reschedule weekly limit
            }

        # Check 4: Total attempt exhaustion
        total_contacts = len(contact_history)
        if total_contacts >= MAX_TOTAL_ATTEMPTS:
            return {
                "action": ComplianceAction.BLOCKED_EXHAUSTED,
                "rule_cited": f"Maximum attempts exhausted — {MAX_TOTAL_ATTEMPTS} total contacts reached",
                "details": (
                    f"Customer has been contacted {total_contacts} times total "
                    f"(max: {MAX_TOTAL_ATTEMPTS}). Mandatory escalation to human review. "
                    f"Automated recovery is done — never repeat."
                ),
                "rescheduled_to": None,
            }

        # Check 5: Voice call cooldown
        if intervention == InterventionType.VOICE_CALL:
            last_voice = self._last_voice_call(contact_history)
            if last_voice:
                hours_since = (current_time - last_voice).total_seconds() / 3600
                if hours_since < VOICE_CALL_COOLDOWN_HOURS:
                    return {
                        "action": ComplianceAction.BLOCKED_FREQUENCY,
                        "rule_cited": f"Voice call cooldown — minimum {VOICE_CALL_COOLDOWN_HOURS} hours between calls",
                        "details": (
                            f"Last voice call was {hours_since:.1f} hours ago. "
                            f"Minimum cooldown: {VOICE_CALL_COOLDOWN_HOURS} hours."
                        ),
                        "rescheduled_to": (
                            last_voice + timedelta(hours=VOICE_CALL_COOLDOWN_HOURS)
                        ),
                    }

        # All checks passed
        return {
            "action": ComplianceAction.ALLOWED,
            "rule_cited": "all_checks_passed",
            "details": (
                f"All compliance checks passed. "
                f"Contact window: OK ({ist_time.strftime('%I:%M %p IST')}). "
                f"Daily: {today_contacts}/{MAX_CONTACTS_PER_DAY}. "
                f"Weekly: {week_contacts}/{MAX_CONTACTS_PER_WEEK}. "
                f"Total: {total_contacts}/{MAX_TOTAL_ATTEMPTS}."
            ),
            "rescheduled_to": None,
        }

    def _count_contacts_today(
        self, history: List[Dict], current_time: datetime
    ) -> int:
        """Count contacts made today (IST)."""
        today_ist = current_time.astimezone(IST).date()
        count = 0
        for entry in history:
            ts = entry.get("timestamp")
            if isinstance(ts, str):
                ts = datetime.fromisoformat(ts)
            if ts and ts.astimezone(IST).date() == today_ist:
                count += 1
        return count

    def _count_contacts_this_week(
        self, history: List[Dict], current_time: datetime
    ) -> int:
        """Count contacts in the last 7 days."""
        week_ago = current_time - timedelta(days=7)
        count = 0
        for entry in history:
            ts = entry.get("timestamp")
            if isinstance(ts, str):
                ts = datetime.fromisoformat(ts)
            if ts and ts > week_ago:
                count += 1
        return count

    def _last_voice_call(self, history: List[Dict]) -> Optional[datetime]:
        """Find the most recent voice call timestamp."""
        voice_calls = [
            entry for entry in history
            if entry.get("intervention_type") == "voice_call"
        ]
        if not voice_calls:
            return None
        latest = max(voice_calls, key=lambda x: x.get("timestamp", ""))
        ts = latest.get("timestamp")
        if isinstance(ts, str):
            return datetime.fromisoformat(ts)
        return ts

    def generate_compliance_report(
        self, all_checks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate a summary compliance report for the dashboard."""
        total = len(all_checks)
        allowed = sum(1 for c in all_checks if c["action"] == ComplianceAction.ALLOWED)
        blocked = total - allowed

        blocked_by_rule = {}
        for check in all_checks:
            if check["action"] != ComplianceAction.ALLOWED:
                rule = check["rule_cited"]
                blocked_by_rule[rule] = blocked_by_rule.get(rule, 0) + 1

        return {
            "total_checks": total,
            "allowed": allowed,
            "blocked": blocked,
            "compliance_rate": round(allowed / max(total, 1) * 100, 1),
            "blocked_by_rule": blocked_by_rule,
            "summary": (
                f"{allowed}/{total} actions allowed. "
                f"{blocked} actions blocked by compliance rules."
            ),
        }
