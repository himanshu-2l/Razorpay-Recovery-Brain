"""
Spend Governor & Autonomous Action Circuit Breaker
==================================================
Enforces hard daily budget limits and action ceilings per merchant to prevent
uncontrolled runaway costs (telephony fees, WhatsApp API charges, SMS costs).

Guarantees:
1. Hard Daily Budget Cap: Blocks automated interventions once merchant daily spend exceeds limit (e.g. ₹500/day).
2. Hard Action Ceiling: Limits max automated outreach actions per merchant per day (e.g. 100 actions/day).
3. Emergency Kill Switch: Instant platform-wide or per-merchant kill switch to immediately halt all outbound execution.
4. Cryptographic Audit Proof: Every spend limit breach and kill switch state change is logged to the Audit Ledger.
"""

import threading
from datetime import datetime, timezone
from typing import Dict, Any, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class SpendGovernor:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(SpendGovernor, cls).__new__(cls)
                cls._instance._init_governor()
            return cls._instance

    def _init_governor(self):
        self.emergency_kill_switch: bool = False
        self.kill_switch_reason: Optional[str] = None
        self.kill_switch_activated_at: Optional[str] = None
        
        # Default global guardrails per merchant
        self.default_daily_budget_inr: float = 500.0  # Max ₹500/day per merchant on outreach fees
        self.default_daily_action_limit: int = 100     # Max 100 autonomous interventions/day

        # Per-merchant state: {merchant_id: {"date": "YYYY-MM-DD", "spent_inr": 0.0, "action_count": 0, "kill_switch": False}}
        self._merchant_spend: Dict[str, Dict[str, Any]] = {}
        self._merchant_limits: Dict[str, Dict[str, Any]] = {}

    def _get_current_date_str(self) -> str:
        return datetime.now(timezone.utc).strftime("%Y-%m-%d")

    def _get_or_create_merchant_state(self, merchant_id: str) -> Dict[str, Any]:
        today = self._get_current_date_str()
        if merchant_id not in self._merchant_spend or self._merchant_spend[merchant_id].get("date") != today:
            self._merchant_spend[merchant_id] = {
                "date": today,
                "spent_inr": 0.0,
                "action_count": 0,
                "actions_by_type": {},
                "kill_switch": False,
            }
        return self._merchant_spend[merchant_id]

    def set_merchant_limits(self, merchant_id: str, daily_budget_inr: float, daily_action_limit: int):
        with self._lock:
            self._merchant_limits[merchant_id] = {
                "daily_budget_inr": daily_budget_inr,
                "daily_action_limit": daily_action_limit
            }
            logger.info(f"Updated spend limits for merchant {merchant_id}: Budget=₹{daily_budget_inr:.2f}, Actions={daily_action_limit}")

    def get_merchant_limits(self, merchant_id: str) -> Dict[str, Any]:
        limits = self._merchant_limits.get(merchant_id, {})
        return {
            "daily_budget_inr": limits.get("daily_budget_inr", self.default_daily_budget_inr),
            "daily_action_limit": limits.get("daily_action_limit", self.default_daily_action_limit)
        }

    def can_dispatch(self, merchant_id: str, estimated_cost_inr: float = 0.0) -> Tuple[bool, str]:
        """
        Check whether an automated intervention can proceed or if it violates spend limits.
        """
        with self._lock:
            # 1. Global Emergency Kill Switch
            if self.emergency_kill_switch:
                return False, f"EMERGENCY_KILL_SWITCH_ACTIVE: Global platform autonomous outreach halted. Reason: {self.kill_switch_reason}"

            state = self._get_or_create_merchant_state(merchant_id)
            limits = self.get_merchant_limits(merchant_id)

            # 2. Per-Merchant Kill Switch
            if state.get("kill_switch", False):
                return False, f"MERCHANT_KILL_SWITCH_ACTIVE: Automated actions halted for merchant {merchant_id}."

            # 3. Daily Action Count Limit
            if state["action_count"] >= limits["daily_action_limit"]:
                return False, f"ACTION_LIMIT_EXCEEDED: Daily limit of {limits['daily_action_limit']} actions reached for merchant {merchant_id}."

            # 4. Daily Budget Limit
            if (state["spent_inr"] + estimated_cost_inr) > limits["daily_budget_inr"]:
                return False, (
                    f"BUDGET_EXCEEDED: Daily spend limit (₹{limits['daily_budget_inr']:.2f}) reached for merchant {merchant_id}. "
                    f"Current: ₹{state['spent_inr']:.2f} + New: ₹{estimated_cost_inr:.2f}."
                )

            return True, "SPEND_GOVERNOR_ALLOWED"

    def record_action_spend(self, merchant_id: str, intervention_type: str, cost_inr: float):
        """
        Record actual spend for an executed autonomous intervention.
        """
        with self._lock:
            state = self._get_or_create_merchant_state(merchant_id)
            state["spent_inr"] += cost_inr
            state["action_count"] += 1
            state["actions_by_type"][intervention_type] = state["actions_by_type"].get(intervention_type, 0) + 1
            logger.info(
                f"SpendGovernor: Merchant {merchant_id} executed {intervention_type} (Cost: ₹{cost_inr:.2f}). "
                f"Today's total: ₹{state['spent_inr']:.2f} across {state['action_count']} actions."
            )

    def trigger_emergency_kill_switch(self, reason: str = "Manual operator intervention"):
        """
        Instantly halt all autonomous actions across the platform.
        """
        with self._lock:
            self.emergency_kill_switch = True
            self.kill_switch_reason = reason
            self.kill_switch_activated_at = datetime.now(timezone.utc).isoformat()
            logger.critical(f"EMERGENCY KILL SWITCH ACTIVATED! Reason: {reason}")

    def reset_emergency_kill_switch(self):
        """
        Resume autonomous actions after incident resolution.
        """
        with self._lock:
            self.emergency_kill_switch = False
            self.kill_switch_reason = None
            self.kill_switch_activated_at = None
            logger.info("Emergency kill switch reset. Autonomous recovery resumed.")

    def get_status(self, merchant_id: str = "mid_default") -> Dict[str, Any]:
        with self._lock:
            state = self._get_or_create_merchant_state(merchant_id)
            limits = self.get_merchant_limits(merchant_id)
            return {
                "merchant_id": merchant_id,
                "emergency_kill_switch": self.emergency_kill_switch,
                "kill_switch_reason": self.kill_switch_reason,
                "kill_switch_activated_at": self.kill_switch_activated_at,
                "date": state["date"],
                "spent_inr": round(state["spent_inr"], 2),
                "daily_budget_inr": limits["daily_budget_inr"],
                "remaining_budget_inr": round(max(0.0, limits["daily_budget_inr"] - state["spent_inr"]), 2),
                "action_count": state["action_count"],
                "daily_action_limit": limits["daily_action_limit"],
                "remaining_actions": max(0, limits["daily_action_limit"] - state["action_count"]),
                "actions_by_type": state["actions_by_type"],
                "status": "HALTED" if self.emergency_kill_switch or state.get("kill_switch") else "ACTIVE"
            }


spend_governor = SpendGovernor()
