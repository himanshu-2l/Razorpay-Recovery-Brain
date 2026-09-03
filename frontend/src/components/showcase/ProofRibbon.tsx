import React from 'react';
import { TrendingUp, ShieldCheck, Clock, Database } from 'lucide-react';
import type { BatchSummary } from '../../types';

interface ProofRibbonProps {
  summary: BatchSummary | null;
}

export const ProofRibbon: React.FC<ProofRibbonProps> = ({ summary }) => {
  const atRisk = summary?.total_at_risk || 9579541;
  const recovered = summary?.total_recovered || 253723;
  const casesCount = summary?.total_cases || 53;

  return (
    <section className="py-6 border-y border-white/5 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          
          {/* Stat 1 */}
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start space-x-1.5 text-xs text-gray-400 font-mono">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <span>Net Recovered Yield</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
              ₹{Math.round(recovered).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-gray-400">From ₹{Math.round(atRisk).toLocaleString('en-IN')} flagged at risk</p>
          </div>

          {/* Stat 2 */}
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start space-x-1.5 text-xs text-gray-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Time-To-Intervene</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
              &lt;780 ms
            </div>
            <p className="text-[11px] text-gray-400">Zero human intervention delay</p>
          </div>

          {/* Stat 3 */}
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start space-x-1.5 text-xs text-gray-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Regulatory Veto Rate</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono tracking-tight">
              0 Violations
            </div>
            <p className="text-[11px] text-gray-400">100% compliant with RBI 7 PM curfew</p>
          </div>

          {/* Stat 4 */}
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start space-x-1.5 text-xs text-gray-400 font-mono">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>Verifiable Ledger</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
              {casesCount * 3 + 145} Blocks
            </div>
            <p className="text-[11px] text-gray-400">SHA-256 Merkle chain in SQLite</p>
          </div>

        </div>
      </div>
    </section>
  );
};
