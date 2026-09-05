import React, { useState, useEffect, useRef } from 'react';
import { TrendingDown, Zap, CheckCircle2, XCircle } from 'lucide-react';

function useCountUp(target: number, duration = 1200, decimals = 0): string {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString('en-IN');
}

const COMPARISON = [
  {
    feature: 'B2B Receivables Voice Agent',
    us: true,
    them: false,
    note: 'Hinglish AI, PTP tracking',
  },
  {
    feature: 'Promise-to-Pay Tracker',
    us: true,
    them: false,
    note: 'Auto-resumes on broken PTP',
  },
  {
    feature: 'Pre-debit Mandate Intervention',
    us: true,
    them: false,
    note: '24h before debit fails',
  },
  {
    feature: 'Payment Degradation Root Cause',
    us: true,
    them: false,
    note: 'TD vs BD in <150ms',
  },
  {
    feature: 'Subscription Recovery',
    us: true,
    them: true,
    note: 'Standard bot has basic retry',
  },
  {
    feature: 'Abandoned Cart Recovery',
    us: true,
    them: true,
    note: 'We add 1-click WhatsApp intent',
  },
  {
    feature: 'Responsible Collections Policy (RBI FPC)',
    us: true,
    them: false,
    note: 'Time windows, frequency caps',
  },
  {
    feature: 'Cryptographic Audit Merkle Trail',
    us: true,
    them: false,
    note: 'Tamper-evident verification',
  },
];

export const ImpactCounter: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        io.disconnect();
      }
    }, { threshold: 0.2 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const dsoAfter = useCountUp(visible ? 41 : 0, 1400);
  const recoveryAfter = useCountUp(visible ? 73 : 0, 1600);
  const latencyMs = useCountUp(visible ? 147 : 0, 1200);

  return (
    <div ref={ref} className="space-y-6 text-left">

      {/* KPI Delta Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* DSO */}
        <div className="p-5 rounded-[15px] bg-[#202a3e] border border-white/10">
          <div className="text-xs font-mono uppercase tracking-wider text-[#305EFF] mb-3 flex items-center space-x-1.5">
            <TrendingDown className="w-4 h-4" />
            <span>Days Sales Outstanding</span>
          </div>
          <div className="flex items-end space-x-3">
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-[#cdd0d6]/40 line-through decoration-red-400">67</div>
              <div className="text-[10px] font-mono text-[#cdd0d6]/60 mt-0.5">BEFORE</div>
            </div>
            <div className="text-[#cdd0d6]/40 text-lg mb-1">→</div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white">{visible ? dsoAfter : '--'}</div>
              <div className="text-[10px] font-mono font-semibold text-[#305EFF] mt-0.5">AFTER</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-xl sm:text-2xl font-bold font-['Open_Sans'] text-[#305EFF]">-39%</div>
              <div className="text-[10px] font-mono text-[#cdd0d6]/70">DSO REDUCTION</div>
            </div>
          </div>
        </div>

        {/* Recovery Rate */}
        <div className="p-5 rounded-[15px] bg-[#202a3e] border border-white/10">
          <div className="text-xs font-mono uppercase tracking-wider text-[#305EFF] mb-3 flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-[#305EFF]" />
            <span>Invoice Recovery Rate</span>
          </div>
          <div className="flex items-end space-x-3">
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-[#cdd0d6]/40 line-through decoration-red-400">31%</div>
              <div className="text-[10px] font-mono text-[#cdd0d6]/60 mt-0.5">BEFORE</div>
            </div>
            <div className="text-[#cdd0d6]/40 text-lg mb-1">→</div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white">{visible ? recoveryAfter : '--'}%</div>
              <div className="text-[10px] font-mono font-semibold text-[#305EFF] mt-0.5">AFTER</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-xl sm:text-2xl font-bold font-['Open_Sans'] text-[#305EFF]">+135%</div>
              <div className="text-[10px] font-mono text-[#cdd0d6]/70">LIFT</div>
            </div>
          </div>
        </div>

        {/* Response Latency */}
        <div className="p-5 rounded-[15px] bg-[#202a3e] border border-white/10">
          <div className="text-xs font-mono uppercase tracking-wider text-[#305EFF] mb-3 flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-[#305EFF]" />
            <span>Diagnosis Latency</span>
          </div>
          <div className="flex items-end space-x-3">
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-[#cdd0d6]/40 line-through decoration-red-400">3d</div>
              <div className="text-[10px] font-mono text-[#cdd0d6]/60 mt-0.5">HUMAN TEAM</div>
            </div>
            <div className="text-[#cdd0d6]/40 text-lg mb-1">→</div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white">{visible ? latencyMs : '--'}<span className="text-xs">ms</span></div>
              <div className="text-[10px] font-mono font-semibold text-[#305EFF] mt-0.5">AI BRAIN</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-xl sm:text-2xl font-bold font-['Open_Sans'] text-[#305EFF]">1765x</div>
              <div className="text-[10px] font-mono text-[#cdd0d6]/70">FASTER</div>
            </div>
          </div>
        </div>
      </div>

      {/* Uncertainty Band */}
      <div className="p-5 rounded-[15px] bg-[#202a3e] border border-white/10 space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center space-x-2 text-xs font-mono text-white">
            <Zap className="w-4 h-4 text-[#305EFF]" />
            <span>Assumed Recovery Uncertainty Band (P10 Floor · P50 Expected Net · P90 Upside)</span>
          </div>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#17202e] text-[#305EFF] border border-[#305EFF]/40">
            AUTONOMY ENVELOPE: ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-[12px] bg-[#17202e] border border-white/5 space-y-1">
            <span className="text-[11px] font-mono text-[#cdd0d6]/70 block uppercase">P10 (Floor · 0.65x)</span>
            <span className="text-lg font-bold font-mono text-white">₹1,76,800</span>
            <span className="text-xs text-[#cdd0d6]/60 block">Conservative 65% floor bound</span>
          </div>

          <div className="p-3.5 rounded-[12px] bg-[#17202e] border border-[#305EFF]/40 space-y-1">
            <span className="text-[11px] font-mono text-[#305EFF] block uppercase">P50 (Expected Net · 1.0x)</span>
            <span className="text-lg font-bold font-mono text-white">₹2,72,000</span>
            <span className="text-xs text-[#cdd0d6]/60 block">Central net recoverable value</span>
          </div>

          <div className="p-3.5 rounded-[12px] bg-[#17202e] border border-white/5 space-y-1">
            <span className="text-[11px] font-mono text-[#cdd0d6]/70 block uppercase">P90 (Upside · 1.25x)</span>
            <span className="text-lg font-bold font-mono text-white">₹3,40,000</span>
            <span className="text-xs text-[#cdd0d6]/60 block">High-engagement 125% ceiling</span>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="rounded-[15px] bg-[#202a3e] border border-white/10 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10 bg-[#17202e] flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-white">
              Autonomous Recovery Brain vs Standard Retries
            </span>
            <p className="text-xs text-[#cdd0d6]/70 mt-0.5">
              Comprehensive evaluation across enterprise revenue preservation benchmarks.
            </p>
          </div>
          <div className="text-xs font-mono px-2.5 py-1 rounded-full bg-[#202a3e] border border-[#305EFF]/40 text-[#305EFF]">
            8 features · 4 gaps filled
          </div>
        </div>

        {/* Table Headers */}
        <div className="grid grid-cols-[1fr_130px_130px] px-5 py-2.5 bg-[#17202e] border-b border-white/10 text-xs font-mono text-[#cdd0d6] uppercase tracking-wider">
          <span>Feature & Capability</span>
          <span className="text-center text-[#305EFF]">Recovery Brain</span>
          <span className="text-center text-[#cdd0d6]/60">Standard Retries</span>
        </div>

        <div className="divide-y divide-white/5">
          {COMPARISON.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_130px_130px] items-center px-5 py-2.5 hover:bg-[#17202e]/60 transition-colors"
            >
              <div>
                <span className="text-xs sm:text-sm font-semibold text-white font-['Open_Sans']">{row.feature}</span>
                <span className="ml-2 text-xs text-[#cdd0d6]/60">({row.note})</span>
              </div>
              <div className="flex justify-center">
                {row.us
                  ? <CheckCircle2 className="w-4 h-4 text-[#305EFF]" />
                  : <XCircle className="w-4 h-4 text-red-400" />}
              </div>
              <div className="flex justify-center">
                {row.them
                  ? <CheckCircle2 className="w-4 h-4 text-[#cdd0d6]/60" />
                  : <XCircle className="w-4 h-4 text-white/20" />}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_130px_130px] px-5 py-2.5 bg-[#17202e] border-t border-white/10 text-xs font-mono text-[#cdd0d6]">
          <span>Total 8 Core Capabilities Evaluated</span>
          <span className="text-center text-[#305EFF] font-semibold">8 / 8 Supported</span>
          <span className="text-center text-[#cdd0d6]/60">2 / 8 Basic</span>
        </div>
      </div>
    </div>
  );
};

export default ImpactCounter;
