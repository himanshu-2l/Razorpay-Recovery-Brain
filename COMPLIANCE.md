# 📜 Regulatory Compliance Architecture & Legal Safeguards
### Revenue Recovery Brain — Razorpay AI Buildathon 2026 · Track 03

---

## 🏛️ Regulatory Overview

The **Revenue Recovery Brain** operates at the intersection of enterprise collections, conversational AI, and Indian payments infrastructure. To ensure that our automated agents can be safely deployed by regulated entities and enterprise merchants, the platform enforces hard, code-level compliance guardrails grounded in Indian financial regulations.

---

## 1. Strict Voice Credential Prohibition (RBI Master Direction on Digital Payment Security Controls)

> [!IMPORTANT]
> **Zero Voice Credential Collection**: In strict compliance with RBI Master Directions on Digital Payment Security Controls, our conversational voice agent is **strictly consultative**. It is architecturally prohibited from soliciting, recording, or processing payment credentials over telephony channels.

### Structural Guardrails:
1. **No OTP / PIN Collection**:
   - The agent never asks for One-Time Passwords (OTP), UPI MPINs, card CVVs, or internet banking credentials.
   - The `VoiceSafetyFilter` (`backend/app/services/voice_safety.py`) scans every conversational turn with regex word boundaries for forbidden terms (`"pin"`, `"otp"`, `"password"`, `"cvv"`, `"upi pin"`, `"enter code"`, `"bataiye"`).
   - Any script containing a forbidden credential request is immediately intercepted, blocked from execution, and logged to the immutable audit ledger under `action_type="voice_blocked_compliance"`.
2. **Customer Self-Service via Razorpay Payment Links**:
   - Payment settlement takes place **exclusively via customer self-service**.
   - The voice agent negotiates a Promise-to-Pay (PTP) date or milestone split, then dispatches an official, cryptographically signed Razorpay Payment Link (`https://rzp.io/i/...`) to the debtor's verified mobile number via SMS and WhatsApp.
3. **Mandatory Closing Compliance Statement**:
   - Every telephony dialogue template and dynamic TTS synthesis script terminates with the mandatory consumer safety disclaimer:
     > *"Aapko ek secure payment link bheja gaya hai. Kripya usi se pay karein. Koi PIN ya OTP phone par share nahi karein."*

---

## 2. Responsible Collections Policy (Inspired by RBI Fair Practices Code Principles)

While the statutory RBI Fair Practices Code (FPC) formally binds regulated lenders (Banks and NBFCs) and their recovery agents, the Revenue Recovery Brain adopts these principles as the **gold standard for responsible enterprise B2B dunning**:

### Operational Parameters:
| Guardrail | Statutory Rule | Implementation in Code |
|---|---|---|
| **Contact Window** | Calls permitted only between **8:00 AM and 7:00 PM IST** | Enforced by `ComplianceEngine` and `VoiceSafetyFilter.pre_call_check()`. Any call triggered outside this window is hard-blocked and automatically rescheduled to 9:00 AM next business morning. |
| **Outreach Frequency Caps** | Maximum **2 voice calls** and **3 digital nudges** per debtor per 7-day rolling window | Enforced by `SpendGovernor` and `ComplianceEngine`. Attempts exceeding the cap are suppressed with `FREQUENCY_CAP_EXCEEDED`. |
| **Mandatory Cool-Off** | Mandatory **48-hour cool-off period** following an explicit customer dispute or hardship notice | When intent classifier detects `TurnIntent.ESCALATE_TO_HUMAN` or `TurnIntent.HARDSHIP_DEFERRAL`, further automated outreach is paused for 48 hours and routed to a human billing manager. |
| **Economic Floor** | Small-value recoveries (< ₹100) are unprofitable and harass customers | Amounts below ₹100 are automatically aborted (`blocked_economic_floor`) to preserve merchant margins and customer goodwill. |

---

## 3. Digital Personal Data Protection (DPDP) Act 2023 Compliance

As an enterprise AI system processing debtor telephone numbers, transaction values, and call transcripts, the platform adheres to India's **DPDP Act 2023**:

### Core Privacy Principles:
1. **Purpose Limitation**: Debtor PII is processed strictly for the stated purpose of invoice resolution, debt counseling, and payment reconciliation.
2. **Automated PII Redaction**:
   - Phone numbers are masked in all logs, REST responses, and dashboard views: `+91 98765*****`.
   - Email addresses are masked: `r***@razorpay.com`.
   - Bank accounts / card numbers are masked: `**** 5512`.
3. **Statutory Retention Schedule**:
   - **Voice Call Audio Recordings**: **30 Days TTL** (purged automatically; cryptographic SHA-256 integrity hash preserved for non-repudiation).
   - **Conversational Transcripts & PTP Notes**: **90 Days TTL**.
   - **Financial Audit Ledger Entries**: Retained permanently in tamper-free SHA-256 sequence for statutory tax and financial audits.
4. **Data Principal Right to Erasure (Section 12 DPDP Act 2023)**:
   - Exposes a statutory erasure endpoint (`POST /api/governance/dpdp/erase-customer`).
   - Purges all active personal identifiers while leaving a zero-knowledge cryptographic tombstone hash (`SHA-256(customer_id:ts:ERASED)`) in the audit ledger, guaranteeing non-repudiation without storing PII.

---

## 4. Income Tax Act Section 43B(h) MSME Clock

For B2B commercial receivables, the Revenue Recovery Brain transforms dunning calls into consultative working capital advisory:
1. **Statutory 45-Day Payment Window**: Under Section 15 of the MSMED Act 2006 and Section 43B(h) of the Income Tax Act (effective AY 2024-25), buyers must pay MSME suppliers within 45 days (with written contract) or 15 days (without contract).
2. **Tax Deduction Disallowance**: If unpaid within 45 days, the buyer is legally disallowed from deducting the invoice expense in that financial year, creating a direct tax penalty.
3. **Consultative Negotiation**: Rather than hostile dunning, our Hinglish agent advises the buyer's CFO of the impending 43B(h) tax deadline, turning statutory compliance into mutual settlement leverage.

---

## 5. Third-Party Independent Ledger Verification

All compliance blocks, pre-call checks, and settlement receipts are appended to an immutable, append-only **SHA-256 Cryptographic Hash Chain**:
```bash
# Verify the mathematical integrity of the compliance audit trail independently:
python backend/verify_ledger.py
```
Every block seals:
- `event_type` (`VOICE_BLOCKED_COMPLIANCE`, `PAYMENT_LINK_CREATED`, `COMPLIANCE_BLOCKED_OUT_OF_HOURS`)
- `case_id` & masked PII
- `prev_hash -> content_hash` cryptographic link
