# Architecture Decisions & Scope Disclosure (DECISIONS.md)

**Project**: Razorpay Revenue Recovery Brain  
**Track**: 03 (AI Revenue Recovery) — Razorpay AI Buildathon 2026  
**Engineering Manifesto**: Radical Intellectual Honesty & Multi-Funnel Unification  

---

## 1. Executive Summary & Scope Disclosure

In high-stakes fintech engineering, credibility begins with transparent boundaries. Following the best practices of production systems and benchmarked against peer submissions in Track 03, this document explicitly discloses what in our repository is **100% connected to live Razorpay Test-Mode APIs**, what is **modeled/simulated for reproducible evaluation**, and **why each architectural trade-off was made**.

### The Core Premise: Table Stakes vs. Our True Moat
During early research, many teams (including peers like `SVIGHNESH/recoup`, `SanathDambre08/RecoverX`, `voice-recovery-agent`, and `revcatch-agent`) independently converged on the pattern of:
> *Deterministic Core + Bounded LLM + Audit Trail + RBI Curfew Guardrails + Vernacular Voice.*

We recognize that vernacular/Hinglish voice outreach is now **table stakes**, not an uncontested differentiator.

### Where Peer Solutions Fall Short
Every prominent competitor examined in Track 03 built a **siloed, single-funnel point solution**:
- `Shankar-v27/urudhi`: B2B trade debt negotiation only.
- `SVIGHNESH/recoup`: UPI recurring mandate dunning only.
- `HappyGarg8o/ai-revenue-recovery`: Payment failure retries only.
- `arrya5/revenue-recovery-agent`: Retry schedule timing only.

**Real Indian commerce does not leak in silos.** A corporate buyer (e.g. Rohit Mehta of *Mehta Textiles Pvt. Ltd.*) simultaneously experiences:
1. An expired corporate debit card that fails a recurring cloud SaaS mandate.
2. A checkout cart abandonment 2 hours later caused by that same card.
3. An overdue B2B trade supplier invoice approaching the statutory Section 43B(h) MSME 45-day tax penalty cliff.

Siloed bots from three disjoint systems will spam Rohit with 3 uncoordinated calls/SMS within 4 hours, causing contact fatigue, brand erosion, and wasted merchant fees.

**Our Uncontested Differentiator**:
The **Unified Cross-Leak Revenue Operating System**. A single customer risk profile store that resolves identity across all 4 funnels, detects shared root causes, deduplicates communication to prevent spam, and coordinates multi-debt settlement in a single touch.

---

## 2. Real vs. Synthetic Integration Matrix

| Subsystem | Real Implementation Details | Synthetic / Modeled Details | Rationale |
| :--- | :--- | :--- | :--- |
| **Razorpay Money Movement** | Real `razorpay-python` client initialization, real Order creation (`order_...`), real Payment Link generation (`purl_...`), and real Invoices. | Mock fallback active if API keys (`RZP_KEY_ID`, `RZP_KEY_SECRET`) are unset in environment. | Allows judges and automated CI pipelines to evaluate the entire pipeline offline without requiring valid merchant test credentials. |
| **Webhook Ingestion** | Real FastAPI webhook receiver (`/api/webhook/razorpay`), real HMAC-SHA256 signature verification against `X-Razorpay-Signature`. | Deterministic synthetic webhook generator in the sandbox to fire sample failure events (`payment.failed`, `order.paid`). | Enables reproducible end-to-end testing of webhook signature validation without manual Razorpay dashboard triggers. |
| **Cryptographic Audit Ledger** | Real SHA-256 Merkle chain, real SQLite database persistence (`audit_ledger.db`), real tamper-verification CLI (`verify_ledger.py`). | None. The ledger is 100% authentic and persists across process restarts. | In financial recovery, auditability is a non-negotiable legal and operational invariant. |
| **Telephony & Hinglish Agent** | Real Twilio REST API integration (`twilio.rest.Client`) for voice calls and WhatsApp business templates (`whatsapp:+91...`). | Deterministic simulated telephony audio and text transcripts for automated test suites and offline demos. | Running 100+ automated test cases on real Twilio telephony numbers would burn credits and be rate-limited by cellular carriers. |
| **Banking Gateway Circuit Breakers** | Real circuit-breaker state machine (Closed, Open, Half-Open) with automatic recovery timeouts and failure threshold tracking. | Seeded failure rate bursts on simulated HDFC/ICICI/Axis gateways to demonstrate automatic rerouting. | You cannot force HDFC Bank’s production server to experience a 503 outage on command during a 5-minute hackathon pitch. |
| **Section 43B(h) Tax Clock** | Real Indian Income Tax Act statutory logic (45-day MSME deadline, fiscal year-end deduction disallowance risk calculation). | Simulated invoice due dates spanning 0 to 45 days. | Accurately tests the engine's urgency escalation on Day 40–44 invoices. |

---

## 3. Best-in-Class Borrowed Innovations (Competitor Benchmarking)

To ensure our system represents the absolute state-of-the-art across all technical axes, we explicitly adopted and upgraded key breakthroughs pioneered by our strongest peers:

### A. Promise $\rightarrow$ Commitment $\rightarrow$ Payment Lifecycle (from `Shankar-v27/urudhi`)
- **Old Approach**: Generic "promise-to-pay" tracker.
- **Upgraded Architecture**: 
  1. **Promise**: Unverified intent expressed by debtor during conversational outreach.
  2. **Commitment**: System-accepted, policy-bounded agreement that automatically creates a real Razorpay Payment Link for the committed installment amount.
  3. **Payment**: Strict status transition to `FULFILLED` occurs **only** when an authentic Razorpay webhook confirms fund capture via HMAC SHA-256 signature.

### B. Double-Check Stopping Rule / Gap-Payment Defense (from `HappyGarg8o`)
- **The Problem**: A customer pays their overdue invoice 3 minutes after the AI decides to call them, but before the background worker fires the call.
- **The Defense**: Our stopping rules execute **twice**:
  - `Check 1 (T₀)`: At initial diagnosis and queue insertion.
  - `Check 2 (T₁)`: A mandatory pre-flight barrier immediately before physical Twilio/WhatsApp execution. If a payment webhook arrived in the interim gap, the action is aborted instantly with a `GAP_PAYMENT_INTERCEPTED` ledger entry.

### C. Deterministic Hinglish Time Parser (from `SVIGHNESH/recoup`)
- **The Problem**: LLMs frequently hallucinate or miscalculate relative vernacular dates (e.g. interpreting "somvar" as next month or "parso" as yesterday).
- **The Solution**: A deterministic rule-based parser (`HinglishTimeParser`) translating Indian phrases (`parso`, `somvar ko`, `salary ke baad`, `kal shaam`) into exact ISO-8601 IST timestamps, with automatic clamping to RBI allowed communication windows (07:00 – 19:00 IST).

### D. Causal Uplift Modeling & Methodology Validation (CATE / ITE Framework)
- **The Circularity Problem**: Testing an AI against simulated outcomes derived from its own predicted probabilities is statistically circular. A production deployment requires genuine randomized holdback groups.
- **The Uplift Modeling Framing**:
  - We model the **Conditional Average Treatment Effect (CATE / ITE)**: $\Delta P = P(\text{recovery} \mid \text{action}) - P(\text{recovery} \mid \text{do-nothing})$.
  - Grounded in causal uplift literature:
    - *Gutiérrez & Gérardy (2017)*: "Causal Inference and Uplift Modelling: A Review of the Literature" (Rubin causal model comparison).
    - *Verhelst et al. (arXiv:2312.07206)*: "A churn prediction dataset from the telecom sector: a new benchmark for uplift modeling" (Orange Belgium churn benchmark).
    - *arXiv:2111.10106*: "A Large Scale Benchmark for Individual Treatment Effect Prediction and Uplift Modeling" (near-random assignment for valid causal estimates).
    - *arXiv:2211.07264*: "Partial counterfactual identification and uplift modeling: theoretical results and real-world assessment".
  - Customers partition into four behavioral quadrants: *Persuadables*, *Sure Things*, *Lost Causes*, and *Sleeping Dogs*.
  - Our explicit `churn_penalty_inr` quantitatively penalizes touching the *Sleeping Dogs* quadrant, preventing negative-ROI brand damage.
- **Constrained Optimization & Debt Collection Literature**:
  - Our intervention routing follows the foundational structure of *Abe et al. (ACM SIGKDD 2010)*: "Optimizing Debt Collections Using Constrained Reinforcement Learning", which predicts repayment probabilities per debtor-action pair and optimizes assignment via linear programming (deployed at New York State Dept of Taxation & Finance).
  - Extended by risk-tiered deep RL recommendation models (*ScienceDirect, 2024*) and multi-criteria optimization for collections (*ScienceDirect, 2026*).
  - B2B invoice payment prediction grounded in *arXiv:1912.10828* ("Optimize Cash Collection: Use Machine Learning to Predict Invoice Payment").
- **Empirical India / UPI Payment Rails Grounding**:
  - Scale figures grounded in *arXiv:2601.02369* ("Fair Distribution of Digital Payments"): 350M+ users, 550+ banks, 117B annual transactions.
  - Subscriptions: 20 million monthly UPI AutoPay mandate revocations due to low balance (*Business Standard*, Sept 2025).
  - Infrastructure: Real recurring switch outages documented by *Observer Research Foundation* ("UPI at Scale: Outages and the Push for Resilient Systems"), grounding Technical Decline (TD) vs. Business Decline (BD) isolation.
- **Methodology Validation Setup**:
  - **Near-Random Assignment**: Uses deterministic SHA-256 hash assignment ensuring balanced arms (analogous to propensity score AUC $\approx 0.509$).
  - **Stratified Balance**: Partitions cases across risk-score quartiles to eliminate covariate imbalance.
  - **Evaluation Rigor**: Two-proportion $z$-test with 95% Wilson confidence intervals, power analysis for minimum sample sizes, and explicit labeling that simulated recovery rates are assumed from collections literature rather than live-measured lift.

---

## 4. Regulatory & Legal Invariants (Non-Negotiable Guardrails)

1. **RBI Curfew Hours**: Strictly zero voice outreach permitted between 19:00 and 07:00 IST. Candidate cases are safely queued for morning execution.
2. **Credential Prohibition**: The voice agent and WhatsApp templates are hardcoded to **NEVER** request, accept, or process CVV numbers, card PINs, or UPI OTPs. All fund movement occurs through authenticated Razorpay hosted links (`purl_...`).
3. **DPDP Act 2023 (Right to Erasure)**: Fully functional `/api/dpdp/erase` endpoint that cryptographically anonymizes customer PII in the database while preserving the mathematical Merkle hash integrity in the audit ledger.
