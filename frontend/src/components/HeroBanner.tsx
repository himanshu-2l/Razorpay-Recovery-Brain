import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  PhoneCall,
  ShieldAlert,
  Bot,
  Zap,
  CheckCircle2,
  Lock,
  Layers
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
    <div className="relative overflow-hidden pt-10 pb-8 px-4 sm:px-6 lg:px-8 agent-studio-grid rounded-3xl border border-white/5 bg-[#050507]">
      
      {/* Signature Thermal Iridescent Glow Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] thermal-aura pointer-events-none -z-0" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[300px] bg-purple-600/10 blur-[110px] pointer-events-none -z-0" />
      <div className="absolute top-1/3 right-1/4 w-[350px] h-[250px] bg-cyan-500/10 blur-[100px] pointer-events-none -z-0" />

      <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
        
        {/* Top Eyebrows / Credibility Pill */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#2B7FFF] animate-ping" />
            <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-blue-300">
              INTELLIGENCE ON DEMAND
            </span>
          </div>

          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-mono">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Built on Anthropic's Claude Agent SDK & Razorpay Optimizer</span>
          </div>
        </div>

        {/* The Famous Agent Studio Thesis Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-sans max-w-4xl mx-auto leading-[1.15]">
            Every month, businesses lose revenue not because payments fail,&nbsp;
            <span className="font-serif-display italic text-[#2B7FFF] font-normal text-4xl sm:text-6xl lg:text-7xl block mt-2 drop-shadow-[0_0_35px_rgba(43,127,255,0.4)]">
              but because no one has time to fix what happens after.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-gray-400 font-sans leading-relaxed">
            <strong className="text-white">Revenue Recovery Brain</strong> is the grand unified orchestration engine for Razorpay Agent Studio. It diagnoses root causes in <strong className="text-white">&lt;150ms</strong>, enforces a strict <strong className="text-emerald-400">Responsible Collections Policy (RBI FPC-Inspired)</strong>, and automates high-conversion <strong className="text-purple-300">Hinglish Voice & Mandate Interventions</strong>.
          </p>
        </div>

        {/* Hero Interactive CTA Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onOpenVoice}
            className="flex items-center space-x-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-[#2B7FFF] via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Simulate Hinglish Voice Recovery</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>

          <button
            onClick={onOpenComplianceDemo}
            className="flex items-center space-x-2 px-5 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-medium backdrop-blur-md transition-all active:scale-95"
          >
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>Simulate 9 PM Out-of-Hours Policy Block</span>
          </button>

          <button
            onClick={() => setShowAgentStack(!showAgentStack)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-full border text-xs font-mono transition-all ${
              showAgentStack
                ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                : 'bg-white/[0.02] text-gray-400 border-white/5 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showAgentStack ? 'Hide Agent Stack' : 'View Agent Studio Stack (7 Agents)'}</span>
          </button>
        </div>

        {/* Agent Studio Stack Viewer (Collapsible / Expandable) */}
        {showAgentStack && (
          <div className="pt-6 animate-in fade-in zoom-in-95 duration-300 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 text-left">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">
                  Razorpay Agent Studio · Autonomous AI Stack
                </span>
                <p className="text-[11px] text-gray-400">
                  How the Revenue Recovery Brain unifies and orchestrates the prebuilt Razorpay agent suite:
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                UNIFIED GRID ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
              {PREBUILT_AGENTS.map((agent, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-2xl bg-white/[0.02] border ${agent.border} backdrop-blur-sm space-y-1.5 transition-all hover:bg-white/[0.05]`}
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
                  <div className="text-[10px] font-mono text-gray-400">{agent.tagline}</div>
                  <p className="text-[11px] text-gray-300 leading-snug line-clamp-2">{agent.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4 Pillars Mini-Badges with Razorpay Design System styling */}
        <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm space-y-1">
            <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400">
              <Zap className="w-3.5 h-3.5" />
              <span>01. Payment TD vs BD</span>
            </div>
            <p className="text-[11px] text-gray-400">NPCI smart retry for bank downtime; targeted nudges for PIN/balance.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm space-y-1">
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400">
              <Bot className="w-3.5 h-3.5" />
              <span>02. Cart Drop-off</span>
            </div>
            <p className="text-[11px] text-gray-400">1-click WhatsApp checkout intents; skips unfixable price shocks.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm space-y-1">
            <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400">
              <Lock className="w-3.5 h-3.5" />
              <span>03. RBI Mandate Bug</span>
            </div>
            <p className="text-[11px] text-gray-400">Triggers re-auth notification for &gt;₹15K limits with 24-hr pre-debit buffer.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm space-y-1">
            <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>04. B2B Voice Chaser</span>
            </div>
            <p className="text-[11px] text-gray-400">Hinglish AI voice agent negotiates and logs Promise-to-Pay.</p>
          </div>
        </div>

        {/* Customer / Quote Proof Banner */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white text-xs">
              IG
            </div>
            <div>
              <div className="text-xs font-semibold text-white">
                “AI agents that address real commerce challenges — recovering revenue, resolving disputes, and predicting cash flow.”
              </div>
              <div className="text-[10px] font-mono text-gray-400">
                Irina Ghose · Managing Director, Anthropic India
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[10px] font-mono text-emerald-400 flex-shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Responsible Collections Policy (RBI FPC-Inspired)</span>
          </div>
        </div>

      </div>
    </div>
  );
};
