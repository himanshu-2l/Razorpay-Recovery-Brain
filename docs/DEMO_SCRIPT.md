# 🎬 5-Minute Video Demo Script
### Revenue Recovery Brain — Razorpay AI Buildathon 2026 · Track 03
**Presenter:** Himanshu · **Target:** 4:50 with 10s buffer

---

## Pre-Recording Setup Checklist

- [ ] Backend running: `http://localhost:8000`
- [ ] Dashboard open: `http://localhost:5173`
- [ ] Razorpay Test Dashboard open in separate tab: `https://dashboard.razorpay.com/app/payment-links`
- [ ] OBS or screen recorder ready, capture entire screen, 1080p
- [ ] System audio on (for browser TTS voice)
- [ ] Phone charged and nearby (for Twilio call scene)
- [ ] Split-screen layout ready: Dashboard left 60%, Razorpay dashboard right 40%

---

## [0:00 – 0:25] The Problem — No Slides, Just Real Numbers

**Screen:** Dashboard → Command Center tab. Batch already run. Show the live metric cards and Peer-Reviewed Foundation chip.

> **Spoken (calm, no hype):**
> "India processes over 117 billion UPI transactions annually across 350 million users. But behind that volume, over 20 million UPI AutoPay subscription mandates are revoked every single month due to low customer balances.
>
> When payments drop, traditional dunning bots blindly spam SMS and WhatsApp, annoying customers and burning money. That's wrong because a banking switch outage and an insufficient balance are completely different problems requiring completely different responses.
>
> The same merchant also loses revenue to checkout cart drops and overdue B2B trade invoices. Revenue Recovery Brain unifies all four leak funnels under one stateful, academically grounded decision engine."

---

## [0:25 – 1:10] Real Razorpay Integration — Split Screen, Unfakeable

**Screen:** Split screen — Dashboard left, Razorpay test dashboard right (already open, refresh it once).

**Action:** Go to Dashboard → Webhook Sandbox tab. Select "B2B Invoice Overdue · 38 Days". Click **Dispatch Webhook**.

> **Spoken:**
> "When a B2B invoice overdue event hits our webhook endpoint, the engine diagnoses the root cause and creates a recovery payment link. Watch both screens."

**[Watch the response appear — ~150ms]**

> "On the left: root cause `RECV_CASH_FLOW`, intervention `voice_call` + payment link, compliance `ALLOWED`, latency 143ms. On the right — refresh the Razorpay dashboard."

**[Refresh Razorpay test dashboard — the plink_ ID appears]**

> "That payment link just appeared in a real Razorpay test account. Not simulated, not hardcoded. It's cancellable, it sends real SMS/email notifications, and if the buyer pays it, that hits real Razorpay settlement. The link ID on screen matches what you'd see if you logged into this test account."

---

## [1:10 – 2:30] The Climax — A Real Phone Rings

**Screen:** Dashboard → Hinglish Voice Agent tab. Show the form pre-filled with:
- Customer: Rohit Mehta
- Amount: ₹85,000
- Invoice: INV-2026-08-MEHTA-001
- Your phone number in the "Test Call" field

**[Click "Trigger Real Call"]**

> **Spoken (while waiting ~10s for Twilio to connect):**
> "B2B invoice recovery in India fails because email gets ignored. Our agent calls in Hinglish — the actual language of Indian business-to-business relationships."

**[Phone rings, on screen and audible]**

**[Answer the call on camera / pick up on desk — let the audio play through]**

*Call plays: "Namaskar! Kya main Rohit Mehta ji se baat kar sakta hoon? Main Recovery Brain se bol raha hoon. Aapka ₹85,000 ka invoice 38 din se pending hai — kya aaj 10 minute baat ho sakti hai?"*

> **Spoken (after call connects, voice-over or after hang up):**
> "That's Twilio telephony, Hinglish script, calling a real Indian mobile number. The same script is running in the browser's voice synthesizer for zero-setup local demos. The voice call route is what you'd deploy for actual merchant collections."

---

## [2:30 – 3:15] Compliance Gate — Show It Refusing to Act

**Screen:** Dashboard → RBI Compliance tab.

**Action 1:** Set time to **9:00 PM IST**. Click **Trigger Intervention**.

> **Spoken:**
> "Most demo agents show the happy path. We show the compliance gate blocking the agent."

**[Show: RED card — BLOCKED, rule cited, rescheduled to 9:00 AM]**

> "9 PM — blocked. Rescheduled to next morning. The rule cited is our responsible collections policy: 8 AM to 7 PM contact window, maximum 3 attempts per week, 48-hour cool-off after any dispute."

**Action 2:** Set time to **2:00 PM IST**. Click **Trigger Intervention**.

**[Show: GREEN card — ALLOWED]**

> "2 PM — allowed. Same agent, same customer, different time. The compliance layer visibly refusing to act is more impressive than the agent acting. It means this can run autonomously without a human babysitting every decision."

---

## [3:15 – 3:55] Cross-Leak Unified Intelligence

**Screen:** Open new browser tab → `http://localhost:8000/api/demo/unified-recovery-scenario`

> **Spoken:**
> "Here's the claim that separates this from every payment-failure-only dunning tool: the same customer can simultaneously have a payment failure, a cart drop, a subscription halt, and an overdue invoice. The unified brain sees all four."

**[Show the JSON response — point to key fields]**

> "Rohit Mehta. Total exposure ₹2,45,304 across four leak types. The engine prioritized the B2B invoice first — it's approaching the Indian MSME Section 43B(h) tax deadline, which gives the buyer's CFO a direct tax incentive to pay within 45 days. WhatsApp outreach was suppressed for two of the four cases — the engine detected it would have fired twice for the same customer today and suppressed one, to prevent contact fatigue. That suppression decision is logged in the cryptographic audit trail."

---

## [3:55 – 4:25] Honest Batch Metrics

**Screen:** Dashboard → Command Center → scroll to Exceptions section.

> **Spoken:**
> "50-case batch. Total at risk: ₹8.7 lakhs. Recovered: ₹5.9 lakhs. Recovery rate: 68%. 

> These are the cases we couldn't recover."

**[Point to the Exceptions list]**

> "Chronic dispute cases escalated to human. Price shock cases deliberately stopped — there's no recovery play for a customer who decided the product isn't worth the price. We show you the exceptions because hiding them would be lying about what an AI system can actually do."

---

## [4:25 – 4:50] Grounded Core & Verifiable Proof
 
**Screen:** Dashboard → Architecture / Decision Engine tab (showing IFSHM pipeline and research chips).
 
> **Spoken:**
> "Our routing logic follows the same predict-repayment-probability-then-optimize-assignment structure as Abe et al.'s KDD 2010 debt collection paper. We model the Conditional Average Treatment Effect (CATE) to isolate true incremental lift ($\Delta P$) while quantitatively penalizing interventions into the 'Sleeping Dogs' quadrant to preserve customer goodwill.
>
> What we did build is the production decision grid that makes recovery work safely in India: root-cause diagnosis, GoCardless failure filters, calendar-aligned payday scheduling, the RBI 7PM curfew gate, cross-leak risk unification, and an immutable SHA-256 Merkle audit ledger.
>
> You can independently verify our audit trail right from the command line: run `python verify_ledger.py http://localhost:8000/api/audit-ledger/export` to recompute the hash sequence live.
>
> All 49 architectural verification tests pass with 100% green coverage, backed by an interactive 1,028-node knowledge graph. Thank you."
 
---
 
## Timing Summary
 
| Segment | Time | Key Proof |
|---|---|---|
| Problem statement | 0:00–0:25 | 20M AutoPay revocations, 117B UPI scale, live dashboard |
| Razorpay split-screen | 0:25–1:10 | plink_ ID appearing in real Razorpay test account |
| Hinglish voice call | 1:10–2:30 | Real phone ringing, Twilio |
| Compliance block | 2:30–3:15 | 9PM blocked (RBI Curfew), 2PM allowed — live |
| Cross-leak & Failure Filter | 3:15–3:55 | JSON endpoint, Section 43B(h) MSME leverage, shared risk profile |
| Honest batch metrics | 3:55–4:25 | Exceptions shown, not hidden |
| Grounded close & CLI Proof | 4:25–4:50 | Abe et al. KDD 2010, CATE Uplift, 49/49 tests pass, verify_ledger.py |


---

## Narration Rules

- **Never say:** "revolutionary," "unprecedented," "Grand Unified," "100% accuracy," "fully autonomous"
- **Always say specific numbers:** "143ms measured," "94% on held-out split," "3 cases misclassified"
- **Show the exceptions list:** it reads as maturity, not weakness
- **The Twilio call is the climax** — do not rush it, let the audio play

---

## Recording Notes

- Record at 1080p
- No background music — the phone call audio IS the sound design
- Zoom into the `plink_` ID appearing in Razorpay dashboard — this is the most important 3 seconds in the video
- If the Twilio call fails on take 1, cut and restart — don't use a take where it fails silently
