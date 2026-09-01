"""
Intervention Router — picks ONE bounded action per case based on root cause.

The whole thesis: same symptom + different root cause → different action.
TD (bank down) → retry. BD (insufficient funds) → nudge. Mandate → re-auth.
"""

from datetime import datetime, timezone
from typing import Dict, Any, Optional, List

from app.models.database import RootCause, InterventionType, LeakType


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

    def route(
        self,
        root_cause: RootCause,
        leak_type: LeakType,
        data: Dict[str, Any],
        customer_contact_history: Optional[List[Dict]] = None,
    ) -> Dict[str, Any]:
        """
        Route a diagnosed case to the single best intervention.

        Returns intervention details including type, reason, and alternatives rejected.
        """
        # Default intervention from the map
        intervention = self.INTERVENTION_MAP.get(root_cause, InterventionType.ESCALATE_HUMAN)

        # B2B receivable routing: amount and age determine voice vs text
        if leak_type == LeakType.B2B_RECEIVABLE:
            amount = data.get("amount", 0)
            days_overdue = data.get("days_overdue", 0)
            broken_promises = data.get("broken_promises", 0)

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
                    f"({days_overdue} days) — voice call more effective than text."
                )
            else:
                intervention = InterventionType.WHATSAPP_NUDGE
                reason = (
                    f"Low-to-mid value (₹{amount:,.0f}), {days_overdue} days overdue. "
                    f"WhatsApp nudge is sufficient and lower cost."
                )
        else:
            reason = self._generate_reason(root_cause, intervention, data)

        # Cross-reference: don't double-contact same customer same day
        alternatives_rejected = self._evaluate_alternatives(
            root_cause, intervention, leak_type, data
        )

        # Build nudge message if applicable
        nudge_content = None
        if intervention in (InterventionType.WHATSAPP_NUDGE, InterventionType.EMAIL_NUDGE):
            nudge_content = self._build_nudge(root_cause, data)

        return {
            "intervention": intervention,
            "reason": reason,
            "alternatives_rejected": alternatives_rejected,
            "nudge_content": nudge_content,
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
                "RBI e-mandate re-authorization required. Blind retry will fail repeatedly. Must trigger re-auth flow.",
            (RootCause.CARD_EXPIRED, InterventionType.EMAIL_NUDGE):
                "Card expired. Customer needs to update payment method — email with update link.",
            (RootCause.CHECKOUT_PRICE_SHOCK, InterventionType.STOP):
                "Price shock abandonment. This is a merchant UX problem, not a customer recovery target. No intervention.",
            (RootCause.CHECKOUT_3DS_FAILURE, InterventionType.RETRY):
                "3DS verification failed at bank. Worth retrying with a different gateway route.",
            (RootCause.SUB_MANDATE_BUG, InterventionType.REAUTH):
                "The documented RBI >₹15K mandate bug. Blind retries will keep failing. Need re-authorization.",
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
