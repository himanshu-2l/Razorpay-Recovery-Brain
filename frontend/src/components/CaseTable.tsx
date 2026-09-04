import React, { useState } from 'react';
import { Search, Filter, Layers, Eye } from 'lucide-react';
import type { CaseItem } from '../types';

// Converts snake_case or SCREAMING_SNAKE to Title Case: "payment_failure" → "Payment Failure"
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
      return { label: 'TD · Bank Infra', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
    }
    if (rc.startsWith('bd_')) {
      return { label: 'BD · User Error', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    }
    if (rc.includes('mandate')) {
      return { label: 'Mandate Bug', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
    }
    if (rc.startsWith('checkout_')) {
      return { label: 'Cart Drop-off', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    }
    return { label: 'B2B Oversight', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'recovered':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'partially_recovered':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'stopped':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'escalated':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 space-y-4 p-5">
      
      {/* Table Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center space-x-2 font-display">
            <Layers className="w-4 h-4 text-[#2B7FFF]" />
            <span>Live Batch Signals & Diagnosis Stream</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time feed of 50+ cases with single-action routing and audit trails
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customer, error, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all font-mono"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
        <span className="text-[11px] font-mono uppercase text-gray-400 mr-2 flex items-center">
          <Filter className="w-3 h-3 mr-1" />
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
            className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all ${
              selectedLeakType === tab.key
                ? 'bg-blue-600/30 text-[#2B7FFF] border border-blue-500/40 font-semibold'
                : 'bg-white/[0.02] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/[0.03] text-[11px] font-mono text-gray-400 uppercase tracking-wider border-b border-white/5">
            <tr>
              <th className="py-3 px-4">Customer & Account</th>
              <th className="py-3 px-4">Leak Type</th>
              <th className="py-3 px-4">Diagnosed Root Cause</th>
              <th className="py-3 px-4">Intervention Route</th>
              <th className="py-3 px-4">At Risk</th>
              <th className="py-3 px-4">Recovered</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredCases.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500 font-mono">
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
                    className="hover:bg-white/[0.03] cursor-pointer transition-colors group"
                  >
                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-white group-hover:text-blue-400 transition-colors">
                        {c.customer_name}
                      </div>
                      {c.customer_company && (
                        <div className="text-[10px] text-gray-400 font-mono">
                          {c.customer_company}
                        </div>
                      )}
                    </td>

                    {/* Leak Type */}
                    <td className="py-3 px-4 font-mono text-gray-300 text-[11px]">
                      {toTitleCase(c.leak_type)}
                    </td>

                    {/* Root Cause */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono border ${causeBadge.bg}`}>
                        {causeBadge.label}
                      </span>
                    </td>

                    {/* Intervention */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-white text-[11px] font-medium">
                        {toTitleCase(c.chosen_intervention)}
                      </span>
                    </td>

                    {/* At Risk */}
                    <td className="py-3 px-4 font-mono text-white font-semibold">
                      {formatCurrency(c.amount_at_risk)}
                    </td>

                    {/* Recovered */}
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {c.amount_recovered > 0 ? formatCurrency(c.amount_recovered) : '—'}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono border font-semibold ${statusColor}`}>
                        {toTitleCase(c.status)}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
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

      <div className="flex items-center justify-between text-xs text-gray-400 font-mono pt-1">
        <span>Showing {filteredCases.length} of {cases.length} cases</span>
        <span>Click any row to inspect decision reasoning & rejected alternatives</span>
      </div>

    </div>
  );
};
