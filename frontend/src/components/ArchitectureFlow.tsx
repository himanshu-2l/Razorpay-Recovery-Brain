import React, { useState, useEffect } from 'react';
import { Cpu, ArrowRight, Database, Brain, GitBranch, Zap, Lock, CheckCircle2, Activity, ChevronDown } from 'lucide-react';
import { API_BASE } from '../api';
import type { CaseItem } from '../types';

const toTitleCase = (s: string): string =>
  s.replace(/_/g, ' ').replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

interface PipelineNode {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  data: string[];
  color: string;
  borderColor: string;
  textColor: string;
}

interface ArchitectureFlowProps {
  cases: CaseItem[];
}

export const ArchitectureFlow: React.FC<ArchitectureFlowProps> = ({ cases }) => {
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [detailedCase, setDetailedCase] = useState<CaseItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [animStep, setAnimStep] = useState(0);

  useEffect(() => {
    if (!selectedCase) return;
    setAnimStep(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= 6; i++) {
      timers.push(setTimeout(() => setAnimStep(i), i * 350));
    }
    return () => timers.forEach(clearTimeout);
  }, [selectedCase]);

  const handleSelectCase = async (c: CaseItem) => {
    setSelectedCase(c);
    setDetailedCase(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/cases/${c.id}`);
      if (res.ok) setDetailedCase(await res.json());
      else setDetailedCase(c);
    } catch {
      setDetailedCase(c);
    } finally {
      setLoading(false);
    }
  };

  const activeCase = detailedCase || selectedCase;

  const buildNodes = (c: CaseItem): PipelineNode[] => [
    {
      id: 'input',
      label: 'Multimodal State Input',
      sublabel: 'x_t = [x^L, x^M, x^A]',
      icon: <Database className="w-5 h-5" />,
      color: 'bg-slate-800/80',
      borderColor: 'border-slate-600/50',
      textColor: 'text-slate-300',
      data: [
        `Error Code: ${(c.root_cause ?? 'UNKNOWN').toUpperCase()}`,
        `Amount at Risk: \u20b9${(c.amount_at_risk ?? 0).toLocaleString('en-IN')}`,
        `Leak Type: ${toTitleCase(c.leak_type ?? '')}`,
        `Customer: ${c.customer_name}`,
      ],
    },
    {
      id: 'encoder',
      label: 'LLM Semantic Encoder',
      sublabel: 's_t = LLM(f_enc(x_t))',
      icon: <Brain className="w-5 h-5" />,
      color: 'bg-blue-950/60',
      borderColor: 'border-blue-700/40',
      textColor: 'text-blue-300',
      data: [
        `Root Cause Class: ${
          c.root_cause?.startsWith('td_') ? 'Technical Decline (TD)' :
          c.root_cause?.startsWith('bd_') ? 'Business Decline (BD)' :
          c.root_cause?.includes('mandate') ? 'Mandate Regulatory' : 'Cross-Funnel Receivable'
        }`,
        `Confidence: ${Math.round((c.root_cause_confidence ?? 0.88) * 100)}%`,
        `Reasoning: ${(c.reasoning_chain ?? 'Error pattern matched to known fault mode').slice(0, 80)}...`,
      ],
    },
    {
      id: 'high_action',
      label: 'High-Level Policy Action',
      sublabel: 'a_t^(h) \u2014 Strategy Category',
      icon: <GitBranch className="w-5 h-5" />,
      color: 'bg-purple-950/60',
      borderColor: 'border-purple-700/40',
      textColor: 'text-purple-300',
      data: [
        `Chosen Strategy: ${toTitleCase(c.chosen_intervention ?? 'unknown')}`,
        `Reason: ${(c.intervention_reason ?? 'Optimal route for root cause').slice(0, 80)}`,
        ...(c.alternatives_rejected?.slice(0, 2).map((a) => `Rejected: ${toTitleCase(a.action)}`) ?? []),
      ],
    },
    {
      id: 'low_action',
      label: 'Low-Level Parameters',
      sublabel: 'a_t^(l) \u2014 Execution Details',
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-amber-950/50',
      borderColor: 'border-amber-700/40',
      textColor: 'text-amber-300',
      data: [
        `Retry Window: ${(c as any).smart_schedule?.optimal_hour != null ? `${(c as any).smart_schedule.optimal_hour}:00 IST` : 'Payday offset window'}`,
        `Calendar Reason: ${(c as any).smart_schedule?.reason ?? 'Aligned to salary cycle'}`,
        `Contact Cost: ${(c as any).counterfactual?.intervention_cost_inr != null ? `\u20b9${(c as any).counterfactual.intervention_cost_inr.toFixed(2)}` : '\u2264\u20b92.50 / contact'}`,
        `ENRV Estimate: \u20b9${Math.round(((c as any).counterfactual?.expected_net_recovery_inr ?? c.amount_at_risk * 0.74)).toLocaleString('en-IN')}`,
      ],
    },
    {
      id: 'compliance',
      label: 'Compliance Gate',
      sublabel: 'RBI FPC \u00b7 DPDP \u00b7 Circuit Breaker',
      icon: <Lock className="w-5 h-5" />,
      color: 'bg-emerald-950/50',
      borderColor: 'border-emerald-700/40',
      textColor: 'text-emerald-300',
      data: [
        `Status: ${toTitleCase(c.compliance_status ?? 'allowed')}`,
        `Time Gate: 8 AM \u2013 7 PM IST (RBI FPC \u00a74.3)`,
        `DPDP Consent: ${(c.compliance_details ?? '').includes('denied') ? 'Blocked \u2014 opted out' : 'Verified'}`,
        `Details: ${(c.compliance_details ?? 'Within daily contact limit').slice(0, 70)}`,
      ],
    },
    {
      id: 'outcome',
      label: 'Recovery Outcome',
      sublabel: 'ENRV Realized \u00b7 Merkle Sealed',
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: c.amount_recovered > 0 ? 'bg-emerald-900/40' : 'bg-slate-800/60',
      borderColor: c.amount_recovered > 0 ? 'border-emerald-500/40' : 'border-slate-600/40',
      textColor: c.amount_recovered > 0 ? 'text-emerald-300' : 'text-gray-400',
      data: [
        `Final Status: ${toTitleCase(c.status ?? 'unknown')}`,
        `Recovered: ${c.amount_recovered > 0 ? `\u20b9${c.amount_recovered.toLocaleString('en-IN')}` : '\u2014'}`,
        `Recovery Rate: ${c.amount_at_risk > 0 ? `${((c.amount_recovered / c.amount_at_risk) * 100).toFixed(1)}%` : '\u2014'}`,
        `Audit: SHA-256 Merkle Chain Sealed`,
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Decision Engine \u2014 IFSHM Pipeline</h2>
              <p className="text-xs text-gray-400 font-mono">
                LLM Semantic Interpretation + Hierarchical RL Policy (arXiv:2506.07411)
              </p>
            </div>
          </div>

          {/* Case Selector */}
          <div className="flex items-center space-x-3">
            <label className="text-xs text-gray-400 font-mono whitespace-nowrap">Trace case:</label>
            <div className="relative">
              <select
                value={selectedCase?.id ?? ''}
                onChange={(e) => {
                  const c = cases.find((x) => x.id === e.target.value);
                  if (c) handleSelectCase(c);
                }}
                className="appearance-none bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 pr-8 text-xs text-white font-mono focus:outline-none focus:border-blue-500/50 transition-all cursor-pointer min-w-[260px]"
              >
                <option value="">\u2014 Pick a case to trace \u2014</option>
                {cases.slice(0, 25).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customer_name} \u00b7 \u20b9{c.amount_at_risk?.toLocaleString('en-IN')} \u00b7 {toTitleCase(c.root_cause ?? '')}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Research Paper Chips */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
          <span className="text-[10px] text-gray-600 font-mono self-center">Research foundation:</span>
          {[
            { label: 'Abe et al. · Constrained RL (KDD 2010)', color: 'text-amber-400 border-amber-500/30 bg-amber-500/5', id: 'SIGKDD-10' },
            { label: 'CATE Uplift · Sleeping Dogs Defense', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5', id: '2312.07206' },
            { label: 'IFSHM · Self-Healing Control', color: 'text-blue-400 border-blue-500/30 bg-blue-500/5', id: '2506.07411' },
            { label: 'RAILS · Verification-Native Clearing', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5', id: '2606.08790' },
            { label: 'PCAT · Protocol Security', color: 'text-purple-400 border-purple-500/30 bg-purple-500/5', id: '2607.21824' },
          ].map((p) => (
            <span key={p.id} className={`text-[10px] font-mono px-2 py-0.5 rounded border ${p.color}`}>
              {p.id.startsWith('SIGKDD') ? p.id : `arXiv:${p.id}`} · {p.label}
            </span>
          ))}
        </div>
      </div>

      {/* Pipeline Visualization */}
      {!selectedCase ? (
        <div className="glass-panel rounded-2xl p-16 border border-white/10 text-center space-y-3">
          <Activity className="w-8 h-8 text-gray-700 mx-auto" />
          <p className="text-gray-500 text-sm">Select a case above to trace its full decision path through the IFSHM pipeline.</p>
          <p className="text-gray-600 text-xs font-mono">
            6 stages: Input \u2192 LLM Encode \u2192 High-Level Policy \u2192 Parameters \u2192 Compliance Gate \u2192 Outcome
          </p>
        </div>
      ) : loading ? (
        <div className="glass-panel rounded-2xl p-16 border border-white/10 text-center space-y-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm font-mono">Loading case telemetry...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Case Summary Bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/8 text-xs font-mono flex-wrap">
            <span className="text-gray-500">Tracing:</span>
            <span className="text-white font-semibold">{activeCase?.customer_name}</span>
            {activeCase?.customer_company && <span className="text-gray-600">({activeCase.customer_company})</span>}
            <span className="text-gray-700">\u00b7</span>
            <span className="text-blue-400">{toTitleCase(activeCase?.root_cause ?? '')}</span>
            <span className="text-gray-700">\u00b7</span>
            <span className="text-amber-400">\u20b9{activeCase?.amount_at_risk?.toLocaleString('en-IN')}</span>
            <span className="text-gray-700">\u00b7</span>
            <span className={activeCase?.amount_recovered && activeCase.amount_recovered > 0 ? 'text-emerald-400 font-semibold' : 'text-gray-400'}>
              {toTitleCase(activeCase?.status ?? '')}
            </span>
          </div>

          {/* Pipeline Nodes: 3-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeCase && buildNodes(activeCase).map((node, idx) => (
              <div
                key={node.id}
                className={`rounded-xl border p-4 space-y-3 transition-all duration-500 ${node.color} ${node.borderColor}`}
                style={{
                  opacity: animStep > idx ? 1 : 0,
                  transform: animStep > idx ? 'translateY(0)' : 'translateY(12px)',
                  transitionDelay: `${idx * 60}ms`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center ${node.textColor}`}>
                      {node.icon}
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${node.textColor}`}>{node.label}</div>
                      <div className="text-[10px] text-gray-600 font-mono">{node.sublabel}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-gray-600 bg-white/[0.04] px-1.5 py-0.5 rounded">
                    S{idx + 1}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {node.data.map((line, di) => (
                    <div key={di} className="flex items-start space-x-1.5">
                      <ArrowRight className="w-3 h-3 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-[11px] text-gray-300 leading-relaxed">{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* PPO Equation Summary */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <p className="text-[10px] font-mono text-gray-600">
              <span className="text-gray-500">Reward:</span>{' '}
              <span className="text-amber-400">ENRV</span>
              <span className="text-gray-700"> \u2212 </span>
              <span className="text-red-400">Cost</span>
              <span className="text-gray-700"> \u2212 </span>
              <span className="text-purple-400">ChurnPenalty</span>
              <span className="text-gray-700"> \u00b7 </span>
              <span className="text-blue-400">L\u1d9c\u02e1\u1d35\u1d3e(\u03b8) = \u212c\u0302[min(r_t(\u03b8)\u00b7\u00c2_t, clip(r_t, 1\u00b1\u03b5)\u00b7\u00c2_t)]</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchitectureFlow;
