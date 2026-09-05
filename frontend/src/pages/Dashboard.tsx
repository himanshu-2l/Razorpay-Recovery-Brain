import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Activity,
  RefreshCw,
  Clock,
  ChevronRight,
  PhoneCall,
  Zap,
} from 'lucide-react';
import type { BatchSummary, CaseItem } from '../types';
import type { ConsoleTab } from '../components/Navbar';
import { RecoveryFlow3D } from '../components/RecoveryFlow3D';
import { API_BASE } from '../api';

interface DashboardProps {
  summary?: BatchSummary | null;
  cases?: CaseItem[];
  onSelectCase?: (c: CaseItem) => void;
  onNavigateTab?: (tab: ConsoleTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  summary: propSummary,
  cases: propCases,
  onSelectCase,
  onNavigateTab,
}) => {
  const [summary, setSummary] = useState<BatchSummary | null>(propSummary || null);
  const [cases, setCases] = useState<CaseItem[]>(propCases || []);
  const [loading, setLoading] = useState<boolean>(!propSummary);
  const [filterAgent, setFilterAgent] = useState<string>('all');

  useEffect(() => {
    if (propSummary) setSummary(propSummary);
    if (propCases && propCases.length > 0) setCases(propCases);
  }, [propSummary, propCases]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, casesRes] = await Promise.all([
        fetch(`${API_BASE}/api/batch/summary`),
        fetch(`${API_BASE}/api/cases?limit=100`),
      ]);
      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData);
      }
      if (casesRes.ok) {
        const casesData = await casesRes.json();
        setCases(casesData.cases || []);
      }
    } catch (err) {
      console.warn('Dashboard failed to load fresh telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!propSummary) {
      loadData();
    }
  }, []);

  const filteredCases = cases.filter((c) => {
    if (filterAgent === 'all') return true;
    if (filterAgent === 'prevent') return c.leak_type === 'payment_failure';
    if (filterAgent === 'rescue') return c.leak_type === 'checkout_abandonment';
    if (filterAgent === 'renew') return c.leak_type === 'subscription_failure';
    if (filterAgent === 'rakshak' || filterAgent === 'vasool') return c.leak_type === 'b2b_receivable';
    return true;
  });

  const formatLakhs = (val: number) => {
    const absVal = Math.abs(val);
    if (absVal >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (absVal >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Banner & Quick Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              MISSION CRITICAL · AUTONOMOUS RECOVERY DASHBOARD
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 font-display">
            Autonomous Recovery Command
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Full-spectrum 2.5D visual telemetry across technical failures, checkout drop-offs, subscriptions, and B2B voice collections.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('voice')}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-xs font-semibold text-purple-300 transition-all cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Voice Studio</span>
            </button>
          )}
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('chaos')}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-semibold text-amber-300 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Chaos Injection</span>
            </button>
          )}
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            <span>Sync Telemetry</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-white/10 relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400">Total Capital at Risk</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-2">
            {formatLakhs(summary?.total_at_risk || 9579541)}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Across {summary?.total_cases || 120} delinquent instances
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400">Recovered to Date</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-2">
            {formatLakhs(summary?.total_recovered || 2537230)}
          </div>
          <p className="text-[11px] text-emerald-400/80 mt-1">
            +{summary?.recovery_rate || 26.5}% overall recovery yield
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10 relative overflow-hidden group hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400">Section 43B(h) Clock</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-cyan-300 font-mono mt-2">
            -24.2 Days
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Average DSO reduction across MSME vendors
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10 relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400">Voice PTP Commitment</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-300 font-mono mt-2">
            78.4%
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            100% RBI Calling Window Compliant
          </p>
        </div>
      </div>

      {/* 3D RECOVERY FLOW VISUALIZATION SECTION (User Requested) */}
      <section className="space-y-4">
        <RecoveryFlow3D
          summary={summary}
          cases={cases}
          onSelectCase={onSelectCase}
        />
      </section>

      {/* Active Interventions Table with Agent Filters */}
      <section className="glass-panel rounded-2xl p-6 border border-white/10 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>Live Multi-Agent Recovery Stream</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Inspect active cases undergoing automated retry, smart links, mandate restoration, or Hinglish voice calls.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
            {['all', 'prevent', 'rescue', 'renew', 'rakshak'].map((agent) => (
              <button
                key={agent}
                onClick={() => setFilterAgent(agent)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all cursor-pointer ${
                  filterAgent === agent
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {agent === 'all' ? 'All Agents' : agent}
              </button>
            ))}
          </div>
        </div>

        {/* Case Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-mono text-gray-400 uppercase border-b border-white/10">
              <tr>
                <th className="pb-3 font-semibold">Case ID</th>
                <th className="pb-3 font-semibold">Customer / Merchant</th>
                <th className="pb-3 font-semibold">Agent Assigned</th>
                <th className="pb-3 font-semibold">At Risk</th>
                <th className="pb-3 font-semibold">Recovered</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCases.slice(0, 10).map((c) => {
                const agentTag =
                  c.leak_type === 'payment_failure'
                    ? { name: 'PREVENT', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' }
                    : c.leak_type === 'checkout_abandonment'
                    ? { name: 'RESCUE', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' }
                    : c.leak_type === 'subscription_failure'
                    ? { name: 'RENEW', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' }
                    : { name: 'RAKSHAK', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };

                return (
                  <tr
                    key={c.id}
                    onClick={() => onSelectCase && onSelectCase(c)}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 font-mono font-medium text-blue-400">
                      {c.id}
                    </td>
                    <td className="py-3.5 text-white font-medium">
                      {c.customer_name || 'Enterprise Merchant'}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold border ${agentTag.color}`}>
                        {agentTag.name}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-gray-300">
                      {formatLakhs(c.amount_at_risk || 0)}
                    </td>
                    <td className="py-3.5 font-mono text-emerald-400 font-semibold">
                      {c.amount_recovered ? formatLakhs(c.amount_recovered) : '—'}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        c.status === 'recovered' || c.status === 'partially_recovered'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectCase) onSelectCase(c);
                        }}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 group-hover:text-white transition-all inline-flex items-center"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
