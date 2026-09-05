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

const toTitleCase = (s: string): string =>
  s.replace(/_/g, ' ').replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

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
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#17202e] border-t border-white/10 text-white">
      {/* Header Badge & Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#202a3e] border border-[#305EFF]/40 text-xs font-semibold text-[#305EFF]">
          <Layers className="w-3.5 h-3.5 text-[#305EFF]" />
          <span>CROSS-LEAK UNIFICATION ENGINE</span>
        </div>
        
        <h2 className="text-3xl sm:text-5xl font-bold font-['Open_Sans'] tracking-[-0.036em] text-white leading-tight">
          One Customer. Four Silos. <br />
          <span className="text-[#305EFF]">
            A Single Coordinated Revenue Brain.
          </span>
        </h2>
        
        <p className="text-sm sm:text-base font-['Open_Sans'] leading-relaxed text-[#cdd0d6]">
          Competitors build point solutions for single funnels. Revenue Recovery Brain unifies B2B Invoices, 
          Subscription Mandates, Checkout Drops, and Payment Failures under one identity—preventing bot spam 
          and solving the ₹240k Section 43B(h) tax cliff first.
        </p>
      </div>

      {/* Comparison Grid: Siloed Bots vs Unified Brain */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14 text-left">
        
        {/* Left: The Competitor Trap */}
        <div className="rounded-[15px] bg-[#202a3e] border border-white/10 p-6 sm:p-8 flex flex-col justify-between space-y-6 relative">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-red-400 flex items-center gap-1.5 font-['Open_Sans']">
                <XCircle className="w-4 h-4 text-red-400" />
                Competitor Point Solutions
              </span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-red-950/40 text-red-300 border border-red-800/40">
                Siloed Bot Spam
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-[10px] bg-[#17202e] border border-white/5">
                <FileText className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white font-['Open_Sans']">Bot #1 (B2B Trade Receivables)</div>
                  <div className="text-xs text-[#cdd0d6]">Blasts generic legal notice for ₹240,000 overdue invoice at 08:30 AM.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-[10px] bg-[#17202e] border border-white/5">
                <CreditCard className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white font-['Open_Sans']">Bot #2 (SaaS Subscription Mandate)</div>
                  <div className="text-xs text-[#cdd0d6]">Sends WhatsApp nudge for failed ₹4,999 card renewal at 09:15 AM.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-[10px] bg-[#17202e] border border-white/5">
                <ShoppingCart className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white font-['Open_Sans']">Bot #3 (Abandoned Cart Recovery)</div>
                  <div className="text-xs text-[#cdd0d6]">Automated IVR call for ₹12,000 cart dropoff at 10:00 AM.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-[10px] bg-[#17202e] border border-red-900/30 text-xs text-[#cdd0d6] space-y-1">
            <span className="font-semibold text-red-300 block">The Result: Severe Contact Fatigue</span>
            <span>Debtor Rohit Mehta blocks all 3 numbers. Zero rupees recovered, merchant reputation damaged.</span>
          </div>
        </div>

        {/* Right: Revenue Recovery Brain — Unified Cross-Leak OS */}
        <div className="rounded-[15px] bg-[#202a3e] border border-[#305EFF]/40 p-6 sm:p-8 flex flex-col justify-between space-y-6 relative">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#305EFF] flex items-center gap-1.5 font-['Open_Sans']">
                <CheckCircle2 className="w-4 h-4 text-[#305EFF]" />
                Revenue Recovery Brain
              </span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#17202e] text-[#305EFF] border border-[#305EFF]/40">
                Unified Orchestration
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-[10px] bg-[#17202e] border border-white/5">
                <ShieldCheck className="w-4 h-4 text-[#305EFF] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white font-['Open_Sans']">Single Customer Identity Graph</div>
                  <div className="text-xs text-[#cdd0d6]">Links Rohit Mehta across merchant accounts, aggregate debt: ₹256,999.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-[10px] bg-[#17202e] border border-white/5">
                <Clock className="w-4 h-4 text-[#305EFF] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white font-['Open_Sans']">Statutory Tax Clock Priority (§43B(h))</div>
                  <div className="text-xs text-[#cdd0d6]">Prioritizes ₹240k invoice (Day 38/45) to avoid 30% IT deduction penalty.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-[10px] bg-[#17202e] border border-white/5">
                <Sparkles className="w-4 h-4 text-[#305EFF] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white font-['Open_Sans']">Single Bundled Smart Link + Gap Defense</div>
                  <div className="text-xs text-[#cdd0d6]">1 WhatsApp touchpoint with unified link; halts instantly if paid at T1.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-[10px] bg-[#17202e] border border-[#305EFF]/30 text-xs text-[#cdd0d6] space-y-1">
            <span className="font-semibold text-[#305EFF] block">The Result: Seamless High-Value Closure</span>
            <span>Debtor pays ₹240k invoice immediately to protect tax deduction, and refreshes mandate in 1 click.</span>
          </div>
        </div>
      </div>

      {/* Interactive Live Demo Notebook */}
      <div className="rounded-[15px] bg-[#202a3e] border border-white/10 p-6 sm:p-8 space-y-6 text-left relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-['Open_Sans'] flex items-center gap-2 text-white">
              <Zap className="w-4 h-4 text-[#305EFF]" />
              Live Demonstration: Rohit Mehta (Mehta Textiles Pvt Ltd)
            </h3>
            <p className="text-xs sm:text-sm font-['Open_Sans'] text-[#cdd0d6] mt-1">
              Trigger real-time cross-funnel diagnosis across B2B invoice, checkout dropoff, and subscription mandate.
            </p>
          </div>

          <button
            onClick={runScenario}
            disabled={loading}
            className="idle-btn-primary text-xs px-6 py-2.5 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Orchestrating Brain...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run Cross-Leak Diagnosis</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/40 text-xs text-red-300">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Customer Summary & Tax Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-[10px] bg-[#17202e] border border-white/10">
                <span className="text-xs font-mono text-[#cdd0d6]/70 block">Identified Debtor</span>
                <span className="text-base font-bold text-white block mt-0.5">{data.customer.name}</span>
                <span className="text-xs text-[#cdd0d6]/80">{data.customer.company}</span>
              </div>

              <div className="p-4 rounded-[10px] bg-[#17202e] border border-white/10">
                <span className="text-xs font-mono text-[#cdd0d6]/70 block">Total Cross-Funnel Exposure</span>
                <span className="text-xl font-bold font-mono text-[#305EFF] block mt-0.5">
                  ₹{data.total_exposure_inr.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-[#cdd0d6]/80">{data.all_cases.length} Intercepted Leaks Combined</span>
              </div>

              <div className="p-4 rounded-[10px] bg-[#17202e] border border-white/10">
                <span className="text-xs font-mono text-[#305EFF] block">Section 43B(h) Clock</span>
                <span className="text-xl font-bold font-mono text-white block mt-0.5">
                  {data.tax_clock.days_remaining} Days to Tax Cliff
                </span>
                <span className="text-xs font-semibold text-[#305EFF]">{data.tax_clock.urgency} Urgency</span>
              </div>
            </div>

            {/* Unified Leaks in Priority Order */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#cdd0d6]/70 block">
                Cases Resolved & Prioritized By Statutory Urgency:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.all_cases.map((c, i) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-[10px] bg-[#17202e] border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className={i === 0 ? 'text-[#305EFF] font-bold' : 'text-[#cdd0d6]/70'}>
                        PRIORITY #{i + 1}
                      </span>
                      <span className="font-bold text-white">₹{c.amount_at_risk.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white font-['Open_Sans'] truncate">
                      {toTitleCase(c.leak_type)}
                    </div>
                    <div className="text-xs font-mono text-[#305EFF] mt-1">
                      {toTitleCase(c.chosen_intervention)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CrossLeakShowcase;
