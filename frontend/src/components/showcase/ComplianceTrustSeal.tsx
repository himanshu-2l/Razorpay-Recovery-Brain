import React from 'react';
import { ShieldCheck, Lock, FileText, ArrowRight } from 'lucide-react';
import complianceCardImg from '../../assets/compliance_card.jpg';

interface ComplianceTrustSealProps {
  onLaunchConsole: () => void;
}

export const ComplianceTrustSeal: React.FC<ComplianceTrustSealProps> = ({ onLaunchConsole }) => {
  return (
    <section className="py-20 border-t border-white/10 bg-[#17202e] relative text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center text-left">
          
          {/* Left Column: Visual Specimen Frame */}
          <div className="lg:col-span-6">
            <div className="bg-[#202a3e] border border-white/10 rounded-[15px] p-3 relative overflow-hidden">
              <img
                src={complianceCardImg}
                alt="RBI & DPDP Compliance Shield"
                className="w-full h-auto object-cover rounded-[10px] border border-white/10"
              />
              <div className="mt-3 text-center text-xs font-mono text-[#cdd0d6]/70">
                Figure 1.0 — Cryptographic Shield Verification & Compliance Vault
              </div>
            </div>
          </div>

          {/* Right Column: Regulatory Breakdown */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#202a3e] border border-[#305EFF]/40 text-xs font-semibold text-[#305EFF]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#305EFF]" />
              <span>BANK-GRADE REGULATORY PROOF</span>
            </div>

            <h3 className="text-3xl sm:text-5xl font-bold font-['Open_Sans'] tracking-[-0.036em] text-white leading-tight">
              Engineered with Strict Indian Compliance.{' '}
              <span className="text-[#305EFF]">
                Guaranteed by code.
              </span>
            </h3>

            <p className="text-sm sm:text-base font-['Open_Sans'] leading-relaxed text-[#cdd0d6]">
              Most AI agents operate with vague boundaries that break financial regulations. Razorpay Revenue Recovery Brain is built with hardcoded, cryptographically verified legal guardrails.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-[12px] bg-[#202a3e] border border-white/10 space-y-1">
                <div className="flex items-center space-x-2 text-sm font-bold font-['Open_Sans'] text-white">
                  <Lock className="w-4 h-4 text-[#305EFF]" />
                  <span>RBI Curfew Window</span>
                </div>
                <p className="text-xs font-['Open_Sans'] leading-relaxed text-[#cdd0d6]">
                  Strictly vetoes voice calls between 19:00 and 07:00 IST. Queues candidates for morning release.
                </p>
              </div>

              <div className="p-5 rounded-[12px] bg-[#202a3e] border border-white/10 space-y-1">
                <div className="flex items-center space-x-2 text-sm font-bold font-['Open_Sans'] text-white">
                  <FileText className="w-4 h-4 text-[#305EFF]" />
                  <span>DPDP Act 2023</span>
                </div>
                <p className="text-xs font-['Open_Sans'] leading-relaxed text-[#cdd0d6]">
                  Immediate Right to Erasure support. Automated anonymization of PII after recovery completion.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onLaunchConsole}
                className="idle-btn-primary text-xs px-6 py-2.5 flex items-center space-x-2"
              >
                <span>Enter Operations Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default ComplianceTrustSeal;
