import React from 'react';
import { IndianRupee, TrendingUp, ShieldCheck, AlertOctagon, CheckCircle } from 'lucide-react';
import type { BatchSummary } from '../types';

interface StatsGridProps {
  summary: BatchSummary | null;
  loading: boolean;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ summary, loading }) => {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-28 rounded-2xl bg-white/[0.03] border border-white/5" />
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Top 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total at Risk */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-gray-400 uppercase tracking-wider">
              Total Revenue At Risk
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {formatCurrency(summary.total_at_risk)}
            </div>
            <div className="text-[11px] text-gray-400 mt-1 flex items-center space-x-1">
              <span>Across {summary.total_cases} live leak signals</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/50 to-orange-500/50" />
        </div>

        {/* Card 2: Measured Money Recovered */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group glow-blue">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-blue-300 uppercase tracking-wider">
              Measured Money Recovered
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-[#2B7FFF]">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {formatCurrency(summary.total_recovered)}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1 font-mono">
              <TrendingUp className="w-3 h-3" />
              <span>Realized cash via targeted interventions</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2B7FFF] to-cyan-400" />
        </div>

        {/* Card 3: Recovery Efficiency */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-emerald-400 uppercase tracking-wider">
              Recovery Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {summary.recovery_rate}%
            </div>
            <div className="text-[11px] text-gray-400 mt-1 flex items-center space-x-1">
              <span>Ground truth benchmark vs blind retries</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </div>

        {/* Card 4: Compliance & Stopping Rules */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-purple-300 uppercase tracking-wider">
              RBI Compliance Gate
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {summary.compliance.blocked} Blocked
            </div>
            <div className="text-[11px] text-gray-400 mt-1 flex items-center space-x-1">
              <span>8 AM–7 PM window & frequency caps enforced</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500" />
        </div>

      </div>

      {/* Category Breakdown Breakdown Pills */}
      <div className="glass-panel p-5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-gray-300 font-semibold">
            Recovery Breakdown by Failure Category
          </span>
          <span className="text-xs text-gray-400">
            Same symptom diagnosed into discrete root-cause buckets
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
          {Object.entries(summary.by_leak_type).map(([leakKey, stats]) => {
            const labelMap: Record<string, string> = {
              payment_failure: '01. Payment Degradation (TD/BD)',
              checkout_abandonment: '02. Checkout Abandonment',
              subscription_failure: '03. Subscription & Mandate',
              b2b_receivable: '04. B2B Overdue Receivables',
            };

            const percentage = stats.at_risk > 0 ? Math.round((stats.recovered / stats.at_risk) * 100) : 0;

            return (
              <div key={leakKey} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="text-xs font-medium text-gray-300 truncate">
                  {labelMap[leakKey] || leakKey}
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-bold font-mono text-white">
                    {formatCurrency(stats.recovered)}
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    of {formatCurrency(stats.at_risk)}
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>{stats.count} cases</span>
                  <span className="text-emerald-400 font-semibold">{percentage}% recovered</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
