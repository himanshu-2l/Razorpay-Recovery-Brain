import React, { useState, useEffect, useCallback } from 'react';
import { BarChart2, FlaskConical, TrendingUp, AlertCircle, CheckCircle2, RefreshCw, Info, AlertTriangle } from 'lucide-react';
import { API_BASE } from '../api';

interface StratificationBalance {
  control_quartile_distribution: Record<string, number>;
  treatment_quartile_distribution: Record<string, number>;
}

interface ABExperimentResult {
  experiment_id: string;
  experiment_name: string;
  sample_size_control: number;
  sample_size_treatment: number;
  recoveries_control: number;
  recoveries_treatment: number;
  recovery_rate_control: number;
  recovery_rate_treatment: number;
  absolute_lift_pct: number;
  relative_lift_pct: number;
  z_statistic: number;
  p_value: number;
  ci_95_lower: number;
  ci_95_upper: number;
  is_significant: boolean;
  minimum_n_required_per_arm: number;
  adequately_powered: boolean;
  amount_recovered_control_inr: number;
  amount_recovered_treatment_inr: number;
  incremental_recovery_inr: number;
  stratification_balance: StratificationBalance;
  statistical_note: string;
}

interface ABTestResponse {
  status: string;
  experiment?: ABExperimentResult;
  message?: string;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const MetricCard: React.FC<{
  label: string;
  value: string;
  sub?: string;
  accent?: 'blue' | 'emerald' | 'amber' | 'rose' | 'violet';
  large?: boolean;
}> = ({ label, value, sub, accent = 'blue', large = false }) => {
  const colors = {
    blue:    { border: 'border-blue-500/20',    bg: 'bg-blue-500/5',    text: 'text-blue-400' },
    emerald: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', text: 'text-emerald-400' },
    amber:   { border: 'border-amber-500/20',   bg: 'bg-amber-500/5',   text: 'text-amber-400' },
    rose:    { border: 'border-rose-500/20',    bg: 'bg-rose-500/5',    text: 'text-rose-400' },
    violet:  { border: 'border-violet-500/20',  bg: 'bg-violet-500/5',  text: 'text-violet-400' },
  };
  const c = colors[accent];
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-4 flex flex-col gap-1`}>
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</span>
      <span className={`font-bold ${large ? 'text-3xl' : 'text-xl'} ${c.text}`}>{value}</span>
      {sub && <span className="text-xs text-gray-500">{sub}</span>}
    </div>
  );
};

// Bar comparison chart rendered in pure CSS/SVG (no external deps)
const RecoveryBarChart: React.FC<{
  controlRate: number;
  treatmentRate: number;
  controlN: number;
  treatmentN: number;
}> = ({ controlRate, treatmentRate, controlN, treatmentN }) => {
  const maxH = 140;
  const ctrlH = controlRate * maxH;
  const trtH = treatmentRate * maxH;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-end gap-8 h-44 px-4">
        {/* Control bar */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-semibold text-gray-300">{(controlRate * 100).toFixed(1)}%</span>
          <div
            className="w-16 rounded-t-md bg-gradient-to-t from-slate-600 to-slate-400 transition-all duration-700 ease-out"
            style={{ height: `${ctrlH}px` }}
          />
          <div className="text-center">
            <span className="text-xs font-medium text-gray-400">Control</span>
            <br />
            <span className="text-[10px] text-gray-500 font-mono">3 SMS/Email</span>
            <br />
            <span className="text-[10px] text-gray-600">n={controlN}</span>
          </div>
        </div>

        {/* Treatment bar */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-bold text-emerald-400">{(treatmentRate * 100).toFixed(1)}%</span>
          <div
            className="w-16 rounded-t-md bg-gradient-to-t from-blue-700 to-blue-400 shadow-lg shadow-blue-500/20 transition-all duration-700 ease-out"
            style={{ height: `${trtH}px` }}
          />
          <div className="text-center">
            <span className="text-xs font-medium text-gray-300">Treatment</span>
            <br />
            <span className="text-[10px] text-blue-400 font-mono">Vasool Agent</span>
            <br />
            <span className="text-[10px] text-gray-600">n={treatmentN}</span>
          </div>
        </div>
      </div>

      {/* Lift arrow annotation */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-xs font-semibold text-emerald-400">
          +{((treatmentRate - controlRate) * 100).toFixed(1)}pp absolute lift
          {' · '}+{(((treatmentRate - controlRate) / controlRate) * 100).toFixed(0)}% relative lift
        </span>
      </div>
    </div>
  );
};

// CI visualizer
const ConfidenceIntervalBar: React.FC<{
  lower: number;
  upper: number;
  point: number;
  label: string;
}> = ({ lower, upper, point, label }) => {
  // Scale to [0%, 100%] display space
  const scale = (v: number) => `${Math.max(0, Math.min(100, v))}%`;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-gray-400">{label}</span>
      <div className="relative h-4 rounded-full bg-white/5 border border-white/10 overflow-hidden">
        {/* CI range */}
        <div
          className="absolute top-0 h-full bg-blue-500/30 rounded-full"
          style={{ left: scale(lower), width: `${upper - lower}%` }}
        />
        {/* Point estimate */}
        <div
          className="absolute top-0.5 w-1 h-3 bg-blue-400 rounded-full shadow-md"
          style={{ left: scale(point - 0.5) }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-600 font-mono">
        <span>0%</span>
        <span className="text-blue-400">{lower.toFixed(1)}% – {upper.toFixed(1)}% (95% CI)</span>
        <span>100%</span>
      </div>
    </div>
  );
};

// Quartile stratification balance table
const StratificationTable: React.FC<{ balance: StratificationBalance }> = ({ balance }) => {
  const quarters = [1, 2, 3, 4];
  const ctrl = balance.control_quartile_distribution;
  const trt = balance.treatment_quartile_distribution;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left py-2 text-gray-500 font-medium">Risk Quartile</th>
            <th className="text-center py-2 text-gray-400 font-medium">Control (n)</th>
            <th className="text-center py-2 text-blue-400 font-medium">Treatment (n)</th>
            <th className="text-center py-2 text-gray-500 font-medium">Balance</th>
          </tr>
        </thead>
        <tbody>
          {quarters.map(q => {
            const c = ctrl[q] ?? 0;
            const t = trt[q] ?? 0;
            const total = c + t;
            const ratio = total > 0 ? Math.abs(c - t) / total : 0;
            const balanced = ratio < 0.3;
            return (
              <tr key={q} className="border-b border-white/[0.03]">
                <td className="py-1.5 text-gray-400">Q{q} ({['Low', 'Mid-Low', 'Mid-High', 'High'][q - 1]} Risk)</td>
                <td className="text-center py-1.5 text-gray-300 font-mono">{c}</td>
                <td className="text-center py-1.5 text-blue-300 font-mono">{t}</td>
                <td className="text-center py-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    balanced ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                  }`}>
                    {balanced ? 'Balanced' : 'Skewed'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};


// ── Main Component ─────────────────────────────────────────────────────────────

export const ABTestResults: React.FC = () => {
  const [data, setData] = useState<ABTestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [reseeding, setReseeding] = useState(false);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/ab-test/results`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.warn('A/B test endpoint not available:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReseed = async () => {
    setReseeding(true);
    try {
      await fetch(`${API_BASE}/api/ab-test/reseed`, { method: 'POST' });
      await fetchResults();
    } finally {
      setReseeding(false);
    }
  };

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const exp = data?.experiment;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
        <span className="font-mono text-sm">Loading methodology validation results…</span>
      </div>
    );
  }

  // ── No data state ──────────────────────────────────────────────────────────
  if (!exp || data?.status === 'no_data') {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center space-y-4">
        <FlaskConical className="w-10 h-10 text-gray-500 mx-auto" />
        <p className="text-gray-400 text-sm">No experiment data yet.</p>
        <p className="text-gray-600 text-xs">Generate a batch first, then click Reseed.</p>
        <button
          onClick={handleReseed}
          className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all"
        >
          Reseed Experiment
        </button>
      </div>
    );
  }

  const significant = exp.is_significant;

  return (
    <div className="space-y-6">

      {/* ⚠️ Unmissable Methodology Disclaimer — MUST appear before any results */}
      <div className="flex gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-amber-300 uppercase tracking-wide">
            Methodology Validation — Synthetic Scenario, Not Live-Measured Lift
          </p>
          <p className="text-[11px] text-amber-200/70 leading-relaxed">
            This view demonstrates that the statistical engine (two-proportion z-test, Wilson
            95% CI, sample size formula) is <strong>correctly implemented</strong> against a
            known synthetic scenario. Recovery rates are <strong>assumed</strong> from general
            MSME collections literature (28% control baseline; intervention-specific treatment
            rates) — <strong>not verified Razorpay-published figures</strong> and not
            experimentally observed from a live holdback group. Real A/B measurement requires
            a genuine production holdback group with tracked payment outcomes over weeks/months.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <FlaskConical className="w-4.5 h-4.5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Methodology Validation: Simulated Scenario</h2>
            <p className="text-xs text-gray-500">
              Statistical engine proof · {exp.sample_size_control + exp.sample_size_treatment} synthetic cases · Two-proportion z-test
            </p>
          </div>
        </div>
        <button
          onClick={handleReseed}
          disabled={reseeding}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${reseeding ? 'animate-spin' : ''}`} />
          Reseed
        </button>
      </div>

      {/* Significance Verdict Banner */}
      <div className={`rounded-xl border px-5 py-3.5 flex items-center gap-3 ${
        significant
          ? 'bg-emerald-500/8 border-emerald-500/25'
          : 'bg-rose-500/8 border-rose-500/25'
      }`}>
        {significant
          ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
        }
        <div>
          <p className={`text-sm font-bold ${significant ? 'text-emerald-300' : 'text-rose-300'}`}>
            Statistically Significant: {significant ? 'YES ✓' : 'NO ✗'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            p = {exp.p_value.toFixed(4)}{significant ? ' < 0.05 — reject H₀' : ' ≥ 0.05 — fail to reject H₀'}
            {' · '}z = {exp.z_statistic.toFixed(3)}
            {' · '}95% CI: [{exp.ci_95_lower.toFixed(1)}%, {exp.ci_95_upper.toFixed(1)}%]
          </p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          label="Control Recovery"
          value={`${(exp.recovery_rate_control * 100).toFixed(1)}%`}
          sub={`${exp.recoveries_control}/${exp.sample_size_control} invoices`}
          accent="amber"
        />
        <MetricCard
          label="Treatment Recovery"
          value={`${(exp.recovery_rate_treatment * 100).toFixed(1)}%`}
          sub={`${exp.recoveries_treatment}/${exp.sample_size_treatment} invoices`}
          accent="emerald"
        />
        <MetricCard
          label="Absolute Lift"
          value={`+${exp.absolute_lift_pct.toFixed(1)}pp`}
          sub={`+${exp.relative_lift_pct.toFixed(1)}% relative`}
          accent="blue"
          large
        />
        <MetricCard
          label="Incremental Recovery"
          value={`₹${(exp.incremental_recovery_inr / 1000).toFixed(0)}K`}
          sub="Treatment − Control"
          accent="violet"
        />
      </div>

      {/* Bar Chart + CI Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Bar Chart */}
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-white">Recovery Rate Comparison</span>
          </div>
          <RecoveryBarChart
            controlRate={exp.recovery_rate_control}
            treatmentRate={exp.recovery_rate_treatment}
            controlN={exp.sample_size_control}
            treatmentN={exp.sample_size_treatment}
          />
        </div>

        {/* Statistical Details */}
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-semibold text-white">Statistical Evidence</span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            {[
              { label: 'H₀', value: 'recovery_rate_control = recovery_rate_treatment' },
              { label: 'Test', value: 'Two-proportion z-test (two-tailed)' },
              { label: 'z-stat', value: exp.z_statistic.toFixed(4), highlight: Math.abs(exp.z_statistic) > 1.96 },
              { label: 'p-value', value: exp.p_value.toFixed(6), highlight: exp.p_value < 0.05 },
              { label: 'α', value: '0.05 (95% confidence)' },
              { label: 'Power', value: exp.adequately_powered ? '≥80% (adequately powered)' : '<80% (small demo batch)', highlight: exp.adequately_powered },
              { label: 'Min n/arm', value: `${exp.minimum_n_required_per_arm} (have: ${Math.min(exp.sample_size_control, exp.sample_size_treatment)})` },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="flex gap-2">
                <span className="text-gray-600 w-16 shrink-0">{label}:</span>
                <span className={highlight ? 'text-emerald-400' : 'text-gray-300'}>{value}</span>
              </div>
            ))}
          </div>

          {/* CI bar */}
          <ConfidenceIntervalBar
            lower={exp.ci_95_lower}
            upper={exp.ci_95_upper}
            point={(exp.recovery_rate_treatment * 100)}
            label="95% Wilson CI — Treatment Recovery Rate"
          />
        </div>
      </div>

      {/* Stratification Balance */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white">Risk-Quartile Stratification Balance</span>
          <span className="text-[10px] text-gray-500 ml-1">(prevents selection bias)</span>
        </div>
        <StratificationTable balance={exp.stratification_balance} />
      </div>

      {/* Static statistical note from engine */}
      {exp.statistical_note && (
        <div className="flex gap-2.5 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
          <Info className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-gray-500 leading-relaxed">
            {exp.statistical_note}
          </p>
        </div>
      )}

    </div>
  );
};
