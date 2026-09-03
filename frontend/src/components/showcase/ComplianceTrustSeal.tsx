import React from 'react';
import { ShieldCheck, Lock, FileText, ArrowRight } from 'lucide-react';
import complianceCardImg from '../../assets/compliance_card.jpg';

interface ComplianceTrustSealProps {
  onLaunchConsole: () => void;
}

export const ComplianceTrustSeal: React.FC<ComplianceTrustSealProps> = ({ onLaunchConsole }) => {
  return (
    <section className="py-20 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Visual Badge Card */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden border border-white/10 glass-panel shadow-2xl">
              <img
                src={complianceCardImg}
                alt="RBI & DPDP Compliance Shield"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Right Column: Regulatory Breakdown */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>BANK-GRADE REGULATORY PROOF</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              Engineered with Strict Indian Compliance.{' '}
              <span className="font-serif-italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-300">
                Guaranteed by code.
              </span>
            </h3>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Most AI agents operate with vague boundaries that break financial regulations. Razorpay Revenue Recovery Brain is built with hardcoded, cryptographically verified legal guardrails.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <div className="flex items-center space-x-2 text-xs font-semibold text-white">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>RBI Curfew Window</span>
                </div>
                <p className="text-xs text-gray-400 leading-normal">
                  Strictly vetoes voice calls between 19:00 and 07:00 IST. Queues candidates for morning release.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <div className="flex items-center space-x-2 text-xs font-semibold text-white">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>DPDP Act 2023</span>
                </div>
                <p className="text-xs text-gray-400 leading-normal">
                  Immediate Right to Erasure support. Automated anonymization of PII after recovery completion.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={onLaunchConsole}
                className="flex items-center space-x-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm shadow-xl shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
              >
                <span>Enter Operations Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
