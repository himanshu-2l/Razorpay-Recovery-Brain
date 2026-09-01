"""
Synthetic Data Generator for Revenue Recovery Brain.

Generates 50+ realistic cases grounded in real statistics:
- NPCI TD rate: ~0.7-0.8%, BD rate: ~5-7%
- Indian SME average payment delay: 73 days vs 30-day terms
- Cart abandonment: ~70% overall, ~25% recoverable
- Subscription churn from payment failure: ~9% involuntary
"""

import random
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any

# Indian first names and company names for realistic data
FIRST_NAMES = [
    "Rajesh", "Priya", "Amit", "Sneha", "Vikram", "Anita", "Suresh", "Kavita",
    "Deepak", "Meera", "Rahul", "Pooja", "Nikhil", "Swati", "Arjun", "Divya",
    "Manoj", "Neha", "Sanjay", "Ritu", "Arun", "Simran", "Kunal", "Anjali",
    "Rohit", "Preeti", "Karan", "Shreya", "Vivek", "Isha"
]

LAST_NAMES = [
    "Sharma", "Patel", "Singh", "Kumar", "Gupta", "Agarwal", "Joshi", "Mehta",
    "Verma", "Reddy", "Nair", "Iyer", "Chopra", "Malhotra", "Kapoor", "Bhatia",
    "Desai", "Shah", "Mishra", "Rao"
]

COMPANY_NAMES = [
    "TechStar Solutions", "Bharat Electronics Pvt Ltd", "Krishna Textiles",
    "Desi Digital Services", "Annapurna Foods", "Vayuputra Logistics",
    "Dharma Consulting", "Shakti Manufacturing", "NexGen Software",
    "Pinnacle Trading Co", "Green Earth Organics", "Metro Build Infra",
    "CloudNine IT Services", "Sagar Marine Exports", "Indigo Pharma",
    "Golden Harvest Agri", "Apex Auto Parts", "Digital Wave Media",
    "Summit Engineering", "Pacific Trade Links"
]

# Razorpay error codes mapped to root causes
RAZORPAY_ERROR_CODES = {
    "BAD_REQUEST_ERROR": {
        "descriptions": [
            "Payment processing cancelled by customer",
            "Payment was not completed on time",
        ],
        "root_cause": "checkout_friction"
    },
    "GATEWAY_ERROR": {
        "descriptions": [
            "Payment processing failed due to error at bank or wallet gateway",
            "Payment processing failed because of a temporary issue at the bank's end",
        ],
        "root_cause": "td_bank_down"
    },
    "SERVER_ERROR": {
        "descriptions": [
            "Payment processing failed due to internal server error",
        ],
        "root_cause": "td_npci_timeout"
    },
}

# Payment failure distribution based on real NPCI stats
PAYMENT_FAILURE_DISTRIBUTION = {
    "td_bank_down": 0.08,           # ~8% of failures are TD
    "td_npci_timeout": 0.04,        # ~4% NPCI infra
    "bd_insufficient_funds": 0.30,   # ~30% balance issues
    "bd_wrong_pin": 0.15,           # ~15% auth failures
    "bd_limit_exceeded": 0.10,      # ~10% limit issues
    "mandate_reauth": 0.08,         # ~8% mandate re-auth (RBI)
    "card_expired": 0.12,           # ~12% expired cards
    "checkout_friction": 0.13,      # ~13% UX/checkout issues
}


def generate_phone():
    return f"+91{random.randint(7000000000, 9999999999)}"


def generate_email(first, last):
    domains = ["gmail.com", "yahoo.com", "outlook.com", "company.co.in"]
    return f"{first.lower()}.{last.lower()}@{random.choice(domains)}"


def generate_customers(count: int = 30) -> List[Dict[str, Any]]:
    """Generate realistic Indian customer profiles."""
    customers = []
    for i in range(count):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        is_business = random.random() < 0.4  # 40% are businesses

        customer = {
            "id": str(uuid.uuid4()),
            "name": f"{first} {last}",
            "email": generate_email(first, last),
            "phone": generate_phone(),
            "company": random.choice(COMPANY_NAMES) if is_business else None,
            "customer_type": "business" if is_business else "individual",
            "total_lifetime_value": round(random.uniform(5000, 500000), 2),
            "risk_score": round(random.uniform(0, 1), 2),
            "created_at": datetime.now(timezone.utc) - timedelta(days=random.randint(30, 365))
        }
        customers.append(customer)
    return customers


def generate_payment_failures(customers: List[Dict], count: int = 20) -> List[Dict[str, Any]]:
    """Generate realistic payment failure transactions with root-cause-grounded distribution."""
    transactions = []
    root_causes = list(PAYMENT_FAILURE_DISTRIBUTION.keys())
    weights = list(PAYMENT_FAILURE_DISTRIBUTION.values())

    for i in range(count):
        customer = random.choice(customers)
        root_cause = random.choices(root_causes, weights=weights, k=1)[0]

        # Map root cause to Razorpay-style error
        if root_cause.startswith("td_"):
            error_code = "GATEWAY_ERROR"
            error_source = "bank"
        elif root_cause.startswith("bd_"):
            error_code = "BAD_REQUEST_ERROR"
            error_source = "customer"
        elif root_cause == "mandate_reauth":
            error_code = "BAD_REQUEST_ERROR"
            error_source = "bank"
        elif root_cause == "card_expired":
            error_code = "BAD_REQUEST_ERROR"
            error_source = "customer"
        else:
            error_code = "BAD_REQUEST_ERROR"
            error_source = "customer"

        payment_methods = ["card", "upi", "netbanking", "wallet"]
        method_weights = [0.35, 0.40, 0.15, 0.10]

        amount = random.choice([
            random.randint(100, 500) * 100,      # ₹100-500 (small)
            random.randint(500, 5000) * 100,     # ₹500-5000 (medium)
            random.randint(5000, 50000) * 100,   # ₹5000-50000 (large)
            random.randint(50000, 200000) * 100,  # ₹50K-2L (high value)
        ])

        txn = {
            "id": str(uuid.uuid4()),
            "customer_id": customer["id"],
            "razorpay_payment_id": f"pay_test_{uuid.uuid4().hex[:14]}",
            "razorpay_order_id": f"order_test_{uuid.uuid4().hex[:14]}",
            "amount": amount,  # In paise
            "currency": "INR",
            "payment_method": random.choices(payment_methods, weights=method_weights, k=1)[0],
            "status": "failed",
            "error_code": error_code,
            "error_description": random.choice(RAZORPAY_ERROR_CODES[error_code]["descriptions"]),
            "error_source": error_source,
            "gateway_response": {
                "error_code": error_code,
                "root_cause_hint": root_cause,
                "bank_reference": f"REF{random.randint(100000, 999999)}",
                "retry_recommended": root_cause.startswith("td_"),
            },
            "is_recurring": root_cause == "mandate_reauth",
            "subscription_id": f"sub_test_{uuid.uuid4().hex[:10]}" if root_cause == "mandate_reauth" else None,
            "attempt_count": random.randint(1, 3),
            "created_at": datetime.now(timezone.utc) - timedelta(
                hours=random.randint(1, 72)
            ),
            "_root_cause": root_cause,  # Ground truth for classifier validation
        }
        transactions.append(txn)
    return transactions


def generate_checkout_abandonments(customers: List[Dict], count: int = 10) -> List[Dict[str, Any]]:
    """Generate checkout abandonment cases."""
    cases = []
    stages = [
        ("payment_method_selection", "checkout_payment_mismatch", 0.25),
        ("card_entry", "checkout_friction", 0.30),
        ("3ds_verification", "checkout_3ds_failure", 0.20),
        ("price_reveal", "checkout_price_shock", 0.25),
    ]

    for i in range(count):
        customer = random.choice([c for c in customers if c["customer_type"] == "individual"])
        stage, root_cause, _ = random.choices(stages, weights=[s[2] for s in stages], k=1)[0]

        amount = random.randint(500, 15000) * 100  # ₹500-15000 in paise

        case = {
            "id": str(uuid.uuid4()),
            "customer_id": customer["id"],
            "order_id": f"order_test_{uuid.uuid4().hex[:14]}",
            "amount": amount,
            "abandonment_stage": stage,
            "time_spent_seconds": random.randint(10, 300),
            "payment_methods_offered": random.choice([
                ["card", "upi", "netbanking"],
                ["card", "netbanking"],  # UPI missing
                ["card", "upi", "netbanking", "wallet"],
            ]),
            "device_type": random.choice(["mobile", "desktop"]),
            "created_at": datetime.now(timezone.utc) - timedelta(
                hours=random.randint(1, 48)
            ),
            "_root_cause": root_cause,
            "_recoverable": root_cause != "checkout_price_shock",  # Price shock = not recoverable
        }
        cases.append(case)
    return cases


def generate_subscription_failures(customers: List[Dict], count: int = 8) -> List[Dict[str, Any]]:
    """Generate failed subscription payment cases."""
    cases = []
    sub_causes = [
        ("sub_mandate_bug", 0.35),    # The documented RBI >15K bug
        ("sub_card_expired", 0.30),
        ("sub_balance", 0.35),
    ]

    for i in range(count):
        customer = random.choice(customers)
        root_cause, _ = random.choices(
            [(c, w) for c, w in sub_causes],
            weights=[w for _, w in sub_causes],
            k=1
        )[0]

        # Mandate bug specifically hits amounts >₹15,000
        if root_cause == "sub_mandate_bug":
            amount = random.randint(15001, 100000) * 100  # >₹15K in paise
        else:
            amount = random.randint(199, 9999) * 100

        case = {
            "id": str(uuid.uuid4()),
            "customer_id": customer["id"],
            "subscription_id": f"sub_test_{uuid.uuid4().hex[:10]}",
            "plan_name": random.choice([
                "Pro Monthly", "Enterprise Annual", "Premium Quarterly",
                "Growth Monthly", "Starter Annual"
            ]),
            "amount": amount,
            "billing_cycle": random.choice(["monthly", "quarterly", "annual"]),
            "consecutive_failures": random.randint(1, 4),
            "mandate_active": root_cause != "sub_mandate_bug",
            "card_expiry": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 90))).strftime("%m/%y") if root_cause == "sub_card_expired" else None,
            "created_at": datetime.now(timezone.utc) - timedelta(
                hours=random.randint(1, 168)
            ),
            "_root_cause": root_cause,
        }
        cases.append(case)
    return cases


def generate_b2b_invoices(customers: List[Dict], count: int = 15) -> List[Dict[str, Any]]:
    """
    Generate B2B overdue invoices.
    Grounded in: Indian SME average payment delay of 73 days against 30-day terms.
    """
    business_customers = [c for c in customers if c["customer_type"] == "business"]
    if len(business_customers) < 5:
        # Ensure enough business customers
        for i in range(5 - len(business_customers)):
            c = customers[i].copy()
            c["customer_type"] = "business"
            c["company"] = random.choice(COMPANY_NAMES)
            business_customers.append(c)

    invoices = []
    recv_causes = [
        ("recv_oversight", 0.40),    # Just forgot / chasing failure
        ("recv_cash_flow", 0.30),    # Genuine cash flow issue
        ("recv_dispute", 0.15),      # Invoice disputed
        ("recv_chronic", 0.15),      # Chronic late payer
    ]

    aging_distribution = [
        (30, 60, 0.30),    # 30-60 days overdue
        (60, 90, 0.25),    # 60-90 days
        (90, 120, 0.20),   # 90-120 days
        (120, 365, 0.15),  # 120+ days
        (1, 30, 0.10),     # 1-30 days (just overdue)
    ]

    for i in range(count):
        customer = random.choice(business_customers)
        root_cause, _ = random.choices(
            [(c, w) for c, w in recv_causes],
            weights=[w for _, w in recv_causes],
            k=1
        )[0]

        aging_range = random.choices(
            aging_distribution,
            weights=[a[2] for a in aging_distribution],
            k=1
        )[0]
        days_overdue = random.randint(aging_range[0], aging_range[1])

        # Indian B2B amounts
        amount = random.choice([
            random.randint(10000, 50000),     # ₹10K-50K
            random.randint(50000, 200000),    # ₹50K-2L
            random.randint(200000, 1000000),  # ₹2L-10L
            random.randint(1000000, 5000000), # ₹10L-50L (big receivables)
        ])

        if days_overdue <= 30:
            aging_bucket = "0-30"
        elif days_overdue <= 60:
            aging_bucket = "31-60"
        elif days_overdue <= 90:
            aging_bucket = "61-90"
        elif days_overdue <= 120:
            aging_bucket = "91-120"
        else:
            aging_bucket = "120+"

        invoice = {
            "id": str(uuid.uuid4()),
            "customer_id": customer["id"],
            "invoice_number": f"INV-{2026}{random.randint(1000, 9999)}",
            "amount": amount,
            "due_date": (datetime.now(timezone.utc) - timedelta(days=days_overdue)).isoformat(),
            "days_overdue": days_overdue,
            "aging_bucket": aging_bucket,
            "payment_terms": random.choice(["NET30", "NET45", "NET60"]),
            "status": "overdue",
            "partial_amount_paid": round(amount * random.choice([0, 0, 0, 0.25, 0.5]), 2),
            "broken_promises": random.randint(0, 3) if root_cause == "recv_chronic" else random.randint(0, 1),
            "contact_count": random.randint(0, 5),
            "last_contact_date": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))).isoformat() if random.random() > 0.3 else None,
            "created_at": (datetime.now(timezone.utc) - timedelta(days=days_overdue + 30)).isoformat(),
            "_root_cause": root_cause,
        }
        invoices.append(invoice)
    return invoices


def generate_full_batch() -> Dict[str, Any]:
    """
    Generate the complete synthetic batch: 50+ cases across all 4 categories.

    Returns all data needed to seed the database and run the recovery brain.
    """
    customers = generate_customers(30)

    payment_failures = generate_payment_failures(customers, 20)
    checkout_abandonments = generate_checkout_abandonments(customers, 10)
    subscription_failures = generate_subscription_failures(customers, 8)
    b2b_invoices = generate_b2b_invoices(customers, 15)

    total_at_risk = (
        sum(t["amount"] / 100 for t in payment_failures) +
        sum(c["amount"] / 100 for c in checkout_abandonments) +
        sum(s["amount"] / 100 for s in subscription_failures) +
        sum(inv["amount"] for inv in b2b_invoices)
    )

    batch = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_cases": len(payment_failures) + len(checkout_abandonments) + len(subscription_failures) + len(b2b_invoices),
        "total_amount_at_risk_inr": round(total_at_risk, 2),
        "breakdown": {
            "payment_failures": len(payment_failures),
            "checkout_abandonments": len(checkout_abandonments),
            "subscription_failures": len(subscription_failures),
            "b2b_invoices": len(b2b_invoices),
        },
        "customers": customers,
        "payment_failures": payment_failures,
        "checkout_abandonments": checkout_abandonments,
        "subscription_failures": subscription_failures,
        "b2b_invoices": b2b_invoices,
    }

    return batch


if __name__ == "__main__":
    import json

    batch = generate_full_batch()
    print(f"Generated {batch['total_cases']} cases")
    print(f"Total ₹ at risk: ₹{batch['total_amount_at_risk_inr']:,.2f}")
    print(f"Breakdown: {batch['breakdown']}")

    # Save to file for inspection
    with open("synthetic_batch.json", "w") as f:
        json.dump(batch, f, indent=2, default=str)
    print("Saved to synthetic_batch.json")
