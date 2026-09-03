# Diagnosis Classifier Held-Out Validation Report

> **Synthetic Data Disclosure:** The underlying dataset used for this benchmark consists of **500 synthetic transactions and invoices** generated according to known NPCI, RBI, and SME payment failure distributions. An **80/20 train/test split** was enforced (400 calibration / 100 held-out). Metrics below represent performance on the **100 untouched held-out samples** and should be interpreted as structural validation of the deterministic diagnosis rules rather than live bank telemetry.

## 1. Overall Classifier Summary (Side-by-Side Comparison)

| Evaluation Scope | Total Classes | Held-Out Test Size | Overall Accuracy | Macro F1 Score | Avg Inference Latency |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Coarse 5-Bucket View** | `5 classes` | `100 samples` | **`100.0%`** | `1.000` | `0.006 ms / item` |
| **Fine-Grained View (Uncollapsed)** | `16 classes` | `100 samples` | **`95.0%`** | `0.940` | `0.006 ms / item` |

> **Methodological Note on Coarse vs. Fine-Grained Accuracy:**  
> The coarse 5-bucket view groups statistically similar business-decline sub-types (`bd_insufficient_funds`, `bd_wrong_pin`, `bd_limit_exceeded`, `card_expired`) into broad operational archetypes. The fine-grained view evaluates true per-cause discrimination across all individual failure mechanisms with zero collapsing.
> The fine-grained accuracy is naturally lower because real-world gateway descriptions (e.g. distinguishing daily limit ceilings vs balance depletion vs card validity lapse) contain natural semantic variations that occasionally fall back to generic heuristics. The uncollapsed metric is the more credible, transparent baseline to lead with.

## 2. Coarse 5-Bucket Evaluation

### Per-Class Precision, Recall, and F1 (Coarse)

| Class Name | Support | True Positives (TP) | False Positives (FP) | False Negatives (FN) | Precision | Recall | F1 Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`TD_INFRASTRUCTURE`** | `18` | `18` | `0` | `0` | `1.000` | `1.000` | **`1.000`** |
| **`BD_CUSTOMER_AUTH`** | `24` | `24` | `0` | `0` | `1.000` | `1.000` | **`1.000`** |
| **`MANDATE_REAUTH`** | `14` | `14` | `0` | `0` | `1.000` | `1.000` | **`1.000`** |
| **`CHECKOUT_UX_FRICTION`** | `22` | `22` | `0` | `0` | `1.000` | `1.000` | **`1.000`** |
| **`B2B_RECEIVABLE_AGING`** | `22` | `22` | `0` | `0` | `1.000` | `1.000` | **`1.000`** |

### Confusion Matrix (Coarse)

| Actual \ Predicted | `TD_INFRAST` | `BD_CUSTOME` | `MANDATE_RE` | `CHECKOUT_U` | `B2B_RECEIV` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`TD_INFRAST`** | `18` | `0` | `0` | `0` | `0` |
| **`BD_CUSTOME`** | `0` | `24` | `0` | `0` | `0` |
| **`MANDATE_RE`** | `0` | `0` | `14` | `0` | `0` |
| **`CHECKOUT_U`** | `0` | `0` | `0` | `22` | `0` |
| **`B2B_RECEIV`** | `0` | `0` | `0` | `0` | `22` |

## 3. Fine-Grained Validation (Uncollapsed)

### Per-Class Precision, Recall, and F1 (Uncollapsed RootCause Enum)

| Root Cause (Enum Value) | Support | TP | FP | FN | Precision | Recall | F1 Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`bd_insufficient_funds`** | `8` | `8` | `0` | `0` | `1.000` | `1.000` | **`1.000`** |
| **`bd_limit_exceeded`** | `6` | `6` | `0` | `0` | `1.000` | `1.000` | **`1.000`** |
| **`bd_wrong_pin`** | `4` | `4` | `4` | `0` | `0.500` | `1.000` | **`0.667`** |
| **`card_expired`** | `6` | `2` | `0` | `4` | `1.000` | `0.333` | **`0.500`** |
| **`checkout_3ds_failure`** | `3` | `3` | `0` | `0` | `1.000` | `1.000` | **`1.000`** |
| **`checkout_friction`** | `10` | `10` | `0` | `0` | `1.000` | `1.000` | **`1.000`** |
| **`checkout_payment_mismatch`** | `4` | `4` | `0` | `0` | `1.000` | `1.000` | **`1.000`** |
| **`checkout_price_shock`** | `5` | `5` | `0` | `0` | `1.000` | `1.000` | **`1.000`** |
| **`mandate_reauth`** | `6` | `6` | `0` | `0` | `1.000` | `1.000` | **`1.000`** |
| **`recv_cash_flow`** | `6` | `6` | `0` | `0` | `1.000` | `1.000` | **`1.000`** |
| **`recv_chronic`** | `6` | `6` | `0` | `0` | `1.000` | `1.000` | **`1.000`** |
| **`recv_dispute`** | `5` | `5` | `0` | `0` | `1.000` | `1.000` | **`1.000`** |
| **`recv_oversight`** | `5` | `5` | `0` | `0` | `1.000` | `1.000` | **`1.000`** |
| **`sub_mandate_bug`** | `8` | `8` | `0` | `0` | `1.000` | `1.000` | **`1.000`** |
| **`td_bank_down`** | `12` | `12` | `1` | `0` | `0.923` | `1.000` | **`0.960`** |
| **`td_npci_timeout`** | `6` | `5` | `0` | `1` | `1.000` | `0.833` | **`0.909`** |

### Confusion Matrix (Uncollapsed RootCause Enum)

| Actual \ Pred | `bd_insuf` | `bd_limit` | `bd_wrong` | `card_exp` | `checkout` | `checkout` | `checkout` | `checkout` | `mandate_` | `recv_cas` | `recv_chr` | `recv_dis` | `recv_ove` | `sub_mand` | `td_bank_` | `td_npci_` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`bd_insufficien`** | `8` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` |
| **`bd_limit_excee`** | `0` | `6` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` |
| **`bd_wrong_pin`** | `0` | `0` | `4` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` |
| **`card_expired`** | `0` | `0` | `4` | `2` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` |
| **`checkout_3ds_f`** | `0` | `0` | `0` | `0` | `3` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` |
| **`checkout_frict`** | `0` | `0` | `0` | `0` | `0` | `10` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` |
| **`checkout_payme`** | `0` | `0` | `0` | `0` | `0` | `0` | `4` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` |
| **`checkout_price`** | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `5` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` |
| **`mandate_reauth`** | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `6` | `0` | `0` | `0` | `0` | `0` | `0` | `0` |
| **`recv_cash_flow`** | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `6` | `0` | `0` | `0` | `0` | `0` | `0` |
| **`recv_chronic`** | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `6` | `0` | `0` | `0` | `0` | `0` |
| **`recv_dispute`** | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `5` | `0` | `0` | `0` | `0` |
| **`recv_oversight`** | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `5` | `0` | `0` | `0` |
| **`sub_mandate_bu`** | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `8` | `0` | `0` |
| **`td_bank_down`** | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `12` | `0` |
| **`td_npci_timeou`** | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `1` | `5` |

## 4. Known Limitations & Misclassification Analysis

### Identified Misclassifications (5 cases with fine-grained discrepancy)

| True Root Cause | Predicted Cause | Leak Type | Input Key Signals | Diagnosed Reasoning |
| :--- | :--- | :--- | :--- | :--- |
| `card_expired` | `bd_wrong_pin` | `payment_failure` | `{'error_code': 'BAD_REQUEST_ERROR', 'error_source': 'customer', '...` | Error code BAD_REQUEST_ERROR from source 'customer' → known pattern: bd_wrong_pi... |
| `card_expired` | `bd_wrong_pin` | `payment_failure` | `{'error_code': 'BAD_REQUEST_ERROR', 'error_source': 'customer', '...` | Error code BAD_REQUEST_ERROR from source 'customer' → known pattern: bd_wrong_pi... |
| `td_npci_timeout` | `td_bank_down` | `payment_failure` | `{'error_code': 'SERVER_ERROR', 'error_source': 'bank', 'error_des...` | Error code SERVER_ERROR from source 'bank' → known pattern: td_npci_timeout Desc... |
| `card_expired` | `bd_wrong_pin` | `payment_failure` | `{'error_code': 'BAD_REQUEST_ERROR', 'error_source': 'customer', '...` | Error code BAD_REQUEST_ERROR from source 'customer' → known pattern: bd_wrong_pi... |
| `card_expired` | `bd_wrong_pin` | `payment_failure` | `{'error_code': 'BAD_REQUEST_ERROR', 'error_source': 'customer', '...` | Error code BAD_REQUEST_ERROR from source 'customer' → known pattern: bd_wrong_pi... |

## 5. Real-World Telemetry Limitations & Fallback Strategy

1. **Answer Leakage Removed:** The system contains zero synthetic shortcut fields. The engine classifies strictly on realistic webhook signals (`error_code`, `error_source`, `error_description`, `amount`, `is_recurring`, `attempt_count`).
2. **Downstream ENRV Protection:** Low-confidence fine-grained classifications dynamically widen P10-P90 uncertainty spreads in `intervention_router.py`, preventing false precision in financial recovery forecasting.
3. **Unstructured Gateway Noise & LLM Fallback:** In production bank integrations, bank switches occasionally return generic `BAD_REQUEST_ERROR` with uninformative descriptions like *'Payment processing failed'*. For such edge cases where deterministic rules cannot establish >70% confidence, the engine falls back to LLM reasoning chain (`llm_service.py`) for semantic disambiguation.
4. **Mandate Thresholds:** Recurring payments above ₹15,000 are deterministically flagged for AFA re-authorization per RBI's e-mandate framework.

