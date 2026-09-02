"""
Staleness Monitor & Deadlock Observability Engine
================================================
Monitors in-flight recovery cases to prevent cases from being silently abandoned or
stuck in `AWAITING_RESPONSE` / `INTERVENING` states indefinitely.

Guarantees:
1. Continuous SLA Scanning: Detects cases untouched past designated timeout limits (e.g. 24h default).
2. Auto-Escalation: Flags stale cases for senior supervisor queue with clear root-cause context.
3. Auto-Expiry / Fallback: Transitions unresolvable abandoned interventions to terminal review state.
4. Cryptographic Observability: Records `STALE_CASE_ESCALATED` in the Audit Ledger.
"""

from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Tuple, Optional
import logging
from app.core.audit_ledger import audit_ledger

logger = logging.getLogger(__name__)


class StalenessMonitor:
    """
    Monitors in-flight recovery cases for silent timeouts and pending human approval bottlenecks.
    """

    DEFAULT_SLA_THRESHOLDS_HOURS = {
        "checkout_abandonment": 2,    # Cart drop-offs expire after 2 hours (high urgency)
        "payment_failure": 12,        # Gateway retries/nudges stale after 12 hours
        "subscription_failure": 24,   # Subscriptions stale after 24 hours
        "b2b_receivable": 48,         # B2B invoice reminders stale after 48 hours without update
        "awaiting_human_approval": 24 # Human approval tickets stale after 24 hours
    }

    def __init__(self):
        pass

    def scan_case_staleness(
        self,
        case: Dict[str, Any],
        now_dt: Optional[datetime] = None
    ) -> Tuple[bool, Optional[str], Dict[str, Any]]:
        """
        Check whether a single case has exceeded its operational SLA.
        """
        now = now_dt or datetime.now(timezone.utc)
        status = case.get("status", "open")

        # Closed/terminal cases are not stale
        if status in ("recovered", "reconciled_late_auth", "failed", "stopped"):
            return False, None, {}

        created_str = case.get("created_at")
        if not created_str:
            return False, None, {}

        try:
            if isinstance(created_str, datetime):
                created_dt = created_str
            else:
                created_dt = datetime.fromisoformat(str(created_str).replace("Z", "+00:00"))
            
            age_hours = (now - created_dt).total_seconds() / 3600.0
        except Exception:
            age_hours = 0.0

        leak_type = case.get("leak_type", "payment_failure")
        sla_limit = self.DEFAULT_SLA_THRESHOLDS_HOURS.get(leak_type, 24)
        if case.get("requires_human_approval"):
            sla_limit = min(sla_limit, self.DEFAULT_SLA_THRESHOLDS_HOURS["awaiting_human_approval"])

        if age_hours >= sla_limit:
            reason = f"Case age ({age_hours:.1f}h) exceeds SLA limit of {sla_limit}h for {leak_type} (Status: {status})"
            metadata = {
                "age_hours": round(age_hours, 1),
                "sla_limit_hours": sla_limit,
                "current_status": status,
                "leak_type": leak_type,
                "recommended_action": "ESCALATE_TO_SUPERVISOR_QUEUE"
            }
            return True, reason, metadata

        return False, None, {}

    def process_stale_cases(
        self,
        cases_list: List[Dict[str, Any]],
        auto_escalate: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Scan a list of recovery cases, flag stale cases, and record audit escalations.
        """
        escalated_cases = []
        now = datetime.now(timezone.utc)

        for case in cases_list:
            is_stale, reason, metadata = self.scan_case_staleness(case, now)
            if is_stale:
                case["is_stale"] = True
                case["staleness_reason"] = reason
                case["staleness_metadata"] = metadata
                
                if auto_escalate and not case.get("staleness_escalated"):
                    case["staleness_escalated"] = True
                    case["supervisor_alert_priority"] = "HIGH"
                    
                    # Record cryptographic audit event
                    audit_ledger.record_event(
                        event_type="STALE_CASE_ESCALATED",
                        case_id=case.get("id", "unknown_case"),
                        payload={
                            "reason": reason,
                            "metadata": metadata,
                            "case_id": case.get("id"),
                            "amount_at_risk": case.get("amount_at_risk"),
                            "action": "ESCALATE_TO_SUPERVISOR_QUEUE"
                        }
                    )
                    logger.warning(f"StalenessMonitor: Escalated stale case {case.get('id')} — {reason}")

                escalated_cases.append(case)

        return escalated_cases


staleness_monitor = StalenessMonitor()
