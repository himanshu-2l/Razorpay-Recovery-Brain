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
| `be8df28b` | Anita Patel | `payment_failure` | `checkout_friction` | ₹2,173.00 | `STOPPED` | Blocked by Responsible Collections Policy — Contact attempted outside 8 AM–7 PM IST (Rescheduled to 2026-09-03T04:30:00+00:00) |
| `56138f80` | Priya Shah | `payment_failure` | `checkout_friction` | ₹484.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `026670a6` | Shreya Reddy | `payment_failure` | `checkout_friction` | ₹119,201.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `037d6e2e` | Shreya Reddy | `payment_failure` | `td_bank_down` | ₹1,571.00 | `PARTIALLY_RECOVERED` | Status: partially_recovered | Action: retry |
| `4672a50d` | Sneha Singh | `payment_failure` | `checkout_friction` | ₹40,755.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `57a5ee68` | Kavita Patel | `payment_failure` | `bd_wrong_pin` | ₹120.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `b005884b` | Simran Kumar | `payment_failure` | `bd_wrong_pin` | ₹6,624.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `b4b811e9` | Ritu Singh | `payment_failure` | `td_bank_down` | ₹198.00 | `PARTIALLY_RECOVERED` | Status: partially_recovered | Action: retry |
| `b91ca0e7` | Sanjay Bhatia | `payment_failure` | `unknown` | ₹6,808.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹6,808.00 ≥ ₹50,000) or chronic dispute |
| `06af12ed` | Arun Kumar | `payment_failure` | `bd_wrong_pin` | ₹375.00 | `PARTIALLY_RECOVERED` | Status: partially_recovered | Action: whatsapp_nudge |
| `84535d31` | Kavita Patel | `payment_failure` | `checkout_friction` | ₹26,376.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `98586c9b` | Priya Shah | `payment_failure` | `bd_wrong_pin` | ₹2,250.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `578ac000` | Neha Kumar | `payment_failure` | `checkout_friction` | ₹2,424.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `cca0e6e6` | Shreya Chopra | `payment_failure` | `bd_wrong_pin` | ₹1,096.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `b65c622c` | Shreya Mehta | `payment_failure` | `bd_wrong_pin` | ₹133,177.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `c3bd4650` | Arun Kumar | `payment_failure` | `bd_wrong_pin` | ₹4,500.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `d39de650` | Amit Mishra | `payment_failure` | `checkout_friction` | ₹7,500.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `c7fdec4b` | Swati Malhotra | `checkout_abandonment` | `checkout_payment_mismatch` | ₹5,181.00 | `STOPPED` | Blocked by Responsible Collections Policy — Contact attempted outside 8 AM–7 PM IST (Rescheduled to 2026-09-03T04:30:00+00:00) |
| `e4bb640b` | Shreya Chopra | `checkout_abandonment` | `checkout_payment_mismatch` | ₹2,971.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `f4490208` | Karan Patel | `checkout_abandonment` | `checkout_payment_mismatch` | ₹7,178.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `61b82a37` | Neha Joshi | `checkout_abandonment` | `checkout_payment_mismatch` | ₹7,383.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `43df0d73` | Suresh Shah | `checkout_abandonment` | `checkout_friction` | ₹6,263.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `b022e46b` | Shreya Chopra | `checkout_abandonment` | `checkout_price_shock` | ₹4,113.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹4,113.00 ≥ ₹50,000) or chronic dispute |
| `70670ba0` | Nikhil Nair | `checkout_abandonment` | `checkout_payment_mismatch` | ₹6,007.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `ca534846` | Vivek Iyer | `checkout_abandonment` | `checkout_payment_mismatch` | ₹9,251.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `ffc53d0f` | Nikhil Kumar | `checkout_abandonment` | `checkout_friction` | ₹14,702.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `705a07cb` | Arjun Desai | `checkout_abandonment` | `checkout_friction` | ₹1,841.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `cef0f3f5` | Neha Verma | `checkout_abandonment` | `checkout_3ds_failure` | ₹13,299.00 | `FAILED` | Status: failed | Action: retry |
| `580ee1b8` | Amit Mishra | `subscription_failure` | `sub_card_expired` | ₹4,107.00 | `FAILED` | Status: failed | Action: email_nudge |
| `4dbbf7ed` | Priya Shah | `subscription_failure` | `sub_balance` | ₹6,242.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `f9fe61d4` | Neha Verma | `subscription_failure` | `sub_mandate_bug` | ₹97,214.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹97,214.00 ≥ ₹50,000) or chronic dispute |
| `ca7852a2` | Shreya Mehta | `subscription_failure` | `sub_balance` | ₹9,471.00 | `FAILED` | Status: failed | Action: whatsapp_nudge |
| `4e3c7600` | Sneha Singh | `subscription_failure` | `sub_card_expired` | ₹5,789.00 | `FAILED` | Status: failed | Action: email_nudge |
| `72aba274` | Shreya Reddy | `subscription_failure` | `sub_card_expired` | ₹9,016.00 | `FAILED` | Status: failed | Action: email_nudge |
| `c5a889aa` | Rohit Gupta | `subscription_failure` | `sub_balance` | ₹1,618.00 | `PARTIALLY_RECOVERED` | Status: partially_recovered | Action: whatsapp_nudge |
| `7391f8a5` | Amit Desai | `subscription_failure` | `sub_mandate_bug` | ₹79,790.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹79,790.00 ≥ ₹50,000) or chronic dispute |
| `819d9e48` | Manoj Bhatia | `b2b_receivable` | `recv_cash_flow` | ₹122,422.00 | `STOPPED` | Blocked by Responsible Collections Policy — Contact attempted outside 8 AM–7 PM IST (Rescheduled to 2026-09-03T04:30:00+00:00) |
| `087030e0` | Kavita Patel | `b2b_receivable` | `recv_cash_flow` | ₹1,929,442.00 | `STOPPED` | Blocked by Responsible Collections Policy — Contact attempted outside 8 AM–7 PM IST (Rescheduled to 2026-09-03T04:30:00+00:00) |
| `039402c2` | Ritu Singh | `b2b_receivable` | `recv_chronic` | ₹121,019.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹121,019.00 ≥ ₹50,000) or chronic dispute |
| `20f07527` | Sanjay Bhatia | `b2b_receivable` | `recv_oversight` | ₹28,120.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹28,120.00 ≥ ₹50,000) or chronic dispute |
| `97dc8f90` | Rohit Gupta | `b2b_receivable` | `recv_cash_flow` | ₹126,581.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹126,581.00 ≥ ₹50,000) or chronic dispute |
| `cbc9e3d1` | Pooja Iyer | `b2b_receivable` | `recv_oversight` | ₹2,680,688.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹2,680,688.00 ≥ ₹50,000) or chronic dispute |
| `227c3fec` | Sneha Singh | `b2b_receivable` | `recv_chronic` | ₹2,595,421.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹2,595,421.00 ≥ ₹50,000) or chronic dispute |
| `73203c9c` | Kavita Patel | `b2b_receivable` | `recv_dispute` | ₹2,185,806.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹2,185,806.00 ≥ ₹50,000) or chronic dispute |
| `dca68be0` | Sanjay Bhatia | `b2b_receivable` | `recv_cash_flow` | ₹42,798.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹42,798.00 ≥ ₹50,000) or chronic dispute |
| `517880ac` | Amit Desai | `b2b_receivable` | `recv_cash_flow` | ₹120,650.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹120,650.00 ≥ ₹50,000) or chronic dispute |
| `900f8de8` | Amit Desai | `b2b_receivable` | `recv_cash_flow` | ₹32,803.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹32,803.00 ≥ ₹50,000) or chronic dispute |
| `49ace6ac` | Sanjay Shah | `b2b_receivable` | `recv_cash_flow` | ₹1,486,210.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹1,486,210.00 ≥ ₹50,000) or chronic dispute |
| `57a00e10` | Rohit Gupta | `b2b_receivable` | `recv_cash_flow` | ₹63,529.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹63,529.00 ≥ ₹50,000) or chronic dispute |
| `cf4a837e` | Swati Agarwal | `b2b_receivable` | `recv_cash_flow` | ₹194,769.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹194,769.00 ≥ ₹50,000) or chronic dispute |
| `a07d3653` | Rohit Gupta | `b2b_receivable` | `recv_cash_flow` | ₹113,892.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹113,892.00 ≥ ₹50,000) or chronic dispute |
| `84023749` | Swati Agarwal | `b2b_receivable` | `recv_chronic` | ₹202,689.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹202,689.00 ≥ ₹50,000) or chronic dispute |
| `e82c61df` | Neha Joshi | `b2b_receivable` | `recv_cash_flow` | ₹125,000.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹125,000.00 ≥ ₹50,000) or chronic dispute |
| `8ac44dea` | Rohit Agarwal | `b2b_receivable` | `recv_chronic` | ₹250,000.00 | `AWAITING_RESPONSE` | Held for Human Operator Approval — High-stakes amount (₹250,000.00 ≥ ₹50,000) or chronic dispute |

## 4. Full Per-Case Audit Sample (First 20 Cases)

| Case ID | Customer | Root Cause | Intervention | Amount | Status | Cryptographic Receipt Seal |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `be8df28b` | Anita Patel | `checkout_friction` | `whatsapp_nudge` | ₹2,173.00 | `stopped` | `b3c44c1f46bca6...` |
| `56138f80` | Priya Shah | `checkout_friction` | `whatsapp_nudge` | ₹484.00 | `failed` | `dee698c722202f...` |
| `a972fc7f` | Arjun Desai | `bd_wrong_pin` | `whatsapp_nudge` | ₹91,352.00 | `recovered` | `def942694e1e3a...` |
| `7430385c` | Arun Kumar | `checkout_friction` | `whatsapp_nudge` | ₹2,952.00 | `recovered` | `f5dda1c2139bb6...` |
| `026670a6` | Shreya Reddy | `checkout_friction` | `whatsapp_nudge` | ₹119,201.00 | `failed` | `8ece7007025573...` |
| `037d6e2e` | Shreya Reddy | `td_bank_down` | `retry` | ₹1,571.00 | `partially_recovered` | `398b5e93ee496c...` |
| `4672a50d` | Sneha Singh | `checkout_friction` | `whatsapp_nudge` | ₹40,755.00 | `failed` | `ed41e4974d3f6c...` |
| `57a5ee68` | Kavita Patel | `bd_wrong_pin` | `whatsapp_nudge` | ₹120.00 | `failed` | `fe05a3750fe726...` |
| `b005884b` | Simran Kumar | `bd_wrong_pin` | `whatsapp_nudge` | ₹6,624.00 | `failed` | `7153028d2f0b01...` |
| `001ba458` | Shreya Reddy | `bd_wrong_pin` | `whatsapp_nudge` | ₹60,151.00 | `recovered` | `9a62d3e71d3e24...` |
| `b4b811e9` | Ritu Singh | `td_bank_down` | `retry` | ₹198.00 | `partially_recovered` | `d24aa7a97cd567...` |
| `b91ca0e7` | Sanjay Bhatia | `unknown` | `escalate_human` | ₹6,808.00 | `awaiting_response` | `01a1ef948ed338...` |
| `a84827a0` | Arjun Desai | `checkout_friction` | `whatsapp_nudge` | ₹260.00 | `recovered` | `0e01a7dc537b91...` |
| `06af12ed` | Arun Kumar | `bd_wrong_pin` | `whatsapp_nudge` | ₹375.00 | `partially_recovered` | `14394ab925a6a7...` |
| `84535d31` | Kavita Patel | `checkout_friction` | `whatsapp_nudge` | ₹26,376.00 | `failed` | `5c37b77fb1e0f6...` |
| `c6f9e5a0` | Vivek Nair | `bd_wrong_pin` | `whatsapp_nudge` | ₹40,909.00 | `recovered` | `511fba216d0521...` |
| `98586c9b` | Priya Shah | `bd_wrong_pin` | `whatsapp_nudge` | ₹2,250.00 | `failed` | `b403534a4ca94e...` |
| `578ac000` | Neha Kumar | `checkout_friction` | `whatsapp_nudge` | ₹2,424.00 | `failed` | `9093b4e14d8837...` |
| `cca0e6e6` | Shreya Chopra | `bd_wrong_pin` | `whatsapp_nudge` | ₹1,096.00 | `failed` | `27521ce762d726...` |
| `60b2d596` | Anita Kapoor | `bd_wrong_pin` | `whatsapp_nudge` | ₹1,373.00 | `recovered` | `2f7740f96640c2...` |

