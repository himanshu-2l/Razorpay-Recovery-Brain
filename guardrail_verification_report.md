# Adversarial Guardrail Verification Report

> **Summary:** Confirms that all 4 critical safety guardrails visibly fire, prevent unauthorized actions, and record immutable cryptographic audit events in the SHA-256 blockchain ledger.

## 1. Adversarial Test Results Matrix

| Adversarial Scenario | Expected Guardrail Behavior | Verification Status | Cryptographic Audit Evidence |
| :--- | :--- | :---: | :--- |
| **a) Webhook Race Condition** | Exactly 1 winner, 9 duplicate rejections | **`PASSED`** | Event ID: `evt_adversarial_race_121101` |
| **b) Economic Floor (< ₹100)** | Blocked from outreach, zero cost wasted | **`PASSED`** | Sequence #134 (`6efc6f683dc2d2b7...`) |
| **c) Off-Hours (9:30 PM IST)** | Blocked & rescheduled to next day 10 AM | **`PASSED`** | Sequence #135 (`f797411412aee8c2...`) |
| **d) High Stakes (≥ ₹50,000)** | Held for human approval, auto-action halted | **`PASSED`** | Sequence #136 (`282d985060d35099...`) |

## 2. Guardrail Evidence Details

### a. Webhook Concurrency Race Test
- **Details:** Processed 1 winner, rejected 9 duplicates cleanly.
- **Mechanism:** SQLite WAL atomic lease lock with millisecond expiration.

### b. Economic Floor Guardrail
- **Action:** `blocked_economic_floor`
- **Rule:** `Economic Floor Rule — Minimum viable recovery threshold ₹100`
- **Audit Sequence:** `Record #134`

### c. Time Window Contact Guardrail
- **Action:** `blocked_time_window`
- **Rule:** `Responsible Collections Policy (RBI FPC Principles) — Contact permitted only 8 AM – 7 PM IST`
- **Rescheduled Target:** `2026-09-03 04:30:00+00:00`
- **Audit Sequence:** `Record #135`

### d. High-Stakes Human-in-the-Loop Threshold
- **Evaluated Amount:** `₹125,000.00`
- **Requires Human Approval:** `True`
- **Audit Sequence:** `Record #136`

