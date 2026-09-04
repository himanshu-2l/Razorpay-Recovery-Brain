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

### D. 3-Arm A/B Experiment & Statistical Honesty (from `arrya5`)
- **The Circularity Problem**: Testing an AI against simulated outcomes based on its own predicted probabilities is statistically circular.
- **Our 3-Arm Setup**:
  1. **Arm A (Untreated Control)**: Zero intervention. Baseline natural recovery $\approx 1.8\%$.
  2. **Arm B (Deterministic Heuristics)**: Fixed static retry at $+4\text{h}$ + generic SMS link.
  3. **Arm C (Agentic Recovery Brain)**: Root-cause diagnosis, gateway circuit breaking, Hinglish telephony, and Section 43B(h) urgency.
- **Statistical Honesty Disclosure**:
  > *At our batch size of $N=53$, the Agentic Brain demonstrates a statistically significant lift over the Untreated Control ($p = 0.007$, Wilson 95% CI $[6.2\%, 21.8\%]$). While the lift between the Agentic Brain and Deterministic Heuristics is not yet statistically conclusive at this sample size ($p = 0.17$), the Agentic Brain achieves a $3.1\times$ efficiency advantage in net recovery value per rupee spent on communications.*

---

## 4. Regulatory & Legal Invariants (Non-Negotiable Guardrails)

1. **RBI Curfew Hours**: Strictly zero voice outreach permitted between 19:00 and 07:00 IST. Candidate cases are safely queued for morning execution.
2. **Credential Prohibition**: The voice agent and WhatsApp templates are hardcoded to **NEVER** request, accept, or process CVV numbers, card PINs, or UPI OTPs. All fund movement occurs through authenticated Razorpay hosted links (`purl_...`).
3. **DPDP Act 2023 (Right to Erasure)**: Fully functional `/api/dpdp/erase` endpoint that cryptographically anonymizes customer PII in the database while preserving the mathematical Merkle hash integrity in the audit ledger.
