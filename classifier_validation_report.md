# Diagnosis Classifier Held-Out Validation Report

> **Synthetic Data Disclosure:** The underlying dataset used for this benchmark consists of **500 synthetic transactions and invoices** generated according to known NPCI, RBI, and SME payment failure distributions. An **80/20 train/test split** was enforced (400 calibration / 100 held-out). Metrics below represent performance on the **100 untouched held-out samples** and should be interpreted as structural validation of the deterministic diagnosis rules rather than live bank telemetry.

## 1. Overall Classifier Summary

| Metric | Result | Interpretation |
| :--- | :---: | :--- |
| **Held-Out Test Set Size** | `100 samples` | Strictly untouched during rule calibration |
| **Overall Accuracy** | `100.0%` | Correct classification rate on held-out split |
| **Macro F1 Score** | `1.000` | Unweighted mean of class F1 scores |
| **Average Inference Latency** | `0.005 ms / item` | Microsecond-speed deterministic rule evaluation |

## 2. Per-Class Precision, Recall, and F1

| Class Name | Support | True Positives (TP) | False Positives (FP) | False Negatives (FN) | Precision | Recall | F1 Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`TD_INFRASTRUCTURE`** | `17` | `17` | `0` | `0` | `1.000` | `1.000` | **`1.000`** |
| **`BD_CUSTOMER_AUTH`** | `25` | `25` | `0` | `0` | `1.000` | `1.000` | **`1.000`** |
| **`MANDATE_REAUTH`** | `27` | `27` | `0` | `0` | `1.000` | `1.000` | **`1.000`** |
| **`CHECKOUT_UX_FRICTION`** | `20` | `20` | `0` | `0` | `1.000` | `1.000` | **`1.000`** |
| **`B2B_RECEIVABLE_AGING`** | `11` | `11` | `0` | `0` | `1.000` | `1.000` | **`1.000`** |

## 3. Confusion Matrix (Held-Out Test Set)

| Actual \ Predicted | `TD_INFRAST` | `BD_CUSTOME` | `MANDATE_RE` | `CHECKOUT_U` | `B2B_RECEIV` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`TD_INFRAST`** | `17` | `0` | `0` | `0` | `0` |
| **`BD_CUSTOME`** | `0` | `25` | `0` | `0` | `0` |
| **`MANDATE_RE`** | `0` | `0` | `27` | `0` | `0` |
| **`CHECKOUT_U`** | `0` | `0` | `0` | `20` | `0` |
| **`B2B_RECEIV`** | `0` | `0` | `0` | `0` | `11` |

