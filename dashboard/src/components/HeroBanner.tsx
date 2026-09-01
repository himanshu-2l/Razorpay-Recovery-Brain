import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Layers,
  Mic,
  IndianRupee,
} from 'lucide-react';

interface HeroBannerProps {
  onOpenVoice: () => void;
  onOpenComplianceDemo: () => void;
  onRefreshBatch: () => void;
  isProcessing: boolean;
  totalAtRisk: number;
  totalRecovered: number;
  recoveryRate: number;
}

const PREBUILT_AGENTS = [
  {
    name: 'Subscription Recovery',
    tagline: 'Mandate & Dunning Engine',
    desc: 'Analyzes failed subscription payments, applies smarter retry logic, and triggers targeted customer nudges.',
    status: 'Unified in Brain',
    icon: '🔄',
    color: 'from-blue-600 to-indigo-600',
    border: 'border-blue-500/30'
  },
  {
    name: 'Abandoned Cart Conversion',
    tagline: 'Checkout Drop-off Recovery',
    desc: 'Identifies abandoned checkouts and re-engages buyers via 1-click WhatsApp intents with personalized recovery.',
    status: 'Unified in Brain',
    icon: '🛒',
    color: 'from-cyan-600 to-blue-600',
    border: 'border-cyan-500/30'
  },
  {
    name: 'B2B Voice Receivables',
    tagline: 'Hinglish Telephony Agent',
    desc: 'Empathetic conversational AI that calls debtors in Hinglish, negotiates terms, and logs Promise-to-Pay.',
    status: 'Unified in Brain',
    icon: '📞',
    color: 'from-purple-600 to-pink-600',
    border: 'border-purple-500/30'
  },
  {
    name: 'Payment Degradation Guard',
    tagline: 'NPCI & TD Diagnostics',
    desc: 'Distinguishes Technical Degradation (TD) from Business Declines (BD) to prevent futile customer disturbance.',
    status: 'Unified in Brain',
    icon: '⚡',
    color: 'from-amber-600 to-orange-600',
    border: 'border-amber-500/30'
  },
  {
    name: 'Dispute Responder',
    tagline: 'Chargeback Maximizer',
    desc: 'Auto-responds to chargebacks with optimized evidence packets to maximize dispute win rates.',
    status: 'Compatible',
    icon: '⚖️',
    color: 'from-emerald-600 to-teal-600',
    border: 'border-emerald-500/30'
  },
  {
    name: 'RTO Shield & Insights',
    tagline: 'COD Address Validator',
    desc: 'Detects high-risk COD orders before dispatch using LLM address validation and bad pincode intelligence.',
    status: 'Compatible',
    icon: '🛡️',
    color: 'from-rose-600 to-red-600',
    border: 'border-rose-500/30'
  },
  {
    name: 'Cashflow Forecaster',
    tagline: 'Liquidity Predictor',
    desc: 'Predicts cash position 3–7 days ahead with alerts for payroll risk, shortfalls, and payout failures.',
    status: 'Compatible',
    icon: '📈',
    color: 'from-violet-600 to-indigo-600',
    border: 'border-violet-500/30'
  }
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onOpenVoice,
  onOpenComplianceDemo,
}) => {
  const [showAgentStack, setShowAgentStack] = useState<boolean>(false);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#07132B] shadow-2xl">
      
      {/* ── Signature Atmospheric Radiant Blue Lighting & Ray Gradients ───────── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c2f82] via-[#0b2460] to-[#040e22] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-blue-500/25 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 -right-20 w-[550px] h-[550px] bg-cyan-400/20 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none opacity-40" />

      {/* ── Hero Main Content Grid ───────────────────────────────────────────── */}
      <div className="relative z-10 px-6 sm:px-10 lg:px-12 pt-10 pb-8 space-y-8">
        
        {/* Top Floating Mini-Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2B7FFF] animate-ping" />
            <span className="text-[11px] font-mono font-bold tracking-[0.22em] uppercase text-blue-300">
              INTRODUCING · RAZORPAY AGENT STUDIO
            </span>
          </div>

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/90 text-[11px] font-mono backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Anthropic Claude Agent SDK · Sub-150ms Telephony & Recovery</span>
          </div>
        </div>

        {/* 2-Column Showcase (Left: Copy & CTAs | Right: Centerpiece Spectral Artwork) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Stacked Headline & Controls */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="space-y-3">
              <span className="text-xs sm:text-sm font-mono font-bold tracking-[0.25em] text-cyan-300 uppercase block">
                INTRODUCING
              </span>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.02] font-sans">
                Razorpay<br />
                Agentic<br />
                Payments
              </h1>

              <p className="text-base sm:text-lg text-blue-100/90 font-sans font-medium pt-1 leading-relaxed">
                AI-Powered Conversational Payment Experience & Revenue Recovery Engine
              </p>
            </div>

            {/* CTA Buttons Matching Razorpay Official Cut-Corner Style */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {/* Primary Black Cut-Corner Capsule Button */}
              <button
                onClick={onOpenVoice}
                className="group relative px-7 py-3.5 bg-black text-white text-xs sm:text-sm font-bold tracking-wide transition-all hover:bg-neutral-900 border border-white/20 shadow-xl flex items-center space-x-2.5 active:scale-95"
                style={{
                  clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)',
                }}
              >
                <span>Sign Up / Launch Voice AI</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenComplianceDemo}
                className="flex items-center space-x-2 px-5 py-3.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white text-xs font-mono backdrop-blur-md transition-all active:scale-95"
              >
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <span>Simulate 9 PM RBI Shield</span>
              </button>

              <button
                onClick={() => setShowAgentStack(!showAgentStack)}
                className={`flex items-center space-x-2 px-4 py-3.5 rounded-full border text-xs font-mono transition-all ${
                  showAgentStack
                    ? 'bg-purple-600/30 text-purple-300 border-purple-400'
                    : 'bg-white/[0.04] text-gray-300 border-white/10 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{showAgentStack ? 'Hide Agent Stack' : 'Agent Stack (7)'}</span>
              </button>
            </div>

            {/* Mini Trust Pillars */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1 backdrop-blur-sm">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>100% RBI Compliant</span>
                </div>
                <p className="text-[11px] text-gray-300">8 AM–7 PM window auto-enforced.</p>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1 backdrop-blur-sm">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-cyan-400 font-mono">
                  <Zap className="w-3.5 h-3.5" />
                  <span>&lt;150ms Triage</span>
                </div>
                <p className="text-[11px] text-gray-300">TD vs BD root-cause classification.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Centerpiece (Spectral Woman with Floating Tech Nodes) */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            
            {/* Glowing Backdrop Aura */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 via-cyan-500/20 to-purple-600/30 rounded-3xl filter blur-2xl pointer-events-none" />

            {/* Main Showcase Frame */}
            <div className="relative w-full rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-black/40 group">
              
              {/* Spectral AI Heat-Map Centerpiece Image */}
              <img
                src="/hero-agentic-centerpiece.jpg"
                alt="Razorpay Agentic Payments - AI Conversational Experience"
                className="w-full h-auto object-cover rounded-3xl transition-transform duration-700 group-hover:scale-105"
              />

              {/* Floating Node 1: Frosted Microphone Glassmorphic Tile */}
              <div className="absolute left-4 top-1/3 -translate-y-1/2 p-3.5 rounded-2xl bg-white/[0.12] backdrop-blur-xl border border-white/30 shadow-2xl flex items-center justify-center text-white animate-pulse">
                <Mic className="w-6 h-6 text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              </div>

              {/* Floating Node 2: Frosted Rupee Glassmorphic Blueprint Tile */}
              <div className="absolute right-4 top-6 p-3.5 rounded-2xl bg-white/[0.12] backdrop-blur-xl border border-white/30 shadow-2xl flex items-center justify-center text-white">
                <IndianRupee className="w-6 h-6 text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
              </div>

              {/* Floating Node 3: Bottom Interactive '+ Ask Anything' Capsule */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] sm:w-[80%] px-5 py-3 rounded-full bg-white/[0.15] backdrop-blur-2xl border border-white/30 shadow-2xl flex items-center justify-between text-white cursor-pointer hover:bg-white/[0.22] transition-all"
                   onClick={onOpenVoice}>
                <div className="flex items-center space-x-2 text-xs sm:text-sm font-sans font-semibold">
                  <span className="text-cyan-300 text-base font-bold">+</span>
                  <span>Ask Anything (Hinglish Voice Agent)</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <div className="flex items-center space-x-0.5">
                    <span className="w-0.5 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-0.5 h-3.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-0.5 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* ── Collapsible Prebuilt Agent Studio Stack ───────────────────────── */}
        {showAgentStack && (
          <div className="pt-4 animate-in fade-in zoom-in-95 duration-300 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 text-left">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  Razorpay Agent Studio · Autonomous AI Fleet (7 Engines)
                </span>
                <p className="text-[11px] text-gray-300">
                  How the Revenue Recovery Brain unifies and orchestrates the prebuilt Razorpay agent suite:
                </p>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                UNIFIED GRID ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
              {PREBUILT_AGENTS.map((agent, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-2xl bg-white/[0.04] border ${agent.border} backdrop-blur-md space-y-1.5 transition-all hover:bg-white/[0.08]`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{agent.icon}</span>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                      agent.status === 'Unified in Brain'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-white/5 text-gray-400 border border-white/10'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white font-sans">{agent.name}</div>
                  <div className="text-[10px] font-mono text-gray-300">{agent.tagline}</div>
                  <p className="text-[11px] text-gray-300 leading-snug line-clamp-2">{agent.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Official Full-Width White Partner Ecosystem Marquee Ticker ───────── */}
      <div className="w-full bg-white py-4 px-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6 text-gray-900 font-sans font-bold text-sm tracking-wider opacity-80 hover:opacity-100 transition-opacity">
          <span className="font-extrabold tracking-tighter text-base">boAt</span>
          <span className="tracking-wide">super <span className="bg-black text-white px-1 py-0.5 rounded text-xs">U</span></span>
          <span className="text-xs tracking-tight uppercase font-mono">NUGGET <span className="text-[9px] text-gray-500">BY ZOMATO</span></span>
          <span className="text-xs tracking-wider uppercase font-mono">gnani.ai</span>
          <span className="italic font-serif text-base tracking-normal">zomato</span>
          <span className="text-xs tracking-widest uppercase font-semibold">BLUESTONE</span>
          <span className="text-base font-extrabold tracking-tighter text-red-600">Vi</span>
          <span className="text-xs font-mono font-bold tracking-widest uppercase">PVR INOX</span>
          <span className="text-xs tracking-tight">the <span className="font-bold">dērma</span> co</span>
          <span className="text-xs font-mono font-bold uppercase text-blue-600">SARVAM.AI</span>
        </div>
      </div>

    </div>
  );
};
