import React, { useState } from 'react';
import {
  ArrowRight,
  Play,
  ShieldCheck,
  Zap,
  Activity,
  BookOpen,
  TrendingUp,
  Cpu,
  PhoneCall,
  MessageSquare,
  Lock,
  Volume2,
  CheckCircle2,
  RefreshCw,
  Send,
} from 'lucide-react';

interface ShowcaseHeroProps {
  onLaunchConsole: () => void;
  onOpenSimulator: () => void;
  totalAtRisk: number;
  totalRecovered: number;
  recoveryRate: number;
}

type HeroTab = 'circuit' | 'voice' | 'whatsapp' | 'merkle';

export const ShowcaseHero: React.FC<ShowcaseHeroProps> = ({
  onLaunchConsole,
  onOpenSimulator,
  totalAtRisk,
  totalRecovered,
  recoveryRate,
}) => {
  const [activeTab, setActiveTab] = useState<HeroTab>('circuit');
  const [isSimulatingDowntime, setIsSimulatingDowntime] = useState<boolean>(true);
  const [voicePlaying, setVoicePlaying] = useState<boolean>(true);
  const [whatsappPaid, setWhatsappPaid] = useState<boolean>(false);

  return (
    <section className="relative pt-12 pb-24 overflow-hidden">
      
      {/* ── Horizon Light Radial Bloom ────────────────────────────────────── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[480px] rounded-full pointer-events-none -z-0 opacity-65"
        style={{
          background: 'radial-gradient(circle, rgba(8, 33, 143, 0.45) 20%, rgba(41, 138, 203, 0.25) 55%, transparent 80%)',
          filter: 'blur(100px)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">

        {/* Chain Badge Announcement Pill with Razor Chamfer */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-[#305EFF]/50 bg-[#202a3e] text-[#305EFF] text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-[#305EFF] animate-ping" />
          <span className="tracking-wide uppercase font-semibold">
            RAZOR-EDGE REVENUE RECOVERY ENGINE · SUB-800MS DECISIONING
          </span>
        </div>

        {/* Hero Headline (Idle Finance display style with single cyan split) */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-['Open_Sans'] font-bold tracking-[-0.036em] text-[#ffffff] leading-[1.12]">
            Stop Payment Leaks.{' '}
            <br className="hidden sm:block" />
            <span className="text-[#305EFF]">Before They Fail.</span>
          </h1>

          <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed text-[#cdd0d6] font-['Open_Sans']">
            India's first autonomous revenue recovery engine. Intercepts failed transactions in <span className="text-[#305EFF] font-semibold">&lt;800ms</span>, trips 150ms circuit breakers around degraded bank switches, recovers carts via Hinglish WhatsApp & Voice, and clears the 45-day MSME tax cliff.
          </p>
        </div>

        {/* Paired Actions: Filled White Pill + Ghost Cyan Link */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {/* Primary Action Button */}
          <button
            onClick={onLaunchConsole}
            className="idle-btn-primary px-7 py-3 text-sm flex items-center space-x-2 font-semibold"
          >
            <span>Launch Operations Console</span>
            <ArrowRight className="w-4 h-4 text-[#000000]" />
          </button>

          {/* Secondary Ghost Link Action */}
          <button
            onClick={onOpenSimulator}
            className="idle-btn-ghost px-5 py-3 text-sm flex items-center space-x-2"
          >
            <Play className="w-3.5 h-3.5 fill-[#305EFF]" />
            <span>Simulate a Failure</span>
          </button>
        </div>

        {/* Proof Strip with hairline dividers */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-[#cdd0d6] pt-2">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-[#305EFF]" />
            <span>100% RBI FPC · DPDP Compliant</span>
          </div>
          <div className="w-px h-3 bg-white/15 hidden sm:block" />
          <div className="flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-[#305EFF]" />
            <span>&lt;800ms Autonomous Triage</span>
          </div>
          <div className="w-px h-3 bg-white/15 hidden sm:block" />
          <div className="flex items-center space-x-1.5">
            <Activity className="w-4 h-4 text-[#305EFF]" />
            <span>SHA-256 Merkle Audit</span>
          </div>
          <div className="w-px h-3 bg-white/15 hidden sm:block" />
          <div
            className="flex items-center space-x-1.5 cursor-help group"
            title="Institutional Foundations: Abe et al. (KDD 2010), CATE Uplift Modeling, arXiv:2601.02369"
          >
            <BookOpen className="w-4 h-4 text-[#305EFF]" />
            <span className="group-hover:text-[#ffffff] transition-colors">Peer-Reviewed Science</span>
          </div>
        </div>

      </div>

      {/* ── Deep-Sea Trading Terminal Platform Simulator ────────────────── */}
      <div className="mt-14 relative max-w-5xl mx-auto px-4 sm:px-6 z-10">
        
        {/* Top Float Callout (Top Left) */}
        <div className="hidden md:flex absolute -top-5 -left-2 z-20 items-center space-x-2.5 px-3.5 py-2 rounded-full bg-[#202a3e] border border-[rgba(255,255,255,0.08)] shadow-lg">
          <div className="p-1 rounded-full bg-[#305EFF]/15 text-[#305EFF]">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <div className="text-xs font-mono font-bold text-[#305EFF] leading-none">+14.2% GMV Lift</div>
            <div className="text-[10px] text-[#cdd0d6] mt-0.5">Autonomous Intercept Active</div>
          </div>
        </div>

        {/* Top Float Callout (Top Right) */}
        <div className="hidden md:flex absolute -top-5 -right-2 z-20 items-center space-x-2.5 px-3.5 py-2 rounded-full bg-[#202a3e] border border-[rgba(255,255,255,0.08)] shadow-lg">
          <div className="p-1 rounded-full bg-[#305EFF]/15 text-[#305EFF]">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <div className="text-xs font-mono font-bold text-[#305EFF] leading-none">Circuit Breaker Armed</div>
            <div className="text-[10px] text-[#cdd0d6] mt-0.5">4 Gateway Fallbacks Ready</div>
          </div>
        </div>

        {/* Tide Card Terminal Container: Flat #202a3e with 1px border & 15px radius */}
        <div className="bg-[#202a3e] border border-[rgba(255,255,255,0.08)] rounded-[15px] overflow-hidden text-left">
          
          {/* Terminal Navigation Bar */}
          <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.08)] bg-[#17202e]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#305EFF]/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              </div>
              <span className="text-xs font-mono text-[#cdd0d6] font-semibold hidden sm:inline">
                recovery-terminal :: stage-feed
              </span>
            </div>

            {/* Tab Pill Filter Row (80px radius) */}
            <div className="flex items-center p-1 rounded-full bg-[#17202e] border border-[rgba(255,255,255,0.08)]">
              <button
                onClick={() => setActiveTab('circuit')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-heading cursor-pointer transition-all ${
                  activeTab === 'circuit'
                    ? 'bg-[#ffffff] text-[#000000] font-semibold'
                    : 'text-[#cdd0d6] hover:text-[#ffffff]'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Circuit Breaker</span>
              </button>

              <button
                onClick={() => setActiveTab('voice')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-heading cursor-pointer transition-all ${
                  activeTab === 'voice'
                    ? 'bg-[#ffffff] text-[#000000] font-semibold'
                    : 'text-[#cdd0d6] hover:text-[#ffffff]'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Hinglish Voice</span>
              </button>

              <button
                onClick={() => setActiveTab('whatsapp')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-heading cursor-pointer transition-all ${
                  activeTab === 'whatsapp'
                    ? 'bg-[#ffffff] text-[#000000] font-semibold'
                    : 'text-[#cdd0d6] hover:text-[#ffffff]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Pay</span>
              </button>

              <button
                onClick={() => setActiveTab('merkle')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-heading cursor-pointer transition-all ${
                  activeTab === 'merkle'
                    ? 'bg-[#ffffff] text-[#000000] font-semibold'
                    : 'text-[#cdd0d6] hover:text-[#ffffff]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Merkle Audit</span>
              </button>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="p-6 sm:p-8 min-h-[380px] flex flex-col justify-between bg-[#17202e]/40">

            {/* TAB 1: CIRCUIT BREAKER SWITCHBOARD */}
            {activeTab === 'circuit' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-heading font-bold text-[#ffffff]">
                      Autonomous Gateway Circuit Breaker & Failover
                    </h3>
                    <p className="text-xs text-[#cdd0d6] mt-1">
                      When an upstream bank gateway degrades, traffic dynamically shifts in &lt;150ms.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSimulatingDowntime(!isSimulatingDowntime)}
                    className="idle-btn-ghost text-xs px-3 py-1.5 flex items-center space-x-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingDowntime ? 'animate-spin' : ''}`} />
                    <span>{isSimulatingDowntime ? 'Simulating HDFC Downtime (503)' : 'All Gateways Nominal'}</span>
                  </button>
                </div>

                {/* Gateway Tiles: Flat #202a3e cards with hairline borders */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className={`p-4 rounded-[12px] border ${
                    isSimulatingDowntime
                      ? 'border-[#ff4d4d]/50 bg-[#ff4d4d]/10'
                      : 'border-[rgba(255,255,255,0.08)] bg-[#202a3e]'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-[#cdd0d6]">HDFC Switch</span>
                      <span className={isSimulatingDowntime ? 'text-[#ff4d4d] font-bold' : 'text-[#305EFF]'}>
                        {isSimulatingDowntime ? 'DEGRADED' : 'HEALTHY'}
                      </span>
                    </div>
                    <div className="text-xl font-bold font-mono text-[#ffffff]">
                      {isSimulatingDowntime ? '4,820 ms' : '140 ms'}
                    </div>
                    <div className="text-[10px] text-[#cdd0d6]/70 mt-1 font-mono">
                      {isSimulatingDowntime ? 'Circuit Open · Throttled' : 'Primary Routing Active'}
                    </div>
                  </div>

                  <div className={`p-4 rounded-[12px] border ${
                    isSimulatingDowntime
                      ? 'border-[#305EFF]/50 bg-[#305EFF]/10'
                      : 'border-[rgba(255,255,255,0.08)] bg-[#202a3e]'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-[#cdd0d6]">ICICI Priority</span>
                      <span className="text-[#305EFF] font-bold">FAILOVER ACTIVE</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-[#ffffff]">112 ms</div>
                    <div className="text-[10px] text-[#305EFF] font-medium mt-1 font-mono">
                      Handling 82% diverted GMV
                    </div>
                  </div>

                  <div className="p-4 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[#202a3e]">
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-[#cdd0d6]">SBI Core</span>
                      <span className="text-[#305EFF] font-bold">READY</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-[#ffffff]">165 ms</div>
                    <div className="text-[10px] text-[#cdd0d6]/70 mt-1 font-mono">Secondary fallback ready</div>
                  </div>

                  <div className="p-4 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[#202a3e]">
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-[#cdd0d6]">Axis UPI</span>
                      <span className="text-[#305EFF] font-bold">STANDBY</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-[#ffffff]">190 ms</div>
                    <div className="text-[10px] text-[#cdd0d6]/70 mt-1 font-mono">Zero downtime recorded</div>
                  </div>
                </div>

                {/* Circuit Breaker Stamped Result Banner */}
                <div className="p-4 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[#202a3e] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-[#305EFF]/15 text-[#305EFF]">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#ffffff]">
                        Auto-Routing Result: ₹3,42,890 Preserved From Outage
                      </div>
                      <div className="text-[11px] text-[#cdd0d6]">
                        1,420 checkout sessions preserved without requiring customer to refresh or re-enter credentials.
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-[#305EFF] font-semibold px-3 py-1 rounded-full border border-[#305EFF]/30 bg-[#305EFF]/10">
                    99.98% SUCCESS
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: HINGLISH VOICE TELEPHONY */}
            {activeTab === 'voice' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-heading font-bold text-[#ffffff]">
                      Conversational Hinglish AI Agent
                    </h3>
                    <p className="text-xs text-[#cdd0d6] mt-1">
                      Places low-latency, empathetic calls in native Indian vernacular to verify payment intent.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-mono text-[#305EFF] bg-[#305EFF]/10 px-3 py-1 rounded-full border border-[#305EFF]/30">
                    <span className="w-2 h-2 rounded-full bg-[#305EFF] animate-ping" />
                    <span>CALL ACTIVE · 00:24</span>
                  </div>
                </div>

                {/* Audio Waveform Bar */}
                <div className="p-4 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[#202a3e] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setVoicePlaying(!voicePlaying)}
                      className="p-2.5 rounded-full bg-[#305EFF] text-[#000000] hover:bg-[#ffffff] transition-all cursor-pointer"
                    >
                      <Volume2 className={`w-4 h-4 ${voicePlaying ? 'animate-pulse' : ''}`} />
                    </button>
                    <div>
                      <div className="text-xs font-semibold text-[#ffffff]">
                        Synthetic Hinglish Stream (480ms turnaround)
                      </div>
                      <div className="text-[11px] text-[#cdd0d6]/70 font-mono">
                        Abe et al. Uplift Modeling · Sentiment: Positive (PTP)
                      </div>
                    </div>
                  </div>

                  {/* Animated Soundbars in Spectral Cyan */}
                  <div className="flex items-center space-x-1 h-6">
                    {[16, 24, 12, 28, 18, 22, 14, 26, 20, 10, 24, 16].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-[#305EFF] rounded-full transition-all duration-150"
                        style={{
                          height: voicePlaying ? `${h}px` : '4px',
                          opacity: voicePlaying ? 1 : 0.35,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Dialogue Stream */}
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-[12px] border border-[#305EFF]/20 bg-[#305EFF]/5 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold block text-[#305EFF]">
                      Autonomous AI Voice Agent
                    </span>
                    <p className="leading-relaxed text-[#ffffff]">
                      "Namaste Rahul ji! Main payment recovery desk se call kar raha hoon. Aapka ₹4,890 ka payment HDFC server timeout ki wajah se hold pe tha. Kya hum WhatsApp par direct UPI link bhej dein?"
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[#202a3e] space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold block text-[#cdd0d6]">
                      Customer Response (Rahul Mehta)
                    </span>
                    <p className="leading-relaxed text-[#ffffff]">
                      "Haan please, WhatsApp par bhej dijiye, I will pay right away through GPay."
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: WHATSAPP CONVERSATIONAL PAY */}
            {activeTab === 'whatsapp' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-heading font-bold text-[#ffffff]">
                      Tokenized WhatsApp One-Click Checkout
                    </h3>
                    <p className="text-xs text-[#cdd0d6] mt-1">
                      Pre-filled, zero-fraud UPI Intent links sent via official verified Meta business channel.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#305EFF] flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4 text-[#305EFF]" />
                    <span>Verified Meta Green Badge</span>
                  </span>
                </div>

                {/* WhatsApp Terminal Bubble */}
                <div className="p-5 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[#202a3e] max-w-md mx-auto space-y-3">
                  <div className="flex items-center space-x-2.5 pb-2 border-b border-[rgba(255,255,255,0.08)]">
                    <div className="w-8 h-8 rounded-full bg-[#305EFF]/20 text-[#305EFF] flex items-center justify-center font-bold text-xs">
                      R
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#ffffff] flex items-center space-x-1">
                        <span>Recovery Payments</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#305EFF]" />
                      </div>
                      <div className="text-[10px] text-[#cdd0d6]/70 font-mono">Official Business Channel</div>
                    </div>
                  </div>

                  <p className="text-xs text-[#cdd0d6] leading-relaxed">
                    Hello Rahul! Your pending cart at <strong>Mehta Textiles</strong> is safely reserved. Tap below to complete payment instantly via GPay/PhonePe:
                  </p>

                  <div className="p-3 rounded-[8px] bg-[#17202e] border border-[rgba(255,255,255,0.06)] space-y-1 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#cdd0d6]/60">Order ID</span>
                      <span className="font-semibold text-[#ffffff]">order_MCK9210</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#cdd0d6]/60">Amount Due</span>
                      <span className="font-bold text-[#305EFF]">₹4,890.00</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setWhatsappPaid(!whatsappPaid)}
                    className={`w-full py-2.5 rounded-full font-semibold text-xs transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                      whatsappPaid
                        ? 'bg-[#305EFF] text-[#000000]'
                        : 'bg-[#ffffff] text-[#000000] hover:bg-[#cdd0d6]'
                    }`}
                  >
                    {whatsappPaid ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Payment Received & Settled via UPI</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Tap to Complete ₹4,890 Checkout</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: CRYPTOGRAPHIC MERKLE LEDGER */}
            {activeTab === 'merkle' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-heading font-bold text-[#ffffff]">
                      SHA-256 Merkle Audit Chain & DPDP Proof
                    </h3>
                    <p className="text-xs text-[#cdd0d6] mt-1">
                      Every autonomous action is mathematically sealed into a tamper-evident audit ledger.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#305EFF] font-semibold">
                    100% REGULATORY AUDIT PASS
                  </span>
                </div>

                {/* Merkle Block Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-4 rounded-[12px] border border-[#305EFF]/40 bg-[#202a3e]">
                    <div className="text-[10px] text-[#305EFF] font-bold mb-1 flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>BLOCK #004829 · LATEST SEAL</span>
                    </div>
                    <div className="text-xs font-semibold text-[#ffffff] truncate">
                      Hash: 3a1f9e2b8c0d...
                    </div>
                    <div className="text-[11px] text-[#cdd0d6] mt-2 space-y-1">
                      <div>Action: RECOVERY_SETTLED</div>
                      <div>Amount: ₹4,890 INR</div>
                      <div>DPDP: Anonymized</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[#202a3e] opacity-80">
                    <div className="text-[10px] text-[#cdd0d6] font-bold mb-1">
                      BLOCK #004828 · PREV
                    </div>
                    <div className="text-xs font-semibold text-[#ffffff] truncate">
                      Hash: 7f8a91b2c4e5...
                    </div>
                    <div className="text-[11px] text-[#cdd0d6] mt-2 space-y-1">
                      <div>Action: WHATSAPP_DISPATCH</div>
                      <div>Customer: cust_RMehta_01</div>
                      <div>Curfew: Allowed (14:32 IST)</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[#202a3e] opacity-60">
                    <div className="text-[10px] text-[#cdd0d6] font-bold mb-1">
                      BLOCK #004827 · ROOT
                    </div>
                    <div className="text-xs font-semibold text-[#ffffff] truncate">
                      Hash: 0b4c8d9e1f2a...
                    </div>
                    <div className="text-[11px] text-[#cdd0d6] mt-2 space-y-1">
                      <div>Action: INTERCEPT_DROP</div>
                      <div>Trigger: HDFC_503_FAIL</div>
                      <div>CATE Score: +0.942</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-[8px] border border-[rgba(255,255,255,0.08)] bg-[#17202e] text-xs flex items-center justify-between font-mono">
                  <span className="text-[#cdd0d6] truncate">Root: sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
                  <span className="text-[#305EFF] font-bold ml-2">VERIFIED</span>
                </div>
              </div>
            )}

          </div>

          {/* Terminal Footer Telemetry Strip */}
          <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-t border-[rgba(255,255,255,0.08)] bg-[#17202e]/60">
            <div className="flex items-center space-x-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#305EFF] animate-ping" />
              <div>
                <span className="text-xs text-[#cdd0d6] font-mono block">Autonomous Recovery Yield</span>
                <span className="text-sm sm:text-base font-bold font-mono text-[#ffffff]">
                  ₹{Math.round(totalRecovered).toLocaleString('en-IN')} recovered ({recoveryRate}% yield)
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-xs font-mono">
              <div>
                <span className="text-[#cdd0d6] block text-[11px]">Flagged at Risk</span>
                <span className="font-semibold text-[#ffffff]">
                  ₹{Math.round(totalAtRisk).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="border-l border-[rgba(255,255,255,0.1)] pl-5">
                <span className="text-[#cdd0d6] block text-[11px]">Engine Status</span>
                <span className="text-[#305EFF] font-semibold">Zero Interruption</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
};

export default ShowcaseHero;
