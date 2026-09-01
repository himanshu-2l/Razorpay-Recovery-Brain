# 🧠 Revenue Recovery Brain

### Track 03 — AI Revenue Recovery | Razorpay AI Buildathon 2026

---

## What This Is

A **unified root-cause diagnosis + intervention router** that sits above payment failures, checkout abandonment, subscription dunning, and B2B receivables — because these four things are symptoms of the same underlying causes, and treating them separately is why recovery rates are bad today.

## What Makes This Different

| What everyone else builds | What we built |
|---|---|
| Better dunning bot for ONE leak type | **One brain** watching all four leaks |
| Same "payment failed" nudge for every failure | **Root-cause diagnosis** → different failure = different treatment |
| Text-only recovery (email/WhatsApp) | **Live Hinglish voice agent** for B2B collections |
| Compliance as an afterthought | **Compliance as a feature** — the system visibly blocking bad actions |

## Architecture

```
Signal Ingestion → Root-Cause Diagnosis Engine → Intervention Router → Compliance Gate → Execution → Dashboard
```

Four failure types, one brain:
- **Payment degradation**: TD vs BD vs Mandate classification (grounded in NPCI data)
- **Checkout abandonment**: WHERE in funnel + WHY they dropped
- **Subscription failure**: The documented RBI >₹15K mandate bug detection
- **B2B receivables**: Hinglish voice recovery with Promise-to-Pay tracking

## Quick Start

```bash
# Backend
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Dashboard
cd dashboard
npm install
npm run dev
```

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/batch/generate` | POST | Generate + process 50+ synthetic cases |
| `/api/batch/summary` | GET | Dashboard summary with recovery metrics |
| `/api/cases` | GET | List all cases (filterable) |
| `/api/cases/{id}` | GET | Full case with audit trail |
| `/api/demo/compliance-block` | POST | Trigger a visible compliance block |
| `/api/demo/voice-call` | POST | Demo Hinglish voice call |
| `/api/stats` | GET | Recovery statistics |
| `/api/compliance/report` | GET | Full compliance report |

## Measured Results (Across 50+ Synthetic Cases)

- **Payment failures**: TD recovery ~92%, BD recovery ~45-60%
- **Checkout recovery**: ~30-35% of recoverable abandonments
- **Subscription recovery**: ~78% when mandate re-auth is the actual issue
- **B2B receivables**: ~55% via voice, ~70% oversight nudges

## What's Real vs Simulated

| Component | Status |
|---|---|
| Razorpay test-mode API calls | ✅ Real |
| Root-cause diagnosis engine | ✅ Real |
| Compliance enforcement | ✅ Real |
| Voice call flow (Hinglish) | ✅ Real (Vapi) |
| WhatsApp/email delivery | ⚡ Simulated (messages generated, not sent) |
| Recovery outcomes | ⚡ Simulated (probability-based, grounded in industry data) |

## Tech Stack

- **Backend**: Python + FastAPI
- **Diagnosis**: Rule-based classifier + LLM reasoning chain
- **Voice**: Vapi + Claude API (Hinglish)
- **Dashboard**: Next.js + React
- **Payments**: Razorpay test-mode APIs
- **Database**: SQLite

## RBI Fair Practices Code Compliance

Hard-coded, not configurable:
- Contact window: 8 AM – 7 PM IST only
- Max 3 contacts per customer per week
- Max 1 contact per customer per day
- No abusive/coercive language (prompt guardrails)
- Full audit trail per case
- Max 7 total attempts → mandatory human escalation

---

Built by Himanshu for the Razorpay AI Buildathon 2026.
