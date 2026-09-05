import React, { useState } from 'react';
import {
  Sparkles,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Activity,
  Mic,
  Play,
} from 'lucide-react';

interface StickyAgentShowcaseProps {
  onOpenVoice: () => void;
  onOpenCompliance: () => void;
  onOpenWebhook: () => void;
}

export const StickyAgentShowcase: React.FC<StickyAgentShowcaseProps> = ({
  onOpenVoice,
  onOpenCompliance,
  onOpenWebhook,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const STEPS = [
    {
      id: 1,
      tag: 'STAGE 01 · REAL-TIME TRIAGE',
      title: 'Sub-10ms Ingestion & Failure Diagnostics',
      desc: 'Intercepts incoming payment.failed and subscription.halted webhooks, instantly distinguishing Technical Degradation (TD) from Business Declines (BD).',
      metric: '< 10ms Latency',
      badge: 'Circuit Breaker Guard',
      color: 'from-blue-500 to-cyan-500',
      borderColor: 'border-cyan-500/40',
      activeBg: 'bg-cyan-500/10',
    },
    {
      id: 2,
      tag: 'STAGE 02 · CONVERSATIONAL TELEPHONY',
      title: 'Hinglish Voice Agent & Section 43B(h) Clock',
      desc: 'Places empathetic voice calls to debtors in Hinglish, enforces Section 43B(h) MSME 45-day tax urgency, and logs verifiable Promise-to-Pay (PTP).',
      metric: '82% Recovery Rate',
      badge: 'RBI 8 AM–7 PM Compliant',
      color: 'from-purple-500 to-indigo-500',
      borderColor: 'border-purple-500/40',
      activeBg: 'bg-purple-500/10',
    },
    {
      id: 3,
      tag: 'STAGE 03 · VERIFIABLE PROOF',
      title: 'Decision Receipts & Late Auth Intercept',
      desc: 'Seals counterfactual ENRV calculations in a SHA-256 cryptographic audit ledger and intercepts late payment authorizations asynchronously.',
      metric: '100% Audit Proof',
      badge: 'Zero Double Charge',
      color: 'from-emerald-500 to-teal-500',
      borderColor: 'border-emerald-500/40',
      activeBg: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#080d1a] p-6 sm:p-10 space-y-10 shadow-2xl agent-studio-grid">
      
      {/* ── Ambient Radial Iridescent Glows ───────────────────────────────────── */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-blue-600/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-purple-600/15 blur-[120px] pointer-events-none rounded-full" />

      {/* ── Header Section ────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>AUTONOMOUS RECOVERY WORKFLOWS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1] font-sans">
            Meet your Autonomous <br />
            <span className="font-serif-display italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 text-4xl sm:text-5xl lg:text-6xl">
              Recovery Fleet
            </span>
          </h2>

          <p className="text-sm sm:text-base text-gray-400 font-sans leading-relaxed">
            Self-orchestrating autonomous AI agents that monitor failed flows, resolve overdue B2B receivables, and mathematically maximize Expected Net Recoverable Value.
          </p>
        </div>

        {/* Step Indicator Badges */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((stepNum) => (
            <button
              key={stepNum}
              onClick={() => setActiveStep(stepNum)}
              className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all ${
                activeStep === stepNum
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/40'
                  : 'bg-white/[0.03] text-gray-400 hover:text-white border border-white/5 hover:bg-white/[0.06]'
              }`}
            >
              Stage 0{stepNum}
            </button>
          ))}
        </div>
      </div>

      {/* ── Interactive 2-Column Showcase ────────────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Interactive Step Switcher */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {STEPS.map((step) => {
              const isSelected = activeStep === step.id;
              return (
                <div
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 border ${
                    isSelected
                      ? `${step.activeBg} ${step.borderColor} shadow-xl shadow-blue-500/5 translate-x-1`
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-blue-300 uppercase">
                      {step.tag}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      isSelected
                        ? 'bg-white/10 text-white border-white/20'
                        : 'bg-white/[0.02] text-gray-500 border-white/5'
                    }`}>
                      {step.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white font-sans">
                    {step.title}
                  </h3>

                  <p className="text-xs text-gray-400 font-sans mt-1 leading-relaxed">
                    {step.desc}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono border-t border-white/5 pt-2.5">
                    <span className="text-emerald-400 font-bold">{step.metric}</span>
                    <span className={`flex items-center space-x-1 ${isSelected ? 'text-blue-400' : 'text-gray-600'}`}>
                      <span>Explore workflow</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Autonomous Prompt Capsule */}
          <div
            onClick={onOpenVoice}
            className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/30 border border-blue-500/20 backdrop-blur-xl flex items-center justify-between cursor-pointer hover:border-blue-400/40 transition-all group shadow-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs border border-blue-500/30 group-hover:scale-110 transition-transform">
                <Sparkles className="w-4 h-4 text-cyan-300" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">
                  + Ask Recovery AI to run autonomous chaser
                </div>
                <div className="text-[10px] font-mono text-gray-400">
                  Target: ₹1,91,000 overdue B2B receivables · 45-day tax clock
                </div>
              </div>
            </div>

            <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
              <Mic className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Right Column: Live Dynamic Pinned Showcase Screen */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex-1 p-6 rounded-3xl bg-[#0b1222]/90 border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
            
            {/* Window Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                <span className="text-xs font-mono text-gray-400 ml-2">
                  revenue-recovery-orchestrator.telemetry
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                  AGENT RUNTIME ACTIVE
                </span>
              </div>
            </div>

            {/* ── STAGE 1 VIEW: Sub-10ms Ingestion & Failure Diagnostics ─────── */}
            {activeStep === 1 && (
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                      Live Ingestion Stream
                    </span>
                    <h4 className="text-lg font-bold text-white">
                      NPCI Technical Degradation vs NSF Decline
                    </h4>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                    4.2ms Processed
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-cyan-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-gray-400">NPCI Switch Latency</span>
                      <span className="text-cyan-400 font-bold">142ms · STABLE</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full w-[24%]" />
                    </div>
                    <p className="text-[11px] text-gray-400 font-mono">Auto-retry armed for transient timeouts</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-gray-400">HDFC Rail Breaker</span>
                      <span className="text-emerald-400 font-bold">CLOSED (NORMAL)</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full w-[100%]" />
                    </div>
                    <p className="text-[11px] text-gray-400 font-mono">Outage detector: 0 trips in last 60 min</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 font-mono text-xs space-y-2 text-left">
                  <div className="text-gray-500 text-[10px] uppercase tracking-wider">Simulated Ingestion Event:</div>
                  <div className="text-cyan-300">
                    &gt; POST /api/webhook/razorpay · event: &quot;payment.failed&quot; · amount: ₹2,499.00
                  </div>
                  <div className="text-emerald-400">
                    &gt; Intercepted in 4.2ms: Root Cause: TECHNICAL_DEGRADATION (NPCI timeout)
                  </div>
                  <div className="text-purple-300">
                    &gt; Chosen Intervention: SMART_RETRY with Razorpay Optimizer (Lift: +60%)
                  </div>
                </div>

                <button
                  onClick={onOpenWebhook}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-mono text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Launch Webhook Sandbox Simulator</span>
                </button>
              </div>
            )}

            {/* ── STAGE 2 VIEW: Hinglish Voice Telephony & MSME Section 43B(h) ─ */}
            {activeStep === 2 && (
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">
                      B2B Telephony Chaser
                    </span>
                    <h4 className="text-lg font-bold text-white">
                      Overdue Invoices to Recover · ₹1,91,000 Pending
                    </h4>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">
                    MSME 45-Day Clock
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-purple-500/30 space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">INV-20268421 · Rajesh Sharma</div>
                      <div className="text-[11px] font-mono text-gray-400">Client Enterprises · 67 Days Overdue</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-base font-bold text-amber-400">₹85,000.00</div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-semibold border border-red-500/30">
                        URGENT (&gt;45 Days)
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 font-mono text-xs space-y-1">
                    <div className="text-purple-300 font-semibold">🎙️ AI Dialogue Preview (Hinglish):</div>
                    <p className="text-gray-300 text-[11px] italic">
                      &quot;Namaste Rajesh ji! Main INV-20268421 ke baare mein baat kar raha hoon. Aapka ₹85,000 ka invoice 67 din se pending hai... kya hum 8 September tak settle kar lein?&quot;
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={onOpenVoice}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-mono text-xs font-bold shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center space-x-2"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Auto-Call Debtor (Hinglish Voice)</span>
                  </button>

                  <button
                    onClick={onOpenCompliance}
                    className="px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-mono text-xs flex items-center space-x-1.5 transition-all"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>RBI Check</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── STAGE 3 VIEW: Decision Receipts & Audit Proof ──────────────── */}
            {activeStep === 3 && (
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                      Cryptographic Decision Receipt
                    </span>
                    <h4 className="text-lg font-bold text-white">
                      SHA-256 Tamper-Evident Audit Ledger
                    </h4>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    SEAL VERIFIED
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 font-mono text-center">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-[10px] text-gray-500">P10 FLOOR</div>
                    <div className="text-xs font-bold text-gray-300 mt-0.5">₹3,841.50</div>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <div className="text-[10px] text-purple-300 font-bold">P50 ENRV</div>
                    <div className="text-xs font-bold text-purple-200 mt-0.5">₹5,910.00</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-[10px] text-gray-500">P90 CEILING</div>
                    <div className="text-xs font-bold text-emerald-400 mt-0.5">₹7,387.50</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 font-mono text-xs space-y-1.5 text-left">
                  <div className="flex items-center justify-between text-gray-400 text-[10px]">
                    <span>RECEIPT ID: rcpt_83b659f5109e47</span>
                    <span className="text-emerald-400">STATUS: SEALED & TAMPER-FREE</span>
                  </div>
                  <div className="text-[11px] text-gray-300 truncate">
                    HASH: e1bcb3a303fb5118721c29e1aa71f28b78912e5a40b12a87c1248e
                  </div>
                  <div className="text-[10px] text-emerald-400/90 pt-1">
                    ✓ Asynchronous late auth intercept armed: outreach cancels automatically on payment.captured
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between text-xs font-mono text-emerald-300">
                  <span className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Autonomy Envelope: Cap ₹25,000 · Expanded Mode</span>
                  </span>
                  <span className="text-[10px] text-gray-400">Hysteresis: 5 Cycles</span>
                </div>
              </div>
            )}

            {/* Bottom Telemetry Footer Bar */}
            <div className="border-t border-white/10 pt-3 flex items-center justify-between text-[10px] font-mono text-gray-400">
              <div className="flex items-center space-x-2">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Zero Double-Charge Invariant Enforced</span>
              </div>
              <div>Sub-150ms Guaranteed Execution</div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
