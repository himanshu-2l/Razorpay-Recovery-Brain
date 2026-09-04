"""
Recovery Pipeline — orchestrates the full recovery workflow.

Pipeline: Ingest Signal → Diagnose → Route → Compliance Check → Execute → Log
"""

from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import uuid

from app.models.database import (
    LeakType, RootCause, InterventionType, CaseStatus, ComplianceAction
)
from app.services.diagnosis_engine import DiagnosisEngine
from app.services.intervention_router import InterventionRouter
from app.services.compliance_engine import ComplianceEngine


from app.core.audit_ledger import audit_ledger
from app.services.receipt_service import receipt_service
from app.services.stage_planner import stage_planner
from app.services.outcome_reconciler import outcome_reconciler
from app.services.cross_leak_state import cross_leak_store


class RecoveryPipeline:
    """
    End-to-end recovery pipeline that processes a batch of revenue-at-risk cases.
    Each case flows through: Diagnosis → Routing → Compliance → Execution → Logging.
    """

    def __init__(self):
        self.diagnosis = DiagnosisEngine()
        self.router = InterventionRouter()
        self.compliance = ComplianceEngine()
        self.cases: List[Dict[str, Any]] = []
        self.audit_logs: List[Dict[str, Any]] = []

    def process_payment_failure(
        self,
        transaction: Dict[str, Any],
        customer: Dict[str, Any],
        customer_history: Optional[List[Dict]] = None,
        contact_history: Optional[List[Dict]] = None,
        current_time: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Process a single payment failure through the full pipeline."""
        return self._process_case(
            leak_type=LeakType.PAYMENT_FAILURE,
            data={**transaction, "customer_name": customer.get("name", "")},
            customer=customer,
            customer_history=customer_history,
            contact_history=contact_history,
            amount_at_risk=transaction.get("amount", 0) / 100 if transaction.get("amount", 0) > 10000 else transaction.get("amount", 0),
            current_time=current_time,
        )

    def process_checkout_abandonment(
        self,
        case_data: Dict[str, Any],
        customer: Dict[str, Any],
        contact_history: Optional[List[Dict]] = None,
        current_time: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Process a checkout abandonment through the pipeline."""
        return self._process_case(
            leak_type=LeakType.CHECKOUT_ABANDONMENT,
            data={
                **case_data,
                "customer_name": customer.get("name", ""),
                "customer_ltv": customer.get("lifetime_value", 12000.0),
            },
            customer=customer,
            contact_history=contact_history,
            amount_at_risk=case_data.get("amount", 0) / 100 if case_data.get("amount", 0) > 10000 else case_data.get("amount", 0),
            current_time=current_time,
        )

    def process_subscription_failure(
        self,
        sub_data: Dict[str, Any],
        customer: Dict[str, Any],
        contact_history: Optional[List[Dict]] = None,
        current_time: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Process a subscription failure through the pipeline."""
        return self._process_case(
            leak_type=LeakType.SUBSCRIPTION_FAILURE,
            data={**sub_data, "customer_name": customer.get("name", "")},
            customer=customer,
            contact_history=contact_history,
            amount_at_risk=sub_data.get("amount", 0) / 100 if sub_data.get("amount", 0) > 10000 else sub_data.get("amount", 0),
            current_time=current_time,
        )

    def process_overdue_invoice(
        self,
        invoice: Dict[str, Any],
        customer: Dict[str, Any],
        contact_history: Optional[List[Dict]] = None,
        current_time: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Process an overdue B2B invoice through the pipeline."""
        return self._process_case(
            leak_type=LeakType.B2B_RECEIVABLE,
            data={**invoice, "customer_name": customer.get("name", "")},
            customer=customer,
            contact_history=contact_history,
            amount_at_risk=invoice.get("amount", 0),
            current_time=current_time,
        )

    # Aliases for pipeline processing
    process_b2b_receivable = process_overdue_invoice
    process_subscription_churn = process_subscription_failure

    def _process_case(
        self,
        leak_type: LeakType,
        data: Dict[str, Any],
        customer: Dict[str, Any],
        customer_history: Optional[List[Dict]] = None,
        contact_history: Optional[List[Dict]] = None,
        amount_at_risk: float = 0,
        current_time: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Core pipeline: diagnose → route → compliance → simulate execution."""
        case_id = str(uuid.uuid4())
        logs = []

        # Step 0: CROSS-LEAK STATE LINKAGE
        customer_id = (
            data.get("customer_id")
            or customer.get("id")
            or f"cust_{case_id[:8]}"
        )
        cross_profile = cross_leak_store.record_leak_event(
            customer_id=customer_id,
            leak_type_value=leak_type.value,
            data={**data, "customer": customer},
        )
        data["cross_leak_profile"] = cross_profile.to_dict()

        # Step 1: DIAGNOSE
        diagnosis = self.diagnosis.diagnose(leak_type, data, customer_history)
        root_cause = diagnosis["root_cause"]

        # Audit Ledger: Intent Recording
        audit_ledger.record_event(
            event_type="ACTION_INTENT",
            case_id=case_id,
            payload={
                "leak_type": leak_type.value,
                "amount_at_risk": amount_at_risk,
                "root_cause": root_cause.value,
                "confidence": diagnosis["confidence"],
            }
        )

        logs.append({
            "case_id": case_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": "diagnosed",
            "actor": "diagnosis_engine",
            "details": {
                "step": "diagnosis",
                "root_cause": root_cause.value,
                "confidence": diagnosis["confidence"],
                "reasoning": diagnosis["reasoning_chain"],
            }
        })

        # Step 2: ROUTE & COUNTERFACTUAL MATH
        route_data = {
            **data,
            "diagnosis_confidence": diagnosis.get("confidence", 0.88),
        }
        route_result = self.router.route(
            root_cause=root_cause,
            leak_type=leak_type,
            data=route_data,
            customer_contact_history=contact_history,
            amount_inr=amount_at_risk,
        )
        intervention = route_result["intervention"]
        counterfactual = route_result.get("counterfactual", {})

        logs.append({
            "case_id": case_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": "routed",
            "actor": "intervention_router",
            "details": {
                "step": "intervention_routing",
                "chosen_intervention": intervention.value,
                "reason": route_result["reason"],
                "alternatives_rejected": route_result["alternatives_rejected"],
                "counterfactual": counterfactual,
            }
        })

        # Step 3: COMPLIANCE CHECK
        compliance_result = self.compliance.check(
            intervention=intervention,
            customer_id=customer.get("id", ""),
            contact_history=contact_history,
            amount_at_risk=amount_at_risk,
            current_time=current_time,
        )

        logs.append({
            "case_id": case_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": "compliance_check",
            "actor": "compliance_engine",
            "details": {
                "step": "compliance_check",
                "result": compliance_result["action"].value,
                "rule": compliance_result["rule_cited"],
                "details": compliance_result["details"],
            }
        })

        # Step 4: DETERMINE STATUS
        # GAP-PAYMENT DEFENSE (Benchmark: HappyGarg8o/ai-revenue-recovery):
        # Double-check stopping rule evaluated at T1 immediately before any physical dispatch.
        # If settled in interim gap, immediately resolve and suppress all communication.
        if self._check_gap_payment(data, customer):
            status = CaseStatus.RECOVERED
            amount_recovered = amount_at_risk
            audit_ledger.record_event(
                event_type="GAP_PAYMENT_INTERCEPTED",
                case_id=case_id,
                payload={
                    "customer_id": customer_id,
                    "amount_recovered": amount_recovered,
                    "suppressed_intervention": intervention.value,
                    "reason": "Payment confirmed in interim gap between diagnosis (T0) and execution (T1). Outreach halted.",
                }
            )
            logs.append({
                "case_id": case_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "action": "gap_payment_intercepted",
                "actor": "gap_payment_defense",
                "details": {
                    "step": "gap_payment_defense",
                    "suppressed_intervention": intervention.value,
                    "status": "recovered",
                    "amount_recovered": amount_recovered,
                    "defense_policy": "HappyGarg8o_DoubleCheck_T1",
                }
            })
        elif compliance_result["action"] == ComplianceAction.ALLOWED:
            if counterfactual.get("requires_human_approval") or route_result.get("hitl_quarantine", {}).get("is_quarantined"):
                # Zero-I/O Human-In-The-Loop quarantine gate for high-stakes recovery
                status = CaseStatus.APPROVAL_PENDING
                amount_recovered = 0
                logs.append({
                    "case_id": case_id,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "action": "queued_for_approval",
                    "actor": "hitl_quarantine_gate",
                    "details": {
                        "step": "hitl_quarantine",
                        "intervention": intervention.value,
                        "status": status.value,
                        "quarantine_reason": route_result.get("hitl_quarantine", {}).get("quarantine_reason"),
                        "amount_recovered": amount_recovered,
                        "nudge_content": route_result.get("nudge_content"),
                    }
                })
            else:
                # Bounded automated execution
                status, amount_recovered = self._simulate_execution(
                    intervention=intervention,
                    root_cause=root_cause,
                    amount_at_risk=amount_at_risk,
                    data=data,
                )
                logs.append({
                    "case_id": case_id,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "action": "intervened",
                    "actor": "execution_layer",
                    "details": {
                        "step": "execution",
                        "intervention": intervention.value,
                        "status": status.value,
                        "amount_recovered": amount_recovered,
                        "nudge_content": route_result.get("nudge_content"),
                    }
                })
        elif compliance_result["action"] in (
            ComplianceAction.BLOCKED_TIME_WINDOW,
            ComplianceAction.BLOCKED_FREQUENCY,
            ComplianceAction.BLOCKED_DUPLICATE,
            ComplianceAction.BLOCKED_ECONOMIC_FLOOR,
        ):
            status = CaseStatus.STOPPED
            amount_recovered = 0

            logs.append({
                "case_id": case_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "action": "blocked",
                "actor": "compliance_engine",
                "details": {
                    "step": "blocked_by_compliance",
                    "rule": compliance_result["rule_cited"],
                    "rescheduled_to": (
                        compliance_result["rescheduled_to"].isoformat()
                        if compliance_result["rescheduled_to"] else None
                    ),
                }
            })
        elif compliance_result["action"] == ComplianceAction.BLOCKED_EXHAUSTED:
            status = CaseStatus.ESCALATED
            amount_recovered = 0
            intervention = InterventionType.ESCALATE_HUMAN
        else:
            status = CaseStatus.OPEN
            amount_recovered = 0

        # Build the complete case record
        case = {
            "id": case_id,
            "customer_id": customer.get("id", ""),
            "customer_name": customer.get("name", ""),
            "customer_company": customer.get("company"),
            "leak_type": leak_type.value,
            "amount_at_risk": amount_at_risk,
            "amount_recovered": amount_recovered,
            "root_cause": root_cause.value,
            "root_cause_confidence": diagnosis["confidence"],
            "reasoning_chain": diagnosis["reasoning_chain"],
            "chosen_intervention": intervention.value,
            "intervention_reason": route_result["reason"],
            "alternatives_rejected": route_result["alternatives_rejected"],
            "strategy_tournament": route_result.get("strategy_tournament", []),
            "hitl_quarantine": route_result.get("hitl_quarantine", {}),
            "counterfactual": counterfactual,
            "requires_human_approval": counterfactual.get("requires_human_approval", False),
            "compliance_status": compliance_result["action"].value,
            "compliance_rule": compliance_result["rule_cited"],
            "compliance_details": compliance_result["details"],
            "rescheduled_to": (
                compliance_result["rescheduled_to"].isoformat()
                if compliance_result["rescheduled_to"] else None
            ),
            "status": status.value,
            "tax_clock": route_result.get("tax_clock"),
            "nudge_content": route_result.get("nudge_content"),
            "failure_filter": route_result.get("failure_filter"),
            "cross_leak_profile": cross_profile.to_dict(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "audit_logs": logs,
        }

        # Generate Cryptographic Decision Receipt & Stages
        receipt = receipt_service.generate_receipt(case)
        case["receipt"] = receipt
        case["stages"] = stage_planner.generate_stages(case)

        self.cases.append(case)
        self.audit_logs.extend(logs)

        return case

    def _check_gap_payment(self, data: Dict[str, Any], customer: Dict[str, Any]) -> bool:
        """
        Gap-Payment Defense (Benchmark: HappyGarg8o/ai-revenue-recovery):
        Double-check stopping rule evaluated at T1 immediately before physical dispatch.
        Returns True if customer settled during the pipeline decision window.
        """
        # 1. Explicit payment confirmation flags in payload
        if data.get("gap_payment_confirmed") or data.get("settled_in_gap") or data.get("paid_in_gap"):
            return True
        if customer.get("gap_payment_confirmed") or customer.get("paid_in_gap"):
            return True
        return False

    def _simulate_execution(
        self,
        intervention: InterventionType,
        root_cause: RootCause,
        amount_at_risk: float,
        data: Dict[str, Any],
    ) -> tuple:
        """
        Simulate execution outcome based on intervention type and root cause.
        Returns (status, amount_recovered).
        """
        import random

        # Recovery probability by intervention + root cause
        recovery_rates = {
            # TD retries have high success
            (InterventionType.RETRY, RootCause.TD_BANK_DOWN): 0.92,
            (InterventionType.RETRY, RootCause.TD_NPCI_TIMEOUT): 0.88,
            (InterventionType.RETRY, RootCause.CHECKOUT_3DS_FAILURE): 0.65,

            # Re-auth has good success when it's the actual problem
            (InterventionType.REAUTH, RootCause.MANDATE_REAUTH): 0.78,
            (InterventionType.REAUTH, RootCause.SUB_MANDATE_BUG): 0.80,

            # Nudges vary by root cause
            (InterventionType.WHATSAPP_NUDGE, RootCause.BD_INSUFFICIENT_FUNDS): 0.45,
            (InterventionType.WHATSAPP_NUDGE, RootCause.BD_WRONG_PIN): 0.60,
            (InterventionType.WHATSAPP_NUDGE, RootCause.CHECKOUT_PAYMENT_MISMATCH): 0.35,
            (InterventionType.WHATSAPP_NUDGE, RootCause.CHECKOUT_FRICTION): 0.30,
            (InterventionType.WHATSAPP_NUDGE, RootCause.SUB_BALANCE): 0.40,
            (InterventionType.WHATSAPP_NUDGE, RootCause.RECV_OVERSIGHT): 0.70,

            # Autonomous Bounded Margin Concession (NexaCart Benchmark)
            (InterventionType.DISCOUNT_NUDGE, RootCause.CHECKOUT_PRICE_SHOCK): 0.65,
            (InterventionType.DISCOUNT_NUDGE, RootCause.CHECKOUT_FRICTION): 0.60,

            # Email nudges
            (InterventionType.EMAIL_NUDGE, RootCause.BD_LIMIT_EXCEEDED): 0.55,
            (InterventionType.EMAIL_NUDGE, RootCause.CARD_EXPIRED): 0.50,
            (InterventionType.EMAIL_NUDGE, RootCause.SUB_CARD_EXPIRED): 0.48,

            # Voice calls for receivables
            (InterventionType.VOICE_CALL, RootCause.RECV_CASH_FLOW): 0.55,
            (InterventionType.VOICE_CALL, RootCause.RECV_OVERSIGHT): 0.75,

            # Stop actions
            (InterventionType.STOP, RootCause.CHECKOUT_PRICE_SHOCK): 0.0,

            # Escalation
            (InterventionType.ESCALATE_HUMAN, RootCause.RECV_CHRONIC): 0.25,
            (InterventionType.ESCALATE_HUMAN, RootCause.RECV_DISPUTE): 0.35,
        }

        recovery_rate = recovery_rates.get(
            (intervention, root_cause),
            0.40  # Default recovery rate
        )

        # Simulate outcome
        recovered = random.random() < recovery_rate

        if recovered:
            # Full or partial recovery
            if random.random() < 0.7:
                amount_recovered = amount_at_risk  # Full recovery
                status = CaseStatus.RECOVERED
            else:
                amount_recovered = round(amount_at_risk * random.uniform(0.3, 0.8), 2)
                status = CaseStatus.PARTIALLY_RECOVERED
        else:
            amount_recovered = 0
            status = CaseStatus.FAILED

        return status, amount_recovered

    def process_full_batch(self, batch: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process the entire synthetic batch through the pipeline.
        Returns summary results for the dashboard.
        """
        customers_by_id = {c["id"]: c for c in batch["customers"]}

        # Process each category
        for txn in batch.get("payment_failures", []):
            customer = customers_by_id.get(txn["customer_id"], {})
            self.process_payment_failure(txn, customer)

        for checkout in batch.get("checkout_abandonments", []):
            customer = customers_by_id.get(checkout["customer_id"], {})
            self.process_checkout_abandonment(checkout, customer)

        for sub in batch.get("subscription_failures", []):
            customer = customers_by_id.get(sub["customer_id"], {})
            self.process_subscription_failure(sub, customer)

        for invoice in batch.get("b2b_invoices", []):
            customer = customers_by_id.get(invoice["customer_id"], {})
            self.process_overdue_invoice(invoice, customer)

        # Build summary
        return self.get_summary()

    def get_summary(self) -> Dict[str, Any]:
        """Generate batch-level summary for the dashboard."""
        total_at_risk = sum(c["amount_at_risk"] for c in self.cases)
        total_recovered = sum(c["amount_recovered"] for c in self.cases)

        by_leak_type = {}
        by_root_cause = {}
        by_status = {}

        for case in self.cases:
            lt = case["leak_type"]
            rc = case["root_cause"]
            st = case["status"]

            if lt not in by_leak_type:
                by_leak_type[lt] = {"count": 0, "at_risk": 0, "recovered": 0}
            by_leak_type[lt]["count"] += 1
            by_leak_type[lt]["at_risk"] += case["amount_at_risk"]
            by_leak_type[lt]["recovered"] += case["amount_recovered"]

            if rc not in by_root_cause:
                by_root_cause[rc] = {"count": 0, "at_risk": 0, "recovered": 0}
            by_root_cause[rc]["count"] += 1
            by_root_cause[rc]["at_risk"] += case["amount_at_risk"]
            by_root_cause[rc]["recovered"] += case["amount_recovered"]

            by_status[st] = by_status.get(st, 0) + 1

        # Exception list (what we couldn't recover and why)
        exceptions = [
            {
                "case_id": c["id"],
                "customer": c["customer_name"],
                "amount": c["amount_at_risk"],
                "root_cause": c["root_cause"],
                "reason": c["intervention_reason"],
                "status": c["status"],
            }
            for c in self.cases
            if c["status"] in ("failed", "stopped", "escalated")
        ]

        # Compliance report
        compliance_checks = [
            {"action": c["compliance_status"], "rule_cited": c["compliance_rule"]}
            for c in self.cases
        ]
        blocked_count = sum(
            1 for c in compliance_checks
            if c["action"] != ComplianceAction.ALLOWED.value
        )

        return {
            "total_cases": len(self.cases),
            "total_at_risk": round(total_at_risk, 2),
            "total_recovered": round(total_recovered, 2),
            "recovery_rate": round(total_recovered / max(total_at_risk, 1) * 100, 1),
            "by_leak_type": {
                k: {kk: round(vv, 2) if isinstance(vv, float) else vv for kk, vv in v.items()}
                for k, v in by_leak_type.items()
            },
            "by_root_cause": {
                k: {kk: round(vv, 2) if isinstance(vv, float) else vv for kk, vv in v.items()}
                for k, v in by_root_cause.items()
            },
            "by_status": by_status,
            "exceptions": exceptions,
            "compliance": {
                "total_checks": len(compliance_checks),
                "blocked": blocked_count,
                "compliance_rate": round(
                    (len(compliance_checks) - blocked_count) / max(len(compliance_checks), 1) * 100, 1
                ),
            },
            "cases": self.cases,
        }
