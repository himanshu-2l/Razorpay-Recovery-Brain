import React from 'react';
import { Users, Clock, ShieldAlert, CheckCircle, ArrowUpRight } from 'lucide-react';

interface ThreePillarsSectionProps {
  onOpenCompliance: () => void;
  onOpenVoice: () => void;
  onOpenWebhook: () => void;
}

export const ThreePillarsSection: React.FC<ThreePillarsSectionProps> = ({
  onOpenCompliance,
  onOpenVoice,
  onOpenWebhook,
}) => {
  return (
    <section className="py-20 border-t border-white/10 bg-[#17202e] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#202a3e] border border-[#305EFF]/40 text-xs font-semibold text-[#305EFF]">
            <span>CORE INNOVATIONS · RECOVERY ARCHITECTURE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold font-['Open_Sans'] tracking-[-0.036em] text-white leading-tight">
            Built for Real-World Indian Payments.{' '}
            <span className="text-[#305EFF]">
              Not textbook scenarios.
            </span>
          </h2>

          <p className="text-sm sm:text-base font-['Open_Sans'] text-[#cdd0d6] leading-relaxed">
            Three deep backend innovations that bridge autonomous AI with statutory banking compliance and enterprise revenue operations.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          
          {/* Pillar 1: Cross-Leak Profile Unification */}
          <div className="p-7 rounded-[15px] bg-[#202a3e] border border-white/10 flex flex-col justify-between space-y-6 hover:border-white/25 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#17202e] border border-[#305EFF]/40 text-[#305EFF] flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-['Open_Sans'] text-white">
                Cross-Leak Profile Unification
              </h3>
              <p className="text-xs sm:text-sm font-['Open_Sans'] leading-relaxed text-[#cdd0d6]">
                When a user’s recurring subscription fails, our engine cross-references whether they also have pending B2B vendor invoices or uncaptured checkout links. One unified recovery plan prevents duplicate spam.
              </p>
              <div className="space-y-2 pt-2 text-xs sm:text-sm text-[#cdd0d6]">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#305EFF]" />
                  <span>Deduplicated outreach channels</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#305EFF]" />
                  <span>Combined multi-invoice WhatsApp intent</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenWebhook}
              className="idle-btn-ghost text-xs w-full py-2.5 flex items-center justify-between px-4"
            >
              <span>Test Webhook Unification</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#305EFF]" />
            </button>
          </div>

          {/* Pillar 2: Section 43B(h) MSME Tax Clock */}
          <div className="p-7 rounded-[15px] bg-[#202a3e] border border-white/10 flex flex-col justify-between space-y-6 hover:border-white/25 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#17202e] border border-[#305EFF]/40 text-[#305EFF] flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-['Open_Sans'] text-white">
                Section 43B(h) Tax Clock Engine
              </h3>
              <p className="text-xs sm:text-sm font-['Open_Sans'] leading-relaxed text-[#cdd0d6]">
                Indian Income Tax Section 43B(h) mandates vendor settlement within 45 days or expenses are disallowed. Our engine tracks tax-clock urgency and dynamically accelerates recovery before audit deadlines.
              </p>
              <div className="space-y-2 pt-2 text-xs sm:text-sm text-[#cdd0d6]">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#305EFF]" />
                  <span>Day 40–44 priority escalation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#305EFF]" />
                  <span>Prevents corporate tax deductions forfeiture</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenCompliance}
              className="idle-btn-ghost text-xs w-full py-2.5 flex items-center justify-between px-4"
            >
              <span>Inspect Tax Clock Rules</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#305EFF]" />
            </button>
          </div>

          {/* Pillar 3: Dynamic Autonomy Envelope */}
          <div className="p-7 rounded-[15px] bg-[#202a3e] border border-white/10 flex flex-col justify-between space-y-6 hover:border-white/25 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#17202e] border border-[#305EFF]/40 text-[#305EFF] flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-['Open_Sans'] text-white">
                Self-Contracting Autonomy Envelope
              </h3>
              <p className="text-xs sm:text-sm font-['Open_Sans'] leading-relaxed text-[#cdd0d6]">
                The AI does not run unbounded. If error rates surge or recovery confidence drops below threshold, the autonomy envelope automatically contracts and routes high-stakes cases to a Human-in-the-Loop gate.
              </p>
              <div className="space-y-2 pt-2 text-xs sm:text-sm text-[#cdd0d6]">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#305EFF]" />
                  <span>Hard stop on 3 consecutive failures</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#305EFF]" />
                  <span>Cryptographic human approval override</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenVoice}
              className="idle-btn-ghost text-xs w-full py-2.5 flex items-center justify-between px-4"
            >
              <span>View Autonomy Envelope</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#305EFF]" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};

export default ThreePillarsSection;
