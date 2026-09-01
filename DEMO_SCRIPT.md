# 🎬 3-Minute Video Demo Script: Razorpay Revenue Recovery Brain
**Track 03 — AI Revenue Recovery | Razorpay AI Buildathon 2026**  
**Presenter**: Himanshu  
**Total Target Time**: 3:00 (180 Seconds)

---

## Part 1: The Problem & Taste Hook (0:00 – 0:35)
**Screen**: *Obsidian Agent Studio Dashboard (`http://localhost:5173`) displaying the Hero Header & 50+ Processed Cases.*

> **Spoken Dialogue**:  
> "Hi Razorpay team, I'm Himanshu. In Indian digital commerce, revenue doesn't vanish all at once—it leaks across four distinct funnels: Payment Gateway Failures, Cart Abandonment, Subscription Mandate Churn, and B2B Receivables.
> 
> The standard industry approach treats these as separate dunning silos with blind, repetitive emails. But retrying an RBI e-mandate without waiting 24 hours violates compliance, and treating a bank outage the same as an insufficient balance destroys customer trust.
> 
> We built the **Razorpay Revenue Recovery Brain**—a unified, deterministic diagnosis engine and intervention router that identifies the exact root cause in under 500ms and executes compliant, high-conversion recovery across all four leak channels."

---

## Part 2: Real-Time Webhook Diagnosis Sandbox (0:35 – 1:15)
**Screen**: *Switch to the **Webhook Sandbox** tab. Select `Payment Failed (NPCI Bank Timeout)` and click **Dispatch Webhook**.*

> **Spoken Dialogue**:  
> "Let's test our live webhook ingestion engine. When a raw `payment.failed` event hits our endpoint, our deterministic engine classifies it in 124ms into **Technical Degradation (TD)** versus **Business Decline (BD)**.
> 
> Here, the NPCI switch timed out. Instead of spamming the user with a 'Payment Failed' warning, the brain suppresses user-facing alerts and schedules an automated mandate retry at the optimal network window.
> 
> Notice the **Alternatives Rejected** section: the AI explicitly rejected a voice call and checkout link because the customer was not at fault."

---

## Part 3: Live Hinglish Voice Agent for B2B Receivables (1:15 – 2:05)
**Screen**: *Switch to **Hinglish Voice Agent** tab. Click **Simulate Real-Time Voice Call** (Audio synthesis plays aloud while equalizer animates).*

> **Spoken Dialogue**:  
> "Now let's look at our highest-impact capability: **B2B Receivables Recovery**. In India, SME payment delays average 73 days against 30-day terms. Email reminders get ignored.
> 
> Watch our conversational AI agent initiate a bounded, empathetic voice call in natural Hinglish:
> 
> *(Audio plays: 'Namaste! Kya main Rajesh Sharma ji se baat kar raha hoon?... Aapka ₹85,000 ka invoice 67 din se pending hai...')*
> 
> The agent listens to the customer's cash flow constraint, negotiates a realistic date, logs a verified **Promise-to-Pay (PTP)** for September 8th, and generates an audit-signed ledger entry with zero human intervention."

---

## Part 4: RBI Fair Practices Compliance Shield (2:05 – 2:35)
**Screen**: *Switch to **RBI Compliance** tab. Click **Simulate 9 PM Compliance Block**.*

> **Spoken Dialogue**:  
> "Most hackathon agents can hallucinate or harass users. In our system, **Compliance is a first-class citizen**.
> 
> We enforce hard, unbypassable guardrails grounded in the RBI Fair Practices Code:
> 1. Strict **8 AM to 7 PM IST** contact windows.
> 2. Max **2 voice contacts per week** per debtor.
> 3. Mandatory **48-hour cool-off** after a dispute or decline.
> 
> When an intervention is triggered at 9 PM, the system hard-blocks the action, cites Rule 4.2(a), and automatically reschedules the call to 9:00 AM the next business morning."

---

## Part 5: Financial Metrics & Conclusion (2:35 – 3:00)
**Screen**: *Switch to **Command Center** overview, hovering over the Net Recovered Value metric (₹5.9M+ recovered at ~68% recovery rate).*

> **Spoken Dialogue**:  
> "Across our 50-case benchmark, the Revenue Recovery Brain recovered **₹5.9 Lakhs out of ₹8.7 Lakhs at risk**, achieving a **68.4% Net Recovery Rate** while maintaining a 100% RBI compliance score.
> 
> One unified architecture, sub-500ms latency, Hinglish voice recovery, and strict financial compliance. Thank you!"

---

### Recording Checklist
- [x] Backend running on `http://localhost:8000`
- [x] Dashboard running on `http://localhost:5173`
- [x] System volume unmuted for SpeechSynthesis voice playback
- [x] Browser window set to 1080p full screen
