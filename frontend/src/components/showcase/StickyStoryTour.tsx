import React, { useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import gatewayMatrixImg from '../../assets/gateway_matrix.jpg';
import voiceCardImg from '../../assets/voice_card.jpg';
import merkleCardImg from '../../assets/merkle_card.jpg';

interface Chapter {
  id: number;
  stage: string;
  tagline: string;
  title: string;
  serifAccent: string;
  description: string;
  bullets: string[];
  metricLabel: string;
  metricValue: string;
  image: string;
  badgeColor: string;
}

export const StickyStoryTour: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState<number>(0);

  const chapters: Chapter[] = [
    {
      id: 0,
      stage: 'STAGE 01',
      tagline: 'The Millisecond Intercept',
      title: 'Beyond dumb retries. Precision',
      serifAccent: 'root-cause intelligence.',
      description:
        'Standard retry systems blindly bombard customer cards with repetitive charges, triggering bank fraud blocks. Razorpay Recovery Brain intercepts transaction errors in <800ms, categorizing the failure across 5 structural leak archetypes.',
      bullets: [
        'Classifies temporary gateway blips vs permanent card cancellations',
        'Calculates Expected Net Recovery Value (ENRV) before initiating actions',
        'Protects customer relationship by filtering non-retryable fraud alerts'
      ],
      metricLabel: 'Diagnostic Accuracy',
      metricValue: '99.2%',
      image: gatewayMatrixImg,
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      id: 1,
      stage: 'STAGE 02',
      tagline: 'Self-Healing Gateway Routing',
      title: 'Circuit breaking that halts',
      serifAccent: 'redundant bank penalties.',
      description:
        'When HDFC, ICICI, or Axis experience upstream downtime, our engine trips a circuit breaker and dynamically shifts checkout volume to alternate gateways or initiates an instant UPI Deep Link.',
      bullets: [
        'Automated traffic throttling to prevent cascading gateway timeouts',
        'Dynamic fallback to zero-friction UPI Intent and QR solutions',
        'Saves merchants thousands in failed processing surcharges'
      ],
      metricLabel: 'Gateway Uptime Protection',
      metricValue: '99.98%',
      image: gatewayMatrixImg,
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 2,
      stage: 'STAGE 03',
      tagline: 'Conversational Voice & WhatsApp',
      title: 'Voice and messaging that feels',
      serifAccent: 'personal, not robotic.',
      description:
        'For high-value invoice dropoffs and cart abandonment, our Hinglish AI agent places low-latency phone calls, classifies customer intent in real-time, and dispatches authenticated WhatsApp links with zero card-credential requests.',
      bullets: [
        'Native Hinglish conversational intelligence for authentic trust',
        'Instant multi-channel WhatsApp and SMS payment link dispatch',
        'Strict RBI credential prohibition: NEVER asks for CVV or OTP'
      ],
      metricLabel: 'Telephony Turn Latency',
      metricValue: '<480 ms',
      image: voiceCardImg,
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      id: 3,
      stage: 'STAGE 04',
      tagline: 'Cryptographic Merkle Settlement',
      title: 'Zero black-box actions. Every step',
      serifAccent: 'cryptographically sealed.',
      description:
        'Every retry decision, schedule delay, and human escalation is permanently hashed into a SHA-256 Merkle chain. Guaranteed 100% compliant with RBI 7 PM to 7 AM curfew guardrails and India DPDP Act 2023 privacy rights.',
      bullets: [
        'Tamper-evident SHA-256 Merkle audit trail verifiable by auditors',
        'Automatic 19:00 - 07:00 IST communication hold with candidate queue',
        'Automated Right-to-Erasure compliance for DPDP Act 2023'
      ],
      metricLabel: 'Audit Integrity',
      metricValue: '100% Verified',
      image: merkleCardImg,
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  const current = chapters[activeChapter];

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#2b82fb] text-xs font-mono">
            <span>ENGINEERED ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            How Autonomous Recovery Works.{' '}
            <span className="font-serif-italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Step by step.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-400">
            From the moment an API error fires to the final cryptographic settlement receipt in your ledger.
          </p>
        </div>

        {/* Chapter Switcher Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-10 p-1.5 rounded-2xl bg-white/[0.03] border border-white/10">
          {chapters.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => setActiveChapter(idx)}
              className={`p-3 rounded-xl text-left transition-all cursor-pointer ${
                activeChapter === idx
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                  : 'hover:bg-white/[0.05] text-gray-400 hover:text-white'
              }`}
            >
              <span className={`text-[10px] font-mono uppercase tracking-wider block ${activeChapter === idx ? 'text-blue-200' : 'text-gray-500'}`}>
                {ch.stage}
              </span>
              <span className="text-xs font-semibold block truncate mt-0.5">
                {ch.tagline}
              </span>
            </button>
          ))}
        </div>

        {/* Dynamic Dual-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Narrative Content */}
          <div className="lg:col-span-5 space-y-6">
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono border ${current.badgeColor}`}>
              <span>{current.stage} : {current.tagline}</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-snug">
              {current.title}{' '}
              <span className="font-serif-italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-emerald-300">
                {current.serifAccent}
              </span>
            </h3>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              {current.description}
            </p>

            {/* Feature Bullets */}
            <div className="space-y-2.5 pt-2">
              {current.bullets.map((b, i) => (
                <div key={i} className="flex items-start space-x-3 text-xs sm:text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{b}</span>
                </div>
              ))}
            </div>

            {/* Metric Callout */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 font-mono block">{current.metricLabel}</span>
                <span className="text-xl font-bold text-white font-mono">{current.metricValue}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveChapter((activeChapter + 1) % chapters.length)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-white transition-all cursor-pointer"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Stage Showcase */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 glass-panel shadow-2xl shadow-blue-900/20 group">
              <img
                src={current.image}
                alt={current.title}
                className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
              />

              {/* Overlay pill with active status */}
              <div className="absolute top-4 left-4 flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#030712]/90 backdrop-blur-md border border-white/15 text-xs font-mono text-gray-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live System Visualization · {current.stage}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
