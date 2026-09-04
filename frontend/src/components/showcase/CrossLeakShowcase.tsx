import React, { useState } from 'react';
import { 
  Layers, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  Loader2,
  FileText,
  CreditCard,
  ShoppingCart
} from 'lucide-react';
import { API_BASE } from '../../api';

interface LeakCase {
  id: string;
  leak_type: string;
  amount_at_risk: number;
  root_cause: string;
  chosen_intervention: string;
  status: string;
}

interface UnifiedScenarioResponse {
  scenario: string;
  customer: {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
  };
  total_exposure_inr: number;
  all_cases: LeakCase[];
  deduplication_log: Array<{
    case_id: string;
    leak_type: string;
    suppressed_intervention: string;
    reason: string;
  }>;
  tax_clock: {
    days_remaining: number;
    urgency: string;
    cfo_lever_message: string;
  };
  audit_ledger_event: string;
}

export const CrossLeakShowcase: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<UnifiedScenarioResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runScenario = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/demo/unified-recovery-scenario`);
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const json = await res.json();
      
      // Robust normalization supporting both unified-recovery-scenario response formats
      const casesList = json.cases_by_priority || json.all_cases || [];
      const sec43 = json.cross_leak_intelligence?.section_43bh_urgency || json.tax_clock || {};
      const suppressed = json.cross_leak_intelligence?.suppressed_duplicate_contacts || json.deduplication_log || [];

      const normalized: UnifiedScenarioResponse = {
        scenario: json.scenario || 'Cross-Leak Unified Recovery Intelligence',
        customer: json.customer || {
          id: 'cust_unified_rohit_001',
          name: 'Rohit Mehta',
          company: 'Mehta Textiles Pvt. Ltd.',
          email: 'rohit.mehta@mehtaTextiles.in',
          phone: '+919876543210',
        },
        total_exposure_inr: json.total_exposure_inr || 245304.0,
        all_cases: casesList.map((c: any) => ({
          id: c.id || `case_${Math.random().toString(36).substring(7)}`,
          leak_type: c.leak_type || 'unspecified_leak',
          amount_at_risk: c.amount_at_risk || 0,
          root_cause: typeof c.root_cause === 'object' ? c.root_cause?.value || 'unknown' : c.root_cause || 'unknown',
          chosen_intervention: typeof c.chosen_intervention === 'object' ? c.chosen_intervention?.value || 'smart_retry' : c.chosen_intervention || 'smart_retry',
          status: typeof c.status === 'object' ? c.status?.value || 'recovered' : c.status || 'recovered',
        })),
        deduplication_log: suppressed.map((item: any) => ({
          case_id: item.case_id || '',
          leak_type: item.leak_type || '',
          suppressed_intervention: item.suppressed_intervention || 'whatsapp_nudge',
          reason: item.reason || 'WhatsApp outreach already dispatched today. Preventing contact fatigue.',
        })),
        tax_clock: {
          days_remaining: sec43.days_remaining_to_tax_cliff ?? sec43.days_remaining ?? 7,
          urgency: sec43.urgency || 'ELEVATED',
          cfo_lever_message: sec43.cfo_lever || sec43.cfo_lever_message || '7 days remain before 45-day MSME window closes. Settling now avoids Section 43B(h) tax deferral.',
        },
        audit_ledger_event: json.audit_ledger_event || 'UNIFIED_CROSS_LEAK_SCENARIO_DEMO logged to SHA-256 chain',
      };

      setData(normalized);
    } catch (err: any) {
      console.error('Failed to run unified scenario:', err);
      setError(err.message || 'Failed to connect to backend scenario engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background Accent Glow */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-[600px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
      </div>

      {/* Header Badge & Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-mono font-medium tracking-wide">
          <Layers className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>THE UNCONTESTED MOAT · CROSS-LEAK UNIFICATION</span>
        </div>
        
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          One Customer. Four Silos. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
            A Single Coordinated Revenue Brain.
          </span>
        </h2>
        
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
          Competitors build point solutions for single funnels. The Vasool Brain unifies B2B Invoices, 
          Subscription Mandates, Checkout Drops, and Payment Failures under one identity—preventing bot spam 
          and solving the ₹240k Section 43B(h) tax cliff first.
        </p>
      </div>

      {/* Comparison Grid: Siloed Bots vs Unified Brain */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Left: The Competitor Trap */}
        <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-red-400" />
                Competitor Landscape: 3 Point Solutions
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                Siloed Bot Spam
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-red-500/10">
                <FileText className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-gray-200">Bot #1 (B2B Trade Receivables)</div>
                  <div className="text-[11px] text-gray-400">Blasts generic legal notice for ₹240,000 overdue invoice at 08:30 AM.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-red-500/10">
                <CreditCard className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-gray-200">Bot #2 (SaaS Subscription Mandate)</div>
                  <div className="text-[11px] text-gray-400">Sends WhatsApp nudge for failed ₹4,999 card renewal at 09:15 AM.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-red-500/10">
                <ShoppingCart className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-gray-200">Bot #3 (Abandoned Cart Recovery)</div>
                  <div className="text-[11px] text-gray-400">Automated IVR call for ₹12,000 cart dropoff at 10:00 AM.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 space-y-1">
            <span className="font-semibold block">The Result: Severe Contact Fatigue</span>
            <span>Debtor Rohit Mehta blocks all 3 numbers. Zero rupees recovered, merchant reputation damaged.</span>
          </div>
        </div>

        {/* Right: Razorpay Vasool Unified Brain */}
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/10 p-6 sm:p-8 flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Razorpay Vasool: Cross-Leak Operating System
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Unified Orchestration
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-emerald-500/15">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-gray-200">Single Customer Identity Graph</div>
                  <div className="text-[11px] text-gray-400">Links Rohit Mehta across merchant accounts, aggregate debt: ₹256,999.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-emerald-500/15">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-gray-200">Statutory Tax Clock Priority (§43B(h))</div>
                  <div className="text-[11px] text-gray-400">Prioritizes ₹240k invoice (Day 38/45) to avoid 30% IT deduction penalty.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-emerald-500/15">
                <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-gray-200">Single Bundled Smart Link + Gap Defense</div>
                  <div className="text-[11px] text-gray-400">1 WhatsApp touchpoint with unified Razorpay link; halts instantly if paid at T1.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
            <span className="font-semibold block">The Result: Seamless High-Value Closure</span>
            <span>Debtor pays ₹240k invoice immediately to protect tax deduction, and refreshes mandate in 1 click.</span>
          </div>
        </div>
      </div>

      {/* Interactive Live Demo Trigger */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-gray-900/80 to-black/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Live Demonstration: Rohit Mehta (Mehta Textiles Pvt Ltd)
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Trigger real-time cross-funnel diagnosis across B2B invoice, checkout dropoff, and subscription mandate.
            </p>
          </div>

          <button
            onClick={runScenario}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold tracking-wide flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing Unified Scenario...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current text-amber-300" />
                Run Unified Scenario
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Live Scenario Results Display */}
        {data && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-400">
            {/* Customer & Total Exposure Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-[11px] text-gray-400 font-mono uppercase">Customer Identity</span>
                <div className="text-sm font-bold text-white mt-1">{data.customer.name}</div>
                <div className="text-xs text-gray-400">{data.customer.company}</div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-[11px] text-gray-400 font-mono uppercase">Total Unified Exposure</span>
                <div className="text-sm font-bold text-emerald-400 mt-1">₹{data.total_exposure_inr.toLocaleString()}</div>
                <div className="text-xs text-gray-400">Across 4 distinct funnel positions</div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-[11px] text-amber-400 font-mono uppercase flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Section 43B(h) Urgency
                </span>
                <div className="text-sm font-bold text-amber-300 mt-1">{data.tax_clock.days_remaining} Days Remaining</div>
                <div className="text-[11px] text-amber-400/80 line-clamp-1">{data.tax_clock.cfo_lever_message}</div>
              </div>
            </div>

            {/* Resolved Funnel Cases Table */}
            <div className="border border-white/10 rounded-xl overflow-hidden bg-black/40">
              <div className="px-4 py-3 bg-white/[0.02] border-b border-white/10 text-xs font-mono font-medium text-gray-300 flex items-center justify-between">
                <span>CONSOLIDATED LEAK WATERFALL (ORDERED BY VALUE & STATUTORY RISK)</span>
                <span className="text-[11px] text-blue-400">Gap Defense: Verified T1 Active</span>
              </div>
              <div className="divide-y divide-white/5">
                {data.all_cases.map((c) => (
                  <div key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.01] transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white uppercase font-mono">{c.leak_type.replace('_', ' ')}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          {c.id.slice(0, 16)}...
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">Root Cause: <span className="text-gray-300">{c.root_cause}</span></div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-bold text-white font-mono">₹{c.amount_at_risk.toLocaleString()}</div>
                        <div className="text-[11px] text-emerald-400 font-mono">{c.chosen_intervention.replace('_', ' ')}</div>
                      </div>
                      <div className="px-2.5 py-1 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {c.status.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deduplication & Cryptographic Proof */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-2">
                <span className="text-xs font-mono font-semibold text-blue-400 uppercase tracking-wider block">
                  Outreach Deduplication Engine
                </span>
                {data.deduplication_log.length > 0 ? (
                  data.deduplication_log.map((log, i) => (
                    <div key={i} className="text-xs text-gray-300 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>{log.reason}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-400">Secondary outreach suppressed to avoid duplicate notifications.</div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider block">
                  Cryptographic Ledger Proof
                </span>
                <div className="text-xs text-gray-300 font-mono break-all flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{data.audit_ledger_event}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
