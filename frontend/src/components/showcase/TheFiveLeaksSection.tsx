import React, { useState } from 'react';
import { 
  RotateCcw, 
  FileText, 
  ShoppingCart, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Zap
} from 'lucide-react';

interface LeakItem {
  id: string;
  number: string;
  name: string;
  stat: string;
  statLabel: string;
  symptom: string;
  rootCause: string;
  brainFix: string;
  icon: React.ElementType;
}

const LEAKS: LeakItem[] = [
  {
    id: 'gateway_outage',
    number: '01',
    name: 'Bank Switch 503 Degraded Timeouts',
    stat: '₹42,000 Cr',
    statLabel: 'Annual India Failure Volume',
    symptom: 'Card charges hang for 8-15 seconds and time out with generic ZA03 bank network error.',
    rootCause: 'Core banking switches (HDFC, ICICI, Axis) suffer temporary peak-hour degradation.',
    brainFix: '150ms circuit breaker trips instantly and dynamically routes traffic to healthy alternate rails or instant UPI deep links.',
    icon: Zap,
  },
  {
    id: 'broken_mandate',
    number: '02',
    name: 'UPI Autopay & Mandate Renewal Drops',
    stat: '18-24%',
    statLabel: 'SaaS Monthly Churn Contribution',
    symptom: 'Recurring subscription renewals fail silently at 04:00 AM bank settlement batches.',
    rootCause: 'Bank mandate token expiration, insufficient balance at debit time, or NPCI sync lag.',
    brainFix: 'Pre-debit balance validation 24h prior, followed by intelligent retry scheduling and 1-tap WhatsApp mandate refresh.',
    icon: RotateCcw,
  },
  {
    id: 'section_43bh',
    number: '03',
    name: 'Section 43B(h) MSME 45-Day Tax Cliff',
    stat: '30% Tax Hit',
    statLabel: 'Forfeited Expense Deductions',
    symptom: 'High-value enterprise vendor invoices sit unpaid beyond the 45-day statutory MSME window.',
    rootCause: 'Siloed accounts-payable approvals without urgency tracking or automated tax-risk escalation.',
    brainFix: 'Dynamic statutory countdown engine triggers high-priority CFO WhatsApp link and Hinglish voice engagement on Days 38-44.',
    icon: FileText,
  },
  {
    id: 'checkout_abandonment',
    number: '04',
    name: 'High-Friction Checkout Cart Abandonment',
    stat: '68.8%',
    statLabel: 'Average E-commerce Drop Rate',
    symptom: 'Shoppers abandon carts after OTP delays, payment app crashes, or intent redirection hiccups.',
    rootCause: 'SMS OTP latency (>12s) and clumsy multi-app switching causing user dropoff.',
    brainFix: 'Instant zero-friction WhatsApp verified payment link generated in <800ms with single-tap UPI Intent pre-filled.',
    icon: ShoppingCart,
  },
  {
    id: 'dumb_retries',
    number: '05',
    name: 'Dumb Retry Fatigue & Card Fraud Locks',
    stat: '3x Higher',
    statLabel: 'Permanent Customer Lockout Rate',
    symptom: 'Standard recovery scripts blindly retry customer cards, triggering bank fraud lockouts.',
    rootCause: 'Point solutions treat all failures identically, spamming the same card number until banks freeze it.',
    brainFix: 'CATE-discounted ENRV scoring separates temporary hiccups from permanent blocks and enforces a self-contracting autonomy envelope.',
    icon: ShieldAlert,
  },
];

export const TheFiveLeaksSection: React.FC = () => {
  const [activeLeak, setActiveLeak] = useState<string>('gateway_outage');
  const [comparisonMode, setComparisonMode] = useState<'brain' | 'legacy'>('brain');

  const selected = LEAKS.find((l) => l.id === activeLeak) || LEAKS[0];
  const IconComp = selected.icon;

  return (
    <section className="py-24 border-t border-white/10 bg-[#17202e] relative text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#202a3e] border border-[#305EFF]/40 text-xs font-semibold text-[#305EFF]">
            <span>THE ROOT CAUSE · SYSTEMIC INEFFICIENCIES</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold font-['Open_Sans'] tracking-[-0.036em] text-white leading-tight">
            The 5 Silent Revenue Leaks{' '}
            <br className="hidden sm:block" />
            <span className="text-[#305EFF]">in Indian Digital Payments.</span>
          </h2>

          <p className="text-sm sm:text-base font-['Open_Sans'] leading-relaxed text-[#cdd0d6]">
            Every day, high-volume merchants bleed 12% to 28% of their gross revenue to structural failure modes that generic payment gateways ignore. Here is exactly what causes them—and how the Autonomous Brain heals them.
          </p>
        </div>

        {/* 5 Leaks Interactive Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {LEAKS.map((leak) => {
            const isActive = activeLeak === leak.id;
            const LeakIcon = leak.icon;
            return (
              <button
                key={leak.id}
                onClick={() => setActiveLeak(leak.id)}
                className={`p-4 rounded-[15px] border transition-all text-left flex flex-col justify-between cursor-pointer ${
                  isActive
                    ? 'bg-[#202a3e] border-[#305EFF]'
                    : 'bg-[#202a3e]/50 border-white/10 hover:border-white/20 hover:bg-[#202a3e]/70'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <span className={`text-xs font-mono font-bold ${isActive ? 'text-[#305EFF]' : 'text-[#cdd0d6]/60'}`}>
                    LEAK {leak.number}
                  </span>
                  <div className={`p-1.5 rounded-full ${isActive ? 'bg-[#17202e] text-[#305EFF]' : 'bg-[#17202e] text-[#cdd0d6]/60'}`}>
                    <LeakIcon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h4 className="text-xs sm:text-sm font-bold font-['Open_Sans'] text-white line-clamp-2">
                  {leak.name}
                </h4>
                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#305EFF] font-semibold">{leak.stat}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Deep-Dive Card */}
        <div className="rounded-[15px] bg-[#202a3e] border border-white/10 p-6 sm:p-10 relative text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Detail Breakdown */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#17202e] border border-[#305EFF]/40 text-[#305EFF] flex items-center justify-center">
                  <IconComp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono text-[#305EFF] uppercase tracking-wider">
                    Leak #{selected.number} Diagnostic
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-['Open_Sans'] text-white">
                    {selected.name}
                  </h3>
                </div>
              </div>

              {/* Symptom vs Root Cause */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-[12px] bg-[#17202e] border border-white/5 space-y-1.5">
                  <span className="text-xs font-mono uppercase text-red-400 font-semibold block">
                    Observed Symptom
                  </span>
                  <p className="text-xs sm:text-sm text-[#cdd0d6] leading-relaxed">
                    {selected.symptom}
                  </p>
                </div>

                <div className="p-4 rounded-[12px] bg-[#17202e] border border-white/5 space-y-1.5">
                  <span className="text-xs font-mono uppercase text-amber-300 font-semibold block">
                    Underlying Root Cause
                  </span>
                  <p className="text-xs sm:text-sm text-[#cdd0d6] leading-relaxed">
                    {selected.rootCause}
                  </p>
                </div>
              </div>

              {/* The Autonomous Solution */}
              <div className="p-4 rounded-[12px] bg-[#17202e] border border-[#305EFF]/30 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-mono text-[#305EFF] font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>The Autonomous Brain Prescription</span>
                </div>
                <p className="text-xs sm:text-sm text-white font-['Open_Sans'] leading-relaxed">
                  {selected.brainFix}
                </p>
              </div>
            </div>

            {/* Right: Side-by-Side Architectural Contrast */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-[12px] bg-[#17202e] border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-mono text-[#cdd0d6]/70 uppercase">Architecture Comparison</span>
                  <div className="flex items-center space-x-1 bg-[#202a3e] p-1 rounded-full border border-white/10">
                    <button
                      onClick={() => setComparisonMode('brain')}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        comparisonMode === 'brain' ? 'bg-white text-black font-bold' : 'text-[#cdd0d6]'
                      }`}
                    >
                      AI Brain
                    </button>
                    <button
                      onClick={() => setComparisonMode('legacy')}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        comparisonMode === 'legacy' ? 'bg-white text-black font-bold' : 'text-[#cdd0d6]'
                      }`}
                    >
                      Legacy Retries
                    </button>
                  </div>
                </div>

                {comparisonMode === 'brain' ? (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-start space-x-2 text-xs text-[#cdd0d6]">
                      <CheckCircle2 className="w-4 h-4 text-[#305EFF] shrink-0 mt-0.5" />
                      <span><strong>Sub-800ms Intercept:</strong> Catches failures prior to user browser exit.</span>
                    </div>
                    <div className="flex items-start space-x-2 text-xs text-[#cdd0d6]">
                      <CheckCircle2 className="w-4 h-4 text-[#305EFF] shrink-0 mt-0.5" />
                      <span><strong>Dynamic Switchboard:</strong> Seamless failover to ICICI, Axis, or UPI Autopay.</span>
                    </div>
                    <div className="flex items-start space-x-2 text-xs text-[#cdd0d6]">
                      <CheckCircle2 className="w-4 h-4 text-[#305EFF] shrink-0 mt-0.5" />
                      <span><strong>Deduplicated Multi-Channel:</strong> Zero spam; unified customer identity graph.</span>
                    </div>
                    <div className="flex items-start space-x-2 text-xs text-[#cdd0d6]">
                      <CheckCircle2 className="w-4 h-4 text-[#305EFF] shrink-0 mt-0.5" />
                      <span><strong>Cryptographic Merkle Proof:</strong> 100% RBI & DPDP Act compliance.</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-start space-x-2 text-xs text-[#cdd0d6]">
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span><strong>Blind Retry Hammering:</strong> Retries immediately, triggering card fraud freezes.</span>
                    </div>
                    <div className="flex items-start space-x-2 text-xs text-[#cdd0d6]">
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span><strong>Static Gateway Lock-in:</strong> Fails every transaction until bank recovers.</span>
                    </div>
                    <div className="flex items-start space-x-2 text-xs text-[#cdd0d6]">
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span><strong>Siloed Contact Fatigue:</strong> Customer spammed by 3 separate automated bots.</span>
                    </div>
                    <div className="flex items-start space-x-2 text-xs text-[#cdd0d6]">
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span><strong>Zero Legal Guardrails:</strong> Calls made during RBI 19:00 curfew risk heavy fines.</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-[12px] bg-[#17202e] border border-white/5 text-xs font-mono">
                <span className="text-[#cdd0d6]/70">National Impact Metric:</span>
                <span className="text-white font-bold">{selected.stat} · {selected.statLabel}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default TheFiveLeaksSection;
