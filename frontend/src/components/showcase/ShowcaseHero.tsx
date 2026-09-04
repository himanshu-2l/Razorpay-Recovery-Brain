import React from 'react';
import { ArrowRight, Play, ShieldCheck, Zap, Activity, BookOpen } from 'lucide-react';
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
    <section className="relative pt-10 pb-16 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 razorpay-glow-hero pointer-events-none -z-10" />

      <div className="text-center space-y-7 max-w-4xl mx-auto px-4">

        {/* Data-Led Headline */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]">
            ₹{Math.round(totalAtRisk / 100000).toLocaleString('en-IN')}L at risk.{' '}
            <br className="hidden sm:block" />
            Recovered in{' '}
            <span className="font-serif-italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400">
              800 milliseconds.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Standard dunning bots retry blindly and get bank-blocked. Our autonomous engine diagnoses root cause in&nbsp;
            <span className="text-white font-medium">&lt;800ms</span>, halts cascading failures with circuit breakers, and orchestrates recovery across 4 revenue funnels simultaneously via Hinglish voice and WhatsApp.
          </p>
        </div>

        {/* CTA Row */}
        <div className="flex flex-wrap items-center justify-center gap-3">
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
            <span>Simulate a Failure</span>
          </button>
        </div>

        {/* Proof Strip — inline real metrics */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-400 font-mono">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% RBI FPC · DPDP Compliant</span>
          </div>
          <div className="w-px h-3 bg-white/10 hidden sm:block" />
          <div className="flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>&lt;800ms Diagnosis</span>
          </div>
          <div className="w-px h-3 bg-white/10 hidden sm:block" />
          <div className="flex items-center space-x-1.5">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>SHA-256 Merkle Audit</span>
          </div>
          <div className="w-px h-3 bg-white/10 hidden sm:block" />
          <div
            className="flex items-center space-x-1.5 cursor-help group relative"
            title="Institutional Foundations: Abe et al. (KDD 2010), CATE Uplift Modeling, arXiv:2601.02369 (UPI Scale), RAILS (arXiv:2606.08790)"
          >
            <BookOpen className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
            <span className="group-hover:text-purple-300 transition-colors">Peer-Reviewed Foundation</span>
          </div>
        </div>
      </div>

      {/* Hero Dashboard Visual */}
      <div className="mt-12 relative max-w-5xl mx-auto px-4">
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-900/20 glass-panel">
          <img
            src={heroCoreImg}
            alt="Revenue Recovery Brain — Operations Console"
            className="w-full h-auto object-cover transform hover:scale-[1.01] transition-transform duration-700"
          />

          {/* Floating Metric Bar */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#030712]/85 backdrop-blur-xl border border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <span className="text-xs text-gray-400 font-mono block">Real-time Recovery Yield</span>
                <span className="text-sm font-bold text-white font-mono">
                  ₹{Math.round(totalRecovered).toLocaleString('en-IN')} recovered ({recoveryRate}% yield)
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs font-mono text-gray-400">
              <div>
                <span className="text-gray-500 block">At Risk</span>
                <span className="text-white font-medium">₹{Math.round(totalAtRisk).toLocaleString('en-IN')}</span>
              </div>
              <div className="border-l border-white/10 pl-4">
                <span className="text-gray-500 block">Engine</span>
                <span className="text-emerald-400 font-medium">Armed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


