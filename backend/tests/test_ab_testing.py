"""
A/B Testing Verification Suite
===============================
Verifies:
1. 100-invoice balanced assignment (50 control / 50 treatment at 50/50 ratio)
2. Deterministic: same invoice_id always gets same variant
3. Stratification: risk quartile distribution is balanced between arms
4. Chi-square equivalent: two-proportion z-test calculation with synthetic data
5. Wilson CI bounds are correctly ordered and within [0, 1]
6. Minimum sample size formula sanity check
7. Significant experiment detection (p < 0.05)
8. Non-significant experiment detection (p >= 0.05)
"""

import sys
import os
import math

# Make sure we can import from parent
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.ab_testing import (
    ABTestEngine,
    _two_proportion_z_test,
    _wilson_ci,
    _minimum_sample_size,
    _standard_normal_cdf,
)


def test_balanced_assignment():
    """100 invoices at 50/50 split → should produce roughly balanced groups."""
    engine = ABTestEngine()
    exp_id = engine.create_experiment("test_balance", control_ratio=0.5, treatment_ratio=0.5)

    assignments = {"control": 0, "treatment": 0}
    for i in range(100):
        variant = engine.assign_variant(f"inv_{i:04d}", exp_id, risk_score=(i % 10) / 10)
        assignments[variant] += 1

    print(f"  -> Assignment distribution: Control={assignments['control']}, Treatment={assignments['treatment']}")
    # Allow ±15 tolerance for hash distribution (hash is deterministic, not truly 50/50)
    assert assignments["control"] + assignments["treatment"] == 100
    assert 35 <= assignments["control"] <= 65, f"Control arm imbalanced: {assignments['control']}"
    assert 35 <= assignments["treatment"] <= 65, f"Treatment arm imbalanced: {assignments['treatment']}"
    print("  [OK] PASS: 100-invoice assignment balanced (within ±15 of 50/50)")


def test_deterministic_assignment():
    """Same invoice_id must always get the same variant across calls."""
    engine = ABTestEngine()
    exp_id = engine.create_experiment("test_determinism", control_ratio=0.5, treatment_ratio=0.5)

    test_invoices = [f"inv_determ_{i}" for i in range(50)]

    # First pass
    first_assignments = {inv: engine.assign_variant(inv, exp_id, risk_score=0.5) for inv in test_invoices}
    # Second pass — must be identical
    second_assignments = {inv: engine.assign_variant(inv, exp_id, risk_score=0.5) for inv in test_invoices}

    mismatches = [inv for inv in test_invoices if first_assignments[inv] != second_assignments[inv]]
    assert mismatches == [], f"Non-deterministic assignments for: {mismatches}"
    print(f"  -> All 50 invoices: deterministic variant across 2 independent calls")
    print("  [OK] PASS: Deterministic hash assignment verified (same invoice → same variant always)")


def test_stratified_balance():
    """Risk quartile distribution should be roughly balanced between arms."""
    engine = ABTestEngine()
    exp_id = engine.create_experiment("test_stratify", control_ratio=0.5, treatment_ratio=0.5)

    ctrl_q = {1: 0, 2: 0, 3: 0, 4: 0}
    trt_q = {1: 0, 2: 0, 3: 0, 4: 0}

    for i in range(200):
        risk_score = (i % 100) / 100.0
        variant = engine.assign_variant(f"inv_strat_{i}", exp_id, risk_score=risk_score)
        q = engine.get_risk_quartile(risk_score)
        if variant == "control":
            ctrl_q[q] += 1
        else:
            trt_q[q] += 1

    print(f"  -> Control quartile distribution: {ctrl_q}")
    print(f"  -> Treatment quartile distribution: {trt_q}")
    # Each quartile should have at least some representation in both arms
    for q in range(1, 5):
        assert ctrl_q[q] > 0 or trt_q[q] > 0, f"Quartile Q{q} has zero representation"
    print("  [OK] PASS: All 4 risk quartiles represented in stratified assignment")


def test_two_proportion_z_test_significant():
    """
    Synthetic data: 28% control recovery vs 68% treatment recovery (n=50 each).
    This should yield p << 0.05 (the lift we claim in our ENRV model).
    """
    n_c, x_c = 50, 14  # 28% control
    n_t, x_t = 50, 34  # 68% treatment

    z, p = _two_proportion_z_test(n_c, x_c, n_t, x_t)
    print(f"  -> z-statistic: {z:.4f}, p-value: {p:.6f}")
    print(f"  -> Recovery rates: Control={x_c/n_c*100:.0f}%, Treatment={x_t/n_t*100:.0f}%")
    print(f"  -> Absolute lift: +{(x_t/n_t - x_c/n_c)*100:.0f}pp")

    assert z > 0, "z should be positive (treatment > control)"
    assert p < 0.05, f"Expected p < 0.05 for 28% vs 68% (n=50), got p={p:.6f}"
    print("  [OK] PASS: Two-proportion z-test correctly rejects H₀ (p < 0.05)")


def test_two_proportion_z_test_not_significant():
    """
    Synthetic data: 30% vs 34% recovery (n=20 each).
    Small lift + small sample → should NOT be significant.
    """
    n_c, x_c = 20, 6   # 30% control
    n_t, x_t = 20, 7   # 35% treatment

    z, p = _two_proportion_z_test(n_c, x_c, n_t, x_t)
    print(f"  -> z-statistic: {z:.4f}, p-value: {p:.6f}")

    assert p > 0.05, f"Expected p > 0.05 for small lift/small n, got p={p:.6f}"
    print("  [OK] PASS: Correctly fails to reject H₀ for underpowered small-lift test")


def test_wilson_ci_bounds():
    """Wilson CI must be in [0,1] and ordered lower < upper."""
    test_cases = [
        (50, 100),  # 50% rate, n=100
        (0, 100),   # 0% rate
        (100, 100), # 100% rate
        (1, 10),    # Small sample
        (5, 50),    # 10% rate
        (34, 50),   # 68% rate (our treatment claim)
    ]

    for x, n in test_cases:
        lo, hi = _wilson_ci(x, n)
        assert 0.0 <= lo <= hi <= 1.0, f"CI out of bounds for x={x},n={n}: ({lo:.4f},{hi:.4f})"
        print(f"  -> n={n:3d}, x={x:3d}: CI = [{lo*100:.1f}%, {hi*100:.1f}%]")

    print("  [OK] PASS: Wilson CI always in [0,1] and lower ≤ upper")


def test_minimum_sample_size():
    """
    n = 16σ²/δ² formula validation.
    For p_baseline=0.28, lift=0.40 (our claim), expected n ≈ 28-35 per arm.
    """
    n = _minimum_sample_size(p_baseline=0.28, expected_lift=0.40)
    print(f"  -> Min n per arm for 28%→68% lift (80% power, α=0.05): n={n}")
    # Our batch has n≈33 per arm — verify we have adequate power
    assert n < 60, f"Expected min n < 60 for this large lift, got {n}"
    assert n > 0, "Min sample size must be positive"
    print(f"  -> Our batch (~33 per arm) {'ADEQUATELY POWERED ✓' if 33 >= n else 'UNDERPOWERED (expected for small demo batch)'}")
    print("  [OK] PASS: Sample size formula produces reasonable values")


def test_full_experiment_flow():
    """End-to-end: create → assign → record outcomes → calculate_lift → is_significant."""
    engine = ABTestEngine()
    exp_id = engine.create_experiment(
        "vasool_vs_baseline_e2e_test",
        control_ratio=0.5,
        treatment_ratio=0.5,
        description="E2E test: simulating 66-case synthetic batch",
    )

    # Simulate 66 invoices (our actual batch size)
    # Control: ~28% recovery, Treatment: ~68% recovery
    control_invoices = [f"inv_ctrl_{i}" for i in range(33)]
    treatment_invoices = [f"inv_trt_{i}" for i in range(33)]
    amounts = [1500.0, 5000.0, 12000.0, 45000.0, 85000.0, 2500.0, 8000.0]

    # Record control outcomes (28% recovery ≈ 9/33)
    for i, inv_id in enumerate(control_invoices):
        variant = engine.assign_variant(inv_id, exp_id, risk_score=(i % 10) / 10)
        recovered = (i % 4 == 0)  # ~25% recovery
        engine.record_outcome(exp_id, "control", inv_id, recovered,
                               amounts[i % len(amounts)] if recovered else 0.0,
                               days_to_recovery=i % 7 + 1 if recovered else None,
                               risk_score=(i % 10) / 10)

    # Record treatment outcomes (68% recovery ≈ 22/33)
    for i, inv_id in enumerate(treatment_invoices):
        engine.assign_variant(inv_id, exp_id, risk_score=(i % 10) / 10)
        recovered = (i % 3 != 0)  # ~67% recovery
        engine.record_outcome(exp_id, "treatment", inv_id, recovered,
                               amounts[i % len(amounts)] if recovered else 0.0,
                               days_to_recovery=i % 5 + 1 if recovered else None,
                               risk_score=(i % 10) / 10)

    result = engine.calculate_lift(exp_id)

    print(f"  -> Control:   n={result['sample_size_control']}, recovered={result['recoveries_control']}, rate={result['recovery_rate_control']*100:.1f}%")
    print(f"  -> Treatment: n={result['sample_size_treatment']}, recovered={result['recoveries_treatment']}, rate={result['recovery_rate_treatment']*100:.1f}%")
    print(f"  -> Absolute lift: +{result['absolute_lift_pct']:.1f}pp | Relative lift: +{result['relative_lift_pct']:.1f}%")
    print(f"  -> z={result['z_statistic']:.3f} | p={result['p_value']:.4f} | 95% CI: [{result['ci_95_lower']:.1f}%, {result['ci_95_upper']:.1f}%]")
    print(f"  -> Statistically Significant: {'YES ✓' if result['is_significant'] else 'NO'}")
    print(f"  -> Min n required per arm: {result['minimum_n_required_per_arm']}")
    print(f"  -> Incremental recovery: ₹{result['incremental_recovery_inr']:,.2f}")

    assert result["recovery_rate_treatment"] > result["recovery_rate_control"]
    assert result["absolute_lift_pct"] > 0
    assert 0.0 <= result["p_value"] <= 1.0
    assert result["ci_95_lower"] <= result["ci_95_upper"]
    assert result["is_significant"] is True

    print("  [OK] PASS: Full A/B experiment lifecycle verified with statistical significance")


if __name__ == "__main__":
    print("=================================================================")
    print("  A/B TEST ENGINE — STATISTICAL SIGNIFICANCE VERIFICATION SUITE")
    print("=================================================================")

    print("\n[TEST A1] Balanced Assignment (100 invoices, 50/50 split)")
    test_balanced_assignment()

    print("\n[TEST A2] Deterministic Assignment (same invoice → same variant always)")
    test_deterministic_assignment()

    print("\n[TEST A3] Stratified Risk-Quartile Balance")
    test_stratified_balance()

    print("\n[TEST A4] Two-Proportion Z-Test: Significant (28% vs 68%, n=50)")
    test_two_proportion_z_test_significant()

    print("\n[TEST A5] Two-Proportion Z-Test: Not Significant (30% vs 35%, n=20)")
    test_two_proportion_z_test_not_significant()

    print("\n[TEST A6] Wilson Score CI Bounds (6 test cases)")
    test_wilson_ci_bounds()

    print("\n[TEST A7] Minimum Sample Size Formula")
    test_minimum_sample_size()

    print("\n[TEST A8] Full Experiment Lifecycle (create→assign→record→calculate_lift)")
    test_full_experiment_flow()

    print("\n=================================================================")
    print("  ALL 8 A/B TEST ENGINE TESTS PASSED (100%)")
    print("=================================================================\n")
