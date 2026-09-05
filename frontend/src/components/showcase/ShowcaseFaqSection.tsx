import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FaqItem[] = [
  {
    category: 'COMPLIANCE',
    question: 'How does the engine strictly enforce the RBI Calling Curfew (19:00 - 07:00 IST)?',
    answer:
      'The engine enforces a hardcoded statutory curfew gate. Any voice or high-touch recovery action scheduled between 19:00 and 07:00 IST is automatically vetoed by the guardrail kernel and placed into a secure candidate queue for morning release at 08:00 IST. Zero human override can bypass this rule.',
  },
  {
    category: 'INFRASTRUCTURE',
    question: 'How does sub-150ms circuit breaking prevent checkout abandonment?',
    answer:
      'Rather than waiting for a consumer card transaction to timeout after 15 seconds, our switchboard continuously tracks rolling error rates across HDFC, ICICI, SBI, and Axis gateways. The moment an upstream switch degrades, the circuit breaker opens in <150ms, dynamically routing checkout volume to alternate healthy rails or initiating a 1-tap instant UPI Intent link.',
  },
  {
    category: 'TAX & FINANCE',
    question: 'What is the Section 43B(h) MSME 45-day tax clock and why does it matter to CFOs?',
    answer:
      'Under Indian Income Tax Act Section 43B(h), payments to registered MSME enterprises must be settled within 45 days; otherwise, the merchant forfeits the tax deduction on that expense, resulting in an immediate 30% corporate tax penalty. The Recovery Brain tracks statutory invoice aging and elevates priority on Days 38-44 to protect deductions before audit deadlines.',
  },
  {
    category: 'IDENTITY',
    question: 'How does Cross-Leak Profile Unification stop bot spam?',
    answer:
      'Legacy point solutions operate in silos—a subscription bot, an abandoned cart bot, and an invoice debt collector. If one customer has all three, they receive 3 aggressive messages in an hour. Our engine unifies the customer across merchant accounts into a single identity graph, sending one coordinated, bundled WhatsApp touchpoint.',
  },
  {
    category: 'DATA SECURITY',
    question: 'How does the platform ensure DPDP Act 2023 and RBI FPC compliance?',
    answer:
      'Every autonomous action, latency measurement, and human intervention is sealed into a SHA-256 Merkle chain. The system NEVER solicits CVV, PIN, or OTP credentials, and enforces an automated Right-to-Erasure protocol to cryptographically shred non-essential PII following settlement.',
  },
];

export const ShowcaseFaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-24 border-t border-white/10 bg-[#17202e] relative text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#202a3e] border border-[#305EFF]/40 text-xs font-semibold text-[#305EFF]">
            <HelpCircle className="w-3.5 h-3.5 text-[#305EFF]" />
            <span>ENTERPRISE ARCHITECTURE & COMPLIANCE FAQ</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold font-['Open_Sans'] tracking-[-0.036em] text-white leading-tight">
            Frequently Asked Questions.{' '}
            <span className="text-[#305EFF]">Answered by Code.</span>
          </h2>

          <p className="text-sm sm:text-base font-['Open_Sans'] leading-relaxed text-[#cdd0d6]">
            Clear, unambiguous technical answers to common questions about statutory compliance, latency benchmarks, and integration architecture.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3 text-left">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`rounded-[15px] border transition-all ${
                  isOpen
                    ? 'bg-[#202a3e] border-[#305EFF]/40'
                    : 'bg-[#202a3e]/60 border-white/10 hover:border-white/20'
                }`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left cursor-pointer"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-[#305EFF] tracking-wider">
                      {faq.category}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold font-['Open_Sans'] text-white">
                      {faq.question}
                    </h4>
                  </div>
                  <div className={`p-1.5 rounded-full bg-[#17202e] border border-white/10 text-white transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#305EFF]' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-xs sm:text-sm font-['Open_Sans'] text-[#cdd0d6] leading-relaxed border-t border-white/5 animate-in fade-in duration-200">
                    <p>{faq.answer}</p>
                    <div className="mt-3 flex items-center space-x-2 text-[11px] font-mono text-[#305EFF]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Cryptographically Sealed Rule</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ShowcaseFaqSection;
