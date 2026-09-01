import React from 'react';
import { Sparkles, ArrowRight, PhoneCall, ShieldAlert, Cpu } from 'lucide-react';

interface HeroBannerProps {
  onOpenVoice: () => void;
  onOpenComplianceDemo: () => void;
  onRefreshBatch: () => void;
  isProcessing: boolean;
  totalAtRisk: number;
  totalRecovered: number;
  recoveryRate: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onOpenVoice,
  onOpenComplianceDemo,
}) => {
  return (
    <div className="relative overflow-hidden pt-12 pb-8 px-4 sm:px-6 lg:px-8">
      {/* Signature Razorpay Agent Studio Thermal Iridescent Aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/25 via-emerald-500/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/4 left-1/3 w-[350px] h-[250px] bg-purple-600/15 blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto text-center space-y-5">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-[#2B7FFF] animate-pulse" />
          <span className="text-xs font-mono font-medium tracking-widest uppercase text-gray-300">
            TRACK 03 · RAZORPAY AI BUILDATHON 2026
          </span>
        </div>

        {/* Main Headline with soft bloom */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-display">
          Revenue Recovery{' '}
          <span className="bg-gradient-to-r from-white via-blue-200 to-[#2B7FFF] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(43,127,255,0.4)]">
            Brain
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-xs sm:text-sm uppercase tracking-[0.2em] font-medium text-blue-300/80 font-mono">
          Intelligence On Demand · Unified Root-Cause Diagnosis Across All 4 Leaks
        </p>

        <p className="max-w-3xl mx-auto text-sm sm:text-base text-gray-400 font-normal leading-relaxed">
          Razorpay ships separate agents for dunning, carts, and disputes. We built the single brain above them that diagnoses whether a failure is an <strong className="text-white">infrastructure timeout (TD)</strong>, a <strong className="text-white">user decline (BD)</strong>, an <strong className="text-white">RBI mandate bug</strong>, or an <strong className="text-white">SME receivable oversight</strong> — then triggers the single optimal, bounded recovery.
        </p>

        {/* Hero Interactive Quick Actions */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onOpenVoice}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Launch Live Hinglish Voice Call</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>

          <button
            onClick={onOpenComplianceDemo}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-sm font-medium backdrop-blur-md transition-all active:scale-95"
          >
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>Simulate 9 PM RBI Compliance Block</span>
          </button>
        </div>

        {/* 4 Pillars Mini-Badges */}
        <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
            <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400">
              <Cpu className="w-3.5 h-3.5" />
              <span>01. Payment TD vs BD</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Smart retry for bank down; specific nudges for wrong PIN/balance.</p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400">
              <Cpu className="w-3.5 h-3.5" />
              <span>02. Cart Drop-off</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Identifies mobile UPI mismatch vs friction; skips unfixable price shocks.</p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
            <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400">
              <Cpu className="w-3.5 h-3.5" />
              <span>03. RBI Mandate Bug</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Detects &gt;₹15K re-auth failures — stops futile blind retries.</p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
            <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>04. B2B Voice Chaser</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Hinglish AI voice agent negotiates and logs Promise-to-Pay.</p>
          </div>
        </div>

      </div>
    </div>
  );
};
