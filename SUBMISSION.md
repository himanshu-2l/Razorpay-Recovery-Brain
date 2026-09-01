# 🧠 Revenue Recovery Brain
### Razorpay AI Buildathon 2026 — Track 03: AI Revenue Recovery

---

## One-Line Pitch

> **An AI Brain that sits above payment failures, cart drops, subscription halts, and B2B invoice aging — instantly classifies *why* the money was lost (Technical vs. Business vs. Mandate vs. Cash-Flow), picks the legally-bounded right intervention, and speaks Hinglish to recover it.**

---

## The Problem We Chose (and Why It's Massive)

India's digital payments ecosystem has a silent haemorrhage across 4 distinct funnels:

| Funnel | Scale | Core Friction |
|---|---|---|
| **Payment Gateway Failures** | ~8% UPI failure rate (NPCI, 2025) | Merchants blindly retry technical timeouts *and* genuine declines — destroying conversion |
| **Checkout Abandonment** | 68% average Indian e-commerce cart abandonment rate | No root-cause → no personalized recovery |
| **Subscription Churn via Mandate** | 23% SaaS churn is involuntary (failed mandate, expired card) | Teams don't know mandate vs. genuine cancellation |
| **B2B Invoice Receivables** | Indian SMEs wait **73 days** average on 30-day terms | No intelligent, compliant, conversational recovery at scale |

Each of these is solved in isolation by different point tools. **We built the unified brain that sits above all four.**

---

## What We Built

### Architecture

```
Razorpay Webhook / Synthetic Batch Input
         ↓
┌─────────────────────────────────────────┐
│         DIAGNOSIS ENGINE                │
│  TD vs. BD vs. Mandate vs. Aging        │
│  Confidence: 72–94% per case            │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│    RBI FAIR PRACTICES COMPLIANCE GATE   │
│  • 8 AM – 7 PM IST contact window       │
│  • 3 attempts / week hard cap           │
│  • 1 attempt / day daily cap            │
│  • 7 total tries → human escalation     │
│  • 48-hour cool-off after PTP           │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│       SMART INTERVENTION ROUTER         │
│  Instant Retry (TD)                     │
│  Smart Delay — 30 min / 2h / next day  │
│  WhatsApp Soft Nudge (BD low-risk)      │
│  Dynamic Discount Checkout (high cart)  │
│  Mandate Re-link (subscription)         │
│  Hinglish Voice B2B Recovery Agent      │
│  Human Escalation (exhausted / risky)   │
└─────────────────────────────────────────┘
         ↓
  SQLite Audit Vault (full trail)
```

### The Differentiators Judges Can Test Live

1. **Webhook Playground Tab** — Fire any Razorpay event (payment.failed, subscription.halted, invoice.overdue, order.abandoned) at the live Brain and see root-cause, confidence, intervention, and compliance result in `< 500ms`.
2. **Hinglish Voice Recovery Studio** — Click "Simulate Real-Time Voice Call." The browser-native Speech Synthesis API speaks the bilingual Hinglish recovery dialogue aloud with a live audio waveform, synchronized transcript, and Promise-to-Pay auto-logging.
3. **RBI Compliance Gate Demo** — Pick 9 PM → the system **refuses to act** and cites the exact RBI Fair Practices Code rule. Pick 2 PM → it proceeds. This is unprecedented in recovery tooling.
4. **50+ Case Batch with Honest Exceptions** — One click regenerates a diverse synthetic batch (all 4 funnel types, all root-cause categories) with a genuine "unrecovered exceptions" list — winning submissions don't cherry-pick.

---

## Technical Stack

| Layer | Technology |
|---|---|
| **Backend** | FastAPI (Python 3.11), Uvicorn, SQLite (SQLAlchemy), Pytz |
| **Frontend** | React 19 + Vite + TypeScript + Tailwind CSS v4 |
| **Voice** | Browser Web Speech API (`SpeechSynthesis`) — works offline, no API key |
| **Data** | Synthetic generator calibrated to NPCI/RBI/SME published statistics |
| **Design** | Razorpay Agent Studio obsidian design system (`#050507`, JetBrains Mono, glassmorphic cards) |
| **Hosting** | Local dev (`start.bat` / `start.ps1`) — zero infrastructure setup for judges |

---

## What's Real vs. Simulated

**Honest disclosure (as required by hackathon guidelines):**

| Component | Status | Details |
|---|---|---|
| Diagnosis Engine | ✅ Real | Deterministic rule-based classifier |
| RBI Compliance Gate | ✅ Real | Hard time/frequency checks, full audit log |
| Webhook Processing | ✅ Real | Live POST → sub-500ms response |
| Case Database | ✅ Real | SQLite with full schema and audit trail |
| Voice TTS | ✅ Real | Browser Web Speech API speaks aloud |
| Hinglish Dialogue Script | ✅ Real content | Manually authored recovery flow |
| Transaction Data | 🧪 Synthetic | NPCI/SME-calibrated generator |
| WhatsApp / Vapi Calls | 🎭 Simulated | Would use Vapi/WATI APIs in production |
| Razorpay Test-Mode Orders | 🎭 Simulated | Webhook handler ready for real Razorpay events |

---

## How to Run (Judges)

```bash
# Option A: One-click launcher (Windows)
double-click start.bat

# Option B: PowerShell
.\start.ps1

# Option C: Manual
# Terminal 1 — Backend
cd backend && .venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
# Terminal 2 — Frontend
cd dashboard && bun run dev

# Dashboard: http://localhost:5173
# API Docs:  http://localhost:8000/docs
```

---

## 3-Minute Demo Video Script

### [0:00–0:20] Hook
> "India processes 15 billion UPI transactions a month. 8% fail. That's 1.2 billion failures — and right now, merchants are blindly retrying all of them the same way. Here's what should happen instead."

### [0:20–0:50] The Problem (fast cuts)
- Show: Payment failure → angry user
- Show: Subscription halt → MRR drops
- Show: 73-day invoice → cash flow crisis
- Voiceover: "Four separate revenue leaks. Four separate point tools. Zero unified intelligence."

### [0:50–1:30] The Brain Demo
- Open dashboard → `Command Center` overview
- Click `Regenerate Batch` → watch 50+ cases diagnose in real-time
- Click a payment failure case → show Decision Tree modal: TD confidence 87%, why instant retry was chosen, why WhatsApp was rejected
- Point to Exceptions section: "We show you what we couldn't recover — because honest AI wins."

### [1:30–2:00] RBI Compliance Gate
- Switch to `RBI Compliance` tab
- Select 9 PM → click Trigger → show red BLOCKED card + rule citation
- Select 2 PM → click Trigger → green ALLOWED
- "The compliance layer visibly refusing to act is more impressive than the agent acting."

### [2:00–2:40] Hinglish Voice Recovery (THE WOW MOMENT)
- Switch to `Hinglish Voice Agent` tab
- Fill in: Rajesh Sharma, ₹85,000, INV-20268421
- Click "Simulate Real-Time Voice Call"
- Audio plays: agent speaks Hinglish, waveform pulses, transcript animates step by step
- Promise-to-Pay card appears: "₹85,000 scheduled for September 8 · AUDIT SIGNED"

### [2:40–3:00] Webhook Sandbox
- Switch to `Webhook Sandbox` tab
- Select `B2B Invoice Overdue · 48 Days` → Fire Webhook →
- Show: trace_id, latency_ms, root cause, chosen intervention, compliance status — all in 340ms

### [3:00] Close
> "This is what Revenue Recovery looks like when it's built on intelligence, compliance, and empathy. Track 03. Revenue Recovery Brain."

---

## Team

**Himanshu** — Solo Build · Razorpay AI Buildathon 2026

---

## Repository

[https://github.com/himanshu-2l/Razorpay-Recovery-Brain](https://github.com/himanshu-2l/Razorpay-Recovery-Brain)
