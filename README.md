# Revenue Recovery Brain

**Track 03 - AI Revenue Recovery - Razorpay AI Buildathon 2026**

[![Tests](https://img.shields.io/badge/Tests-78%2F78_Passing-10B981?style=flat-square&logo=pytest&logoColor=white)](backend/tests/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![RBI Compliant](https://img.shields.io/badge/RBI_FPC-Enforced-3B82F6?style=flat-square&logo=shield&logoColor=white)](docs/COMPLIANCE.md)
[![SHA-256 Audit](https://img.shields.io/badge/Audit_Ledger-SHA--256_Chained-8B5CF6?style=flat-square)](backend/verify_ledger.py)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

## The Problem

India's digital payment rails process over **117 billion transactions worth $2.19 trillion annually** -- yet merchants silently lose revenue across four disconnected failure funnels that nobody has unified into a single operating system:

| Failure Mode | Scale | Root Cause |
|:---|:---|:---|
| **Mandate Revocations** | 20M+ UPI AutoPay mandates revoked monthly | Low balance at execution; no intelligent retry scheduling |
| **Payment Gateway Failures** | 2,000+ unique bank decline codes | Blind retries trigger issuer rate-limits and rail blacklisting |
| **Checkout Abandonment** | 70%+ drop-off rate | UPI intent mismatches, friction in payment flow |
| **B2B Trade Receivables** | Avg. 73-day DSO on invoices | No awareness of the 45-day Section 43B(h) tax penalty cliff |

Existing tools are **dumb pumps**: they fire blind retries, spam debtors at 10 PM violating RBI Fair Practices Code, and treat the same customer as four disconnected strangers across different recovery channels.

**A corporate buyer simultaneously experiences an expired mandate, an abandoned cart from that same card, and an overdue supplier invoice approaching the 45-day tax cliff.** Three siloed bots will generate three uncoordinated calls within hours -- causing contact fatigue, brand erosion, and wasted merchant fees.

---

## What We Built

**Revenue Recovery Brain** is a unified, multi-funnel revenue recovery operating system with strict regulatory guardrails, mathematical decision science, and a cryptographic audit trail.

It does not just send emails. It **diagnoses**, **decides**, **dispatches**, and **proves**.

```
Webhook arrives  -->  Root-cause diagnosis  -->  Policy gate  -->  Intelligent intervention  -->  Cryptographic proof
      ^                    (<150ms)            (RBI/DPDP)       (smart retry, voice, link)       (SHA-256 ledger)
      |
   Idempotency lock (atomic, At-Most-Once)
```

### Core Capabilities

- **4-Funnel Unification** -- A single cross-leak customer risk profile merges mandate failures, card declines, checkout abandonments, and B2B invoices into one risk view, preventing multi-channel spam
- **Constrained Decision Engine** -- Expected Net Recoverable Value (ENRV) optimizer with causal uplift modeling, churn penalty, and WACC discounting (Abe et al., ACM SIGKDD 2010)
- **Deterministic Compliance Gate** -- Hard-coded RBI Fair Practices Code (08:00-19:00 IST curfew, frequency caps), DPDP Act 2023 PII masking, and Section 43B(h) tax clock enforcement
- **Verified Audit Trail** -- Every decision is SHA-256 chained into a Merkle-style ledger, verifiable offline with zero dependencies
- **At-Most-Once Execution** -- SQLite WAL atomic lease locks guarantee no customer is ever charged twice, even under concurrent webhook storms

---

## Architecture

The system is organized into four bounded execution stages, each with a hard trust boundary:

### Stage 1 - Ingestion & Idempotency Guard
> **Key files:** [`core/idempotency_mutex.py`](backend/app/core/idempotency_mutex.py) &middot; [`app/main.py`](backend/app/main.py)

When a `payment.failed` webhook arrives, the **Bouncer** creates an atomic `PENDING` lease in SQLite WAL mode. Concurrent duplicate webhooks are rejected with `409 Conflict`. This guarantees At-Most-Once execution -- the AI will attempt recovery for a specific failure exactly once.

```
Webhook (payment.failed)
    |
    +---> Idempotency Check ---> DUPLICATE? ---> 409 Conflict (drop)
    |         (SQLite WAL)
    +---> PENDING Lease Created ---> Pipeline proceeds
```

### Stage 2 - Diagnostic Intelligence
> **Key files:** [`services/diagnosis_engine.py`](backend/app/services/diagnosis_engine.py) &middot; [`services/cross_leak_state.py`](backend/app/services/cross_leak_state.py) &middot; [`services/circuit_breaker.py`](backend/app/services/circuit_breaker.py)

The **Investigator** (read-only LLM with structured fallback classifier) ingests the raw Razorpay webhook -- `error_code`, `error_step`, `error_reason` -- and classifies the root cause. Simultaneously:

- The **Cross-Leak State Store** merges this failure into the customer's unified risk profile across all 4 funnels
- The **Bank-Rail Circuit Breaker** (rolling EMA, alpha=0.10) checks if the target bank's success rate has dropped below 30% and contracts the Autonomy Envelope from Rs.25,000 to Rs.5,000
- The **Smart Liquidity Scheduler** aligns any retry with empirical salary and liquidity cycles

```
Raw Webhook Payload
    |
    +---> Root-Cause Classifier (LLM --> regex fallback)
    +---> Cross-Leak Profile Merge
    +---> Bank Circuit Breaker Check (EMA rolling SR)
    +---> Terminal Failure Filter (GoCardless-style)
```

### Stage 3 - Policy Enforcement & Decision
> **Key files:** [`services/compliance_engine.py`](backend/app/services/compliance_engine.py) &middot; [`services/intervention_router.py`](backend/app/services/intervention_router.py) &middot; [`services/autonomy_envelope.py`](backend/app/services/autonomy_envelope.py)

The **Policy Gate** enforces every non-negotiable rule before any action is taken:

- **RBI Fair Practices Code** -- Contact window (08:00-19:00 IST), frequency caps, 48-hour cooling-off
- **DPDP Act 2023** -- PII masking before LLM prompt injection, Right to Erasure endpoint
- **Section 43B(h) Tax Clock** -- Monitors MSME invoice age; flags when approaching the 45-day statutory penalty cliff
- **Autonomy Envelope** -- High-value cases above the configured threshold are routed to human review

Only cases that pass every gate proceed to execution. The **ENRV Calculator** then selects the strategy with the highest expected net recovery:

```
ENRV = delta_P(a) * V  -  C(a)  -  P_churn * LTV
```

Where `delta_P(a)` is the causal uplift over natural recovery, `C(a)` is intervention cost, and the churn penalty term protects high-LTV customers from aggressive contact ("Sleeping Dogs" defense).

### Stage 4 - Multi-Modal Execution & Proof
> **Key files:** [`services/razorpay_client.py`](backend/app/services/razorpay_client.py) &middot; [`services/bolna_caller.py`](backend/app/services/bolna_caller.py) &middot; [`services/whatsapp_service.py`](backend/app/services/whatsapp_service.py) &middot; [`core/audit_ledger.py`](backend/app/core/audit_ledger.py)

The selected intervention executes and every action is written to the immutable audit ledger:

| Intervention | Trigger Condition | Channel |
|:---|:---|:---|
| Smart Retry / Rail Reroute | Technical timeout, alternate rail available | Razorpay API |
| WhatsApp Payment Link | Mid-value, responsive customer | Razorpay `plink_` + WhatsApp |
| Pre-Debit Notification | Mandate re-auth required (>Rs.15,000) | SMS / WhatsApp |
| Voice Recovery Call | High-value B2B, PTP negotiation | Twilio / Bolna + Hinglish Script |
| Human Review Escalation | Above Autonomy Envelope threshold | Operator Console queue |

A **Late Authorization Interceptor** handles asynchronous `payment.captured` events -- if a payment settles naturally after recovery was dispatched, the system catches it in <5ms, cancels in-flight calls/SMS, and records the reconciliation cryptographically.

---

## Regulatory Compliance

Compliance is enforced at the architecture level, not as a feature.

> Full compliance matrix --> [`docs/COMPLIANCE.md`](docs/COMPLIANCE.md)

| Regulation | What We Enforce |
|:---|:---|
| **RBI Fair Practices Code** (DNBS CC No. 95) | Hard curfew 08:00-19:00 IST, frequency caps, 48h cooling-off |
| **RBI Recurring Mandate Circular** (DPSS.CO.PD.No.447) | 24h pre-debit notification, AFA re-auth for mandates >Rs.15,000 |
| **Income Tax Act s.43B(h)** | Real-time 45-day MSME invoice tax clock with CFO-lever escalation |
| **DPDP Act 2023** | PII masking before LLM, Right to Erasure endpoint, purpose limitation |
| **Voice Credential Prohibition** | `VoiceSafetyFilter` blocks any OTP/PIN/CVV solicitation per dialogue turn |

---

## Repository Structure

```
revenue-recovery-brain/
|
+-- backend/                     # FastAPI core service
|   +-- app/
|   |   +-- core/                # Shared infrastructure
|   |   |   +-- idempotency_mutex.py   # Atomic At-Most-Once lease locks
|   |   |   +-- audit_ledger.py        # SHA-256 Merkle-style chained ledger
|   |   |   +-- ab_testing.py          # Two-proportion z-test engine
|   |   |   +-- circuit_breaker.py     # Bank rail EMA success-rate monitor
|   |   |   +-- dpdp_compliance.py     # DPDP Act PII masking & erasure
|   |   |
|   |   +-- services/            # Domain intelligence (30 modules)
|   |   |   +-- diagnosis_engine.py    # Root-cause classifier (<150ms)
|   |   |   +-- intervention_router.py # ENRV strategy tournament
|   |   |   +-- compliance_engine.py   # RBI FPC guardrails
|   |   |   +-- cross_leak_state.py    # 4-funnel customer risk store
|   |   |   +-- smart_scheduler.py     # Salary-cycle aware retry timing
|   |   |   +-- autonomy_envelope.py   # Dynamic spend authority caps
|   |   |   +-- tax_clock_engine.py    # Section 43B(h) MSME monitor
|   |   |   +-- rails_clearing.py      # RAILS protocol audit proofs
|   |   |   +-- voice_safety.py        # Credential extraction guardrail
|   |   |   +-- hinglish_time_parser.py# Vernacular PTP date parser
|   |   |   +-- ptp_tracker.py         # 3-phase Promise-to-Pay lifecycle
|   |   |   +-- razorpay_client.py     # Official Razorpay SDK v2.0.1 facade
|   |   |   +-- bolna_caller.py        # Bolna/Twilio voice agent
|   |   |   +-- whatsapp_service.py    # WhatsApp payment link dispatch
|   |   |
|   |   +-- main.py              # FastAPI entrypoint, routers & lifecycle
|   |
|   +-- tests/                   # 78-test verification suite (100% passing)
|   |   +-- test_recovery_brain.py           # 29 core architectural tests
|   |   +-- test_competitive_enhancements.py # 12 cross-funnel & telephony tests
|   |   +-- test_failure_injection.py        # 7 chaos & adversarial tests
|   |   +-- test_ab_testing.py               # 8 statistical uplift tests
|   |   +-- test_voice_safety.py             # 6 credential guardrail tests
|   |   +-- test_webhook_idempotency.py      # 5 concurrency & race tests
|   |   +-- test_rails_clearing.py           # 5 RAILS cryptographic proof tests
|   |   +-- test_razorpay_sdk.py             # 4 Razorpay SDK facade tests
|   |
|   +-- verify_ledger.py         # Zero-dependency standalone audit verifier
|
+-- dashboard/                   # React 19 + Vite 8 Operator Console
|   +-- src/components/
|       +-- RecoveryFlow3D.tsx       # 4-agent isometric orbit visualization
|       +-- VoiceStudio.tsx          # Hinglish dialogue simulator
|       +-- ABTestResults.tsx        # Live z-test statistical dashboard
|       +-- WebhookPlayground.tsx    # Interactive webhook sandbox
|       +-- FailureInjectionPanel.tsx# Chaos injection controls
|       +-- ComplianceShield.tsx     # RBI compliance gate monitor
|       +-- LiveEventTicker.tsx      # Real-time SSE event stream
|
+-- docs/                        # Architecture & regulatory documentation
    +-- COMPLIANCE.md            # Full RBI / DPDP compliance matrix
    +-- DECISIONS.md             # Architecture decisions & scope disclosure
    +-- DEPLOYMENT.md            # Production deployment guide
    +-- DEMO_SCRIPT.md           # Guided demo walkthrough
```

---

## Getting Started

### Prerequisites

- Python 3.10+ (tested on 3.11)
- Node.js 18+ or Bun

### 1. Backend

```bash
cd backend

python -m venv venv
.\venv\Scripts\activate         # Windows
# source venv/bin/activate      # macOS / Linux

pip install -r requirements.txt

python -m uvicorn app.main:app --reload --port 8000
```

API docs --> `http://localhost:8000/docs`

### 2. Frontend

```bash
cd dashboard

npm install       # or: bun install
npm run dev       # or: bun run dev
```

Operator Console --> `http://localhost:5173`

### 3. Environment Variables

Copy `.env.example` to `backend/.env`:

```bash
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Optional -- voice recovery
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
BOLNA_API_KEY=...
```

The system runs fully without voice credentials -- telephony gracefully degrades to the browser TTS dialogue simulator.

---

## Test Suite

```bash
cd backend
.\venv\Scripts\python.exe -m pytest -v tests/
```

**78 tests, 0 failures, 0 external dependencies required.**

| Test File | Tests | What's Verified |
|:---|:---:|:---|
| `test_recovery_brain.py` | 29 | Webhook idempotency, ENRV math, circuit breaker, ledger integrity |
| `test_competitive_enhancements.py` | 12 | Cross-leak unification, Hinglish PTP, strategy tournament |
| `test_failure_injection.py` | 7 | Concurrency races, duplicate interception, curfew breach |
| `test_ab_testing.py` | 8 | Wilson CIs, two-proportion z-test, deterministic hashing |
| `test_voice_safety.py` | 6 | OTP/PIN extraction blocks, Devanagari evasion, whitelist |
| `test_webhook_idempotency.py` | 5 | 10-thread race, replay attacks, 409 edge rejection |
| `test_rails_clearing.py` | 5 | SHA-256 Merkle roots, dispute evidence, chain head anti-regression |
| `test_razorpay_sdk.py` | 4 | SDK v2.0.1 facade, HMAC validation, payment link lifecycle |

---

## Live Demo Walkthrough

> Full guided script --> [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md)

**1. Webhook Sandbox** -- Select a failure scenario (e.g., *B2B Overdue Invoice*), click **Dispatch**. In under 150ms: root cause diagnosed, RBI gate checked, a Razorpay Payment Link (`plink_`) generated.

**2. Race Condition Proof** -- Fire 10 identical duplicate webhooks simultaneously. Nine are rejected with `409 Conflict`. Exactly one thread executes recovery. Zero double-charges.

**3. RBI Compliance Gate** -- Toggle the simulated time to 9:30 PM. The system immediately refuses and logs the blocked intervention to the audit ledger.

**4. Bank Circuit Breaker** -- Toggle "Simulate HDFC Outage (<30% SR)". The Autonomy Envelope badge contracts from Rs.25,000 to Rs.5,000 in real time.

**5. Offline Ledger Proof** -- Stop the backend. Run:
```bash
python backend/verify_ledger.py
```
Recalculates the SHA-256 chain from raw SQLite -- **100% Chain Integrity Verified** -- zero network dependencies.

**6. Exception Stopping Rule** -- Cases under Rs.100 are automatically aborted by the Policy Engine. The compute cost exceeds the expected recovery. This is visible in the Audit Log pane.

---

## Production vs. Simulated

> Full integration matrix --> [`docs/DECISIONS.md`](docs/DECISIONS.md)

| Component | Status | Notes |
|:---|:---:|:---|
| Razorpay webhook HMAC validation | Real | Validates authentic signatures against official schema |
| Razorpay Payment Link creation | Real | Calls live API, returns authentic `plink_` IDs in test mode |
| Idempotency Guard (atomic locks) | Real | SQLite WAL + Python mutex, <1ms acquisition |
| SHA-256 Merkle audit ledger | Real | Persisted to disk, verifiable offline |
| Bank Circuit Breaker (EMA) | Real | Mathematical, feeds from injected telemetry |
| RBI Compliance Gate | Real | Zero external dependencies, fully hardcoded |
| Voice telephony (Twilio/Bolna) | Hybrid | Live when credentials present; browser TTS fallback otherwise |
| LLM diagnosis engine | Hybrid | Calls local Ollama/vLLM; regex classifier fallback (all 78 tests pass without GPU) |

---

## Academic Foundations

This system maps directly to established research -- not ad-hoc heuristics.

**Constrained RL for Collections** -- Abe, Melville, Pendus et al. (ACM SIGKDD 2010, IBM Research). Deployed at the New York State Department of Taxation and Finance. Our ENRV calculator directly implements their dual-model constrained allocation formulation.

**Causal Uplift & Sleeping Dogs** -- Gutierrez & Gerardy (2017); Verhelst et al. (arXiv:2312.07206). The churn penalty term `P_churn * LTV` protects customers who react negatively to contact -- the Sleeping Dogs quadrant in uplift literature.

**RAILS Verification Protocol** -- arXiv:2606.08790. Cryptographically-chained audit proofs and dispute defense packages for agentic commerce.

**India UPI Scale** -- arXiv:2601.02369. 350M users, 550+ banks, $2.19T annual volume -- establishing the mandate failure and rail degradation problem at scale.

---

## Regulatory Reference

- **RBI Fair Practices Code** (DNBS CC No. 95/03.05.002) -- Borrower contact restricted to 08:00-19:00 IST
- **RBI Recurring Mandate Circular** (DPSS.CO.PD.No.447/02.14.003/2021-22) -- 24h pre-debit notification; AFA for mandates >Rs.15,000
- **Income Tax Act s.43B(h)** -- 45-day mandatory settlement window for registered MSME suppliers
- **Digital Personal Data Protection Act 2023** -- Purpose limitation, Right to Erasure, cryptographic auditability

---

## Further Reading

| Document | Contents |
|:---|:---|
| [`docs/COMPLIANCE.md`](docs/COMPLIANCE.md) | Full RBI / DPDP compliance architecture with code citations |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Architecture decisions & honest scope disclosure |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Production deployment on Render, Vercel, Docker |
| [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) | Step-by-step 5-minute demo walkthrough |
| [`docs/SUBMISSION.md`](docs/SUBMISSION.md) | Track 03 submission details |

---

## License

MIT -- see [LICENSE](LICENSE)
