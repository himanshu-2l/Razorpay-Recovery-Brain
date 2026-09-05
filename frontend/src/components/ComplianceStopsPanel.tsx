import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Moon,
  AlertOctagon,
  Lock,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { API_BASE } from '../api';

interface StoppedCaseItem {
  id: string;
  customer_name: string;
  amount_at_risk: number;
  stop_category: string;
  rule_cited: string;
  status: string;
  scheduled_resumption: string;
  audit_proof: boolean;
}

export const ComplianceStopsPanel: React.FC = () => {
  const [stoppedCases, setStoppedCases] = useState<StoppedCaseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const fetchStoppedCases = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/compliance/stopped-cases`);
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setStoppedCases(data.stopped_cases || []);
      }
    } catch (e) {
      console.error('Failed to load stopped cases:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoppedCases();
  }, []);

  const curfewCount = stoppedCases.filter((c) => c.stop_category.includes('Curfew')).length;
  const disputeCount = stoppedCases.filter((c) => c.stop_category.includes('Dispute')).length;
  const attemptCapCount = stoppedCases.filter((c) => c.stop_category.includes('Attempt')).length;
  const dpdpCount = stoppedCases.filter((c) => c.stop_category.includes('DPDP')).length;

  const filtered = stoppedCases.filter((c) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'curfew') return c.stop_category.includes('Curfew');
    if (filterCategory === 'dispute') return c.stop_category.includes('Dispute');
    if (filterCategory === 'attempt') return c.stop_category.includes('Attempt');
    if (filterCategory === 'dpdp') return c.stop_category.includes('DPDP');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border border-white/10 rounded-2xl bg-[#17202e] p-6 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-lg sm:text-xl font-heading font-bold text-white tracking-tight">
                  Where We Stopped · Statutory Compliance Audit
                </h2>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  100% Policy Enforced
                </span>
              </div>
              <p className="text-xs text-[#cdd0d6] mt-0.5 max-w-3xl leading-relaxed">
                A bounded recovery agent proves its intelligence through its stopping rules. Every case below was deliberately halted or rescheduled by the Rakshak decision engine to comply with RBI Fair Practices Code, DPDP Act 2023 consent laws, or dispute freeze mandates.
              </p>
            </div>
          </div>

          <button
            onClick={fetchStoppedCases}
            disabled={loading}
            className="idle-btn-ghost text-xs px-3.5 py-1.5 flex items-center space-x-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#202a3e] border border-white/10 space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-gray-400">
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Quiet Hours Curfew</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">{curfewCount}</div>
          <span className="text-[10px] text-[#cdd0d6]/70">Halted between 9 PM–8 AM IST</span>
        </div>

        <div className="p-4 rounded-xl bg-[#202a3e] border border-white/10 space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-gray-400">
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            <span>Dispute Freezes</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">{disputeCount}</div>
          <span className="text-[10px] text-[#cdd0d6]/70">Immediate outreach quarantine</span>
        </div>

        <div className="p-4 rounded-xl bg-[#202a3e] border border-white/10 space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-gray-400">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Max 3-Attempt Caps</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">{attemptCapCount}</div>
          <span className="text-[10px] text-[#cdd0d6]/70">Anti-harassment invariant</span>
        </div>

        <div className="p-4 rounded-xl bg-[#202a3e] border border-white/10 space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-gray-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>DPDP Opt-Outs</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">{dpdpCount}</div>
          <span className="text-[10px] text-[#cdd0d6]/70">Consent revoked under Sec 6</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-black/40 border border-white/10 text-xs w-fit">
        {[
          { id: 'all', label: 'All Stopped Cases' },
          { id: 'curfew', label: 'Quiet Hours Curfew' },
          { id: 'dispute', label: 'Dispute Freezes' },
          { id: 'attempt', label: 'Attempt Limit Cap' },
          { id: 'dpdp', label: 'DPDP Opt-Out' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              filterCategory === tab.id
                ? 'bg-[#305EFF] text-white shadow-md shadow-[#305EFF]/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stopped Cases Table */}
      <div className="border border-white/10 rounded-2xl bg-[#202a3e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-mono text-gray-400 uppercase bg-[#17202e] border-b border-white/10">
              <tr>
                <th className="py-3 px-4 font-semibold">Case ID</th>
                <th className="py-3 px-4 font-semibold">Customer / Merchant</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Stop Category</th>
                <th className="py-3 px-4 font-semibold">Statutory Rule Cited</th>
                <th className="py-3 px-4 font-semibold">Resumption Action</th>
                <th className="py-3 px-4 font-semibold">Ledger Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-[#305EFF]">{item.id}</td>
                    <td className="py-3 px-4 text-white font-medium">{item.customer_name}</td>
                    <td className="py-3 px-4 font-mono text-gray-300">
                      ₹{Math.round(item.amount_at_risk).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {item.stop_category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-[#cdd0d6] font-sans max-w-xs">
                      {item.rule_cited}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-gray-400 font-mono">
                      {item.scheduled_resumption}
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center space-x-1 text-[10px] font-mono text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>SHA-256 Sealed</span>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-gray-400 font-mono">
                    No stopped cases found matching this filter category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
