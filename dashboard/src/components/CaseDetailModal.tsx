import React from 'react';
import { X, ShieldCheck, ShieldAlert, CheckCircle2, ArrowRight, CornerDownRight, Layers, MessageSquare } from 'lucide-react';
import type { CaseItem } from '../types';

interface CaseDetailModalProps {
  caseItem: CaseItem | null;
  onClose: () => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({ caseItem, onClose }) => {
  if (!caseItem) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRootCauseBadge = (rc: string) => {
    if (rc.startsWith('td_')) {
      return { label: 'Technical Decline (TD)', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
    }
    if (rc.startsWith('bd_')) {
      return { label: 'Business Decline (BD)', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    }
    if (rc.includes('mandate')) {
      return { label: 'RBI Mandate Bug', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
    }
    if (rc.startsWith('checkout_')) {
      return { label: 'Funnel Abandonment', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
    }
    return { label: 'Receivable Oversight', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
  };

  const badge = getRootCauseBadge(caseItem.root_cause);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] glass-panel rounded-3xl overflow-hidden border border-white/15 flex flex-col shadow-2xl shadow-blue-500/10">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-[#2B7FFF]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Recovery Case Decision Tree
                </h3>
                <span className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">
                Case ID: {caseItem.id} · {caseItem.customer_name} {caseItem.customer_company ? `(${caseItem.customer_company})` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Top Info Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <span className="text-[11px] font-mono text-gray-400 uppercase">Amount at Risk</span>
              <div className="text-xl font-bold font-mono text-white">
                {formatCurrency(caseItem.amount_at_risk)}
              </div>
              <span className="text-[10px] text-gray-400">Target revenue to recover</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <span className="text-[11px] font-mono text-gray-400 uppercase">Amount Recovered</span>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {formatCurrency(caseItem.amount_recovered)}
              </div>
              <span className="text-[10px] text-gray-400 font-mono">
                Status: {caseItem.status.toUpperCase()}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <span className="text-[11px] font-mono text-gray-400 uppercase">Confidence Score</span>
              <div className="text-xl font-bold font-mono text-blue-400">
                {Math.round((caseItem.root_cause_confidence || 0.88) * 100)}%
              </div>
              <span className="text-[10px] text-gray-400">Classifier probability</span>
            </div>
          </div>

          {/* Section 1: Diagnosis & Reasoning Chain */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono font-semibold uppercase text-blue-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Step 1 · Root-Cause Diagnosis & Reasoning Chain</span>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-gray-300 leading-relaxed whitespace-pre-line">
              {caseItem.reasoning_chain || 'Identified root cause through error code parsing and customer transaction telemetry.'}
            </div>
          </div>

          {/* Section 2: Intervention Choice & Rejected Alternatives */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-mono font-semibold uppercase text-purple-400">
              <ArrowRight className="w-4 h-4" />
              <span>Step 2 · Chosen Intervention & Alternative Rejections</span>
            </div>

            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wide">
                  Chosen Action: {caseItem.chosen_intervention.toUpperCase()}
                </span>
                <span className="text-[10px] font-mono text-purple-400">Single Best Route</span>
              </div>
              <p className="text-xs text-gray-300">
                {caseItem.intervention_reason}
              </p>
            </div>

            {/* Alternatives Rejected List */}
            {caseItem.alternatives_rejected && caseItem.alternatives_rejected.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase text-gray-400 tracking-wider">
                  Why other actions were rejected (Audit Evidence):
                </span>
                <div className="space-y-1.5">
                  {caseItem.alternatives_rejected.map((alt, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-black/30 border border-white/5 text-xs flex items-start space-x-2">
                      <CornerDownRight className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-red-300 uppercase font-mono mr-1.5">
                          {alt.action}:
                        </strong>
                        <span className="text-gray-400">{alt.rejected_because}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Compliance Shield Status */}
          <div className={`p-5 rounded-2xl border space-y-3 ${
            caseItem.compliance_status === 'allowed'
              ? 'bg-emerald-500/5 border-emerald-500/20'
              : 'bg-red-500/5 border-red-500/20'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {caseItem.compliance_status === 'allowed' ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                )}
                <span className="text-xs font-mono font-semibold uppercase text-white">
                  Step 3 · RBI Fair Practices Compliance Gate
                </span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                caseItem.compliance_status === 'allowed'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}>
                {caseItem.compliance_status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed font-mono">
              {caseItem.compliance_details || 'Verified against 8 AM - 7 PM contact window, daily limits, and fair practice guidelines.'}
            </p>
          </div>

          {/* Section 4: Nudge Content if applicable */}
          {caseItem.nudge_content && (
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-mono font-semibold uppercase text-cyan-400">
                <MessageSquare className="w-4 h-4" />
                <span>Generated Targeted Nudge Payload</span>
              </div>
              {caseItem.nudge_content.whatsapp && (
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200">
                  <strong className="text-emerald-400 block mb-1 font-mono text-[10px] uppercase tracking-wider">
                    WhatsApp Message Preview:
                  </strong>
                  "{caseItem.nudge_content.whatsapp}"
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
