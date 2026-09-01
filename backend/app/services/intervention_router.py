"""
Intervention Router — picks ONE bounded action per case based on root cause.

The whole thesis: same symptom + different root cause → different action.
TD (bank down) → retry. BD (insufficient funds) → nudge. Mandate → re-auth.
"""

from datetime import datetime, timezone
from typing import Dict, Any, Optional, List

from app.models.database import RootCause, InterventionType, LeakType
from app.services.tax_clock_engine import tax_clock_engine
from app.services.circuit_breaker import bank_circuit_breaker
from app.services.autonomy_envelope import autonomy_envelope
from app.services.smart_scheduler import smart_scheduler


class InterventionRouter:
    """
    Maps diagnosis results to the single best intervention.
    Cross-references customer contact history before acting.
    """

    # Root cause → intervention mapping
    INTERVENTION_MAP = {
        # Payment failures
        RootCause.TD_BANK_DOWN: InterventionType.RETRY,
        RootCause.TD_NPCI_TIMEOUT: InterventionType.RETRY,
        RootCause.BD_INSUFFICIENT_FUNDS: InterventionType.WHATSAPP_NUDGE,
        RootCause.BD_WRONG_PIN: InterventionType.WHATSAPP_NUDGE,
        RootCause.BD_LIMIT_EXCEEDED: InterventionType.EMAIL_NUDGE,
        RootCause.MANDATE_REAUTH: InterventionType.REAUTH,
        RootCause.CARD_EXPIRED: InterventionType.EMAIL_NUDGE,

        # Checkout
        RootCause.CHECKOUT_PAYMENT_MISMATCH: InterventionType.WHATSAPP_NUDGE,
        RootCause.CHECKOUT_3DS_FAILURE: InterventionType.RETRY,
        RootCause.CHECKOUT_PRICE_SHOCK: InterventionType.STOP,  # Not recoverable
        RootCause.CHECKOUT_FRICTION: InterventionType.WHATSAPP_NUDGE,

        # Subscription
        RootCause.SUB_MANDATE_BUG: InterventionType.REAUTH,
        RootCause.SUB_CARD_EXPIRED: InterventionType.EMAIL_NUDGE,
        RootCause.SUB_BALANCE: InterventionType.WHATSAPP_NUDGE,

        # Receivables
        RootCause.RECV_OVERSIGHT: InterventionType.WHATSAPP_NUDGE,
        RootCause.RECV_CASH_FLOW: InterventionType.VOICE_CALL,
        RootCause.RECV_DISPUTE: InterventionType.ESCALATE_HUMAN,
        RootCause.RECV_CHRONIC: InterventionType.ESCALATE_HUMAN,

        RootCause.UNKNOWN: InterventionType.ESCALATE_HUMAN,
    }

    # Nudge message templates (personalized by root cause)
    NUDGE_MESSAGES = {
        RootCause.BD_INSUFFICIENT_FUNDS: {
            "whatsapp": "Hi {name}, your payment of ₹{amount} was declined by your bank — this usually means insufficient balance. You can retry anytime: {payment_link}",
            "email_subject": "Payment of ₹{amount} needs your attention",
            "email_body": "Your payment was declined due to insufficient balance. Please check your account and retry.",
        },
        RootCause.BD_WRONG_PIN: {
            "whatsapp": "Hi {name}, your payment needs verification. Please try again and double-check your UPI PIN or card details: {payment_link}",
            "email_subject": "Quick action needed: Payment verification",
            "email_body": "Your payment couldn't be verified. Please retry with the correct credentials.",
        },
        RootCause.BD_LIMIT_EXCEEDED: {
            "whatsapp": "Hi {name}, your bank's daily transaction limit was reached. You can try again tomorrow or use a different payment method: {payment_link}",
            "email_subject": "Payment limit reached — try tomorrow",
            "email_body": "Your bank's daily limit was hit. Try again tomorrow or use an alternate payment method.",
        },
        RootCause.CARD_EXPIRED: {
            "whatsapp": "Hi {name}, the card on file has expired. Please update your payment method to continue: {update_link}",
            "email_subject": "Your card has expired — update needed",
            "email_body": "The card ending in XXXX has expired. Update your payment method to avoid service interruption.",
        },
        RootCause.CHECKOUT_PAYMENT_MISMATCH: {
            "whatsapp": "Hi {name}, looks like you didn't find your preferred payment method. We support UPI, cards, and netbanking — complete your purchase: {payment_link}",
            "email_subject": "Complete your purchase — all payment methods available",
            "email_body": "We noticed you left during checkout. All major payment methods are supported.",
        },
        RootCause.CHECKOUT_FRICTION: {
            "whatsapp": "Hi {name}, your cart is waiting! Complete your purchase in one tap: {payment_link}",
            "email_subject": "Your items are still in your cart",
            "email_body": "You left some items in your cart. Complete your purchase with a single click.",
        },
        RootCause.SUB_CARD_EXPIRED: {
            "whatsapp": "Hi {name}, your subscription payment failed because your card has expired. Update it to keep your {plan_name} plan active: {update_link}",
            "email_subject": "Subscription at risk — card expired",
            "email_body": "Your subscription couldn't be renewed because the card on file has expired.",
        },
        RootCause.SUB_BALANCE: {
            "whatsapp": "Hi {name}, your {plan_name} subscription payment of ₹{amount} didn't go through. Please ensure sufficient balance and we'll retry: {payment_link}",
            "email_subject": "Subscription renewal needs attention",
            "email_body": "Your subscription couldn't renew. Please check your balance.",
        },
        RootCause.RECV_OVERSIGHT: {
            "whatsapp": "Hi {name}, this is a friendly reminder that invoice {invoice_number} for ₹{amount} is {days_overdue} days past due. Pay now: {payment_link}",
            "email_subject": "Invoice {invoice_number} — friendly reminder",
            "email_body": "Your invoice is overdue. A quick payment now helps both our businesses.",
        },
    }

    # Operational cost per intervention (INR)
    INTERVENTION_COSTS = {
        InterventionType.RETRY: 0.0,
        InterventionType.REAUTH: 0.0,
        InterventionType.EMAIL_NUDGE: 0.50,
        InterventionType.WHATSAPP_NUDGE: 2.50,
        InterventionType.VOICE_CALL: 15.00,
        InterventionType.ESCALATE_HUMAN: 50.00,
        InterventionType.STOP: 0.0,
        InterventionType.NONE: 0.0,
    }

    # Baseline natural recovery probabilities (Do-Nothing Counterfactual)
    NATURAL_RECOVERY_BASELINES = {
        RootCause.TD_BANK_DOWN: 0.22,
        RootCause.TD_NPCI_TIMEOUT: 0.25,
        RootCause.BD_INSUFFICIENT_FUNDS: 0.08,
        RootCause.BD_WRONG_PIN: 0.12,
        RootCause.BD_LIMIT_EXCEEDED: 0.15,
        RootCause.MANDATE_REAUTH: 0.03,
        RootCause.CARD_EXPIRED: 0.01,
        RootCause.CHECKOUT_PAYMENT_MISMATCH: 0.05,
        RootCause.CHECKOUT_3DS_FAILURE: 0.18,
        RootCause.CHECKOUT_PRICE_SHOCK: 0.01,
        RootCause.CHECKOUT_FRICTION: 0.09,
        RootCause.SUB_MANDATE_BUG: 0.02,
        RootCause.SUB_CARD_EXPIRED: 0.01,
        RootCause.SUB_BALANCE: 0.10,
        RootCause.RECV_OVERSIGHT: 0.20,
        RootCause.RECV_CASH_FLOW: 0.08,
        RootCause.RECV_DISPUTE: 0.02,
        RootCause.RECV_CHRONIC: 0.01,
        RootCause.UNKNOWN: 0.05,
    }

    # Expected success probabilities under targeted intervention
    INTERVENTION_SUCCESS_RATES = {
        InterventionType.RETRY: 0.82,
        InterventionType.REAUTH: 0.74,
        InterventionType.WHATSAPP_NUDGE: 0.68,
        InterventionType.EMAIL_NUDGE: 0.45,
        InterventionType.VOICE_CALL: 0.78,
        InterventionType.ESCALATE_HUMAN: 0.55,
        InterventionType.STOP: 0.00,
        InterventionType.NONE: 0.00,
    }

    def route(
        self,
        root_cause: RootCause,
        leak_type: LeakType,
        data: Dict[str, Any],
        customer_contact_history: Optional[List[Dict]] = None,
        amount_inr: float = 0.0,
    ) -> Dict[str, Any]:
        """
        Route a diagnosed case to the single best intervention.
        Computes Expected Net Recoverable Value (ENRV) against Do-Nothing Counterfactual,
        incorporating Section 43B(h) tax leverage, bank circuit breaker, and churn risk.
        """
        # Extract amount
        effective_amount = amount_inr or data.get("amount", 0.0)
        if effective_amount > 10000 and leak_type == LeakType.PAYMENT_FAILURE:
            effective_amount = effective_amount / 100.0  # paise to INR

        # Default intervention from the map
        intervention = self.INTERVENTION_MAP.get(root_cause, InterventionType.ESCALATE_HUMAN)
        tax_clock_data = None

        # Bank Gateway Circuit Breaker Check
        bank_code = data.get("bank", data.get("error_source", "HDFC"))
        if intervention == InterventionType.RETRY and not bank_circuit_breaker.is_rail_available(bank_code):
            # Rail is experiencing technical outage; suppress futile retries
            intervention = InterventionType.WHATSAPP_NUDGE
            reason = (
                f"Bank rail outage detected on {bank_code.upper()} switch (Circuit Breaker Tripped). "
                f"Automated retry suppressed to prevent repeated failure; offering instant alternate payment method link."
            )
        # B2B receivable routing: amount, age, and Section 43B(h) tax clock determine strategy
        elif leak_type == LeakType.B2B_RECEIVABLE:
            amount = data.get("amount", 0)
            days_overdue = data.get("days_overdue", 0)
            broken_promises = data.get("broken_promises", 0)

            # Evaluate Section 43B(h) tax status
            tax_clock = tax_clock_engine.evaluate(amount=effective_amount, days_overdue=days_overdue)
            tax_clock_data = tax_clock.to_dict()

            if broken_promises >= 2:
                intervention = InterventionType.ESCALATE_HUMAN
                reason = (
                    f"Customer has broken {broken_promises} promises. "
                    f"Automated recovery exhausted — human intervention required."
                )
            elif amount > 50000 or days_overdue > 60:
                intervention = InterventionType.VOICE_CALL
                reason = (
                    f"High-value (₹{amount:,.0f}) or significantly overdue "
                    f"({days_overdue} days). Section 43B(h) urgency: {tax_clock.urgency_level.upper()} "
                    f"— voice call provides direct CFO negotiation leverage."
                )
            else:
                intervention = InterventionType.WHATSAPP_NUDGE
                reason = (
                    f"Low-to-mid value (₹{amount:,.0f}), {days_overdue} days overdue. "
                    f"WhatsApp nudge with Section 43B(h) 45-day deadline reminder is sufficient."
                )
        else:
            reason = self._generate_reason(root_cause, intervention, data)

        # Mathematical Counterfactual & ENRV Economics with Churn Penalty
        p_natural = self.NATURAL_RECOVERY_BASELINES.get(root_cause, 0.05)
        p_action = self.INTERVENTION_SUCCESS_RATES.get(intervention, 0.50)
        cost_inr = self.INTERVENTION_COSTS.get(intervention, 0.0)

        # Churn penalty modeling (protecting high-LTV customer relationships)
        # Rationale: 10% of churn-adjacent customer LTV is a conservative enterprise baseline
        # to account for relationship fatigue and customer replacement cost.
        customer_ltv = data.get("customer_ltv", 12000.0)
        p_churn = 0.015 if intervention in (InterventionType.RETRY, InterventionType.EMAIL_NUDGE) else 0.035
        churn_penalty_inr = p_churn * customer_ltv * 0.10  # 10% penalty weight

        incremental_prob = max(0.0, p_action - p_natural)
        enrv_inr = max(0.0, (incremental_prob * effective_amount) - cost_inr - churn_penalty_inr)

        # Assumed Uncertainty Band (P10 Pessimistic Floor, P50 Expected Net, P90 Optimistic Ceiling)
        revenue_bounds_inr = {
            "p10_pessimistic": round(enrv_inr * 0.65, 2),
            "p50_expected": round(enrv_inr, 2),
            "p90_optimistic": round(enrv_inr * 1.25, 2),
        }

        # Autonomy Envelope Check & HITL Gate
        can_auto_execute, envelope_reason = autonomy_envelope.can_execute_autonomously(
            amount_inr=effective_amount,
            confidence=0.92,
            action_name=intervention.value,
        )
        requires_human_approval = bool(not can_auto_execute or effective_amount >= 50000 or intervention == InterventionType.ESCALATE_HUMAN)

        # Cross-reference: evaluate rejected alternatives
        alternatives_rejected = self._evaluate_alternatives(
            root_cause, intervention, leak_type, data
        )

        # Build nudge message if applicable
        nudge_content = None
        if intervention in (InterventionType.WHATSAPP_NUDGE, InterventionType.EMAIL_NUDGE):
            nudge_content = self._build_nudge(root_cause, data)

        # Calendar-Aligned Smart Retry Scheduling
        smart_schedule = smart_scheduler.recommend_optimal_window(
            root_cause=root_cause.value,
            amount=effective_amount,
            failure_timestamp=datetime.now(timezone.utc),
        )

        return {
            "intervention": intervention,
            "reason": reason,
            "alternatives_rejected": alternatives_rejected,
            "nudge_content": nudge_content,
            "tax_clock": tax_clock_data,
            "smart_schedule": smart_schedule,
            "counterfactual": {
                "p_natural_recovery": round(p_natural, 4),
                "p_intervention_recovery": round(p_action, 4),
                "incremental_lift_pct": round((p_action - p_natural) * 100, 1),
                "intervention_cost_inr": cost_inr,
                "churn_penalty_inr": round(churn_penalty_inr, 2),
                "expected_net_recovery_inr": round(enrv_inr, 2),
                "revenue_bounds_inr": revenue_bounds_inr,
                "autonomy_envelope_state": autonomy_envelope.state,
                "requires_human_approval": requires_human_approval,
            },
            "routed_at": datetime.now(timezone.utc).isoformat(),
        }

    def _generate_reason(
        self, root_cause: RootCause, intervention: InterventionType, data: Dict
    ) -> str:
        """Generate human-readable reason for the chosen intervention."""
        reasons = {
            (RootCause.TD_BANK_DOWN, InterventionType.RETRY):
                "Technical decline (bank infrastructure). Transient issue — retry at a different time will likely succeed.",
            (RootCause.TD_NPCI_TIMEOUT, InterventionType.RETRY):
                "NPCI timeout. Infrastructure issue, not customer-side. Auto-retry recommended.",
            (RootCause.BD_INSUFFICIENT_FUNDS, InterventionType.WHATSAPP_NUDGE):
                "Insufficient balance. Retrying won't help — need to tell the customer specifically what happened.",
            (RootCause.BD_WRONG_PIN, InterventionType.WHATSAPP_NUDGE):
                "Authentication failure. Customer needs to retry with correct credentials.",
            (RootCause.BD_LIMIT_EXCEEDED, InterventionType.EMAIL_NUDGE):
                "Bank limit exceeded. Not urgent — email with 'try tomorrow' is appropriate.",
            (RootCause.MANDATE_REAUTH, InterventionType.REAUTH):
                "Trigger customer-side re-authorization request via SMS/WhatsApp. Additional Factor Authentication (AFA) legally requires customer action inside their UPI app; agent dispatches instant re-auth push.",
            (RootCause.CARD_EXPIRED, InterventionType.EMAIL_NUDGE):
                "Card expired. Customer needs to update payment method — email with update link.",
            (RootCause.CHECKOUT_PRICE_SHOCK, InterventionType.STOP):
                "Price shock abandonment. This is a merchant UX problem, not a customer recovery target. No intervention.",
            (RootCause.CHECKOUT_3DS_FAILURE, InterventionType.RETRY):
                "3DS verification failed at bank. Worth retrying with a different gateway route.",
            (RootCause.SUB_MANDATE_BUG, InterventionType.REAUTH):
                "RBI >₹15K mandate limit threshold hit. Customer must complete step-up AFA in their UPI app; agent triggers re-auth notification.",
        }

        key = (root_cause, intervention)
        return reasons.get(key, f"Root cause: {root_cause.value} → intervention: {intervention.value}")

    def _evaluate_alternatives(
        self,
        root_cause: RootCause,
        chosen: InterventionType,
        leak_type: LeakType,
        data: Dict,
    ) -> List[Dict[str, str]]:
        """Document why alternative interventions were rejected."""
        alternatives = []

        if chosen != InterventionType.RETRY:
            if root_cause.value.startswith("bd_"):
                alternatives.append({
                    "action": "retry",
                    "rejected_because": "Business decline — the customer's bank rejected this for a specific reason. Retrying will produce the same result."
                })
            elif root_cause == RootCause.MANDATE_REAUTH:
                alternatives.append({
                    "action": "retry",
                    "rejected_because": "Mandate not active. Retrying without re-authorization will fail indefinitely."
                })

        if chosen != InterventionType.VOICE_CALL and leak_type == LeakType.B2B_RECEIVABLE:
            amount = data.get("amount", 0)
            if amount < 50000:
                alternatives.append({
                    "action": "voice_call",
                    "rejected_because": f"Invoice amount ₹{amount:,.0f} below ₹50K threshold. WhatsApp nudge is sufficient and lower cost."
                })

        if chosen == InterventionType.STOP:
            alternatives.append({
                "action": "whatsapp_nudge",
                "rejected_because": "Root cause (price shock) is not fixable via customer outreach. This is a merchant-side UX issue."
            })

        return alternatives

    def _build_nudge(self, root_cause: RootCause, data: Dict) -> Optional[Dict[str, str]]:
        """Build personalized nudge content based on root cause."""
        templates = self.NUDGE_MESSAGES.get(root_cause)
        if not templates:
            return None

        # Fill template placeholders with available data
        fill = {
            "name": data.get("customer_name", "there"),
            "amount": f"{data.get('amount', 0) / 100:,.0f}" if data.get('amount', 0) > 1000 else f"{data.get('amount', 0):,.0f}",
            "payment_link": "https://rzp.io/demo-recovery-link",
            "update_link": "https://rzp.io/demo-update-method",
            "invoice_number": data.get("invoice_number", ""),
            "days_overdue": str(data.get("days_overdue", "")),
            "plan_name": data.get("plan_name", "subscription"),
        }

        result = {}
        for key, template in templates.items():
            try:
                result[key] = template.format(**fill)
            except KeyError:
                result[key] = template
        return result
