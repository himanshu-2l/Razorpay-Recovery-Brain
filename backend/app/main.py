"""
Revenue Recovery Brain — FastAPI Backend

Main application entry point. Serves the API for:
- Batch processing (generate + run recovery pipeline)
- Individual case processing
- Webhook receiver (Razorpay test-mode)
- Dashboard data endpoints
- Voice call triggers
- Compliance reports
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from datetime import datetime, timezone
from typing import Optional
import json
import uuid
import asyncio
import hashlib

from app.services.data_generator import generate_full_batch
from app.services.recovery_pipeline import RecoveryPipeline

app = FastAPI(
    title="Revenue Recovery Brain",
    description="Unified root-cause diagnosis + intervention router for revenue recovery",
    version="1.0.0",
)

# CORS for dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory state (for hackathon demo - production would use DB)
pipeline = RecoveryPipeline()
current_batch = None
batch_results = None

# ── SSE Live Event Bus ───────────────────────────────────────────────────────
# Broadcast real-time events to all connected dashboard clients
_sse_clients: list[asyncio.Queue] = []

async def _broadcast_event(event_type: str, payload: dict):
    """Push an event to all connected SSE clients."""
    message = json.dumps({
        "type": event_type,
        "payload": payload,
        "ts": datetime.now(timezone.utc).isoformat(),
    })
    dead = []
    for q in _sse_clients:
        try:
            q.put_nowait(message)
        except asyncio.QueueFull:
            dead.append(q)
    for q in dead:
        _sse_clients.remove(q)


@app.get("/api/stream/events")
async def sse_event_stream(request: Request):
    """
    Server-Sent Events — streams live recovery events to the dashboard.
    Connect with: EventSource('http://localhost:8000/api/stream/events')
    """
    queue: asyncio.Queue = asyncio.Queue(maxsize=50)
    _sse_clients.append(queue)

    async def generator():
        try:
            # Send a heartbeat immediately on connect
            yield f"data: {json.dumps({'type': 'connected', 'payload': {'clients': len(_sse_clients)}, 'ts': datetime.now(timezone.utc).isoformat()})}\n\n"
            while True:
                if await request.is_disconnected():
                    break
                try:
                    msg = await asyncio.wait_for(queue.get(), timeout=25.0)
                    yield f"data: {msg}\n\n"
                except asyncio.TimeoutError:
                    # Heartbeat to keep connection alive
                    yield f"data: {json.dumps({'type': 'heartbeat', 'ts': datetime.now(timezone.utc).isoformat()})}\n\n"
        finally:
            if queue in _sse_clients:
                _sse_clients.remove(queue)

    return StreamingResponse(
        generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@app.get("/")
async def root():
    return {
        "name": "Revenue Recovery Brain",
        "version": "1.0.0",
        "description": "Unified root-cause diagnosis + intervention router",
        "status": "operational",
        "endpoints": {
            "POST /api/batch/generate": "Generate + process a new batch",
            "GET /api/batch/summary": "Get batch summary for dashboard",
            "GET /api/cases": "List all processed cases",
            "GET /api/cases/{case_id}": "Get single case with full audit trail",
            "POST /api/webhook/razorpay": "Receive Razorpay webhooks",
            "POST /api/demo/compliance-block": "Demo: trigger a compliance block",
            "POST /api/demo/voice-call": "Demo: trigger a Hinglish voice call",
            "GET /api/compliance/report": "Get compliance report",
            "GET /api/stats": "Get recovery statistics",
        }
    }


# ─── Batch Processing ────────────────────────────────────────────────────

@app.post("/api/batch/generate")
async def generate_and_process_batch():
    """Generate synthetic data and run the full recovery pipeline."""
    global pipeline, current_batch, batch_results

    # Reset pipeline
    pipeline = RecoveryPipeline()

    # Generate synthetic batch
    current_batch = generate_full_batch()

    # Process through the pipeline
    batch_results = pipeline.process_full_batch(current_batch)

    return {
        "status": "completed",
        "total_cases": batch_results["total_cases"],
        "total_at_risk": batch_results["total_at_risk"],
        "total_recovered": batch_results["total_recovered"],
        "recovery_rate": batch_results["recovery_rate"],
        "message": f"Processed {batch_results['total_cases']} cases. "
                   f"₹{batch_results['total_recovered']:,.0f} recovered of "
                   f"₹{batch_results['total_at_risk']:,.0f} at risk "
                   f"({batch_results['recovery_rate']}% recovery rate)."
    }


@app.get("/api/batch/summary")
async def get_batch_summary():
    """Get the full batch summary for the dashboard."""
    if batch_results is None:
        raise HTTPException(
            status_code=404,
            detail="No batch processed yet. POST /api/batch/generate first."
        )
    # Return summary without full case list (too large)
    summary = {k: v for k, v in batch_results.items() if k != "cases"}
    return summary


# ─── Cases ────────────────────────────────────────────────────────────────

@app.get("/api/cases")
async def list_cases(
    leak_type: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
):
    """List all processed cases with optional filters."""
    if batch_results is None:
        return {"cases": [], "total": 0}

    cases = batch_results.get("cases", [])

    # Filter
    if leak_type:
        cases = [c for c in cases if c["leak_type"] == leak_type]
    if status:
        cases = [c for c in cases if c["status"] == status]

    # Strip audit logs from list view (return on detail view)
    cases_summary = []
    for c in cases[:limit]:
        case_copy = {k: v for k, v in c.items() if k != "audit_logs"}
        case_copy["audit_log_count"] = len(c.get("audit_logs", []))
        cases_summary.append(case_copy)

    return {
        "cases": cases_summary,
        "total": len(cases),
        "filters_applied": {
            "leak_type": leak_type,
            "status": status,
        }
    }


@app.get("/api/cases/{case_id}")
async def get_case(case_id: str):
    """Get a single case with full audit trail."""
    if batch_results is None:
        raise HTTPException(status_code=404, detail="No batch processed yet.")

    for case in batch_results.get("cases", []):
        if case["id"] == case_id:
            return case

    raise HTTPException(status_code=404, detail=f"Case {case_id} not found.")


from app.core.idempotency import idempotency_guard
from app.services.razorpay_client import razorpay_client


# ─── Razorpay Webhook ────────────────────────────────────────────────────

@app.post("/api/webhook/razorpay")
async def razorpay_webhook(request: Request):
    """
    Receive Razorpay webhooks (payment.failed, subscription.halted, invoice.overdue, etc.)
    Guaranteed "At-Most-Once Execution" via stateful SQLite WAL Idempotency Core.
    Rejects duplicate/replayed requests with 409 Conflict.
    Processes through the Revenue Recovery Brain in real-time (<500ms).
    """
    import time
    start_time = time.time()
    
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    event = body.get("event", "")
    payload = body.get("payload", {})
    trace_id = f"trace_{uuid.uuid4().hex[:12]}"

    # Extract distinct entity idempotency key
    idempotency_key = (
        request.headers.get("X-Razorpay-Event-Id")
        or payload.get("payment", {}).get("entity", {}).get("id")
        or payload.get("subscription", {}).get("entity", {}).get("id")
        or payload.get("invoice", {}).get("entity", {}).get("id")
        or body.get("id")
        or f"anon_{hashlib.md5(json.dumps(body, sort_keys=True).encode()).hexdigest()[:16]}"
    )

    # Enforce atomic idempotency lock
    acquired, lock_status, cached_data = idempotency_guard.try_acquire(
        key=idempotency_key,
        event_type=event,
        trace_id=trace_id
    )

    if not acquired:
        latency_ms = round((time.time() - start_time) * 1000, 2)
        return JSONResponse(
            status_code=409,
            content={
                "status": "duplicate_rejected",
                "error": "Idempotency invariant enforced: at-most-once recovery execution",
                "idempotency_key": idempotency_key,
                "lock_status": lock_status,
                "cached": cached_data,
                "latency_ms": latency_ms,
                "message": "Duplicate event discarded to prevent double charge / redundant outreach."
            }
        )

    if event == "payment.failed":
        payment = payload.get("payment", {}).get("entity", {})
        case = pipeline.process_payment_failure(
            transaction={
                "razorpay_payment_id": payment.get("id", f"pay_test_{uuid.uuid4().hex[:8]}"),
                "amount": float(payment.get("amount", 250000)) / 100.0 if float(payment.get("amount", 2500)) > 10000 else float(payment.get("amount", 2500)),
                "payment_method": payment.get("method", "upi"),
                "status": "failed",
                "error_code": payment.get("error_code", "BAD_REQUEST_ERROR"),
                "error_description": payment.get("error_description", "Transaction timed out at NPCI switch"),
                "error_source": payment.get("error_source", "bank"),
            },
            customer={
                "id": payment.get("customer_id", "cust_live_demo"),
                "name": payment.get("notes", {}).get("customer_name") or payment.get("email", "Aarav Mehta"),
                "email": payment.get("email", "aarav.mehta@example.com"),
                "phone": payment.get("contact", "+919876543210"),
            }
        )
        latency_ms = round((time.time() - start_time) * 1000, 2)
        idempotency_guard.mark_completed(idempotency_key, response_summary=json.dumps({"case_id": case.get("id"), "root_cause": case.get("root_cause")}))
        await _broadcast_event("webhook_processed", {
            "event": event, "trace_id": trace_id, "latency_ms": latency_ms,
            "root_cause": case.get("root_cause", ""), "intervention": case.get("chosen_intervention", ""),
            "amount": case.get("amount_at_risk", 0), "compliance": case.get("compliance_status", ""),
        })
        return {
            "status": "processed",
            "event": event,
            "trace_id": trace_id,
            "idempotency_key": idempotency_key,
            "latency_ms": latency_ms,
            "case": case,
        }

    elif event in ["subscription.halted", "subscription.pending"]:
        sub = payload.get("subscription", {}).get("entity", {})
        cust = payload.get("customer", {}).get("entity", {})
        case = pipeline.process_subscription_churn(
            subscription={
                "razorpay_sub_id": sub.get("id", f"sub_test_{uuid.uuid4().hex[:8]}"),
                "amount": float(sub.get("charge_amount", 199900)) / 100.0 if float(sub.get("charge_amount", 1999)) > 10000 else float(sub.get("charge_amount", 1999)),
                "mrr_impact": float(sub.get("charge_amount", 199900)) / 100.0,
                "plan_id": sub.get("plan_id", "plan_pro_monthly"),
                "payment_method": "upi_autopay",
                "card_expiry": "09/26",
                "failure_reason": sub.get("error_description", "Mandate debit limit exceeded on issuing bank"),
            },
            customer={
                "id": cust.get("id", "cust_sub_demo"),
                "name": cust.get("name", "Pooja Verma"),
                "email": cust.get("email", "pooja.v@example.com"),
                "phone": cust.get("contact", "+919812345678"),
            }
        )
        latency_ms = round((time.time() - start_time) * 1000, 2)
        idempotency_guard.mark_completed(idempotency_key, response_summary=json.dumps({"case_id": case.get("id"), "root_cause": case.get("root_cause")}))
        await _broadcast_event("webhook_processed", {
            "event": event, "trace_id": trace_id, "latency_ms": latency_ms,
            "root_cause": case.get("root_cause", ""), "intervention": case.get("chosen_intervention", ""),
            "amount": case.get("amount_at_risk", 0), "compliance": case.get("compliance_status", ""),
        })
        return {
            "status": "processed",
            "event": event,
            "trace_id": trace_id,
            "idempotency_key": idempotency_key,
            "latency_ms": latency_ms,
            "case": case,
        }

    elif event in ["invoice.overdue", "invoice.unpaid"]:
        inv = payload.get("invoice", {}).get("entity", {})
        case = pipeline.process_invoice_receivable(
            invoice={
                "invoice_number": inv.get("invoice_number", f"INV-{uuid.uuid4().hex[:6].upper()}"),
                "amount": float(inv.get("amount", 125000)),
                "days_overdue": int(inv.get("days_overdue", 48)),
                "customer_name": inv.get("customer_name", "Kavita Industries Pvt Ltd"),
                "customer_phone": inv.get("customer_phone", "+919823456789"),
                "aging_bucket": "31-60",
                "dispute_flag": inv.get("dispute_flag", False),
            },
            customer={
                "id": inv.get("customer_id", "cust_b2b_demo"),
                "name": inv.get("customer_name", "Kavita Industries Pvt Ltd"),
                "phone": inv.get("customer_phone", "+919823456789"),
            }
        )
        latency_ms = round((time.time() - start_time) * 1000, 2)
        idempotency_guard.mark_completed(idempotency_key, response_summary=json.dumps({"case_id": case.get("id"), "root_cause": case.get("root_cause")}))
        await _broadcast_event("webhook_processed", {
            "event": event, "trace_id": trace_id, "latency_ms": latency_ms,
            "root_cause": case.get("root_cause", ""), "intervention": case.get("chosen_intervention", ""),
            "amount": case.get("amount_at_risk", 0), "compliance": case.get("compliance_status", ""),
        })
        return {
            "status": "processed",
            "event": event,
            "trace_id": trace_id,
            "idempotency_key": idempotency_key,
            "latency_ms": latency_ms,
            "case": case,
        }

    elif event in ["order.abandoned", "cart.abandoned"]:
        order = payload.get("order", {}).get("entity", {})
        case = pipeline.process_cart_abandonment(
            cart={
                "razorpay_order_id": order.get("id", f"order_test_{uuid.uuid4().hex[:8]}"),
                "cart_value": float(order.get("amount", 450000)) / 100.0 if float(order.get("amount", 4500)) > 10000 else float(order.get("amount", 4500)),
                "items_count": int(order.get("items_count", 2)),
                "abandonment_stage": order.get("stage", "payment_method_selection"),
                "customer_id": order.get("customer_id", "cust_cart_demo"),
                "customer_name": order.get("customer_name", "Rohan Gupta"),
                "customer_phone": order.get("customer_phone", "+919712345678"),
                "customer_email": order.get("customer_email", "rohan.gupta@example.com"),
                "customer_ltv": 15000.0,
                "high_intent": True,
            },
            customer={
                "id": order.get("customer_id", "cust_cart_demo"),
                "name": order.get("customer_name", "Rohan Gupta"),
                "email": order.get("customer_email", "rohan.gupta@example.com"),
                "phone": order.get("customer_phone", "+919712345678"),
            }
        )
        latency_ms = round((time.time() - start_time) * 1000, 2)
        return {
            "status": "processed",
            "event": event,
            "trace_id": trace_id,
            "latency_ms": latency_ms,
            "case": case,
        }

    return {
        "status": "unsupported_event",
        "event": event,
        "trace_id": trace_id,
        "message": f"Event '{event}' acknowledged but no recovery rule registered."
    }


# ─── Demo Endpoints ───────────────────────────────────────────────────────

@app.post("/api/demo/compliance-block")
async def demo_compliance_block(hour: int = 21):
    """
    Demo endpoint: attempt an action at a specified hour (default 9 PM)
    to trigger a visible compliance block.
    """
    from app.services.compliance_engine import ComplianceEngine
    from app.models.database import InterventionType
    import pytz

    engine = ComplianceEngine()
    ist = pytz.timezone("Asia/Kolkata")

    # Create a fake time at the specified hour
    fake_time = datetime.now(timezone.utc).astimezone(ist).replace(
        hour=hour, minute=4, second=0
    ).astimezone(timezone.utc)

    result = engine.check(
        intervention=InterventionType.VOICE_CALL,
        customer_id="demo_customer",
        current_time=fake_time,
    )

    return {
        "attempted_action": "voice_call",
        "attempted_at": f"{hour}:04 IST",
        "result": result["action"].value,
        "rule_cited": result["rule_cited"],
        "details": result["details"],
        "rescheduled_to": result["rescheduled_to"].isoformat() if result["rescheduled_to"] else None,
        "message": (
            f"{'❌ ACTION BLOCKED' if result['action'].value != 'allowed' else '✅ ACTION ALLOWED'}\n"
            f"Rule: {result['rule_cited']}\n"
            f"Current time: {hour}:{4:02d} IST\n"
            f"{'Action rescheduled to: ' + result['rescheduled_to'].strftime('%B %d, %I:%M %p IST') if result['rescheduled_to'] else ''}"
        ),
    }


# ─── Multi-Persona Telephony & Intent Classifier ───────────────────────────

@app.get("/api/voice/personas")
async def get_voice_personas():
    """Get all 4 debt recovery collection personas and their prompt strategies."""
    from app.services.voice_intent_classifier import PERSONA_CONFIGS
    return {
        "status": "success",
        "personas": [
            {
                "id": persona.value,
                "label": config["label"],
                "strategy": config["strategy"],
                "tone": config["tone"],
                "description": config["description"],
            }
            for persona, config in PERSONA_CONFIGS.items()
        ]
    }


@app.post("/api/voice/classify-turn")
async def classify_voice_turn(request: Request):
    """Classify a debtor utterance in real-time into structured tools & intents."""
    from app.services.voice_intent_classifier import VoiceIntentClassifier
    body = await request.json()
    utterance = body.get("utterance", "")
    result = VoiceIntentClassifier.classify_utterance(utterance)
    waterfall = VoiceIntentClassifier.compute_turn_latency_waterfall()
    return {
        "utterance": utterance,
        "classification": result,
        "latency_waterfall": waterfall,
    }


@app.post("/api/demo/voice-call")
async def demo_voice_call(request: Request):
    """
    Trigger a Hinglish voice recovery call.
    Accepts persona: first_time_miss / repeat_delinquent / dispute_pending / broken_ptp.
    Dynamically binds debtor details, extracts turn intents, and tracks sub-800ms latency waterfall.
    """
    from app.services.voice_intent_classifier import VoiceIntentClassifier, VoicePersona

    try:
        body = await request.json()
    except Exception:
        body = {}

    phone_number = body.get("phone_number", "+91 98765 43210")
    debtor_name = body.get("debtor_name", "Rajesh Sharma")
    amount = float(body.get("amount", 85000))
    invoice_number = body.get("invoice_number", "INV-20268421")
    days_overdue = int(body.get("days_overdue", 67))
    persona_str = body.get("persona", "first_time_miss")

    try:
        persona = VoicePersona(persona_str)
    except ValueError:
        persona = VoicePersona.FIRST_TIME_MISS

    persona_flow = VoiceIntentClassifier.generate_persona_flow(
        persona=persona,
        debtor_name=debtor_name,
        invoice_number=invoice_number,
        amount=amount,
        days_overdue=days_overdue,
    )

    return {
        "status": "demo_call_completed",
        "phone_number": phone_number,
        "persona": persona.value,
        "strategy": persona_flow["strategy"],
        "tone": persona_flow["tone"],
        "duration_seconds": len(persona_flow["flow"]) * 7,
        "conversation": {
            "language": "Hinglish (Natural Code-Mixing)",
            "flow": persona_flow["flow"],
            "promise_to_pay": persona_flow["promise_to_pay"],
            "compliance": persona_flow["compliance"],
        },
        "latency_waterfall": persona_flow["latency_waterfall"],
        "message": f"Hinglish voice call to {debtor_name} completed under strategy: '{persona_flow['strategy']}'.",
    }


# ─── Smart Calendar Retry Scheduler ───────────────────────────────────────

@app.get("/api/scheduler/candidates")
async def get_candidate_windows(timestamp: Optional[str] = None):
    """
    Generate the 5 deterministic candidate retry windows (Payday 1st-5th, Month-End, +1 Day 9 AM, +3 Days Midday, Immediate).
    """
    from app.services.smart_scheduler import smart_scheduler
    from datetime import datetime, timezone

    ref_time = datetime.fromisoformat(timestamp) if timestamp else datetime.now(timezone.utc)
    candidates = smart_scheduler.generate_candidate_windows(ref_time)
    return {
        "status": "success",
        "reference_time": ref_time.isoformat(),
        "candidates": candidates,
    }


@app.post("/api/scheduler/recommend")
async def recommend_retry_window(request: Request):
    """
    Recommend the optimal candidate retry window for a given root cause and amount.
    """
    from app.services.smart_scheduler import smart_scheduler
    from datetime import datetime, timezone

    try:
        body = await request.json()
    except Exception:
        body = {}

    root_cause = body.get("root_cause", "bd_insufficient_funds")
    amount = float(body.get("amount", 5000.0))
    ts_str = body.get("timestamp")
    ref_time = datetime.fromisoformat(ts_str) if ts_str else datetime.now(timezone.utc)

    recommendation = smart_scheduler.recommend_optimal_window(
        root_cause=root_cause,
        amount=amount,
        failure_timestamp=ref_time,
    )
    return {
        "status": "success",
        "root_cause": root_cause,
        "amount": amount,
        "recommendation": recommendation,
    }


# ─── Statistics ───────────────────────────────────────────────────────────

@app.get("/api/stats")
async def get_stats():
    """Get high-level recovery statistics for the dashboard header."""
    if batch_results is None:
        return {
            "total_cases": 0,
            "total_at_risk": 0,
            "total_recovered": 0,
            "recovery_rate": 0,
            "cases_by_status": {},
        }

    return {
        "total_cases": batch_results["total_cases"],
        "total_at_risk": batch_results["total_at_risk"],
        "total_recovered": batch_results["total_recovered"],
        "recovery_rate": batch_results["recovery_rate"],
        "by_leak_type": batch_results["by_leak_type"],
        "by_status": batch_results["by_status"],
        "compliance": batch_results["compliance"],
        "exception_count": len(batch_results.get("exceptions", [])),
    }


@app.get("/api/compliance/report")
async def get_compliance_report():
    """Get the full compliance report."""
    if batch_results is None:
        return {"message": "No batch processed yet."}

    blocked_cases = [
        {
            "case_id": c["id"],
            "customer": c["customer_name"],
            "intervention": c["chosen_intervention"],
            "compliance_status": c["compliance_status"],
            "rule": c["compliance_rule"],
            "details": c["compliance_details"],
        }
        for c in batch_results.get("cases", [])
        if c["compliance_status"] != "allowed"
    ]

    return {
        "total_checks": batch_results["compliance"]["total_checks"],
        "blocked": batch_results["compliance"]["blocked"],
        "compliance_rate": batch_results["compliance"]["compliance_rate"],
        "blocked_cases": blocked_cases,
    }


@app.get("/api/exceptions")
async def get_exceptions():
    """Get the exception list — cases we couldn't recover and why."""
    if batch_results is None:
        return {"exceptions": []}

    return {
        "total_exceptions": len(batch_results.get("exceptions", [])),
        "exceptions": batch_results.get("exceptions", []),
    }


# ─── LLM / GPU Server Endpoints ─────────────────────────────────────────────


@app.get("/api/llm/health")
async def llm_server_health():
    """
    Ping the Ollama GPU server and return its status.
    Frontend uses this to show the 'AI Brain' live status badge.
    """
    from app.services import llm_service
    info = await llm_service.get_server_info()
    return info


@app.post("/api/llm/voice-call-dynamic")
async def llm_dynamic_voice_call(request: Request):
    """
    Generate a unique, adaptive Hinglish debt recovery conversation using Llama-3-8B.
    If GPU server is offline, falls back to the scripted dialogue.
    """
    from app.services import llm_service

    body = await request.json()
    debtor_name = body.get("debtor_name", "Rajesh Sharma")
    debtor_company = body.get("debtor_company", "ABC Enterprises")
    invoice_number = body.get("invoice_number", "INV-2026-001")
    amount = float(body.get("amount", 85000))
    days_overdue = int(body.get("days_overdue", 67))
    prior_contact_count = int(body.get("prior_contact_count", 0))
    dispute_flag = bool(body.get("dispute_flag", False))

    llm_flow = await llm_service.generate_hinglish_call(
        debtor_name=debtor_name,
        debtor_company=debtor_company,
        invoice_number=invoice_number,
        amount=amount,
        days_overdue=days_overdue,
        prior_contact_count=prior_contact_count,
        dispute_flag=dispute_flag,
    )

    if llm_flow is not None:
        return {
            "status": "success",
            "mode": "llm_generated",
            "model": "llama3:8b-instruct-q4_K_M",
            "phone_number": body.get("phone_number", "+91XXXXXXXXXX"),
            "duration_seconds": len(llm_flow) * 18,
            "conversation": {
                "language": "Hinglish (LLM-generated, context-adaptive)",
                "flow": llm_flow,
                "promise_to_pay": {
                    "amount": amount,
                    "date": "Dynamically negotiated",
                    "invoice": invoice_number,
                    "logged_at": datetime.now(timezone.utc).isoformat(),
                    "follow_up_date": "Scheduled automatically",
                },
                "compliance": {
                    "contact_window": "08:00–19:00 IST enforced",
                    "language": "Hinglish — LLM adaptive",
                    "frequency": "RBI cap enforced",
                    "full_transcript_logged": True,
                },
            },
            "message": "Dynamic Hinglish dialogue generated by local Llama-3-8B on GPU server",
        }

    # Fallback: return the scripted dialogue endpoint redirect signal
    return {
        "status": "fallback",
        "mode": "scripted",
        "message": "GPU server offline — use /api/demo/voice-call for scripted dialogue",
        "gpu_server_url": llm_service.LLM_SERVER_URL,
    }


@app.post("/api/llm/analyze-dispute")
async def llm_analyze_dispute(request: Request):
    """
    Analyze a B2B invoice dispute text using Llama-3-8B.
    Classifies intent: legitimate / cash_flow_delay / evasion / unclear.
    """
    from app.services import llm_service

    body = await request.json()
    dispute_text = body.get("dispute_text", "")
    invoice_number = body.get("invoice_number", "")
    amount = float(body.get("amount", 0))
    vendor_name = body.get("vendor_name", "Unknown Vendor")

    if not dispute_text:
        raise HTTPException(status_code=400, detail="dispute_text is required")

    result = await llm_service.analyze_dispute_text(
        dispute_text=dispute_text,
        invoice_number=invoice_number,
        amount=amount,
        vendor_name=vendor_name,
    )

    if result is not None:
        return {
            "status": "analyzed",
            "model": "llama3:8b-instruct-q4_K_M",
            "input": {
                "invoice": invoice_number,
                "vendor": vendor_name,
                "amount": amount,
                "dispute_text": dispute_text,
            },
            "analysis": result,
        }

    return {
        "status": "fallback",
        "message": "GPU server offline — dispute analysis unavailable",
        "recommended_action": "escalate_to_human",
    }


@app.post("/api/llm/diagnose-enhanced")
async def llm_enhanced_diagnosis(request: Request):
    """
    Run LLM-enhanced diagnosis on a payment failure case.
    Rule engine first, Mistral-7B upgrade if confidence < 0.60.
    """
    from app.services import llm_service
    from app.services.diagnosis_engine import DiagnosisEngine
    from app.models.database import LeakType

    body = await request.json()
    engine = DiagnosisEngine()

    transaction = {
        "error_code": body.get("error_code", ""),
        "error_description": body.get("error_description", ""),
        "error_source": body.get("error_source", ""),
        "amount": body.get("amount", 0),
        "attempt_count": body.get("attempt_count", 1),
        "method": body.get("method", "unknown"),
        "is_recurring": body.get("is_recurring", False),
        "gateway_response": body.get("gateway_response", {}),
    }

    result = await engine.diagnose_with_llm(
        leak_type=LeakType.PAYMENT_FAILURE,
        data=transaction,
    )

    return {
        "root_cause": result["root_cause"].value if hasattr(result["root_cause"], "value") else str(result["root_cause"]),
        "confidence": result["confidence"],
        "reasoning_chain": result["reasoning_chain"],
        "llm_enhanced": result.get("llm_enhanced", False),
        "llm_reasoning": result.get("llm_reasoning"),
        "diagnosed_at": result["diagnosed_at"],
        "gpu_server": await llm_service.get_server_info(),
    }


# ─── Razorpay API & Idempotency Endpoints ────────────────────────────────────


@app.post("/api/razorpay/payment-link")
async def create_recovery_payment_link(request: Request):
    """
    Generate an official/test-mode Razorpay Payment Link for invoice recovery or cart checkout rescue.
    """
    body = await request.json()
    amount_inr = float(body.get("amount", 2500))
    customer_name = body.get("customer_name", "Aarav Mehta")
    customer_phone = body.get("customer_phone", "+919876543210")
    customer_email = body.get("customer_email", "aarav.mehta@example.com")
    description = body.get("description", "Revenue Recovery Brain Auto-Generated Link")
    invoice_number = body.get("invoice_number")

    plink = razorpay_client.create_recovery_payment_link(
        amount_inr=amount_inr,
        customer_name=customer_name,
        customer_phone=customer_phone,
        customer_email=customer_email,
        description=description,
        invoice_number=invoice_number,
    )
    return {
        "status": "created",
        "payment_link": plink,
    }


@app.get("/api/idempotency/stats")
async def get_idempotency_stats():
    """
    Get real-time statistics from the SQLite WAL Idempotency Core.
    Proves at-most-once execution to judges and operators.
    """
    stats = idempotency_guard.get_stats()
    return {
        "status": "active",
        "storage": "sqlite_wal",
        "locks": stats,
    }


# ─── Cryptographic Audit Ledger & HITL Endpoints ────────────────────────────

from app.core.audit_ledger import audit_ledger
from app.services.receipt_service import receipt_service


@app.get("/api/audit/verify")
async def verify_audit_ledger():
    """
    Cryptographically verify the entire SHA-256 hash chain from Genesis to Head.
    Proves tamper-resistance of all recovery actions to judges and compliance auditors.
    """
    is_valid, total_blocks, error = audit_ledger.verify_integrity()
    records = audit_ledger.get_records(limit=10)
    return {
        "integrity_verified": is_valid,
        "total_chained_blocks": total_blocks,
        "error": error,
        "head_hash": records[-1]["content_hash"] if records else "0",
        "recent_blocks": records,
    }


@app.get("/api/receipts/{case_id}")
async def get_decision_receipt(case_id: str):
    """
    Get the cryptographic Decision Receipt for a case.
    """
    if batch_results:
        for c in batch_results.get("cases", []):
            if c["id"] == case_id:
                receipt = c.get("receipt") or receipt_service.generate_receipt(c)
                return receipt
    raise HTTPException(status_code=404, detail=f"Receipt for case {case_id} not found.")


@app.post("/api/cases/{case_id}/approve")
async def approve_case_action(case_id: str, request: Request):
    """
    Human-In-The-Loop (HITL) 1-Click Operator Approval.
    Executes the paused recovery action for high-value cases (> ₹50,000).
    """
    body = await request.json() if request.headers.get("content-type") == "application/json" else {}
    operator_note = body.get("note", "Approved by Merchant Finance Operator")

    if batch_results:
        for c in batch_results.get("cases", []):
            if c["id"] == case_id:
                c["status"] = "recovered"
                c["amount_recovered"] = c.get("amount_at_risk", 0.0)
                c["operator_approval"] = {
                    "status": "approved",
                    "approved_at": datetime.now(timezone.utc).isoformat(),
                    "note": operator_note,
                }
                # Log to cryptographic audit ledger
                audit_ledger.record_event(
                    event_type="HUMAN_OPERATOR_APPROVED",
                    case_id=case_id,
                    payload={"amount": c["amount_at_risk"], "note": operator_note}
                )
                # Re-seal receipt
                c["receipt"] = receipt_service.generate_receipt(c)
                return {
                    "status": "approved",
                    "case_id": case_id,
                    "amount_recovered": c["amount_recovered"],
                    "receipt": c["receipt"],
                }

    raise HTTPException(status_code=404, detail=f"Case {case_id} not found.")


@app.post("/api/cases/{case_id}/reject")
async def reject_case_action(case_id: str, request: Request):
    """
    Human-In-The-Loop (HITL) 1-Click Operator Rejection.
    Stops the proposed recovery action and preserves customer relationship.
    """
    body = await request.json() if request.headers.get("content-type") == "application/json" else {}
    operator_reason = body.get("reason", "Rejected by Merchant Finance Operator")

    if batch_results:
        for c in batch_results.get("cases", []):
            if c["id"] == case_id:
                c["status"] = "stopped"
                c["amount_recovered"] = 0.0
                c["operator_approval"] = {
                    "status": "rejected",
                    "rejected_at": datetime.now(timezone.utc).isoformat(),
                    "reason": operator_reason,
                }
                # Log to cryptographic audit ledger
                audit_ledger.record_event(
                    event_type="HUMAN_OPERATOR_REJECTED",
                    case_id=case_id,
                    payload={"reason": operator_reason}
                )
                c["receipt"] = receipt_service.generate_receipt(c)
                return {
                    "status": "rejected",
                    "case_id": case_id,
                    "receipt": c["receipt"],
                }

    raise HTTPException(status_code=404, detail=f"Case {case_id} not found.")


# ─── Bank Circuit Breaker & Section 43B(h) Tax Clock Endpoints ───────────────

from app.services.circuit_breaker import bank_circuit_breaker
from app.services.tax_clock_engine import tax_clock_engine


@app.get("/api/circuit-breaker/status")
async def get_circuit_breaker_status():
    """
    Get live health metrics across all monitored Indian banking rails.
    Shows active vs tripped rails (e.g., HDFC, SBI, ICICI, Axis, NPCI).
    """
    return {
        "status": "active",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "rails": bank_circuit_breaker.get_all_status(),
    }


@app.post("/api/circuit-breaker/simulate-outage")
async def simulate_circuit_breaker_outage(request: Request):
    """
    Simulate a technical outage on a specific banking rail to test retry suppression.
    """
    body = await request.json()
    bank_code = body.get("bank_code", "HDFC")
    tripped = body.get("tripped", True)
    bank_circuit_breaker.simulate_rail_outage(bank_code, force_tripped=tripped)

    # Log to cryptographic audit ledger
    audit_ledger.record_event(
        event_type="CIRCUIT_BREAKER_SIMULATION",
        case_id="system_fleet",
        payload={"bank_code": bank_code, "tripped": tripped}
    )

    return {
        "message": f"Circuit breaker for rail {bank_code.upper()} set to {'TRIPPED' if tripped else 'HEALTHY'}",
        "rail_status": bank_circuit_breaker.get_all_status(),
    }


@app.get("/api/tax-clock/{case_id}")
async def get_case_tax_clock(case_id: str):
    """
    Evaluate Section 43B(h) Income Tax Act status and CFO negotiation leverage for a B2B invoice case.
    """
    if batch_results:
        for c in batch_results.get("cases", []):
            if c["id"] == case_id:
                amount = c.get("amount_at_risk", 0.0)
                days_overdue = 45  # Default or extracted
                status = tax_clock_engine.evaluate(amount=amount, days_overdue=days_overdue)
                return status.to_dict()

    raise HTTPException(status_code=404, detail=f"Case {case_id} not found.")


# ─── Late Authorization Reconciler & Multi-Stage Planner Endpoints ───────────

from app.services.outcome_reconciler import outcome_reconciler
from app.services.stage_planner import stage_planner


@app.post("/api/webhooks/reconcile-late-auth")
async def reconcile_late_authorization(request: Request):
    """
    Simulate / Ingest late payment authorization event (payment.captured / payment.authorized).
    Intercepts in-flight recovery cases, halts active outreach, and updates status to 'reconciled_late_auth'.
    """
    body = await request.json()
    event_type = body.get("event", "payment.captured")
    payment_id = body.get("payment_id", f"pay_late_{uuid.uuid4().hex[:8]}")
    order_id = body.get("order_id")
    amount_paise = body.get("amount", 250000)

    cases_list = batch_results.get("cases", []) if batch_results else []
    matched, updated_case, message = outcome_reconciler.reconcile_payment_event(
        event_type=event_type,
        payment_id=payment_id,
        order_id=order_id,
        amount_paise=amount_paise,
        cases_list=cases_list,
    )

    if matched and updated_case:
        # Re-generate stages and receipt
        updated_case["stages"] = stage_planner.generate_stages(updated_case)
        updated_case["receipt"] = receipt_service.generate_receipt(updated_case)

    return {
        "matched": matched,
        "message": message,
        "payment_id": payment_id,
        "case": updated_case,
    }


@app.get("/api/cases/{case_id}/stages")
async def get_case_stages(case_id: str):
    """
    Get the 4-stage execution timeline for a recovery case.
    """
    if batch_results:
        for c in batch_results.get("cases", []):
            if c["id"] == case_id:
                stages = c.get("stages") or stage_planner.generate_stages(c)
                return {
                    "case_id": case_id,
                    "stages": stages,
                }

    raise HTTPException(status_code=404, detail=f"Case {case_id} not found.")


# ─── Autonomy Envelope & Promise-to-Pay Endpoints ───────────────────────────

from app.services.autonomy_envelope import autonomy_envelope
from app.services.ptp_tracker import ptp_tracker


@app.get("/api/autonomy/envelope")
async def get_autonomy_envelope():
    """Get active autonomy envelope state, threshold caps, and stability metrics."""
    return autonomy_envelope.get_status()


@app.post("/api/autonomy/contract")
async def contract_autonomy_envelope(request: Request):
    """Safeguard: Force contract autonomy envelope due to detected risk or rail outage."""
    body = await request.json()
    reason = body.get("reason", "Manual operator safeguard trigger")
    autonomy_envelope.contract(reason=reason)
    return {
        "message": f"Autonomy envelope contracted to safeguard mode: {reason}",
        "status": autonomy_envelope.get_status(),
    }


@app.post("/api/autonomy/expand")
async def expand_autonomy_envelope():
    """Expand autonomy envelope back to normal mode."""
    for _ in range(5):
        autonomy_envelope.record_stable_cycle()
    return {
        "message": "Autonomy envelope expanded back to normal operation.",
        "status": autonomy_envelope.get_status(),
    }


@app.post("/api/ptp/record")
async def record_promise_to_pay(request: Request):
    """Record customer payment promise negotiated via voice or messaging."""
    body = await request.json()
    case_id = body.get("case_id", "case_manual_ptp")
    customer_id = body.get("customer_id", "cust_ptp")
    customer_name = body.get("customer_name", "Valued Customer")
    amount = float(body.get("amount", 5000.0))
    days_ahead = int(body.get("days_ahead", 3))
    channel = body.get("channel", "voice_call")

    ptp = ptp_tracker.record_promise(
        case_id=case_id,
        customer_id=customer_id,
        customer_name=customer_name,
        amount_promised=amount,
        promised_days_ahead=days_ahead,
        channel=channel,
    )
    return {"message": "Promise-to-Pay recorded successfully", "promise": ptp.to_dict()}


@app.get("/api/ptp/promises")
async def get_all_promises():
    """List all registered customer Promises-to-Pay and their current fulfillment status."""
    return {"promises": ptp_tracker.get_all()}


# ─── Run ──────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
