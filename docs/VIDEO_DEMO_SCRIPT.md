# Revenue Recovery Brain — Final Audit & Video Demo Script

---

## PART 1: PROJECT HEALTH AUDIT

### ✅ Overall Status: SHIP-READY

| Check | Result | Details |
|:---|:---:|:---|
| Backend tests | **78/78 passing** | 0 failures, 21s runtime, 2 deprecation warnings (cosmetic) |
| Frontend build | **✅ Clean** | 1852 modules, 666ms, chunk size warning only (not an error) |
| Research paper PDF | **✅ Exists** | `paper/main.pdf` — 470KB, 6 pages |
| Problem Blueprint PDF | **✅ Exists** | `docs/TRACK_03_PROBLEM_SOLUTION_ANALYSIS.pdf` — 97KB |
| Pitch Strategy PDF | **✅ Exists** | `docs/PITCH_STRATEGY_MASTER_PLAN.pdf` — 111KB |
| LICENSE | **✅ MIT** | Root directory |
| .env.example | **✅ Both locations** | Root + backend/ (identical copies) |
| docker-compose.yml | **✅ Exists** | PostgreSQL + backend + frontend |
| render.yaml | **✅ Exists** | Root (full-stack) + scripts/ (backend-only) |
| start.bat / start.ps1 | **✅ Exists** | In `scripts/` directory |
| Banner image | **✅ Exists** | `docs/assets/banner.jpg` |
| All 4 verification reports | **✅ Exist** | batch, classifier, guardrail, voice latency |
| Git status | **✅ Clean** | `main` up to date with `origin/main` |

### ⚠️ 2 Minor Issues Found (Non-blocking)

**Issue 1: `start.bat` path reference**
- `docs/SUBMISSION.md` says `double-click start.bat` (implying root)
- But the file is actually at `scripts/start.bat`
- **Impact:** Low — judges reading SUBMISSION.md might look in the wrong place
- **Fix:** Either copy `start.bat` to root, or update SUBMISSION.md instructions

**Issue 2: Dual frontend directories**
- Both `dashboard/` and `frontend/` exist (frontend is a symlink/copy of dashboard)
- `docker-compose.yml` and `render.yaml` reference `frontend/`
- `README.md` references `dashboard/`
- **Impact:** Low — both work, but the duplication could confuse reviewers
- **Fix:** Not needed before submission — both paths work

### 🎉 Verdict: Your project is COMPLETE and ready to demo.

---

## PART 2: VIDEO DEMO SCRIPT

### 🎥 FORMAT DECISION: Screen recording + voiceover

> **Direct screen recording with voiceover narration. NO face cam.**
>
> Judges are engineers. They want to see your product executing live. Every second of face cam is a second they're NOT seeing your dashboard doing real things. The product IS the pitch.

### Recording Setup
- **Tool:** OBS Studio (free) or Loom
- **Resolution:** 1920×1080, 30fps
- **Audio:** Clear mic, zero background music
- **Browser:** Chrome, zoom at 90%
- **Two windows side-by-side when needed:** Dashboard (60%) + Razorpay Dashboard (40%)

### Pre-Recording Checklist
- [ ] Backend running on port 8000
- [ ] Dashboard open at `http://localhost:5173` (Showcase mode)
- [ ] Razorpay Test Dashboard in separate tab
- [ ] Clear browser console
- [ ] System audio on (for TTS voice)
- [ ] Terminal ready with commands pre-typed
- [ ] Close all notifications, Slack, Discord, etc.

---

## ACT 1: THE HOOK (0:00 – 0:30)

> **"Judges decide in the first 30 seconds. Open with your demo doing something insane."**

### On Screen
Console → Overview tab already loaded. KPI cards glowing. 3D Recovery Flow animated.

### Cursor Actions
| Time | Do This |
|:---|:---|
| 0:00 | Screen opens COLD on dashboard — no intro slide |
| 0:03 | Hover **"₹14.27L At Risk"** KPI card |
| 0:06 | Hover **"₹19.25L Recovered"** card |
| 0:10 | Scroll to 3D Recovery Flow — 4 agent nodes orbiting |
| 0:15 | Click a case row — Case Detail Modal opens with SHA-256 hash |

### Say This
```
"India processes 117 billion digital transactions annually. Over 20 million
UPI AutoPay mandates are revoked every single month because the customer's
balance was low at execution time.

When these payments fail, existing tools blindly spam the customer — firing
SMS at 10 PM, retrying during bank outages, and treating the same person as
four different strangers across payment failures, cart drops, subscriptions,
and invoices.

This is Revenue Recovery Brain. It diagnoses the real root cause in under
150 milliseconds, enforces hard RBI compliance gates, and recovers revenue
through the right channel — not the loudest one."
```

---

## ACT 2: LIVE RAZORPAY PROOF (0:30 – 1:20)

> **The most important 50 seconds of the video. A real `plink_` in a real Razorpay dashboard is unfakeable.**

### On Screen
Split: Webhook Sandbox (left 60%) + Razorpay Test Dashboard (right 40%)

### Cursor Actions
| Time | Do This |
|:---|:---|
| 0:30 | Switch to Console → Webhook Sandbox |
| 0:35 | Select **"B2B Invoice Overdue · 38 Days · ₹85,000"** |
| 0:40 | Hover "Dispatch Webhook" — pause 1s — CLICK |
| 0:42 | Hover over response: Root Cause, Intervention, Compliance, Latency, plink_ ID |
| 0:55 | Switch to Razorpay Test Dashboard tab |
| 0:57 | Click Refresh |
| 1:00 | **ZOOM INTO** the plink_ ID — HOLD 3 seconds |

### Say This
```
"Let me show you this is real. I'm dispatching a B2B invoice overdue
webhook — an 85,000 rupee invoice pending for 38 days.

[click Dispatch]

Root cause classified: cash flow receivable. Intervention: voice call plus
payment link. Compliance: allowed. Processing time: 143 milliseconds.

Now watch. I'm refreshing the real Razorpay test dashboard.

[refresh — plink appears]

That payment link just appeared in a real Razorpay account. Not hardcoded.
It sends real SMS and email notifications. If the buyer pays — it settles
through real Razorpay infrastructure."
```

---

## ACT 3: HINGLISH VOICE RECOVERY (1:20 – 2:15)

### On Screen
Console → Voice Studio (full screen)

### Cursor Actions
| Time | Do This |
|:---|:---|
| 1:20 | Navigate to Voice Studio tab |
| 1:25 | Show pre-filled form: Rohit Mehta, ₹85,000, INV-2026-08-MEHTA |
| 1:30 | Click "Generate Script" — Hinglish dialogue appears |
| 1:35 | Click "Simulate Voice Call" — TTS speaks |
| 1:45 | Hover over Voice Safety Guardrail badge: "Zero Credential Collection: ENFORCED" |
| 2:00 | Show PTP tracker: PENDING → NUDGED → SETTLED |

### Say This
```
"B2B recovery in India fails because email gets ignored. Real business
conversations happen in Hinglish.

Our voice agent generates a contextual Hinglish script.

[TTS plays: 'Namaskar! Kya main Rohit Mehta ji se baat kar sakta hoon...']

Notice the safety guardrail. The voice agent never asks for OTP, PIN, CVV,
or any credential. It's architecturally prohibited. The agent is strictly
consultative.

It negotiates a Promise-to-Pay date, then sends a secure Razorpay payment
link via SMS. The customer pays on their own device, on their own time."
```

---

## ACT 4: COMPLIANCE REFUSING TO ACT (2:15 – 2:55)

> **Showing refusal is more impressive than showing action.**

### On Screen
Console → Compliance Shield tab

### Cursor Actions
| Time | Do This |
|:---|:---|
| 2:15 | Switch to Compliance tab |
| 2:20 | Show RBI curfew clock, contact frequency, Section 43B(h) timer |
| 2:25 | Explain: 9:30 PM → BLOCKED, rescheduled to 9 AM |
| 2:35 | Show 2:00 PM → ALLOWED |
| 2:40 | Switch to Stopped Cases tab — show exceptions list |

### Say This
```
"Most AI demos show the happy path. We show the compliance gate blocking
the agent.

9:30 PM — blocked. RBI Fair Practices Code restricts contact to 8 AM to
7 PM IST. The system cites the exact circular, logs it to the cryptographic
audit trail, and reschedules to 9 AM.

2 PM — allowed. Same customer, same debt, different time.

And here are the cases we deliberately did NOT recover. Debts under 100
rupees? Stopped — compute cost exceeds expected recovery. Chronic dispute
cases? Escalated to human, not harassed by AI.

A system that knows when to stop is more trustworthy than one that never
does."
```

---

## ACT 5: CROSS-LEAK ARCHITECTURE (2:55 – 3:40)

### On Screen
Console → Architecture tab → 3D Recovery Flow → API endpoint

### Cursor Actions
| Time | Do This |
|:---|:---|
| 2:55 | Switch to Architecture tab |
| 3:00 | Hover over pipeline stages: Ingestion → Diagnosis → Compliance → ENRV → Execution → Audit |
| 3:10 | Switch to Overview, scroll to 3D Recovery Flow |
| 3:15 | Click agent nodes: Bouncer, Investigator, Police Chief, Auditor |
| 3:25 | Open tab: `http://localhost:8000/api/demo/unified-recovery-scenario` |
| 3:30 | Point at JSON: 4 failures, 1 customer, coordinated response |

### Say This
```
"Four isolated trust boundaries. The Bouncer locks idempotency. The
Investigator diagnoses read-only. The Policy Gate enforces every regulatory
rule. The Auditor seals every decision into a SHA-256 chain.

Here's the real differentiator. One customer — Rohit Mehta — simultaneously
has a payment failure, a cart drop, a subscription halt, and an overdue
invoice. Total exposure: 2.75 lakh rupees.

The unified brain sees all four. It prioritized the B2B invoice first
because it's approaching the 45-day MSME tax deadline. It suppressed
duplicate WhatsApp outreach — two cases would have triggered the same
channel to the same customer. One was automatically deferred."
```

---

## ACT 6: CRYPTOGRAPHIC PROOF (3:40 – 4:15)

### On Screen
Terminal (large font) + then A/B Test tab

### Cursor Actions
| Time | Do This |
|:---|:---|
| 3:40 | Switch to terminal |
| 3:42 | Run: `python backend/verify_ledger.py` |
| 3:45 | Watch: SHA-256 hashes recalculate block by block |
| 3:50 | Final: "✅ 100% Chain Integrity Verified" |
| 3:55 | Switch to Console → A/B Test tab — show z-test with Wilson CIs |

### Say This
```
"Every decision is sealed into a SHA-256 Merkle-style audit ledger. You
don't have to trust our backend.

[runs verify_ledger.py]

This CLI tool recalculates every hash from raw SQLite, offline, zero
dependencies. 100% chain integrity verified.

And our A/B testing doesn't use vibes — it runs two-proportion z-tests
with Wilson score confidence intervals to measure actual causal uplift."
```

---

## ACT 7: CLOSE + TESTS (4:15 – 4:50)

### On Screen
Terminal → then Showcase mode

### Cursor Actions
| Time | Do This |
|:---|:---|
| 4:15 | Run: `cd backend && .\venv\Scripts\python.exe -m pytest -q tests/` |
| 4:20 | Watch dots fly, then "78 passed" |
| 4:30 | Switch to Showcase mode |
| 4:33 | Slow scroll: hero, 5 leaks, 3D architecture, ROI calculator, compliance seal |
| 4:45 | End on hero with animated counters |

### Say This
```
"78 architectural tests. Zero failures. Zero external dependencies.
Covering idempotency races, ENRV math, voice safety guardrails,
cryptographic proof chains, and concurrent webhook storms.

[switch to showcase]

Revenue Recovery Brain. Not a chatbot wrapper. Not a retry scheduler.
A production-grade autonomous revenue recovery operating system — with
hard compliance gates, mathematical decision science, and cryptographic
proof that every action was justified.

Built solo for Razorpay AI Buildathon 2026, Track 03.

Thank you."
```

---

## VEO 3 MOTION GRAPHICS PROMPTS (Optional Transitions)

Use these as 3-4 second transitions between acts. They add polish but must NOT replace live demo time.

### Clip 1: "Payment Cascade" (between Act 1 → Act 2)
```
Cinematic 3D animation of glowing blue and green digital payment data
streams flowing through interconnected nodes on a dark obsidian background
(#050b18). Streams suddenly hit a red barrier node and scatter into particle
debris, then reform and route through alternate emerald-green pathways.
Isometric camera, shallow depth of field, clean fintech aesthetic.
Razorpay blue (#305EFF) and emerald (#10B981) palette. 4 seconds, 24fps.
```

### Clip 2: "Compliance Shield" (between Act 3 → Act 4)
```
A transparent hexagonal shield materializes in front of flowing data
streams. Some streams pass through (glowing green approval), others are
deflected and rerouted (glowing amber redirect). Shield pulses with
geometric regulatory code patterns. Dark navy background with Razorpay
blue highlights. Institutional, zero-hype. 3 seconds, 24fps.
```

### Clip 3: "SHA-256 Chain" (between Act 5 → Act 6)
```
Close-up of blockchain-style blocks materializing one by one, each
connected by a glowing cryptographic hash string. Camera slowly pulls
back to reveal an unbroken chain stretching to the horizon. Each block
has a faint timestamp and case ID hologram. Dark background, purple
(#8B5CF6) and blue (#305EFF) glow. Mathematical, precise. 4 seconds.
```

---

## TIMING SUMMARY

| Act | Time | Key Proof | Duration |
|:---|:---|:---|:---:|
| 1. Hook | 0:00–0:30 | Live KPIs, 3D agents, case modal | 30s |
| 2. Razorpay | 0:30–1:20 | Real `plink_` in real Razorpay | 50s |
| 3. Voice | 1:20–2:15 | Hinglish TTS, safety guardrail, PTP | 55s |
| 4. Compliance | 2:15–2:55 | 9PM blocked, exceptions shown | 40s |
| 5. Architecture | 2:55–3:40 | 4-funnel unified, deduplicated | 45s |
| 6. Crypto Proof | 3:40–4:15 | verify_ledger.py, A/B z-tests | 35s |
| 7. Close | 4:15–4:50 | 78/78 tests, showcase scroll | 35s |
| **TOTAL** | | | **4:50** |

---

## NARRATION RULES

### ❌ Never say:
- "revolutionary", "unprecedented", "game-changing"
- "Hi, I'm Himanshu" (introduce after the hook, not before)
- "100% accuracy" (say "100% on held-out split")
- "fully autonomous" (say "autonomous with hard stopping rules")

### ✅ Always say:
- Specific numbers: "143 milliseconds", "78 tests", "20 million mandates"
- Honest limits: "these are the cases we couldn't recover"
- Regulatory citations: "RBI Fair Practices Code", "Section 43B(h)"

### 🎙️ Tone:
- Calm engineer explaining their system — not a salesperson
- Confidence through specificity — not through adjectives
- Let the product do the talking — your mouse movements ARE the narrative

---

## POST-RECORDING CHECKLIST

- [ ] Video under 5:00
- [ ] `plink_` ID clearly visible in Razorpay dashboard
- [ ] TTS audio audible and clear
- [ ] Terminal text readable
- [ ] No API keys or personal data visible
- [ ] "78 passed" clearly readable
- [ ] "100% Chain Integrity" visible
- [ ] Final frame is Showcase hero (not black screen)
- [ ] Upload to YouTube (unlisted) or Google Drive
- [ ] GitHub link in video description: `https://github.com/himanshu-2l/Razorpay-Recovery-Brain`
