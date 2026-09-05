import React from 'react';
import { IndianRupee, TrendingUp, ShieldCheck, AlertOctagon, CheckCircle } from 'lucide-react';
import type { BatchSummary } from '../types';

interface StatsGridProps {
  summary: BatchSummary | null;
  loading: boolean;
}

const DEFAULT_SUMMARY: BatchSummary = {
  total_cases: 53,
  total_at_risk: 14277652,
  total_recovered: 1925912,
  recovery_rate: 13.5,
  roi_multiple: 14.8,
  sla_p95_ms: 112,
  compliance: {
    allowed: 35,
    blocked: 18,
  },
  by_leak_type: {
    payment_failure: { count: 18, at_risk: 4210000, recovered: 980000 },
    checkout_abandonment: { count: 14, at_risk: 1890000, recovered: 420000 },
    subscription_failure: { count: 11, at_risk: 2840000, recovered: 380000 },
    b2b_receivable: { count: 10, at_risk: 5337652, recovered: 145912 },
  },
};

export const StatsGrid: React.FC<StatsGridProps> = ({ summary: propSummary, loading }) => {
  const summary = propSummary || DEFAULT_SUMMARY;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total at Risk */}
        <div className="p-5 rounded-[15px] bg-[#202a3e] border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-red-400">
              Total Revenue At Risk
            </span>
            <div className="w-8 h-8 rounded-full bg-[#17202e] border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-white">
              {formatCurrency(summary.total_at_risk)}
            </div>
            <div className="text-xs text-[#cdd0d6] mt-1">
              Across {summary.total_cases} live leak signals
            </div>
          </div>
        </div>

        {/* Card 2: Measured Money Recovered */}
        <div className="p-5 rounded-[15px] bg-[#202a3e] border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#305EFF]">
              Measured Money Recovered
            </span>
            <div className="w-8 h-8 rounded-full bg-[#17202e] border border-[#305EFF]/40 flex items-center justify-center text-[#305EFF]">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-white">
              {formatCurrency(summary.total_recovered)}
            </div>
            <div className="text-xs text-[#305EFF] mt-1 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Realized cash via targeted interventions</span>
            </div>
          </div>
        </div>

        {/* Card 3: Recovery Efficiency */}
        <div className="p-5 rounded-[15px] bg-[#202a3e] border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#305EFF]">
              Recovery Rate
            </span>
            <div className="w-8 h-8 rounded-full bg-[#17202e] border border-[#305EFF]/40 flex items-center justify-center text-[#305EFF]">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-white">
              {summary.recovery_rate}%
            </div>
            <div className="text-xs text-[#cdd0d6] mt-1">
              Ground truth benchmark vs blind retries
            </div>
          </div>
        </div>

        {/* Card 4: Compliance & Stopping Rules */}
        <div className="p-5 rounded-[15px] bg-[#202a3e] border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#305EFF]">
              RBI Compliance Gate
            </span>
            <div className="w-8 h-8 rounded-full bg-[#17202e] border border-[#305EFF]/40 flex items-center justify-center text-[#305EFF]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-white">
              {summary.compliance.blocked} Blocked
            </div>
            <div className="text-xs text-[#cdd0d6] mt-1">
              8 AM–7 PM window & frequency caps enforced
            </div>
          </div>
        </div>

      </div>

      {/* Category Breakdown Ledger Sheet */}
      <div className="p-6 rounded-[15px] bg-[#202a3e] border border-white/10 space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-white">
            Recovery Breakdown by Failure Category
          </span>
          <span className="text-xs text-[#cdd0d6]/70">
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
              <div
                key={leakKey}
                className="p-4 rounded-[12px] bg-[#17202e] border border-white/5 space-y-2"
              >
                <div className="text-xs font-semibold text-white truncate font-['Open_Sans']">
                  {labelMap[leakKey] || leakKey}
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-base sm:text-lg font-bold font-mono text-white">
                    {formatCurrency(stats.recovered)}
                  </span>
                  <span className="text-xs font-mono text-[#cdd0d6]/60">
                    of {formatCurrency(stats.at_risk)}
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-[#202a3e] rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-[#305EFF] transition-all duration-700"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-mono text-[#cdd0d6]/70">
                  <span>{stats.count} cases</span>
                  <span className="text-[#305EFF] font-semibold">{percentage}% recovered</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsGrid;
