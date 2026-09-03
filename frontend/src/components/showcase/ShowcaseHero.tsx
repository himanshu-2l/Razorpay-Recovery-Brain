import React from 'react';
import { ArrowRight, Play, Sparkles, ShieldCheck, Zap, Activity } from 'lucide-react';
import heroCoreImg from '../../assets/hero_core.jpg';

interface ShowcaseHeroProps {
  onLaunchConsole: () => void;
  onOpenSimulator: () => void;
  totalAtRisk: number;
  totalRecovered: number;
  recoveryRate: number;
}

export const ShowcaseHero: React.FC<ShowcaseHeroProps> = ({
  onLaunchConsole,
  onOpenSimulator,
  totalAtRisk,
  totalRecovered,
  recoveryRate,
}) => {
  return (
    <section className="relative pt-8 pb-16 overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 razorpay-glow-hero pointer-events-none -z-10" />

      <div className="text-center space-y-6 max-w-4xl mx-auto px-4">
        {/* Top Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#2b82fb] text-xs font-mono tracking-wide shadow-sm shadow-blue-500/10">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span className="font-semibold text-white/90">Razorpay Agent Studio</span>
          <span className="text-white/30">|</span>
          <span className="text-blue-300">Track 03: AI Revenue Recovery</span>
        </div>

        {/* Editorial Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
          The payment failed. <br />
          The recovery{' '}
          <span className="font-serif-italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400">
            already began.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto font-sans leading-relaxed">
          Standard retries blindly retry and get rate-limited. Our autonomous engine diagnoses root cause in milliseconds, halts bank penalties with circuit breakers, and recovers revenue via Hinglish voice and WhatsApp.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onLaunchConsole}
            className="flex items-center space-x-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm shadow-xl shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <span>Launch Operations Console</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSimulator}
            className="flex items-center space-x-2 px-6 py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-medium text-sm backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>Simulate Failure Scenario</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-gray-400 font-mono">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% RBI Curfew & DPDP Compliant</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>&lt;800ms Time-to-Diagnosis</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>SHA-256 Merkle Ledger Sealed</span>
          </div>
        </div>
      </div>

      {/* Hero Visual Asset Display */}
      <div className="mt-12 relative max-w-5xl mx-auto px-4">
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-900/20 glass-panel">
          <img
            src={heroCoreImg}
            alt="Razorpay Agent Studio Core Dashboard"
            className="w-full h-auto object-cover transform hover:scale-[1.01] transition-transform duration-700"
          />

          {/* Floating Metric Badges over Image */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#030712]/80 backdrop-blur-xl border border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <span className="text-xs text-gray-400 font-mono block">Real-time Recovery Yield</span>
                <span className="text-sm font-bold text-white font-mono">
                  ₹{Math.round(totalRecovered).toLocaleString('en-IN')} recovered ({recoveryRate}% yield)
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs font-mono text-gray-400">
              <div>
                <span className="text-gray-500 block">Total At Risk</span>
                <span className="text-white font-medium">₹{Math.round(totalAtRisk).toLocaleString('en-IN')}</span>
              </div>
              <div className="border-l border-white/10 pl-4">
                <span className="text-gray-500 block">Active Status</span>
                <span className="text-emerald-400 font-medium">Engine Armed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
