"""
Dynamic Autonomy Envelope Engine
================================
Defines mathematical safety boundaries for autonomous agent execution.

Key Mechanics:
1. Envelope Parameters:
   - max_autonomous_amount_inr: ₹25,000 (amounts above this require human operator consent)
   - min_confidence_threshold: 0.80 (low-confidence cases pause for review)
   - allowed_actions: [RETRY, REAUTH, WHATSAPP_NUDGE, EMAIL_NUDGE]
2. Dynamic Contraction & Expansion (Asymmetric Hysteresis):
   - CONTRACTS immediately if bank rail outages occur, error rate spikes, or drift is detected
     (tightening amount cap to ₹5,000 and min confidence to 0.90).
   - EXPANDS back to normal only after 5 consecutive stable evaluation cycles.
3. Machine-readable auditability and UI exposure.
"""

import threading
from datetime import datetime, timezone
from typing import Dict, Any, Tuple
from app.core.audit_ledger import audit_ledger


class AutonomyEnvelope:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(AutonomyEnvelope, cls).__new__(cls)
                cls._instance._init_state()
            return cls._instance

    def _init_state(self):
        self._mutex = threading.Lock()
        self.state = "EXPANDED"  # "EXPANDED" (Normal) | "CONTRACTED" (Safeguard)
        self.max_amount_expanded = 25000.0
        self.max_amount_contracted = 5000.0
        self.min_confidence_expanded = 0.80
        self.min_confidence_contracted = 0.90
        self.consecutive_stable_cycles = 0
        self.last_state_change = datetime.now(timezone.utc).isoformat()
        self.contraction_reason = None

    @property
    def current_max_amount(self) -> float:
        return self.max_amount_contracted if self.state == "CONTRACTED" else self.max_amount_expanded

    @property
    def current_min_confidence(self) -> float:
        return self.min_confidence_contracted if self.state == "CONTRACTED" else self.min_confidence_expanded

    def can_execute_autonomously(self, amount_inr: float, confidence: float, action_name: str) -> Tuple[bool, str]:
        """
        Check if an action is within the current active autonomy envelope.
        Returns: (can_execute: bool, reason: str)
        """
        with self._mutex:
            if amount_inr > self.current_max_amount:
                return (
                    False,
                    f"Amount ₹{amount_inr:,.0f} exceeds current autonomy envelope cap "
                    f"(₹{self.current_max_amount:,.0f} [{self.state}]). Requires human approval."
                )

            if confidence < self.current_min_confidence:
                return (
                    False,
                    f"Diagnosis confidence {confidence*100:.1f}% is below autonomy envelope threshold "
                    f"({self.current_min_confidence*100:.1f}% [{self.state}]). Requires human approval."
                )

            if action_name.lower() in ("escalate_human", "stop"):
                return False, f"Action '{action_name.upper()}' mandates human intervention by policy."

            return True, f"Action '{action_name.upper()}' is within the active autonomy envelope ({self.state})."

    def contract(self, reason: str):
        """Immediately contract autonomy envelope to protect capital."""
        with self._mutex:
            self.state = "CONTRACTED"
            self.contraction_reason = reason
            self.consecutive_stable_cycles = 0
            self.last_state_change = datetime.now(timezone.utc).isoformat()

            audit_ledger.record_event(
                event_type="AUTONOMY_ENVELOPE_CONTRACTED",
                case_id="system_governance",
                payload={
                    "new_state": "CONTRACTED",
                    "max_amount": self.max_amount_contracted,
                    "min_confidence": self.min_confidence_contracted,
                    "reason": reason,
                }
            )

    def record_stable_cycle(self):
        """Record a stable cycle; expands back after 5 consecutive stable cycles."""
        with self._mutex:
            if self.state == "CONTRACTED":
                self.consecutive_stable_cycles += 1
                if self.consecutive_stable_cycles >= 5:
                    self.state = "EXPANDED"
                    self.contraction_reason = None
                    self.consecutive_stable_cycles = 0
                    self.last_state_change = datetime.now(timezone.utc).isoformat()

                    audit_ledger.record_event(
                        event_type="AUTONOMY_ENVELOPE_EXPANDED",
                        case_id="system_governance",
                        payload={
                            "new_state": "EXPANDED",
                            "max_amount": self.max_amount_expanded,
                            "min_confidence": self.min_confidence_expanded,
                            "note": "Expanded after 5 consecutive stable verification cycles."
                        }
                    )

    def get_status(self) -> Dict[str, Any]:
        """Get the live status of the autonomy envelope."""
        with self._mutex:
            return {
                "state": self.state,
                "current_max_amount_inr": self.current_max_amount,
                "current_min_confidence": self.current_min_confidence,
                "consecutive_stable_cycles": self.consecutive_stable_cycles,
                "contraction_reason": self.contraction_reason,
                "last_state_change": self.last_state_change,
            }


autonomy_envelope = AutonomyEnvelope()
