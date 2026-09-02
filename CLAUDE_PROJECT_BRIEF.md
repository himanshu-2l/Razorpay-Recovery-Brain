# 🧠 Grand Unified Architecture Brief: Razorpay AI Revenue Recovery Brain
> **Target Audience:** Senior AI / Fintech Architecture Reviewer (Claude)  
> **Context:** Razorpay AI Buildathon — Track 03: AI Revenue Recovery  
> **Current Status:** 24/24 Architectural Tests + 8/8 A/B Statistical Tests Passing (100%), Full-Stack Live Operational System  

---

## 1. Executive Summary & Problem Thesis

In digital payments and B2B receivables, **standard fixed-interval retries are dangerous and inefficient**:
- **Blind Retries**: Attempting a charge once/day for 3 days fails to distinguish between **Technical Declines (TD)** (transient bank/NPCI gateway outages) and **Business Declines (BD)** (insufficient funds, wrong PIN, daily limit exceeded).
- **Double Charges & Race Conditions**: In asynchronous webhook architectures, duplicate `payment.failed` webhooks can trigger duplicate retries or overlapping outreach, frustrating customers.
- **Regulatory Violations**: Outreach outside the RBI Fair Practices Code (permitted only **8:00 AM – 7:00 PM IST**) or soliciting credentials (UPI PIN / OTP) violates RBI Master Directions.
- **Data Privacy Violations**: Contacting users without explicit consent violates India's **Digital Personal Data Protection (DPDP) Act 2023**.
- **B2B Receivables Delays**: Indian SMEs experience average payment delays of **73 days** against 30-day terms.

### Our Solution:
A **Grand Unified Autonomous Revenue Recovery Brain** with:
1. **Sub-10ms Root-Cause Failure Triage** (distinguishing TD vs BD vs Mandate Bug vs Checkout Friction).
2. **At-Most-Once Idempotency Core** (Composite SHA-256 temporal keys with 7-day TTL rejecting duplicate webhook retries).
3. **Cryptographic Decision Receipts** (every recovery decision signed with SHA-256 hash chaining).
4. **Calendar-Aligned Payday & Month-End Smart Scheduler** (scheduling retries during corporate payroll windows: 1st–5th of month).
5. **Sub-800ms Latency Multi-Persona Hinglish Telephony Engine** (4 negotiation personas + structured intent extraction).
6. **Strict RBI Voice Credential Shield** (`VoiceSafetyFilter` rejecting any voice solicitation of UPI PIN / OTP / CVV, routing to secure links).
7. **DPDP Act 2023 Compliance & Consent Architecture** (explicit opt-in tracking, statutory retention schedules, automated erasure).
8. **Section 43B(h) MSME 45-Day Tax Urgency Engine** (consultative CFO tax-deductibility leverage).
9. **Asynchronous Late Authorization Interceptor** (halts outreach instantly upon late `payment.captured` confirmation).
10. **ARR-Aware Counterfactual ENRV with WACC Discounting** (penalizes against annual contract value, applies asymmetric P10/P90 risk bands).
11. **Statistically Rigorous A/B Testing Engine** (stratified randomization, two-proportion z-test, Wilson score 95% CI, proving lift with p < 0.05).
12. **Dynamic Autonomy Envelope with Asymmetric Hysteresis** (contracts dynamically on risk, expands after 5 stable cycles).

---

## 2. System Architecture & Component Topology

```
                  ┌─────────────────────────────────────────────────────────┐
                  │          Incoming Razorpay Webhook Event                │
                  │   (payment.failed, invoice.overdue, mandate.paused)     │
                  └────────────────────────────┬────────────────────────────┘
                                               │
                                               ▼
                  ┌─────────────────────────────────────────────────────────┐
                  │ 1. Idempotency & Rate Limit Defense                     │
                  │    - Composite SHA-256 Temporal Key Store (7-day TTL)   │
                  │    - 3-State Vendor Circuit Breaker (Closed/Open/Half)  │
                  └────────────────────────────┬────────────────────────────┘
                                               │
                                               ▼
                  ┌─────────────────────────────────────────────────────────┐
                  │ 2. Sub-10ms Root-Cause Failure Diagnosis Engine         │
                  │    - Technical Decline (TD) vs Business Decline (BD)    │
                  │    - Bank Gateway & NPCI Rail Outage Detection          │
                  └────────────────────────────┬────────────────────────────┘
                                               │
                                               ▼
                  ┌─────────────────────────────────────────────────────────┐
                  │ 3. Policy & Governance Gate (Hard Regulatory Shield)    │
                  │    - RBI Fair Practices Code (8 AM – 7 PM IST Window)   │
                  │    - Voice Safety Filter (RBI UPI PIN / OTP Ban)        │
                  │    - DPDP Act 2023 Consent & Retention Enforcement      │
                  │    - Economic Viability Floor (> ₹100 Threshold)        │
                  │    - Dynamic Autonomy Envelope (Contraction/Expansion)  │
                  └────────────────────────────┬────────────────────────────┘
                                               │
                                               ▼
                  ┌─────────────────────────────────────────────────────────┐
                  │ 4. Counterfactual ENRV & A/B Experimentation Engine     │
                  │    - ARR-Aware Churn Penalty & WACC Discounting (18%)   │
                  │    - Asymmetric P10/P90 Segment Bands (B2B vs B2C)      │
                  │    - Deterministic Stratified A/B Testing (z-test, p<0.05)│
                  │    - Payday & Month-End Smart Candidate Windows         │
                  └────────────────────────────┬────────────────────────────┘
                                               │
                        ┌──────────────────────┴──────────────────────┐
                        ▼                                             ▼
       ┌─────────────────────────────────┐           ┌─────────────────────────────────┐
       │ 5a. B2B Voice Telephony Studio  │           │ 5b. Razorpay API Execution      │
       │     - 4 Collection Personas     │           │     - Dynamic Payment Links     │
       │     - Turn Intent Extraction    │           │     - UPI Mandate Re-auth       │
       │     - Sub-800ms Latency Bar     │           │     - WhatsApp/Email Nudges     │
       │     - Consultative Link Delivery│           │     - Bank Gateway Fallbacks    │
       └────────────────┬────────────────┘           └────────────────┬────────────────┘
                        │                                             │
                        └──────────────────────┬──────────────────────┘
                                               │
                                               ▼
                  ┌─────────────────────────────────────────────────────────┐
                  │ 6. Cryptographic Audit Ledger & Decision Receipts       │
                  │    - SHA-256 Hash Chain from Genesis to Head            │
                  │    - 1-Click Human-in-the-Loop (HITL) Operator Gate     │
                  │    - Asynchronous Late Auth Reconciler Intercept        │
                  │    - Third-Party Independent Ledger Verification        │
                  └─────────────────────────────────────────────────────────┘
```

---

## 3. Key Mathematical & Algorithmic Modules

### A. ARR-Aware Counterfactual ENRV with WACC Discounting (`intervention_router.py`)
$$\text{ENRV} = \max\left(0, \left(\Delta P \times \text{Discounted Amount}\right) - \text{Cost}_{\text{intervention}} - \text{Penalty}_{\text{churn}}\right)$$
* **Time Value of Money (WACC)**: $\text{Discounted Amount} = \frac{\text{Invoice Amount}}{(1 + r)^{t/365}}$ with $r = 18\%$ (cost of working capital).
* **ARR-Aware Churn Penalty**: $\text{Penalty}_{\text{churn}} = P_{\text{churn}} \times \text{Customer ARR} \times \text{Relationship Score} \times \text{Tenure Discount}$. (If ARR missing, defaults conservatively to $3.0 \times \text{Invoice Amount}$).
* **Asymmetric Risk Bands**:
  * **B2B**: $P_{10} = 0.55 \times \text{ENRV}$ (downside protection against counterparty risk), $P_{90} = 1.30 \times \text{ENRV}$.
  * **B2C**: $P_{10} = 0.65 \times \text{ENRV}$, $P_{90} = 1.25 \times \text{ENRV}$.

### B. Statistical A/B Testing Engine (`ab_testing.py`)
* **Deterministic Stratified Randomization**: Hash `SHA-256(invoice_id + experiment_id + risk_quartile)` ensures reproducible assignment while balancing risk levels across arms.
* **Two-Proportion Z-Test**: Computes $z$-score and two-tailed $p$-value for $H_0: p_{\text{control}} = p_{\text{treatment}}$.
* **95% Wilson Score Interval**: Non-asymmetric confidence intervals accurate for small sample sizes.
* **Sample Size Formulation**: $n = \frac{16 \sigma^2}{\delta^2}$ ensuring $\ge 80\%$ statistical power at $\alpha = 0.05$.

### C. Smart Calendar-Aligned Retry Scheduling (`smart_scheduler.py`)
Generates 5 deterministic candidate retry windows:
1. `immediate`: $+1\text{h}$ (transient switch timeouts).
2. `plus_1_day_morning`: Next day 09:00 AM IST.
3. `payday_window`: 1st–5th of month 10:30 AM IST (aligned with corporate payroll credits).
4. `plus_3_days_midday`: $+3\text{d}$ 12:00 PM IST (secondary dunning fallback).
5. `month_end_window`: 28th–31st of month 11:00 AM IST (business monthly closing liquidity).

### D. Voice Credential Prohibition & Intent Waterfall (`voice_safety.py`, `voice_intent_classifier.py`)
* **Strict RBI Credential Ban**: Regular expressions reject scripts soliciting "PIN", "OTP", "CVV", or passwords; substitutes with safe WhatsApp payment link messaging.
* **Sub-800ms Latency Waterfall**: VAD ($65\text{ms}$) + STT ($120\text{ms}$) + Context ($4.2\text{ms}$) + LLM TTFT ($210\text{ms}$) + TTS ($130\text{ms}$) = **$571.2\text{ms} < 800\text{ms}$ budget**.

### E. Section 43B(h) MSME Tax Clock Engine (`tax_clock_engine.py`)
* Under the MSMED Act Section 15 and Income Tax Act Section 43B(h), dues unpaid after 45 days face income tax disallowance ($30\% \times \text{Penal Interest}$).
* Dynamically provides CFO consultative negotiation leverage without aggressive dunning.

---

## 4. Current Test Suite & Verification Status

The project includes **32 Automated Tests (100% Passing)**:

### 24 Architectural Verification Tests (`test_recovery_brain.py`):
- **Test 1**: Idempotency & Concurrency (10 simultaneous race requests $\rightarrow$ 1 winner, 9 duplicate rejects).
- **Test 2**: RBI Fair Practices 9:30 PM Night Gate (blocks outreach & reschedules to 10 AM IST).
- **Test 3**: Economic Floor Stopping Rule (aborts transactions $< ₹100$).
- **Test 4**: Diagnosis Engine Benchmark ($0.0\text{ms}$ latency root cause classification).
- **Test 5**: Razorpay Payment Link Generation & API schema validation.
- **Test 6**: Cryptographic SHA-256 Audit Ledger Chaining.
- **Test 7**: Counterfactual ENRV & Cryptographic Decision Receipts.
- **Test 8**: Human-In-The-Loop (HITL) High-Stakes Approval Gate ($> ₹50,000$).
- **Test 9**: Section 43B(h) MSME 45-Day Tax Clock.
- **Test 10**: Bank Rail Circuit Breaker (suppresses automated retries during bank switch outages).
- **Test 11**: Outcome Reconciler (intercepts late `payment.captured` and cancels pending outreach).
- **Test 12**: Multi-Stage Recovery Pipeline (4 stages with sub-10ms cumulative execution).
- **Test 13**: Dynamic Autonomy Envelope (Asymmetric Hysteresis contraction/expansion).
- **Test 14**: P10/P50/P90 Uncertainty Bounds & Promise-to-Pay State Machine.
- **Test 15**: Voice Intent Classification, Persona Strategies & Latency Waterfall.
- **Test 16**: Calendar-Aligned Payday & Month-End Smart Scheduler.
- **Test 17**: Spend Governor & Autonomous Action Circuit Breaker (caps daily budgets & emergency kill switches).
- **Test 18**: DPDP Act 2023 Compliance & Right to Erasure.
- **Test 19**: Third-Party Independent Audit Ledger Mathematical Verification.
- **Test 20**: Staleness Monitor & Silent-Failure Observability.
- **Test 21**: 4-Funnel Cross-Leak Unification, Voice Gateway & WACC Discounting.
- **Test 22**: Voice Safety Filter, RBI Credential Prohibition & Pre-Call Gate.
- **Test 23**: DPDP Act 2023 Consent Manager, Retention Schedule & Access Rights.
- **Test 24**: Webhook Idempotency (7-day TTL), Rate Limit Defense & Circuit Breaker.

### 8 Statistical A/B Testing Verification Tests (`test_ab_testing.py`):
- **Test A1**: Balanced Assignment (100 invoices, 50/50 split).
- **Test A2**: Deterministic Assignment (same invoice $\rightarrow$ same variant always).
- **Test A3**: Stratified Risk-Quartile Balance.
- **Test A4**: Two-Proportion Z-Test Significant ($28\%$ vs $68\%$, $p < 0.05$).
- **Test A5**: Two-Proportion Z-Test Not Significant ($30\%$ vs $35\%$, $p \ge 0.05$).
- **Test A6**: Wilson Score CI Bounds ($[0,1]$ containment).
- **Test A7**: Minimum Sample Size Formula Validation ($n = 16\sigma^2/\delta^2$).
- **Test A8**: Full Experiment Lifecycle (create $\rightarrow$ assign $\rightarrow$ record $\rightarrow$ calculate lift $\rightarrow$ $p < 0.05$).

---

## 5. Technology Stack

* **Backend**: Python 3.11, FastAPI, Pydantic v2, SQLite WAL (`sqlite3`), Uvicorn, Optional Local Ollama.
* **Frontend**: React 18, TypeScript, Vite 8, Tailwind CSS, Lucide React, HTML5 SpeechSynthesis API, Real-Time Canvas Audio Visualizer, Razorpay Dark Glassmorphic Theme.
* **Build / Runtime**: Bun / Vite (`bun run build` $\approx 470\text{ms}$), Python Virtual Environment.


---

## 6. Questions & Review Points for Claude

1. **Failure Modes & Edge Cases**: Are there any overlooked edge cases in our late payment authorization interceptor or Section 43B(h) calculation?
2. **Economic Viability**: Does the Counterfactual ENRV mathematical formulation with churn penalties accurately reflect production-grade dunning?
3. **Demo & Presentation Polish**: What specific nuances in our UI or pitch narrative would most impress senior fintech/payments evaluators?
