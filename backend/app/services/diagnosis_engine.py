"""
Root-Cause Diagnosis Engine — The Brain.

Two-tier classification:
1. Rule-based: handles known Razorpay error codes and patterns (covers ~80% of cases)
2. LLM reasoning: handles ambiguous cases with explainable reasoning chain

Key insight: NPCI data shows TD is ~0.7-0.8% (retry helps) while BD is ~5-7% (retry useless).
Most systems treat both the same. We don't.
"""

import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Tuple, List

from app.models.database import RootCause, LeakType, InterventionType

logger = logging.getLogger(__name__)

LLM_CONFIDENCE_THRESHOLD = 0.60  # below this → ask the GPU server


class DiagnosisEngine:
    """
    Root-cause classifier that maps symptoms to actionable diagnoses.
    Processes each case through rules first, falls back to LLM reasoning for ambiguous ones.
    """

    # Known Razorpay error code patterns → root causes
    ERROR_CODE_RULES = {
        # Gateway/bank infrastructure failures → Technical Decline
        ("GATEWAY_ERROR", "bank"): RootCause.TD_BANK_DOWN,
        ("SERVER_ERROR", "bank"): RootCause.TD_NPCI_TIMEOUT,
        ("SERVER_ERROR", "gateway"): RootCause.TD_NPCI_TIMEOUT,

        # Customer-side auth failures → Business Decline
        ("BAD_REQUEST_ERROR", "customer"): RootCause.BD_WRONG_PIN,
    }

    # Error description keyword patterns
    DESCRIPTION_PATTERNS = {
        "insufficient": RootCause.BD_INSUFFICIENT_FUNDS,
        "balance": RootCause.BD_INSUFFICIENT_FUNDS,
        "expired": RootCause.CARD_EXPIRED,
        "limit": RootCause.BD_LIMIT_EXCEEDED,
        "pin": RootCause.BD_WRONG_PIN,
        "otp": RootCause.BD_WRONG_PIN,
        "timeout": RootCause.TD_BANK_DOWN,
        "cancelled": RootCause.CHECKOUT_FRICTION,
        "mandate": RootCause.MANDATE_REAUTH,
        "recurring": RootCause.MANDATE_REAUTH,
        "authorization": RootCause.MANDATE_REAUTH,
    }

    def diagnose_payment_failure(
        self,
        transaction: Dict[str, Any],
        customer_history: Optional[List[Dict]] = None
    ) -> Tuple[RootCause, float, str]:
        """
        Diagnose a payment failure's root cause.

        Returns: (root_cause, confidence, reasoning_chain)
        """
        error_code = transaction.get("error_code", "")
        error_desc = transaction.get("error_description", "").lower()
        error_source = transaction.get("error_source", "")
        gateway_response = transaction.get("gateway_response", {})
        amount = transaction.get("amount", 0)
        is_recurring = transaction.get("is_recurring", False)
        attempt_count = transaction.get("attempt_count", 1)

        reasoning_steps = []

        # Step 1: Check if it's a mandate re-auth issue (RBI >₹15K recurring)
        if is_recurring and amount > 1500000:  # >₹15,000 in paise
            reasoning_steps.append(
                f"Recurring payment of ₹{amount/100:,.0f} (>₹15,000 threshold). "
                f"Under RBI's e-mandate framework, amounts above ₹15,000 require "
                f"additional factor authentication. This is the documented mandate bug — "
                f"blind retries will fail. Need re-authorization flow."
            )
            return RootCause.MANDATE_REAUTH, 0.92, "\n".join(reasoning_steps)

        # Step 2: Check error code + source combination
        code_key = (error_code, error_source)
        if code_key in self.ERROR_CODE_RULES:
            root_cause = self.ERROR_CODE_RULES[code_key]
            reasoning_steps.append(
                f"Error code {error_code} from source '{error_source}' → "
                f"known pattern: {root_cause.value}"
            )
            # Refine with description keywords
            for keyword, cause in self.DESCRIPTION_PATTERNS.items():
                if keyword in error_desc:
                    root_cause = cause
                    reasoning_steps.append(
                        f"Description contains '{keyword}' → refined to {cause.value}"
                    )
                    break

            confidence = 0.88
            return root_cause, confidence, "\n".join(reasoning_steps)

        # Step 3: Description-based pattern matching
        for keyword, cause in self.DESCRIPTION_PATTERNS.items():
            if keyword in error_desc:
                reasoning_steps.append(
                    f"Error description '{error_desc}' contains '{keyword}' → {cause.value}"
                )
                return cause, 0.78, "\n".join(reasoning_steps)

        # Step 4: Heuristic fallback based on retry count
        if attempt_count >= 3:
            reasoning_steps.append(
                f"3+ failed attempts suggests persistent issue, not transient"
            )
            return RootCause.BD_INSUFFICIENT_FUNDS, 0.55, "\n".join(reasoning_steps)

        # Step 6: Cross-reference with customer history
        if customer_history:
            recent_failures = [
                h for h in customer_history
                if h.get("status") == "failed"
            ]
            if len(recent_failures) >= 3:
                reasoning_steps.append(
                    f"Customer has {len(recent_failures)} recent failures — "
                    f"pattern suggests recurring issue, possibly expired card or mandate"
                )
                return RootCause.CARD_EXPIRED, 0.60, "\n".join(reasoning_steps)

        # Unknown — flag for LLM reasoning
        reasoning_steps.append(
            "Could not determine root cause from rules. Flagged for deeper analysis."
        )
        return RootCause.UNKNOWN, 0.30, "\n".join(reasoning_steps)

    def diagnose_checkout_abandonment(
        self, case: Dict[str, Any]
    ) -> Tuple[RootCause, float, str]:
        """Diagnose why a checkout was abandoned."""
        stage = case.get("abandonment_stage", "")
        methods_offered = case.get("payment_methods_offered", [])
        device = case.get("device_type", "")
        time_spent = case.get("time_spent_seconds", 0)

        reasoning = []

        # UPI missing on mobile → payment method mismatch
        if device == "mobile" and "upi" not in methods_offered:
            reasoning.append(
                "Mobile user but UPI not offered. UPI accounts for 40%+ of Indian "
                "digital payments — not offering it on mobile is a conversion killer."
            )
            return RootCause.CHECKOUT_PAYMENT_MISMATCH, 0.90, "\n".join(reasoning)

        # Stage-based classification
        stage_map = {
            "payment_method_selection": (RootCause.CHECKOUT_PAYMENT_MISMATCH, 0.75),
            "card_entry": (RootCause.CHECKOUT_FRICTION, 0.80),
            "3ds_verification": (RootCause.CHECKOUT_3DS_FAILURE, 0.85),
            "price_reveal": (RootCause.CHECKOUT_PRICE_SHOCK, 0.82),
        }

        if stage in stage_map:
            cause, conf = stage_map[stage]
            reasoning.append(
                f"Dropped at stage '{stage}'. "
                f"Time spent: {time_spent}s. Device: {device}."
            )
            if stage == "price_reveal":
                reasoning.append(
                    "Price shock abandonment — NOT recoverable via nudges. "
                    "Root cause is merchant UX, not customer behavior."
                )
            return cause, conf, "\n".join(reasoning)

        return RootCause.CHECKOUT_FRICTION, 0.50, "Generic checkout friction"

    def diagnose_subscription_failure(
        self, case: Dict[str, Any]
    ) -> Tuple[RootCause, float, str]:
        """Diagnose why a subscription payment failed."""
        amount = case.get("amount", 0)
        mandate_active = case.get("mandate_active", True)
        consecutive_failures = case.get("consecutive_failures", 1)
        card_expiry = case.get("card_expiry")

        reasoning = []

        # The documented RBI mandate bug
        if not mandate_active and amount > 1500000:
            reasoning.append(
                f"Subscription amount ₹{amount/100:,.0f} exceeds ₹15,000 and "
                f"mandate is NOT active. This is the documented RBI e-mandate "
                f"additional-factor-authentication bug. Blind retries will keep "
                f"failing — need re-authorization flow."
            )
            return RootCause.SUB_MANDATE_BUG, 0.95, "\n".join(reasoning)

        if card_expiry:
            reasoning.append(
                f"Card expired: {card_expiry}. Customer needs to update payment method."
            )
            return RootCause.SUB_CARD_EXPIRED, 0.90, "\n".join(reasoning)

        if consecutive_failures >= 3:
            reasoning.append(
                f"{consecutive_failures} consecutive failures. Likely persistent "
                f"balance issue — not transient."
            )
            return RootCause.SUB_BALANCE, 0.80, "\n".join(reasoning)

        reasoning.append("Single failure, likely transient balance issue.")
        return RootCause.SUB_BALANCE, 0.65, "\n".join(reasoning)

    def diagnose_receivable(
        self, invoice: Dict[str, Any]
    ) -> Tuple[RootCause, float, str]:
        """Diagnose why a B2B invoice is overdue."""
        days_overdue = invoice.get("days_overdue", 0)
        broken_promises = invoice.get("broken_promises", 0)
        contact_count = invoice.get("contact_count", 0)
        amount = invoice.get("amount", 0)
        partial_paid = invoice.get("partial_amount_paid", 0)

        reasoning = []

        # Chronic late payer
        if broken_promises >= 2:
            reasoning.append(
                f"Customer has broken {broken_promises} promises to pay. "
                f"Pattern indicates chronic late payer — escalate to human, "
                f"do not continue automated chasing."
            )
            return RootCause.RECV_CHRONIC, 0.90, "\n".join(reasoning)

        # Dispute indicator
        if contact_count >= 3 and partial_paid == 0 and days_overdue > 60:
            reasoning.append(
                f"Contacted {contact_count} times, zero payment after {days_overdue} days. "
                f"Possible invoice dispute — needs human review."
            )
            return RootCause.RECV_DISPUTE, 0.75, "\n".join(reasoning)

        # Partial payment suggests cash flow, not unwillingness
        if partial_paid > 0:
            reasoning.append(
                f"Partial payment of ₹{partial_paid:,.0f} received on ₹{amount:,.0f} invoice. "
                f"Customer is willing but cash-constrained. Gentle follow-up appropriate."
            )
            return RootCause.RECV_CASH_FLOW, 0.80, "\n".join(reasoning)

        # Simple oversight (most common)
        if days_overdue < 60 and contact_count < 2:
            reasoning.append(
                f"Invoice {days_overdue} days overdue with only {contact_count} contacts. "
                f"Most likely simple oversight — the 73-day average Indian SME payment delay "
                f"suggests this is normal chasing territory."
            )
            return RootCause.RECV_OVERSIGHT, 0.85, "\n".join(reasoning)

        # Default to cash flow issue
        reasoning.append(
            f"Invoice ₹{amount:,.0f} overdue by {days_overdue} days. "
            f"Likely cash flow constraints."
        )
        return RootCause.RECV_CASH_FLOW, 0.65, "\n".join(reasoning)

    def diagnose(
        self,
        leak_type: LeakType,
        data: Dict[str, Any],
        customer_history: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """
        Synchronous main diagnosis entry point. Routes to the appropriate classifier.
        Returns a structured diagnosis result.
        """
        if leak_type == LeakType.PAYMENT_FAILURE:
            root_cause, confidence, reasoning = self.diagnose_payment_failure(
                data, customer_history
            )
        elif leak_type == LeakType.CHECKOUT_ABANDONMENT:
            root_cause, confidence, reasoning = self.diagnose_checkout_abandonment(data)
        elif leak_type == LeakType.SUBSCRIPTION_FAILURE:
            root_cause, confidence, reasoning = self.diagnose_subscription_failure(data)
        elif leak_type == LeakType.B2B_RECEIVABLE:
            root_cause, confidence, reasoning = self.diagnose_receivable(data)
        else:
            root_cause = RootCause.UNKNOWN
            confidence = 0.0
            reasoning = f"Unknown leak type: {leak_type}"
        # Cross-Leak Context Injection: append any active multi-funnel risk signals to reasoning
        cross_profile = data.get("cross_leak_profile")
        if cross_profile:
            cross_signals = []
            if cross_profile.get("total_b2b_overdue_inr", 0) > 0 and leak_type != LeakType.B2B_RECEIVABLE:
                overdue = cross_profile["total_b2b_overdue_inr"]
                ptp_broken = cross_profile.get("broken_promises_count", 0)
                cross_signals.append(
                    f"₹{overdue:,.0f} B2B overdue receivables ({ptp_broken} broken PTP(s))"
                )
            if cross_profile.get("abandonment_count_7d", 0) > 0 and leak_type not in (LeakType.CHECKOUT_ABANDONMENT,):
                cross_signals.append(
                    f"{cross_profile['abandonment_count_7d']} cart abandonment(s) this week (stage: {cross_profile.get('last_abandonment_stage', 'unknown')})"
                )
            if cross_profile.get("mandate_failure_count", 0) > 0 and leak_type != LeakType.SUBSCRIPTION_FAILURE:
                cross_signals.append(
                    f"{cross_profile['mandate_failure_count']} subscription mandate failure(s)"
                )
            if cross_signals:
                reasoning += (
                    f"\n[Cross-Leak Telemetry] Customer has active multi-funnel exposure: "
                    + "; ".join(cross_signals)
                    + ". Liquidity stress may span multiple payment relationships."
                )

        return {
            "root_cause": root_cause,
            "confidence": confidence,
            "reasoning_chain": reasoning,
            "cross_leak_profile": cross_profile,
            "diagnosed_at": datetime.now(timezone.utc).isoformat(),
        }

    async def diagnose_with_llm(
        self,
        leak_type: LeakType,
        data: Dict[str, Any],
        customer_history: Optional[List[Dict]] = None,
    ) -> Dict[str, Any]:
        """
        Async diagnosis that enhances low-confidence rule results with LLM reasoning.

        Flow:
          1. Run synchronous rule-based diagnosis
          2. If confidence < LLM_CONFIDENCE_THRESHOLD AND leak_type is payment failure:
             → call Mistral-7B on GPU server to resolve
          3. Merge LLM result back into case (preserves rule result on fallback)
        """
        from app.services import llm_service  # lazy import avoids circular dependency

        # Step 1: Rule engine first
        result = self.diagnose(leak_type, data, customer_history)
        result["llm_enhanced"] = False
        result["llm_reasoning"] = None

        # Step 2: LLM enhancement only for low-confidence payment failures
        if (
            result["confidence"] < LLM_CONFIDENCE_THRESHOLD
            and leak_type == LeakType.PAYMENT_FAILURE
        ):
            logger.info(
                f"Rule engine confidence {result['confidence']:.2f} < threshold "
                f"{LLM_CONFIDENCE_THRESHOLD}. Calling LLM for enhanced diagnosis."
            )
            try:
                history_summary = ""
                if customer_history:
                    failed = sum(1 for h in customer_history if h.get("status") == "failed")
                    history_summary = (
                        f"{len(customer_history)} prior transactions, "
                        f"{failed} failures"
                    )

                llm_result = await llm_service.resolve_ambiguous_case(
                    error_code=data.get("error_code", ""),
                    error_description=data.get("error_description", ""),
                    error_source=data.get("error_source", ""),
                    amount=data.get("amount", 0),
                    attempt_count=data.get("attempt_count", 1),
                    method=data.get("method", "unknown"),
                    customer_history_summary=history_summary,
                )

                if llm_result is not None:
                    # Map LLM string → RootCause enum (with safety fallback)
                    try:
                        llm_root_cause = RootCause(llm_result["root_cause"])
                    except ValueError:
                        logger.warning(
                            f"LLM returned unknown root_cause: {llm_result['root_cause']}. "
                            f"Keeping rule-engine result."
                        )
                        llm_root_cause = result["root_cause"]

                    # Only accept LLM result if it improves confidence meaningfully
                    llm_confidence = llm_result["confidence"]
                    if llm_confidence > result["confidence"]:
                        old_root_cause = result["root_cause"]
                        result["root_cause"] = llm_root_cause
                        result["confidence"] = llm_confidence
                        result["llm_enhanced"] = True
                        result["llm_reasoning"] = llm_result.get("reasoning", "")
                        result["reasoning_chain"] = (
                            result["reasoning_chain"]
                            + f"\n[LLM Enhancement] Mistral-7B reclassified "
                            f"{old_root_cause.value} → {llm_root_cause.value} "
                            f"(confidence {llm_confidence:.2f}): "
                            + result["llm_reasoning"]
                        )
                        logger.info(
                            f"LLM improved diagnosis: {old_root_cause.value} → "
                            f"{llm_root_cause.value} ({llm_confidence:.2f})"
                        )
                    else:
                        logger.info(
                            f"LLM returned lower confidence ({llm_confidence:.2f}) "
                            f"than rules ({result['confidence']:.2f}). Keeping rule result."
                        )

            except Exception as e:
                logger.error(f"LLM enhancement failed: {e}", exc_info=True)
                # Graceful: return rule-based result unchanged

        return result
