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
    <section className="py-20 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <span>CORE INNOVATIONS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Built for Real-World Indian Payments.{' '}
            <span className="font-serif-italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-300">
              Not textbook scenarios.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-400">
            Three deep backend innovations that bridge standard AI with statutory banking compliance and enterprise revenue operations.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Pillar 1: Cross-Leak Customer Unification */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Cross-Leak Profile Unification
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                When a user’s recurring subscription fails, our engine cross-references whether they also have pending B2B vendor invoices or uncaptured checkout links. One unified recovery plan prevents duplicate spam.
              </p>
              <div className="space-y-2 pt-2 text-xs text-gray-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span>Deduplicated outreach channels</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span>Combined multi-invoice WhatsApp intent</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenWebhook}
              className="flex items-center justify-between w-full pt-4 border-t border-white/5 text-xs font-mono text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              <span>Test Webhook Unification</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Pillar 2: Section 43B(h) MSME Tax Clock */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Section 43B(h) Tax Clock Engine
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                Indian Income Tax Section 43B(h) mandates vendor settlement within 45 days or expenses are disallowed. Our engine tracks tax-clock urgency and dynamically accelerates recovery before audit deadlines.
              </p>
              <div className="space-y-2 pt-2 text-xs text-gray-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Day 40–44 priority escalation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Prevents corporate tax deductions forfeiture</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenCompliance}
              className="flex items-center justify-between w-full pt-4 border-t border-white/5 text-xs font-mono text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              <span>Inspect Tax Clock Rules</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Pillar 3: Dynamic Autonomy Envelope */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Self-Contracting Autonomy Envelope
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                The AI does not run unbounded. If error rates surge or recovery confidence drops below threshold, the autonomy envelope automatically contracts and routes high-stakes cases to a Human-in-the-Loop gate.
              </p>
              <div className="space-y-2 pt-2 text-xs text-gray-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                  <span>Hard stop on 3 consecutive failures</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                  <span>Cryptographic human approval override</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenVoice}
              className="flex items-center justify-between w-full pt-4 border-t border-white/5 text-xs font-mono text-purple-400 hover:text-purple-300 cursor-pointer"
            >
              <span>View Autonomy Envelope</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
