"""
Webhook Ingestion Engine — Razorpay Idempotency & Rate Limit Headers
====================================================================
Processes inbound Razorpay webhook events with:
1. Temporal duplicate detection via WebhookIdempotencyStore (7-day TTL)
2. Immediate 200 OK fast-return on duplicate delivery (prevents redundant retries)
3. Cryptographic HMAC-SHA256 signature verification
4. X-RateLimit-* and X-Idempotency-* response headers
"""

import json
import hashlib
import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, Request, Header, HTTPException
from fastapi.responses import JSONResponse

from app.core.idempotency_mutex import webhook_idempotency_store, rate_limit_tracker
from app.services.razorpay_client import razorpay_client
from app.services.outcome_reconciler import outcome_reconciler
from app.services.diagnosis_engine import DiagnosisEngine
from app.core.audit_ledger import audit_ledger

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/webhooks", tags=["Webhooks"])


@router.post("/razorpay")
async def handle_razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None, alias="X-Razorpay-Signature"),
    x_razorpay_event_id: Optional[str] = Header(None, alias="X-Razorpay-Event-Id"),
):
    """
    Inbound Razorpay webhook endpoint.
    Handles temporal retries safely:
    - Same event_id + same timestamp -> 200 OK with X-Idempotency-Status: DUPLICATE (ignored)
    - Same event_id + different timestamp -> processed as unique retry/update event
    """
    raw_body = await request.body()
    try:
        payload = json.loads(raw_body.decode("utf-8")) if raw_body else {}
    except Exception:
        raise HTTPException(status_code=400, detail="Malformed JSON payload")

    # 1. Extract Event Identifiers
    event_id = (
        x_razorpay_event_id
        or payload.get("event_id")
        or payload.get("id")
        or f"evt_mock_{hashlib.md5(raw_body).hexdigest()[:12]}"
    )
    event_timestamp = str(
        payload.get("created_at")
        or payload.get("event_timestamp")
        or request.headers.get("X-Razorpay-Event-Time")
        or "0"
    )
    event_type = payload.get("event", "payment.failed")
    payload_hash = hashlib.sha256(raw_body).hexdigest()

    # Telemetry headers
    rl_status = rate_limit_tracker.get_rate_limit_status("razorpay")
    headers = {
        "X-Razorpay-Event-Id": event_id,
        "X-RateLimit-Limit": str(rl_status["limit_per_min"]),
        "X-RateLimit-Remaining": str(rl_status["remaining"]),
        "X-RateLimit-Reset": str(rl_status["reset_seconds"]),
    }

    # 2. Check Webhook Idempotency Store (Temporal Duplicates)
    if webhook_idempotency_store.is_processed(event_id, event_timestamp):
        headers["X-Idempotency-Status"] = "DUPLICATE"
        logger.info(
            f"Razorpay Webhook DEDUPLICATED: event_id={event_id}, timestamp={event_timestamp}. "
            "Returning 200 OK to satisfy gateway."
        )
        return JSONResponse(
            content={
                "status": "duplicate_ignored",
                "event_id": event_id,
                "event_timestamp": event_timestamp,
                "message": "Webhook temporal duplicate recognized and safely ignored.",
            },
            status_code=200,
            headers=headers,
        )

    # 3. Optional HMAC Signature Validation (if secret configured)
    if x_razorpay_signature and not razorpay_client.verify_webhook_signature(raw_body, x_razorpay_signature):
        logger.warning(f"Invalid webhook HMAC signature for event {event_id}")
        headers["X-Idempotency-Status"] = "INVALID_SIGNATURE"
        return JSONResponse(
            content={"status": "error", "message": "Invalid webhook signature"},
            status_code=401,
            headers=headers,
        )

    # 4. Process Webhook Event
    action_taken = "PROCESSED"
    if "payment.captured" in event_type or "payment.authorized" in event_type:
        try:
            from app.main import batch_results
            cases = batch_results.get("cases", []) if batch_results else []
        except Exception:
            cases = []

        matched, updated_case, msg = outcome_reconciler.reconcile_payment_event(
            event_type=event_type,
            payment_id=payload.get("payload", {}).get("payment", {}).get("entity", {}).get("id", "pay_mock"),
            order_id=payload.get("payload", {}).get("payment", {}).get("entity", {}).get("order_id"),
            amount_paise=int(payload.get("payload", {}).get("payment", {}).get("entity", {}).get("amount", 0)),
            cases_list=cases,
            event_id=event_id,
            event_timestamp=event_timestamp,
            customer_email=payload.get("payload", {}).get("payment", {}).get("entity", {}).get("email"),
            customer_phone=payload.get("payload", {}).get("payment", {}).get("entity", {}).get("contact"),
        )
        action_taken = "RECONCILED_MATCH" if matched else "RECONCILE_CHECKED"
    else:
        # Payment failure or generic event: log to audit ledger
        audit_ledger.record_event(
            event_type=f"WEBHOOK_{event_type.upper().replace('.', '_')}",
            case_id=event_id,
            payload={
                "event_id": event_id,
                "timestamp": event_timestamp,
                "type": event_type,
                "payload_hash": payload_hash,
            }
        )

    # 5. Mark Processed with 7-Day TTL
    webhook_idempotency_store.mark_processed(event_id, event_timestamp, payload_hash)
    headers["X-Idempotency-Status"] = "PROCESSED"

    return JSONResponse(
        content={
            "status": "success",
            "event_id": event_id,
            "event_timestamp": event_timestamp,
            "action_taken": action_taken,
            "message": "Webhook processed and registered in WebhookIdempotencyStore (7-day TTL).",
        },
        status_code=200,
        headers=headers,
    )
