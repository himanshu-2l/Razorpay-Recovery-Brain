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
from fastapi.responses import JSONResponse
from datetime import datetime, timezone
from typing import Optional
import json

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


# ─── Razorpay Webhook ────────────────────────────────────────────────────

@app.post("/api/webhook/razorpay")
async def razorpay_webhook(request: Request):
    """
    Receive Razorpay webhooks (payment.failed, subscription.halted, invoice.overdue, etc.)
    Processes through the Revenue Recovery Brain in real-time (<500ms)
    and returns comprehensive root-cause analysis, chosen intervention, and compliance gate decisions.
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
        return {
            "status": "processed",
            "event": event,
            "trace_id": trace_id,
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
        return {
            "status": "processed",
            "event": event,
            "trace_id": trace_id,
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
        return {
            "status": "processed",
            "event": event,
            "trace_id": trace_id,
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


@app.post("/api/demo/voice-call")
async def demo_voice_call(
    phone_number: str = "+919999999999",
    debtor_name: str = "Rajesh Sharma",
    amount: float = 85000,
    invoice_number: str = "INV-20261234",
    days_overdue: int = 67,
):
    """
    Demo endpoint: trigger a Hinglish voice call.
    In demo mode, returns the scripted conversation flow.
    With Vapi integration, would actually place the call.
    """
    conversation_script = {
        "language": "Hinglish",
        "flow": [
            {
                "step": 1,
                "speaker": "agent",
                "text": f"Namaste! Kya main {debtor_name} ji se baat kar raha hoon?",
                "translation": f"Hello! Am I speaking with {debtor_name}?",
            },
            {
                "step": 2,
                "speaker": "debtor",
                "text": "Haan, bol raha hoon.",
                "translation": "Yes, speaking.",
            },
            {
                "step": 3,
                "speaker": "agent",
                "text": f"Dhanyavaad. Main {invoice_number} ke baare mein baat karna chahta hoon. "
                        f"Aapka ₹{amount:,.0f} ka invoice {days_overdue} din se pending hai.",
                "translation": f"Thank you. I'd like to discuss invoice {invoice_number}. "
                              f"Your ₹{amount:,.0f} invoice has been pending for {days_overdue} days.",
            },
            {
                "step": 4,
                "speaker": "debtor",
                "text": "Haan, cash flow mein thodi problem hai. Next week tak kar dunga.",
                "translation": "Yes, there's a bit of a cash flow problem. I'll do it by next week.",
            },
            {
                "step": 5,
                "speaker": "agent",
                "text": "Samajh gaya. Toh kya hum 8 September tak ka date fix kar lein? "
                        "Main ek reminder bhej dunga us din.",
                "translation": "I understand. Shall we fix September 8 as the date? "
                              "I'll send a reminder that day.",
            },
            {
                "step": 6,
                "speaker": "debtor",
                "text": "Haan, 8 September theek hai.",
                "translation": "Yes, September 8 is fine.",
            },
            {
                "step": 7,
                "speaker": "agent",
                "text": f"Bahut accha. Maine ₹{amount:,.0f} ka Promise-to-Pay 8 September ke liye log kar diya hai. "
                        f"Dhanyavaad {debtor_name} ji, aapka din shubh ho!",
                "translation": f"Very good. I've logged a Promise-to-Pay of ₹{amount:,.0f} for September 8. "
                              f"Thank you {debtor_name} ji, have a good day!",
            },
        ],
        "promise_to_pay": {
            "amount": amount,
            "date": "2026-09-08",
            "invoice": invoice_number,
            "logged_at": datetime.now(timezone.utc).isoformat(),
            "follow_up_date": "2026-09-08",
        },
        "compliance": {
            "contact_window": "✅ Within 8 AM – 7 PM IST",
            "language": "✅ No abusive or coercive language used",
            "frequency": "✅ Within weekly contact limit",
            "full_transcript_logged": True,
        }
    }

    return {
        "status": "demo_call_completed",
        "phone_number": phone_number,
        "duration_seconds": 47,
        "conversation": conversation_script,
        "message": f"Voice call to {debtor_name} completed. Promise-to-Pay of ₹{amount:,.0f} logged for Sep 8, 2026.",
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


# ─── Run ──────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
