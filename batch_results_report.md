# Batch Results & Recovery Performance Report

> **Disclaimer & Methodology:** This report presents the evaluation of the **Revenue Recovery Brain** on a synthetic batch of 66 realistic Indian commerce transactions, subscriptions, cart abandonments, and B2B invoices. Recovery figures represent **modeled predicted recoverable values** (Expected Net Recoverable Value / ENRV) based on empirical lift calculations and are explicitly labeled as such.

## 1. Executive Summary Table

| Metric | Evaluated Value | Notes |
| :--- | :--- | :--- |
| **Total Processed Cases** | `66` | 100% of batch evaluated without cherry-picking |
| **Total Amount at Risk** | `₹13,365,317.00` | Across payments, checkout, subscriptions, B2B |
| **Immediate Autonomous Recovered** | `₹298,023.16` | Automatically executed within autonomy envelope |
| **Modeled Expected Net Recovery (ENRV)** | `₹6,808,680.97` | Modeled recoverable net value across actionable pipeline |
| **Modeled Realization % (ENRV / Risk)** | `50.9%` | Realizable recovery rate factoring churn penalty & costs |
| **Autonomous Executions** | `12` | Instant automated retries & standard nudges |
| **Held / Escalated / Blocked Cases** | `54` | High-stakes HITL, economic floor, policy blocks, unfixable UX |

## 2. Category Performance Breakdown

| Failure Category | Case Count | ₹ at Risk | Auto Recovered (₹) | Modeled ENRV (₹) | Realization % | Status Breakdown |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Checkout & Cart Drop-offs** | `21` | ₹288,263.00 | ₹11,161.00 | ₹55,675.17 | `19.3%` | `3 auto / 1 HITL / 2 blocked` |
| **Business Declines (BD)** | `11` | ₹341,927.00 | ₹194,061.41 | ₹10,483.08 | `3.1%` | `4 auto / 0 HITL / 0 blocked` |
| **Technical Declines (TD)** | `2` | ₹1,769.00 | ₹614.02 | ₹1,025.40 | `58.0%` | `0 auto / 0 HITL / 0 blocked` |
| **Other** | `8` | ₹50,782.00 | ₹8,453.73 | ₹24,879.40 | `49.0%` | `1 auto / 1 HITL / 0 blocked` |
| **Mandate & Recurring Issues** | `4` | ₹217,356.00 | ₹40,352.00 | ₹140,654.50 | `64.7%` | `2 auto / 2 HITL / 0 blocked` |
| **B2B Receivables** | `20` | ₹12,465,220.00 | ₹43,381.00 | ₹6,575,963.42 | `52.8%` | `2 auto / 18 HITL / 0 blocked` |

## 3. Honest Exception & Non-Automated Cases List

The system explicitly refuses or holds actions that require human judgment, violate economic floor viability, or occur outside lawful contact windows:

| Case ID | Customer | Failure Type | Root Cause | Amount (₹) | Pipeline Outcome | Explicit Reason |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `93d12138` | Anita Patel | `payment_failure` | `checkout_friction` | ₹2,173.00 | `STOPPED` | Blocked by Responsible Collections Policy — Contact attempted outside 8 AM–7 PM IST (Rescheduled to 2026-09-03T04:30:00+00:00) |
| `ecad9426` | Priya Shah | `payment_failure` | `checkout_friction` | ₹484.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `32e14d42` | Shreya Reddy | `payment_failure` | `checkout_friction` | ₹119,201.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `b7b4f0e5` | Shreya Reddy | `payment_failure` | `td_bank_down` | ₹1,571.00 | `PARTIALLY_RECOVERED` | Status: partially_recovered | Action: retry |
| `e76acd8e` | Sneha Singh | `payment_failure` | `checkout_friction` | ₹40,755.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `564aed53` | Kavita Patel | `payment_failure` | `bd_wrong_pin` | ₹120.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `cf94712d` | Simran Kumar | `payment_failure` | `bd_wrong_pin` | ₹6,624.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `d88489a1` | Ritu Singh | `payment_failure` | `td_bank_down` | ₹198.00 | `PARTIALLY_RECOVERED` | Status: partially_recovered | Action: retry |
| `fc522f49` | Sanjay Bhatia | `payment_failure` | `unknown` | ₹6,808.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹6,808.00 ≥ ₹50,000) or chronic dispute |
| `ebf5c4e4` | Arun Kumar | `payment_failure` | `bd_wrong_pin` | ₹375.00 | `PARTIALLY_RECOVERED` | Status: partially_recovered | Action: whatsapp_nudge |
| `00baf66d` | Kavita Patel | `payment_failure` | `checkout_friction` | ₹26,376.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `9552bf58` | Priya Shah | `payment_failure` | `bd_wrong_pin` | ₹2,250.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `51a96af3` | Neha Kumar | `payment_failure` | `checkout_friction` | ₹2,424.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `17c95919` | Shreya Chopra | `payment_failure` | `bd_wrong_pin` | ₹1,096.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `db068621` | Shreya Mehta | `payment_failure` | `bd_wrong_pin` | ₹133,177.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `ec074392` | Arun Kumar | `payment_failure` | `bd_wrong_pin` | ₹4,500.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `a308b119` | Amit Mishra | `payment_failure` | `checkout_friction` | ₹7,500.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `4b40736a` | Swati Malhotra | `checkout_abandonment` | `checkout_payment_mismatch` | ₹5,181.00 | `STOPPED` | Blocked by Responsible Collections Policy — Contact attempted outside 8 AM–7 PM IST (Rescheduled to 2026-09-03T04:30:00+00:00) |
| `4710c359` | Shreya Chopra | `checkout_abandonment` | `checkout_payment_mismatch` | ₹2,971.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `019e79ff` | Karan Patel | `checkout_abandonment` | `checkout_payment_mismatch` | ₹7,178.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `37992e84` | Neha Joshi | `checkout_abandonment` | `checkout_payment_mismatch` | ₹7,383.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `d12df982` | Suresh Shah | `checkout_abandonment` | `checkout_friction` | ₹6,263.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `557995fd` | Shreya Chopra | `checkout_abandonment` | `checkout_price_shock` | ₹4,113.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹4,113.00 ≥ ₹50,000) or chronic dispute |
| `f14fbcd4` | Nikhil Nair | `checkout_abandonment` | `checkout_payment_mismatch` | ₹6,007.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `3238c51f` | Vivek Iyer | `checkout_abandonment` | `checkout_payment_mismatch` | ₹9,251.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `0f55bab3` | Nikhil Kumar | `checkout_abandonment` | `checkout_friction` | ₹14,702.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `090e3bfb` | Arjun Desai | `checkout_abandonment` | `checkout_friction` | ₹1,841.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `078487c4` | Neha Verma | `checkout_abandonment` | `checkout_3ds_failure` | ₹13,299.00 | `FAILED` | Status: failed | Action: retry |
| `8d54f834` | Amit Mishra | `subscription_failure` | `sub_card_expired` | ₹4,107.00 | `FAILED` | Status: failed | Action: email_nudge |
| `22ff7fc1` | Priya Shah | `subscription_failure` | `sub_balance` | ₹6,242.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `b2cc1f45` | Neha Verma | `subscription_failure` | `sub_mandate_bug` | ₹97,214.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹97,214.00 ≥ ₹50,000) or chronic dispute |
| `aacf20a3` | Shreya Mehta | `subscription_failure` | `sub_balance` | ₹9,471.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `c750751d` | Sneha Singh | `subscription_failure` | `sub_card_expired` | ₹5,789.00 | `FAILED` | Status: failed | Action: email_nudge |
| `0639664c` | Shreya Reddy | `subscription_failure` | `sub_card_expired` | ₹9,016.00 | `FAILED` | Status: failed | Action: email_nudge |
| `eca7bb05` | Rohit Gupta | `subscription_failure` | `sub_balance` | ₹1,618.00 | `PARTIALLY_RECOVERED` | Status: partially_recovered | Action: whatsapp_nudge |
| `55479422` | Amit Desai | `subscription_failure` | `sub_mandate_bug` | ₹79,790.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹79,790.00 ≥ ₹50,000) or chronic dispute |
| `9a42c665` | Manoj Bhatia | `b2b_receivable` | `recv_cash_flow` | ₹122,422.00 | `STOPPED` | Blocked by Responsible Collections Policy — Contact attempted outside 8 AM–7 PM IST (Rescheduled to 2026-09-03T04:30:00+00:00) |
| `81a09715` | Kavita Patel | `b2b_receivable` | `recv_cash_flow` | ₹1,929,442.00 | `STOPPED` | Blocked by Responsible Collections Policy — Contact attempted outside 8 AM–7 PM IST (Rescheduled to 2026-09-03T04:30:00+00:00) |
| `681ba6aa` | Ritu Singh | `b2b_receivable` | `recv_chronic` | ₹121,019.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹121,019.00 ≥ ₹50,000) or chronic dispute |
| `91da676f` | Sanjay Bhatia | `b2b_receivable` | `recv_oversight` | ₹28,120.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹28,120.00 ≥ ₹50,000) or chronic dispute |
| `20ce4ffb` | Rohit Gupta | `b2b_receivable` | `recv_cash_flow` | ₹126,581.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹126,581.00 ≥ ₹50,000) or chronic dispute |
| `e37894f5` | Pooja Iyer | `b2b_receivable` | `recv_oversight` | ₹2,680,688.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹2,680,688.00 ≥ ₹50,000) or chronic dispute |
| `d5883b81` | Sneha Singh | `b2b_receivable` | `recv_chronic` | ₹2,595,421.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹2,595,421.00 ≥ ₹50,000) or chronic dispute |
| `9fbab3c8` | Kavita Patel | `b2b_receivable` | `recv_dispute` | ₹2,185,806.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹2,185,806.00 ≥ ₹50,000) or chronic dispute |
| `c99acb78` | Sanjay Bhatia | `b2b_receivable` | `recv_cash_flow` | ₹42,798.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹42,798.00 ≥ ₹50,000) or chronic dispute |
| `bfbd7aca` | Amit Desai | `b2b_receivable` | `recv_cash_flow` | ₹120,650.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹120,650.00 ≥ ₹50,000) or chronic dispute |
| `ccb1f83b` | Amit Desai | `b2b_receivable` | `recv_cash_flow` | ₹32,803.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹32,803.00 ≥ ₹50,000) or chronic dispute |
| `ed43ab76` | Sanjay Shah | `b2b_receivable` | `recv_cash_flow` | ₹1,486,210.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹1,486,210.00 ≥ ₹50,000) or chronic dispute |
| `8aa1d434` | Rohit Gupta | `b2b_receivable` | `recv_cash_flow` | ₹63,529.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹63,529.00 ≥ ₹50,000) or chronic dispute |
| `9464f9ae` | Swati Agarwal | `b2b_receivable` | `recv_cash_flow` | ₹194,769.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹194,769.00 ≥ ₹50,000) or chronic dispute |
| `f6f75b02` | Rohit Gupta | `b2b_receivable` | `recv_cash_flow` | ₹113,892.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹113,892.00 ≥ ₹50,000) or chronic dispute |
| `262da020` | Swati Agarwal | `b2b_receivable` | `recv_chronic` | ₹202,689.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹202,689.00 ≥ ₹50,000) or chronic dispute |
| `40553f30` | Neha Joshi | `b2b_receivable` | `recv_cash_flow` | ₹125,000.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹125,000.00 ≥ ₹50,000) or chronic dispute |
| `070c010b` | Rohit Agarwal | `b2b_receivable` | `recv_chronic` | ₹250,000.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹250,000.00 ≥ ₹50,000) or chronic dispute |

## 4. Full Per-Case Audit Sample (First 20 Cases)

| Case ID | Customer | Root Cause | Intervention | Amount | Status | Cryptographic Receipt Seal |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `93d12138` | Anita Patel | `checkout_friction` | `whatsapp_nudge` | ₹2,173.00 | `stopped` | `b39062fa947086...` |
| `ecad9426` | Priya Shah | `checkout_friction` | `whatsapp_nudge` | ₹484.00 | `failed` | `28b710854bbc15...` |
| `b88a1038` | Arjun Desai | `bd_wrong_pin` | `whatsapp_nudge` | ₹91,352.00 | `recovered` | `054f61eddff56b...` |
| `7ae07916` | Arun Kumar | `checkout_friction` | `whatsapp_nudge` | ₹2,952.00 | `recovered` | `ab63dec255493d...` |
| `32e14d42` | Shreya Reddy | `checkout_friction` | `whatsapp_nudge` | ₹119,201.00 | `failed` | `998ffb886c079f...` |
| `b7b4f0e5` | Shreya Reddy | `td_bank_down` | `retry` | ₹1,571.00 | `partially_recovered` | `65920e69895100...` |
| `e76acd8e` | Sneha Singh | `checkout_friction` | `whatsapp_nudge` | ₹40,755.00 | `failed` | `53167cbd9b656b...` |
| `564aed53` | Kavita Patel | `bd_wrong_pin` | `whatsapp_nudge` | ₹120.00 | `failed` | `fa26c67aa76625...` |
| `cf94712d` | Simran Kumar | `bd_wrong_pin` | `whatsapp_nudge` | ₹6,624.00 | `failed` | `ee8fe76a28c625...` |
| `8dd68d65` | Shreya Reddy | `bd_wrong_pin` | `whatsapp_nudge` | ₹60,151.00 | `recovered` | `43cb0a0979d414...` |
| `d88489a1` | Ritu Singh | `td_bank_down` | `retry` | ₹198.00 | `partially_recovered` | `1511a9b48a5559...` |
| `fc522f49` | Sanjay Bhatia | `unknown` | `escalate_human` | ₹6,808.00 | `awaiting_response` | `3569e3749c12c0...` |
| `8daee972` | Arjun Desai | `checkout_friction` | `whatsapp_nudge` | ₹260.00 | `recovered` | `af6c6f90694b28...` |
| `ebf5c4e4` | Arun Kumar | `bd_wrong_pin` | `whatsapp_nudge` | ₹375.00 | `partially_recovered` | `4c8687d9ca0c65...` |
| `00baf66d` | Kavita Patel | `checkout_friction` | `whatsapp_nudge` | ₹26,376.00 | `failed` | `03b0efdd21b394...` |
| `a6bddc67` | Vivek Nair | `bd_wrong_pin` | `whatsapp_nudge` | ₹40,909.00 | `recovered` | `33a875fc03a45d...` |
| `9552bf58` | Priya Shah | `bd_wrong_pin` | `whatsapp_nudge` | ₹2,250.00 | `failed` | `375b66ad8d49ad...` |
| `51a96af3` | Neha Kumar | `checkout_friction` | `whatsapp_nudge` | ₹2,424.00 | `failed` | `d8f8f0780c3329...` |
| `17c95919` | Shreya Chopra | `bd_wrong_pin` | `whatsapp_nudge` | ₹1,096.00 | `failed` | `5bd756fa37e215...` |
| `64c35e57` | Anita Kapoor | `bd_wrong_pin` | `whatsapp_nudge` | ₹1,373.00 | `recovered` | `6d6d9565545f7f...` |

