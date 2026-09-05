import React, { useState } from 'react';
import { Layers, ShieldCheck, CheckCircle2, Sliders } from 'lucide-react';

export const Razorpay3DArchitectureStack: React.FC = () => {
  const [decoupled, setDecoupled] = useState<boolean>(true);
  const [selectedLayer, setSelectedLayer] = useState<number>(1);

  return (
    <section className="py-24 border-t border-white/10 bg-[#17202e] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#202a3e] border border-[#305EFF]/40 text-xs font-semibold text-[#305EFF]">
              <Layers className="w-3.5 h-3.5 text-[#305EFF]" />
              <span>AUTONOMOUS MULTI-PLANE ARCHITECTURE</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold font-['Open_Sans'] tracking-[-0.036em] text-white leading-tight">
              Three Physical Planes.{' '}
              <br className="hidden sm:block" />
              <span className="text-[#305EFF]">
                One Autonomous Brain.
              </span>
            </h2>

            <p className="text-sm sm:text-base font-['Open_Sans'] leading-relaxed text-[#cdd0d6]">
              A production-grade decoupled framework that separates statutory banking rails from conversational AI and autonomous decision intelligence.
            </p>
          </div>

          {/* Decouple Switch Button */}
          <div className="flex items-center space-x-3 self-start md:self-end">
            <button
              onClick={() => setDecoupled(!decoupled)}
              className="idle-btn-ghost text-xs px-4 py-2 flex items-center space-x-2"
            >
              <Sliders className="w-3.5 h-3.5 text-[#305EFF]" />
              <span>{decoupled ? 'Decoupled Planes Active' : 'Compact Unified View'}</span>
            </button>
          </div>
        </div>

        {/* Blueprint Stack Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
          
          {/* Left Column: 3 Layer Index Cards Stack */}
          <div className="lg:col-span-7 space-y-4 text-left">
            
            {/* LAYER 1: Application Layer */}
            <div
              onClick={() => setSelectedLayer(1)}
              style={{
                transform: decoupled ? 'translateY(0px)' : 'translateY(0px)',
              }}
              className={`p-6 rounded-[15px] border transition-all duration-200 cursor-pointer relative ${
                selectedLayer === 1
                  ? 'bg-[#202a3e] border-[#305EFF]'
                  : 'bg-[#202a3e]/60 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-[#17202e] border border-[#305EFF]/40 text-[#305EFF] flex items-center justify-center font-bold text-xs">
                    L1
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold font-['Open_Sans'] text-white">
                      Application & Autonomous Decision Layer
                    </h4>
                    <span className="text-xs font-mono text-[#cdd0d6]/70">Autonomous Agent Kernel · CATE Uplift Model</span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#17202e] border border-[#305EFF]/40 text-[#305EFF]">
                  TOP PLANE
                </span>
              </div>

              <p className="text-xs sm:text-sm font-['Open_Sans'] leading-relaxed text-[#cdd0d6]">
                Evaluates every failed checkout against 5 leak archetypes, calculates Expected Net Recoverable Value (ENRV), and contracts autonomy envelope if error spikes occur.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-3 text-xs font-mono text-[#cdd0d6]/80">
                <span className="text-[#305EFF]">● &lt;800ms Decision Loop</span>
                <span>● Abe et al. (KDD 2010)</span>
                <span>● Dynamic Escalation Gate</span>
              </div>
            </div>

            {/* LAYER 2: Telephony & Messaging Rails */}
            <div
              onClick={() => setSelectedLayer(2)}
              style={{
                transform: decoupled ? 'translateY(4px)' : 'translateY(-8px)',
              }}
              className={`p-6 rounded-[15px] border transition-all duration-200 cursor-pointer relative ${
                selectedLayer === 2
                  ? 'bg-[#202a3e] border-[#305EFF]'
                  : 'bg-[#202a3e]/60 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-[#17202e] border border-[#305EFF]/40 text-[#305EFF] flex items-center justify-center font-bold text-xs">
                    L2
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold font-['Open_Sans'] text-white">
                      Telephony & Conversational Messaging Rails
                    </h4>
                    <span className="text-xs font-mono text-[#cdd0d6]/70">Hinglish Voice · WhatsApp 1-Click Pay · Section 43B(h)</span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#17202e] border border-[#305EFF]/40 text-[#305EFF]">
                  MIDDLE PLANE
                </span>
              </div>

              <p className="text-xs sm:text-sm font-['Open_Sans'] leading-relaxed text-[#cdd0d6]">
                Engages customers via conversational voice in regional Indian dialects. Automatically dispatches pre-filled UPI intent links and enforces Section 43B(h) MSME 45-day tax clock urgency.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-3 text-xs font-mono text-[#cdd0d6]/80">
                <span className="text-[#305EFF]">● &lt;480ms Voice Latency</span>
                <span>● Meta Verified Channel</span>
                <span>● Zero Credential Requests</span>
              </div>
            </div>

            {/* LAYER 3: Banking & Cryptographic Foundation */}
            <div
              onClick={() => setSelectedLayer(3)}
              style={{
                transform: decoupled ? 'translateY(8px)' : 'translateY(-16px)',
              }}
              className={`p-6 rounded-[15px] border transition-all duration-200 cursor-pointer relative ${
                selectedLayer === 3
                  ? 'bg-[#202a3e] border-[#305EFF]'
                  : 'bg-[#202a3e]/60 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-[#17202e] border border-[#305EFF]/40 text-[#305EFF] flex items-center justify-center font-bold text-xs">
                    L3
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold font-['Open_Sans'] text-white">
                      Banking Switchboard & Cryptographic Ledger
                    </h4>
                    <span className="text-xs font-mono text-[#cdd0d6]/70">Circuit Breakers · SHA-256 Merkle Chain · DPDP Vault</span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#17202e] border border-[#305EFF]/40 text-[#305EFF]">
                  FOUNDATION
                </span>
              </div>

              <p className="text-xs sm:text-sm font-['Open_Sans'] leading-relaxed text-[#cdd0d6]">
                Integrates directly with HDFC, ICICI, SBI, and Axis switches with 150ms circuit breaking. Seals every autonomous action into a permanent SHA-256 cryptographic audit chain.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-3 text-xs font-mono text-[#cdd0d6]/80">
                <span className="text-[#305EFF]">● 100% RBI Compliant</span>
                <span>● Merkle Hash Verifiable</span>
                <span>● PCI-DSS Level 1</span>
              </div>
            </div>

          </div>

          {/* Right Column: Layer Detailed Deep-Dive Inspector */}
          <div className="lg:col-span-5 text-left">
            <div className="p-7 rounded-[15px] bg-[#202a3e] border border-white/10 space-y-6 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#305EFF]">
                  Inspecting Layer {selectedLayer} of 3
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#305EFF] animate-ping" />
              </div>

              {selectedLayer === 1 && (
                <div className="space-y-4">
                  <div className="p-2.5 rounded-lg bg-[#17202e] border border-white/5 text-white font-semibold text-xs">
                    Layer 01 : CATE-Discounted ENRV Engine
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-['Open_Sans'] text-white tracking-tight">
                    Autonomous Intervention Scoring
                  </h3>
                  <div className="text-sm font-['Open_Sans'] leading-relaxed text-[#cdd0d6] space-y-2">
                    <p>Instead of blind retry hammers, the engine calculates:</p>
                    <code className="text-xs text-[#305EFF] font-mono block p-3 rounded-lg bg-[#17202e] border border-white/10">
                      ENRV = P(Recovery | Action) * Amount - FatigueCost
                    </code>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#cdd0d6]">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#305EFF] shrink-0" />
                      <span>Sleeping Dogs defense (suppresses non-retryable fraud)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#305EFF] shrink-0" />
                      <span>Automatic human gate fallback on low confidence</span>
                    </li>
                  </ul>
                </div>
              )}

              {selectedLayer === 2 && (
                <div className="space-y-4">
                  <div className="p-2.5 rounded-lg bg-[#17202e] border border-white/5 text-white font-semibold text-xs">
                    Layer 02 : Multi-Channel Conversational Mesh
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-['Open_Sans'] text-white tracking-tight">
                    Hinglish Telephony & Tokenized Links
                  </h3>
                  <p className="text-sm font-['Open_Sans'] leading-relaxed text-[#cdd0d6]">
                    High-touch recoveries require authentic Indian context. Our speech engine combines Hindi and English colloquialisms for high trust:
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#cdd0d6]">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#305EFF] shrink-0" />
                      <span>Section 43B(h) urgency countdown trigger</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#305EFF] shrink-0" />
                      <span>One-click WhatsApp UPI Intent generation</span>
                    </li>
                  </ul>
                </div>
              )}

              {selectedLayer === 3 && (
                <div className="space-y-4">
                  <div className="p-2.5 rounded-lg bg-[#17202e] border border-white/5 text-white font-semibold text-xs">
                    Layer 03 : Statutory Banking & Cryptography
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-['Open_Sans'] text-white tracking-tight">
                    150ms Circuit Breaking & Merkle Vault
                  </h3>
                  <p className="text-sm font-['Open_Sans'] leading-relaxed text-[#cdd0d6]">
                    Zero black-box decisions. Every retry schedule, gateway failover, and WhatsApp dispatch is permanently chained with SHA-256 Merkle proofs.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#cdd0d6]">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#305EFF] shrink-0" />
                      <span>Curfew embargo: 19:00 to 07:00 IST calling lock</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#305EFF] shrink-0" />
                      <span>India DPDP Act 2023 Right-To-Erasure protocol</span>
                    </li>
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-[#cdd0d6]/70">Financial Engineering Standard</span>
                <span className="text-[#305EFF] flex items-center space-x-1">
                  <span>Architecture Verified</span>
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Razorpay3DArchitectureStack;
