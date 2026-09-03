# 📊 Razorpay AI Buildathon 2026 — Pitch Slide Outline
**Project**: Revenue Recovery Brain  
**Track**: Track 03 — AI Revenue Recovery  
**Author**: Himanshu  

---

## Slide 1: The Thesis — Revenue Leakage is a Unified Diagnosis Problem
- **Headline**: Revenue doesn't vanish in one step—it degrades across 4 fragmented funnels.
- **The Core Problem**:
  - Payment Failures: ₹2,400 Cr annual GMV lost to blind retries during bank downtime.
  - Cart Abandonment: 70%+ drop-offs treated with generic discounting.
  - Subscription Churn: RBI >₹15,000 mandate re-auth bugs causing involuntary cancellation.
  - B2B Receivables: 73-day average SME DSO (Days Sales Outstanding) due to ineffective email reminders.
- **The Insight**: Point solutions treat symptoms. We built the single intelligence layer above all four funnels.

---

## Slide 2: Architectural Superiority — Sub-500ms Deterministic Core
- **Unified Pipeline**:
  - `Signal Ingestion` → Ingests raw webhooks & transaction logs.
  - `Root-Cause Classifier` → Evaluates Technical Degradation (TD) vs. Business Decline (BD) in <150ms.
  - `Intervention Router` → Selects from 7 bounded actions (Smart Retries, 1-Click WhatsApp Nudges, Hinglish Voice Calls, Backup Payment Links).
  - `Compliance Gate` → Hardware/code-enforced invariants before execution.
- **Traceability**:
  - Every decision logs an immutable reasoning chain and records **Alternatives Explicitly Rejected**.

---

## Slide 3: The Secret Weapon — Hinglish Conversational Debt Recovery
- **The B2B Reality**: Indian MSME owners don't respond to English legal dunning notices.
- **Conversational AI Agent**:
  - Natural bilingual Hinglish dialogue (*"Namaste Rajesh ji, cash flow issue samajh sakte hain..."*).
  - Real-time active negotiation of realistic payment milestones.
  - Automated **Promise-to-Pay (PTP)** logging with timestamped audit signatures.
- **Web Speech & Telephony**: Multi-voice browser synthesis + Vapi/Twilio integration readiness.

---

## Slide 4: Compliance as a Differentiator — RBI Fair Practices Hard Guards
- **The Risk**: Unchecked AI agents harass customers, charge duplicate cards, and violate regulatory contact caps.
- **Code-Enforced Guardrails**:
  - ⏰ **Strict 8 AM – 7 PM IST Contact Window**: Actions outside hours are blocked and rescheduled to 9 AM next business day.
  - 🔄 **Weekly Frequency Caps**: Max 2 voice calls / 3 digital nudges per week.
  - 🛡️ **Mandate Compliance**: Strict compliance with RBI 24-hour pre-debit e-mandate notifications.
  - 🔒 **At-Most-Once Idempotency**: Atomic locks prevent duplicate customer charging.

---

## Slide 5: Business Impact & Execution Roadmap
- **Benchmark Results (50+ Real-World Scenarios)**:
  - Total Revenue at Risk: ₹8,74,500
  - Net Revenue Rescued: ₹5,98,200 (**68.4% Recovery Rate**)
  - Average Diagnostic Latency: **128ms** (Sub-500ms SLA)
  - Compliance Violations: **0 (100% RBI Fair Practices Adherence)**
- **Razorpay Native Integration**:
  - Designed as an extension module for **Razorpay Agent Studio** and **Razorpay Optimizer**.
  - Drop-in webhook ingestion with zero schema migration needed.
