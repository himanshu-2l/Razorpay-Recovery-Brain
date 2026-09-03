# Batch Results & Recovery Performance Report

> **Disclaimer & Methodology:** This report presents the evaluation of the **Revenue Recovery Brain** on a synthetic batch of 66 realistic Indian commerce transactions, subscriptions, cart abandonments, and B2B invoices. Recovery figures represent **modeled predicted recoverable values** (Expected Net Recoverable Value / ENRV) based on empirical lift calculations and are explicitly labeled as such.

## 1. Executive Summary Table

| Metric | Evaluated Value | Notes |
| :--- | :--- | :--- |
| **Total Processed Cases** | `66` | 100% of batch evaluated without cherry-picking |
| **Total Amount at Risk** | `₹13,555,552.00` | Across payments, checkout, subscriptions, B2B |
| **Immediate Autonomous Recovered** | `₹237,893.69` | Automatically executed within autonomy envelope |
| **Modeled Expected Net Recovery (ENRV)** | `₹6,228,637.71` | Modeled recoverable net value across actionable pipeline |
| **Modeled Realization % (ENRV / Risk)** | `45.9%` | Realizable recovery rate factoring churn penalty & costs |
| **Autonomous Executions** | `14` | Instant automated retries & standard nudges |
| **Held / Escalated / Blocked Cases** | `52` | High-stakes HITL, economic floor, policy blocks, unfixable UX |

## 2. Category Performance Breakdown

| Failure Category | Case Count | ₹ at Risk | Auto Recovered (₹) | Modeled ENRV (₹) | Realization % | Status Breakdown |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Business Declines (BD)** | `14` | ₹329,757.00 | ₹43,249.00 | ₹11,194.31 | `3.4%` | `6 auto / 0 HITL / 1 blocked` |
| **Mandate & Recurring Issues** | `4` | ₹286,722.00 | ₹99,555.80 | ₹141,083.00 | `49.2%` | `1 auto / 2 HITL / 0 blocked` |
| **Other** | `12` | ₹120,272.00 | ₹26,263.86 | ₹27,322.05 | `22.7%` | `4 auto / 0 HITL / 0 blocked` |
| **Technical Declines (TD)** | `2` | ₹41,130.00 | ₹28,956.04 | ₹433.34 | `1.1%` | `0 auto / 0 HITL / 0 blocked` |
| **Checkout & Cart Drop-offs** | `14` | ₹312,451.00 | ₹39,868.99 | ₹58,745.38 | `18.8%` | `3 auto / 1 HITL / 1 blocked` |
| **B2B Receivables** | `20` | ₹12,465,220.00 | ₹0.00 | ₹5,989,859.63 | `48.1%` | `0 auto / 18 HITL / 0 blocked` |

## 3. Honest Exception & Non-Automated Cases List

The system explicitly refuses or holds actions that require human judgment, violate economic floor viability, or occur outside lawful contact windows:

| Case ID | Customer | Failure Type | Root Cause | Amount (₹) | Pipeline Outcome | Explicit Reason |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `3741c5c1` | Anita Patel | `payment_failure` | `bd_insufficient_funds` | ₹2,173.00 | `STOPPED` | Blocked by Responsible Collections Policy — Contact attempted outside 8 AM–7 PM IST (Rescheduled to 2026-09-04T04:30:00+00:00) |
| `969934c5` | Priya Shah | `payment_failure` | `bd_insufficient_funds` | ₹484.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `3e7d7889` | Anita Kapoor | `payment_failure` | `bd_insufficient_funds` | ₹27,471.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `432ed0f7` | Nikhil Nair | `payment_failure` | `card_expired` | ₹26,859.00 | `PARTIALLY_RECOVERED` | Status: partially_recovered | Action: email_nudge |
| `172891ca` | Arun Kumar | `payment_failure` | `td_bank_down` | ₹40,755.00 | `PARTIALLY_RECOVERED` | Status: partially_recovered | Action: retry |
| `e6b3c8be` | Simran Kumar | `payment_failure` | `card_expired` | ₹6,624.00 | `FAILED` | Status: failed | Action: email_nudge |
| `2dc61bb5` | Karan Patel | `payment_failure` | `card_expired` | ₹3,633.00 | `FAILED` | Status: failed | Action: email_nudge |
| `e6dd25f7` | Ritu Singh | `payment_failure` | `bd_insufficient_funds` | ₹31,113.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `8106d7b9` | Nikhil Nair | `payment_failure` | `bd_insufficient_funds` | ₹260.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `aba831b8` | Nikhil Nair | `payment_failure` | `td_bank_down` | ₹375.00 | `PARTIALLY_RECOVERED` | Status: partially_recovered | Action: retry |
| `f936cada` | Vivek Nair | `payment_failure` | `bd_limit_exceeded` | ₹40,909.00 | `FAILED` | Status: failed | Action: email_nudge |
| `b895a21d` | Sneha Singh | `payment_failure` | `bd_wrong_pin` | ₹179,598.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `ecedc0d6` | Rohit Gupta | `payment_failure` | `checkout_friction` | ₹193,621.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `0b566ff5` | Simran Kumar | `payment_failure` | `card_expired` | ₹36,758.00 | `FAILED` | Status: failed | Action: email_nudge |
| `d1cdc789` | Arun Kumar | `payment_failure` | `bd_wrong_pin` | ₹4,500.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `a40cab21` | Amit Mishra | `payment_failure` | `checkout_friction` | ₹7,500.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `b6e8c1c9` | Shreya Reddy | `checkout_abandonment` | `checkout_friction` | ₹9,349.00 | `STOPPED` | Blocked by Responsible Collections Policy — Contact attempted outside 8 AM–7 PM IST (Rescheduled to 2026-09-04T04:30:00+00:00) |
| `643562bb` | Shreya Reddy | `checkout_abandonment` | `checkout_friction` | ₹7,312.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `1f546bf0` | Meera Malhotra | `checkout_abandonment` | `checkout_payment_mismatch` | ₹820.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `64f854e5` | Arjun Sharma | `checkout_abandonment` | `checkout_price_shock` | ₹14,482.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹14,482.00 ≥ ₹50,000) or chronic dispute |
| `cf96471e` | Neha Verma | `checkout_abandonment` | `checkout_friction` | ₹8,456.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `2dfb640a` | Meera Malhotra | `checkout_abandonment` | `checkout_3ds_failure` | ₹944.00 | `PARTIALLY_RECOVERED` | Status: partially_recovered | Action: retry |
| `ab369f24` | Swati Malhotra | `checkout_abandonment` | `checkout_payment_mismatch` | ₹4,762.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `0369f3cd` | Shreya Reddy | `checkout_abandonment` | `checkout_friction` | ₹14,912.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `f4a10477` | Nikhil Kumar | `checkout_abandonment` | `checkout_payment_mismatch` | ₹11,178.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `8fea510c` | Priya Shah | `subscription_failure` | `sub_balance` | ₹6,242.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `0d77ecfb` | Kavita Patel | `subscription_failure` | `sub_mandate_bug` | ₹18,366.00 | `PARTIALLY_RECOVERED` | Status: partially_recovered | Action: reauth |
| `d716a27c` | Neha Verma | `subscription_failure` | `sub_mandate_bug` | ₹97,214.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹97,214.00 ≥ ₹50,000) or chronic dispute |
| `fd06bff3` | Sneha Singh | `subscription_failure` | `sub_card_expired` | ₹5,789.00 | `FAILED` | Status: failed | Action: email_nudge |
| `070f3ccf` | Kavita Mishra | `subscription_failure` | `sub_card_expired` | ₹7,731.00 | `FAILED` | Status: failed | Action: email_nudge |
| `fc950c90` | Shreya Reddy | `subscription_failure` | `sub_card_expired` | ₹9,016.00 | `FAILED` | Status: failed | Action: email_nudge |
| `70100682` | Amit Desai | `subscription_failure` | `sub_mandate_bug` | ₹79,790.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹79,790.00 ≥ ₹50,000) or chronic dispute |
| `fe81aea6` | Manoj Bhatia | `b2b_receivable` | `recv_cash_flow` | ₹122,422.00 | `STOPPED` | Blocked by Responsible Collections Policy — Contact attempted outside 8 AM–7 PM IST (Rescheduled to 2026-09-04T04:30:00+00:00) |
| `093236df` | Kavita Patel | `b2b_receivable` | `recv_cash_flow` | ₹1,929,442.00 | `STOPPED` | Blocked by Responsible Collections Policy — Contact attempted outside 8 AM–7 PM IST (Rescheduled to 2026-09-04T04:30:00+00:00) |
| `247cc8f8` | Ritu Singh | `b2b_receivable` | `recv_chronic` | ₹121,019.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹121,019.00 ≥ ₹50,000) or chronic dispute |
| `ac37309f` | Sanjay Bhatia | `b2b_receivable` | `recv_oversight` | ₹28,120.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹28,120.00 ≥ ₹50,000) or chronic dispute |
| `0c54d4fc` | Rohit Gupta | `b2b_receivable` | `recv_cash_flow` | ₹126,581.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹126,581.00 ≥ ₹50,000) or chronic dispute |
| `808d0d23` | Pooja Iyer | `b2b_receivable` | `recv_oversight` | ₹2,680,688.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹2,680,688.00 ≥ ₹50,000) or chronic dispute |
| `723ba620` | Sneha Singh | `b2b_receivable` | `recv_chronic` | ₹2,595,421.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹2,595,421.00 ≥ ₹50,000) or chronic dispute |
| `9ff21833` | Kavita Mishra | `b2b_receivable` | `recv_oversight` | ₹23,617.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `73d31362` | Kavita Patel | `b2b_receivable` | `recv_dispute` | ₹2,185,806.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹2,185,806.00 ≥ ₹50,000) or chronic dispute |
| `cc9d2ec8` | Anita Kapoor | `b2b_receivable` | `recv_cash_flow` | ₹19,764.00 | `FAILED` | Status: failed | Action: voice_call |
| `0f752740` | Sanjay Bhatia | `b2b_receivable` | `recv_cash_flow` | ₹42,798.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹42,798.00 ≥ ₹50,000) or chronic dispute |
| `7beb1bef` | Amit Desai | `b2b_receivable` | `recv_cash_flow` | ₹120,650.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹120,650.00 ≥ ₹50,000) or chronic dispute |
| `d556282b` | Amit Desai | `b2b_receivable` | `recv_cash_flow` | ₹32,803.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹32,803.00 ≥ ₹50,000) or chronic dispute |
| `d177b6e0` | Sanjay Shah | `b2b_receivable` | `recv_cash_flow` | ₹1,486,210.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹1,486,210.00 ≥ ₹50,000) or chronic dispute |
| `a4e3811a` | Rohit Gupta | `b2b_receivable` | `recv_cash_flow` | ₹63,529.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹63,529.00 ≥ ₹50,000) or chronic dispute |
| `4cca92e9` | Swati Agarwal | `b2b_receivable` | `recv_cash_flow` | ₹194,769.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹194,769.00 ≥ ₹50,000) or chronic dispute |
| `86d5be4a` | Rohit Gupta | `b2b_receivable` | `recv_cash_flow` | ₹113,892.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹113,892.00 ≥ ₹50,000) or chronic dispute |
| `62d12867` | Swati Agarwal | `b2b_receivable` | `recv_chronic` | ₹202,689.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹202,689.00 ≥ ₹50,000) or chronic dispute |
| `87cfe229` | Neha Joshi | `b2b_receivable` | `recv_cash_flow` | ₹125,000.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹125,000.00 ≥ ₹50,000) or chronic dispute |
| `81307ef1` | Rohit Agarwal | `b2b_receivable` | `recv_chronic` | ₹250,000.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹250,000.00 ≥ ₹50,000) or chronic dispute |

## 4. Full Per-Case Audit Sample (First 20 Cases)

| Case ID | Customer | Root Cause | Intervention | Amount | Status | Cryptographic Receipt Seal |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `3741c5c1` | Anita Patel | `bd_insufficient_funds` | `whatsapp_nudge` | ₹2,173.00 | `stopped` | `f4e69fc143a89e...` |
| `969934c5` | Priya Shah | `bd_insufficient_funds` | `whatsapp_nudge` | ₹484.00 | `failed` | `69317a77990558...` |
| `1953c2ea` | Arjun Desai | `mandate_reauth` | `reauth` | ₹91,352.00 | `recovered` | `829164044f8cfd...` |
| `528533e9` | Arun Kumar | `bd_limit_exceeded` | `email_nudge` | ₹2,952.00 | `recovered` | `9e5646448b9c4c...` |
| `3e7d7889` | Anita Kapoor | `bd_insufficient_funds` | `whatsapp_nudge` | ₹27,471.00 | `failed` | `7a286278086e22...` |
| `432ed0f7` | Nikhil Nair | `card_expired` | `email_nudge` | ₹26,859.00 | `partially_recovered` | `5056a33eacedcb...` |
| `172891ca` | Arun Kumar | `td_bank_down` | `retry` | ₹40,755.00 | `partially_recovered` | `4a7573cf6f7f86...` |
| `61553e92` | Kavita Patel | `bd_insufficient_funds` | `whatsapp_nudge` | ₹120.00 | `recovered` | `04b6717e0163c9...` |
| `e6b3c8be` | Simran Kumar | `card_expired` | `email_nudge` | ₹6,624.00 | `failed` | `e67e96d7e30111...` |
| `2dc61bb5` | Karan Patel | `card_expired` | `email_nudge` | ₹3,633.00 | `failed` | `d662903c2c5574...` |
| `e6dd25f7` | Ritu Singh | `bd_insufficient_funds` | `whatsapp_nudge` | ₹31,113.00 | `failed` | `339576d9244b15...` |
| `cff350d8` | Sanjay Bhatia | `bd_limit_exceeded` | `email_nudge` | ₹6,808.00 | `recovered` | `398b249bbd9199...` |
| `8106d7b9` | Nikhil Nair | `bd_insufficient_funds` | `whatsapp_nudge` | ₹260.00 | `failed` | `3c758f9b1212bb...` |
| `aba831b8` | Nikhil Nair | `td_bank_down` | `retry` | ₹375.00 | `partially_recovered` | `9335180719f7ae...` |
| `4f029847` | Kavita Patel | `bd_wrong_pin` | `whatsapp_nudge` | ₹26,376.00 | `recovered` | `93ccf7ba460353...` |
| `f936cada` | Vivek Nair | `bd_limit_exceeded` | `email_nudge` | ₹40,909.00 | `failed` | `aae4e227ea8cf1...` |
| `11525111` | Priya Shah | `bd_wrong_pin` | `whatsapp_nudge` | ₹2,250.00 | `recovered` | `2788779232503a...` |
| `671f57aa` | Neha Kumar | `card_expired` | `email_nudge` | ₹2,424.00 | `recovered` | `9a50331f41ee7f...` |
| `b895a21d` | Sneha Singh | `bd_wrong_pin` | `whatsapp_nudge` | ₹179,598.00 | `failed` | `74a6573dac8bf1...` |
| `e9b03e6b` | Nikhil Nair | `bd_insufficient_funds` | `whatsapp_nudge` | ₹4,743.00 | `recovered` | `f29665ca3bbe37...` |

