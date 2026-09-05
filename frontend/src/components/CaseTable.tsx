import React, { useState } from 'react';
import { Search, Filter, Layers, Eye } from 'lucide-react';
import type { CaseItem } from '../types';

const toTitleCase = (s: string): string =>
  s.replace(/_/g, ' ').replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

interface CaseTableProps {
  cases: CaseItem[];
  onSelectCase: (caseItem: CaseItem) => void;
}

export const CaseTable: React.FC<CaseTableProps> = ({ cases, onSelectCase }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeakType, setSelectedLeakType] = useState<string>('all');
  const [selectedStatus] = useState<string>('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.root_cause.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.customer_company && c.customer_company.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLeak = selectedLeakType === 'all' || c.leak_type === selectedLeakType;
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;

    return matchesSearch && matchesLeak && matchesStatus;
  });

  const getRootCauseBadge = (rc: string) => {
    if (rc.startsWith('td_')) {
      return { label: 'TD · Bank Infra', bg: 'bg-[#202a3e] text-[#305EFF] border-[#305EFF]/40' };
    }
    if (rc.startsWith('bd_')) {
      return { label: 'BD · User Error', bg: 'bg-[#202a3e] text-[#cdd0d6] border-white/20' };
    }
    if (rc.includes('mandate')) {
      return { label: 'Mandate Bug', bg: 'bg-[#202a3e] text-[#305EFF] border-[#305EFF]/40' };
    }
    if (rc.startsWith('checkout_')) {
      return { label: 'Cart Drop-off', bg: 'bg-[#202a3e] text-[#cdd0d6] border-white/20' };
    }
    return { label: 'B2B Oversight', bg: 'bg-[#202a3e] text-amber-300 border-amber-500/40' };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approval_pending':
        return 'bg-[#202a3e] text-amber-300 border-amber-500/40';
      case 'recovered':
        return 'bg-[#202a3e] text-[#305EFF] border-[#305EFF]/40';
      case 'in_progress':
        return 'bg-[#202a3e] text-blue-300 border-blue-500/40';
      case 'blocked_curfew':
        return 'bg-red-950/40 text-red-300 border-red-800/40';
      default:
        return 'bg-[#202a3e] text-[#cdd0d6]/70 border-white/10';
    }
  };

  return (
    <div className="p-6 rounded-[15px] bg-[#202a3e] border border-white/10 space-y-5 text-left relative">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-['Open_Sans'] text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#305EFF]" />
            <span>Live Batch Signals & Diagnosis Ledger</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#cdd0d6] mt-0.5">
            Real-time feed of 50+ cases with single-action routing and audit trails
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#cdd0d6]/60" />
          <input
            type="text"
            placeholder="Search customer, error, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full border border-white/10 bg-[#17202e] text-xs text-white placeholder-[#cdd0d6]/40 focus:outline-none focus:border-[#305EFF]"
          />
        </div>
      </div>

      {/* Filter Tabs (Exchange Filter Bar) */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
        <span className="text-xs font-mono uppercase text-[#cdd0d6]/60 mr-2 flex items-center">
          <Filter className="w-3.5 h-3.5 mr-1 text-[#305EFF]" />
          Category:
        </span>
        {[
          { key: 'all', label: 'All Leaks' },
          { key: 'payment_failure', label: 'Payment Failures (TD/BD)' },
          { key: 'checkout_abandonment', label: 'Cart Drop-offs' },
          { key: 'subscription_failure', label: 'Subscription & Mandates' },
          { key: 'b2b_receivable', label: 'B2B Receivables' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedLeakType(tab.key)}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedLeakType === tab.key
                ? 'bg-white text-black font-bold'
                : 'text-[#cdd0d6] hover:text-white hover:bg-[#17202e]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-[12px] border border-white/10 bg-[#17202e]">
        <table className="w-full text-left text-xs">
          <thead className="text-xs font-mono uppercase tracking-wider border-b border-white/10 bg-[#17202e] text-[#cdd0d6]">
            <tr>
              <th className="py-3 px-4 font-semibold">Customer & Account</th>
              <th className="py-3 px-4 font-semibold">Leak Type</th>
              <th className="py-3 px-4 font-semibold">Diagnosed Root Cause</th>
              <th className="py-3 px-4 font-semibold">Intervention Route</th>
              <th className="py-3 px-4 font-semibold">At Risk</th>
              <th className="py-3 px-4 font-semibold">Recovered</th>
              <th className="py-3 px-4 text-center font-semibold">Status</th>
              <th className="py-3 px-4 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredCases.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#cdd0d6]/60 text-xs">
                  No cases found matching the criteria.
                </td>
              </tr>
            ) : (
              filteredCases.map((c) => {
                const causeBadge = getRootCauseBadge(c.root_cause);
                const statusColor = getStatusBadge(c.status);

                return (
                  <tr
                    key={c.id}
                    onClick={() => onSelectCase(c)}
                    className="cursor-pointer transition-colors hover:bg-[#202a3e]/80 group"
                  >
                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-xs sm:text-sm text-white group-hover:text-[#305EFF]">
                        {c.customer_name}
                      </div>
                      {c.customer_company && (
                        <div className="text-xs text-[#cdd0d6]/70">
                          {c.customer_company}
                        </div>
                      )}
                    </td>

                    {/* Leak Type */}
                    <td className="py-3 px-4 text-xs text-[#cdd0d6]">
                      {toTitleCase(c.leak_type)}
                    </td>

                    {/* Root Cause */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-mono ${causeBadge.bg}`}>
                        {causeBadge.label}
                      </span>
                    </td>

                    {/* Intervention Route */}
                    <td className="py-3 px-4 text-xs text-[#cdd0d6]">
                      {toTitleCase(c.chosen_intervention)}
                    </td>

                    {/* At Risk */}
                    <td className="py-3 px-4 font-mono font-bold text-xs text-white">
                      {formatCurrency(c.amount_at_risk)}
                    </td>

                    {/* Recovered */}
                    <td className="py-3 px-4 font-mono font-bold text-xs text-[#305EFF]">
                      {c.amount_recovered > 0 ? formatCurrency(c.amount_recovered) : '—'}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] uppercase font-mono ${statusColor}`}>
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCase(c);
                        }}
                        className="p-1.5 rounded-full bg-[#202a3e] border border-white/10 text-[#305EFF] hover:bg-white hover:text-black cursor-pointer transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CaseTable;
