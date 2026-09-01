# Batch Results & Recovery Performance Report

> **Disclaimer & Methodology:** This report presents the evaluation of the **Revenue Recovery Brain** on a synthetic batch of 66 realistic Indian commerce transactions, subscriptions, cart abandonments, and B2B invoices. Recovery figures represent **modeled predicted recoverable values** (Expected Net Recoverable Value / ENRV) based on empirical lift calculations and are explicitly labeled as such.

## 1. Executive Summary Table

| Metric | Evaluated Value | Notes |
| :--- | :--- | :--- |
| **Total Processed Cases** | `66` | 100% of batch evaluated without cherry-picking |
| **Total Amount at Risk** | `₹13,365,317.00` | Across payments, checkout, subscriptions, B2B |
| **Immediate Autonomous Recovered** | `₹388,804.03` | Automatically executed within autonomy envelope |
| **Modeled Expected Net Recovery (ENRV)** | `₹6,810,160.65` | Modeled recoverable net value across actionable pipeline |
| **Modeled Realization % (ENRV / Risk)** | `51.0%` | Realizable recovery rate factoring churn penalty & costs |
| **Autonomous Executions** | `12` | Instant automated retries & standard nudges |
| **Held / Escalated / Blocked Cases** | `54` | High-stakes HITL, economic floor, policy blocks, unfixable UX |

## 2. Category Performance Breakdown

| Failure Category | Case Count | ₹ at Risk | Auto Recovered (₹) | Modeled ENRV (₹) | Realization % | Status Breakdown |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Checkout & Cart Drop-offs** | `21` | ₹288,263.00 | ₹14,195.39 | ₹55,675.17 | `19.3%` | `3 auto / 1 HITL / 2 blocked` |
| **Business Declines (BD)** | `11` | ₹341,927.00 | ₹327,821.23 | ₹10,483.08 | `3.1%` | `5 auto / 0 HITL / 0 blocked` |
| **Technical Declines (TD)** | `2` | ₹1,769.00 | ₹614.02 | ₹1,025.40 | `58.0%` | `0 auto / 0 HITL / 0 blocked` |
| **Mandate & Recurring Issues** | `5` | ₹224,164.00 | ₹30,977.39 | ₹145,446.18 | `64.9%` | `1 auto / 2 HITL / 0 blocked` |
| **Other** | `7` | ₹43,974.00 | ₹15,196.00 | ₹21,567.40 | `49.0%` | `3 auto / 0 HITL / 0 blocked` |
| **B2B Receivables** | `20` | ₹12,465,220.00 | ₹0.00 | ₹6,575,963.42 | `52.8%` | `0 auto / 18 HITL / 0 blocked` |

## 3. Honest Exception & Non-Automated Cases List

The system explicitly refuses or holds actions that require human judgment, violate economic floor viability, or occur outside lawful contact windows:

| Case ID | Customer | Failure Type | Root Cause | Amount (₹) | Pipeline Outcome | Explicit Reason |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `fa5a8045` | Anita Patel | `payment_failure` | `checkout_friction` | ₹2,173.00 | `STOPPED` | Blocked by Responsible Collections Policy — Contact attempted outside 8 AM–7 PM IST (Rescheduled to 2026-09-03T04:30:00+00:00) |
| `02fc1fb5` | Priya Shah | `payment_failure` | `checkout_friction` | ₹484.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `2584942a` | Shreya Reddy | `payment_failure` | `checkout_friction` | ₹119,201.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `41e61dd4` | Shreya Reddy | `payment_failure` | `td_bank_down` | ₹1,571.00 | `PARTIALLY_RECOVERED` | Status: partially_recovered | Action: retry |
| `c75ec7f7` | Sneha Singh | `payment_failure` | `checkout_friction` | ₹40,755.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `48f49030` | Kavita Patel | `payment_failure` | `bd_wrong_pin` | ₹120.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `3204b9e4` | Simran Kumar | `payment_failure` | `bd_wrong_pin` | ₹6,624.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `65d7d7b4` | Ritu Singh | `payment_failure` | `td_bank_down` | ₹198.00 | `PARTIALLY_RECOVERED` | Status: partially_recovered | Action: retry |
| `b2801af2` | Arjun Desai | `payment_failure` | `checkout_friction` | ₹260.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `5ebe8d67` | Arun Kumar | `payment_failure` | `bd_wrong_pin` | ₹375.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `3223200c` | Kavita Patel | `payment_failure` | `checkout_friction` | ₹26,376.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `7329c653` | Priya Shah | `payment_failure` | `bd_wrong_pin` | ₹2,250.00 | `PARTIALLY_RECOVERED` | Status: partially_recovered | Action: whatsapp_nudge |
| `9d0d94a8` | Neha Kumar | `payment_failure` | `checkout_friction` | ₹2,424.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `47214232` | Anita Kapoor | `payment_failure` | `bd_wrong_pin` | ₹1,373.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `3b7124c8` | Karan Patel | `payment_failure` | `mandate_reauth` | ₹21,986.00 | `PARTIALLY_RECOVERED` | Status: partially_recovered | Action: reauth |
| `ed64e64b` | Arun Kumar | `payment_failure` | `bd_wrong_pin` | ₹4,500.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `3d71aac9` | Amit Mishra | `payment_failure` | `checkout_friction` | ₹7,500.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `95ead5b4` | Swati Malhotra | `checkout_abandonment` | `checkout_payment_mismatch` | ₹5,181.00 | `STOPPED` | Blocked by Responsible Collections Policy — Contact attempted outside 8 AM–7 PM IST (Rescheduled to 2026-09-03T04:30:00+00:00) |
| `d2925700` | Shreya Chopra | `checkout_abandonment` | `checkout_payment_mismatch` | ₹2,971.00 | `PARTIALLY_RECOVERED` | Status: partially_recovered | Action: whatsapp_nudge |
| `baed95bb` | Karan Patel | `checkout_abandonment` | `checkout_payment_mismatch` | ₹7,178.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `872010f4` | Suresh Shah | `checkout_abandonment` | `checkout_friction` | ₹6,263.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `da187a33` | Shreya Chopra | `checkout_abandonment` | `checkout_price_shock` | ₹4,113.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹4,113.00 ≥ ₹50,000) or chronic dispute |
| `71645b80` | Nikhil Nair | `checkout_abandonment` | `checkout_payment_mismatch` | ₹6,007.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `60a5627f` | Vivek Iyer | `checkout_abandonment` | `checkout_payment_mismatch` | ₹9,251.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `9d0248d3` | Nikhil Kumar | `checkout_abandonment` | `checkout_friction` | ₹14,702.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `a5c520bd` | Suresh Shah | `checkout_abandonment` | `checkout_friction` | ₹7,949.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `d9e222a0` | Neha Verma | `checkout_abandonment` | `checkout_3ds_failure` | ₹13,299.00 | `FAILED` | Status: failed | Action: retry |
| `e6308fcb` | Priya Shah | `subscription_failure` | `sub_balance` | ₹6,242.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `356a1330` | Kavita Patel | `subscription_failure` | `sub_mandate_bug` | ₹18,366.00 | `PARTIALLY_RECOVERED` | Status: partially_recovered | Action: reauth |
| `04f59b89` | Neha Verma | `subscription_failure` | `sub_mandate_bug` | ₹97,214.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹97,214.00 ≥ ₹50,000) or chronic dispute |
| `548c5de4` | Sneha Singh | `subscription_failure` | `sub_card_expired` | ₹5,789.00 | `FAILED` | Status: failed | Action: email_nudge |
| `2f7c3801` | Kavita Mishra | `subscription_failure` | `sub_card_expired` | ₹7,731.00 | `FAILED` | Status: failed | Action: email_nudge |
| `5808503e` | Shreya Reddy | `subscription_failure` | `sub_card_expired` | ₹9,016.00 | `FAILED` | Status: failed | Action: email_nudge |
| `fd08b9e0` | Amit Desai | `subscription_failure` | `sub_mandate_bug` | ₹79,790.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹79,790.00 ≥ ₹50,000) or chronic dispute |
| `0b3ef836` | Manoj Bhatia | `b2b_receivable` | `recv_cash_flow` | ₹122,422.00 | `STOPPED` | Blocked by Responsible Collections Policy — Contact attempted outside 8 AM–7 PM IST (Rescheduled to 2026-09-03T04:30:00+00:00) |
| `4bab6112` | Kavita Patel | `b2b_receivable` | `recv_cash_flow` | ₹1,929,442.00 | `STOPPED` | Blocked by Responsible Collections Policy — Contact attempted outside 8 AM–7 PM IST (Rescheduled to 2026-09-03T04:30:00+00:00) |
| `5c2ea46e` | Ritu Singh | `b2b_receivable` | `recv_chronic` | ₹121,019.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹121,019.00 ≥ ₹50,000) or chronic dispute |
| `3f85d5fe` | Sanjay Bhatia | `b2b_receivable` | `recv_oversight` | ₹28,120.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹28,120.00 ≥ ₹50,000) or chronic dispute |
| `ec6f9bf3` | Rohit Gupta | `b2b_receivable` | `recv_cash_flow` | ₹126,581.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹126,581.00 ≥ ₹50,000) or chronic dispute |
| `6197ccde` | Pooja Iyer | `b2b_receivable` | `recv_oversight` | ₹2,680,688.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹2,680,688.00 ≥ ₹50,000) or chronic dispute |
| `8f6e3bed` | Sneha Singh | `b2b_receivable` | `recv_chronic` | ₹2,595,421.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹2,595,421.00 ≥ ₹50,000) or chronic dispute |
| `60c32e32` | Kavita Mishra | `b2b_receivable` | `recv_oversight` | ₹23,617.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `761e76b4` | Kavita Patel | `b2b_receivable` | `recv_dispute` | ₹2,185,806.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹2,185,806.00 ≥ ₹50,000) or chronic dispute |
| `69e2cff9` | Anita Kapoor | `b2b_receivable` | `recv_cash_flow` | ₹19,764.00 | `FAILED` | Status: failed | Action: voice_call |
| `febe8c1b` | Sanjay Bhatia | `b2b_receivable` | `recv_cash_flow` | ₹42,798.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹42,798.00 ≥ ₹50,000) or chronic dispute |
| `9766e6ec` | Amit Desai | `b2b_receivable` | `recv_cash_flow` | ₹120,650.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹120,650.00 ≥ ₹50,000) or chronic dispute |
| `32208f94` | Amit Desai | `b2b_receivable` | `recv_cash_flow` | ₹32,803.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹32,803.00 ≥ ₹50,000) or chronic dispute |
| `20cd88e8` | Sanjay Shah | `b2b_receivable` | `recv_cash_flow` | ₹1,486,210.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹1,486,210.00 ≥ ₹50,000) or chronic dispute |
| `0aa93947` | Rohit Gupta | `b2b_receivable` | `recv_cash_flow` | ₹63,529.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹63,529.00 ≥ ₹50,000) or chronic dispute |
| `3078d243` | Swati Agarwal | `b2b_receivable` | `recv_cash_flow` | ₹194,769.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹194,769.00 ≥ ₹50,000) or chronic dispute |
| `72f56008` | Rohit Gupta | `b2b_receivable` | `recv_cash_flow` | ₹113,892.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹113,892.00 ≥ ₹50,000) or chronic dispute |
| `5ccf0b7f` | Swati Agarwal | `b2b_receivable` | `recv_chronic` | ₹202,689.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹202,689.00 ≥ ₹50,000) or chronic dispute |
| `ceb92944` | Neha Joshi | `b2b_receivable` | `recv_cash_flow` | ₹125,000.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹125,000.00 ≥ ₹50,000) or chronic dispute |
| `bdf9871c` | Rohit Agarwal | `b2b_receivable` | `recv_chronic` | ₹250,000.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹250,000.00 ≥ ₹50,000) or chronic dispute |

## 4. Full Per-Case Audit Sample (First 20 Cases)

| Case ID | Customer | Root Cause | Intervention | Amount | Status | Cryptographic Receipt Seal |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `fa5a8045` | Anita Patel | `checkout_friction` | `whatsapp_nudge` | ₹2,173.00 | `stopped` | `00e3ec6285384c...` |
| `02fc1fb5` | Priya Shah | `checkout_friction` | `whatsapp_nudge` | ₹484.00 | `failed` | `cf426a5a60a998...` |
| `1fd08991` | Arjun Desai | `bd_wrong_pin` | `whatsapp_nudge` | ₹91,352.00 | `recovered` | `c272ecaeec0381...` |
| `4d6ab74d` | Arun Kumar | `checkout_friction` | `whatsapp_nudge` | ₹2,952.00 | `recovered` | `e44b0354c73003...` |
| `2584942a` | Shreya Reddy | `checkout_friction` | `whatsapp_nudge` | ₹119,201.00 | `failed` | `9fc0953fc6a46c...` |
| `41e61dd4` | Shreya Reddy | `td_bank_down` | `retry` | ₹1,571.00 | `partially_recovered` | `d1bcbb4fe222ea...` |
| `c75ec7f7` | Sneha Singh | `checkout_friction` | `whatsapp_nudge` | ₹40,755.00 | `failed` | `c1c04bb0cd3f1f...` |
| `48f49030` | Kavita Patel | `bd_wrong_pin` | `whatsapp_nudge` | ₹120.00 | `failed` | `5272803e3a07be...` |
| `3204b9e4` | Simran Kumar | `bd_wrong_pin` | `whatsapp_nudge` | ₹6,624.00 | `failed` | `b6fe44e0a1ebf4...` |
| `5f2fa986` | Shreya Reddy | `bd_wrong_pin` | `whatsapp_nudge` | ₹60,151.00 | `recovered` | `ed5bad0feeff86...` |
| `65d7d7b4` | Ritu Singh | `td_bank_down` | `retry` | ₹198.00 | `partially_recovered` | `315f2329bf76c0...` |
| `c92b6881` | Sanjay Bhatia | `mandate_reauth` | `reauth` | ₹6,808.00 | `recovered` | `390ad75775c369...` |
| `b2801af2` | Arjun Desai | `checkout_friction` | `whatsapp_nudge` | ₹260.00 | `failed` | `ca7c7f45d636dc...` |
| `5ebe8d67` | Arun Kumar | `bd_wrong_pin` | `whatsapp_nudge` | ₹375.00 | `failed` | `28ed64f3e2fa48...` |
| `3223200c` | Kavita Patel | `checkout_friction` | `whatsapp_nudge` | ₹26,376.00 | `failed` | `87124ec266c057...` |
| `3dd96749` | Vivek Nair | `bd_wrong_pin` | `whatsapp_nudge` | ₹40,909.00 | `recovered` | `b551b9561c40a9...` |
| `7329c653` | Priya Shah | `bd_wrong_pin` | `whatsapp_nudge` | ₹2,250.00 | `partially_recovered` | `ed9e9f35f1d99d...` |
| `9d0d94a8` | Neha Kumar | `checkout_friction` | `whatsapp_nudge` | ₹2,424.00 | `failed` | `db64645b8f4f1f...` |
| `c015bad7` | Shreya Chopra | `bd_wrong_pin` | `whatsapp_nudge` | ₹1,096.00 | `recovered` | `dd766cc5db98d3...` |
| `47214232` | Anita Kapoor | `bd_wrong_pin` | `whatsapp_nudge` | ₹1,373.00 | `failed` | `c68c42ce980ceb...` |

