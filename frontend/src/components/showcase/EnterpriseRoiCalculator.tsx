import React, { useState } from 'react';
import { Calculator, ArrowRight, TrendingUp, ShieldCheck, DollarSign, Clock } from 'lucide-react';

interface EnterpriseRoiCalculatorProps {
  onLaunchConsole: () => void;
}

export const EnterpriseRoiCalculator: React.FC<EnterpriseRoiCalculatorProps> = ({ onLaunchConsole }) => {
  // Sliders state
  const [monthlyGmvLakhs, setMonthlyGmvLakhs] = useState<number>(100); // 100 Lakhs = 1 Crore
  const [failureRatePercent, setFailureRatePercent] = useState<number>(12);
  const [b2bSharePercent, setB2bSharePercent] = useState<number>(40);

  // Calculations
  const monthlyGmv = monthlyGmvLakhs * 100000;
  const monthlyAtRisk = (monthlyGmv * failureRatePercent) / 100;
  const monthlyRecovered = Math.round(monthlyAtRisk * 0.73); // 73% benchmark recovery rate
  const annualRecovered = monthlyRecovered * 12;
  const b2bRecoveredPortion = (monthlyRecovered * b2bSharePercent) / 100;
  const taxSavings = Math.round(b2bRecoveredPortion * 0.30); // 30% corporate tax rate for Section 43B(h)
  const penaltyAvoided = Math.round((monthlyAtRisk * 0.015)); // 1.5% failed gateway processing surcharge

  const formatINR = (val: number): string => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} L`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <section className="py-24 border-t border-white/10 bg-[#17202e] relative text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#202a3e] border border-[#305EFF]/40 text-xs font-semibold text-[#305EFF]">
            <Calculator className="w-3.5 h-3.5 text-[#305EFF]" />
            <span>ENTERPRISE REVENUE RECOVERY CALCULATOR</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold font-['Open_Sans'] tracking-[-0.036em] text-white leading-tight">
            Calculate Your Recoverable Cash.{' '}
            <br className="hidden sm:block" />
            <span className="text-[#305EFF]">In Seconds.</span>
          </h2>

          <p className="text-sm sm:text-base font-['Open_Sans'] leading-relaxed text-[#cdd0d6]">
            Estimate how much leaking capital our autonomous state machine can return to your balance sheet every month based on verified payment benchmarks.
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch text-left">
          
          {/* Left Column: Interactive Sliders Controls */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-[15px] bg-[#202a3e] border border-white/10 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#305EFF]">
                  Merchant Operational Parameters
                </span>
                <span className="text-xs font-mono text-[#cdd0d6]/60">Dynamic Sliders</span>
              </div>

              {/* Slider 1: Monthly GMV */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-white font-semibold">Monthly Transaction Volume (GMV):</span>
                  <span className="text-[#305EFF] font-bold text-sm">{formatINR(monthlyGmv)}</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={2000}
                  step={10}
                  value={monthlyGmvLakhs}
                  onChange={(e) => setMonthlyGmvLakhs(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#17202e] rounded-lg appearance-none cursor-pointer accent-[#305EFF]"
                />
                <div className="flex justify-between text-[11px] font-mono text-[#cdd0d6]/50">
                  <span>₹10 Lakhs</span>
                  <span>₹500 Lakhs (₹5 Cr)</span>
                  <span>₹2,000 Lakhs (₹20 Cr)</span>
                </div>
              </div>

              {/* Slider 2: Failure / Drop Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-white font-semibold">Average Payment Drop & Failure Rate:</span>
                  <span className="text-[#305EFF] font-bold text-sm">{failureRatePercent}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={28}
                  step={1}
                  value={failureRatePercent}
                  onChange={(e) => setFailureRatePercent(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#17202e] rounded-lg appearance-none cursor-pointer accent-[#305EFF]"
                />
                <div className="flex justify-between text-[11px] font-mono text-[#cdd0d6]/50">
                  <span>5% (Low)</span>
                  <span>12% (India Average)</span>
                  <span>28% (High Friction)</span>
                </div>
              </div>

              {/* Slider 3: B2B Trade Receivables Share */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-white font-semibold">B2B Trade Invoice Share (Sec 43B(h)):</span>
                  <span className="text-[#305EFF] font-bold text-sm">{b2bSharePercent}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={b2bSharePercent}
                  onChange={(e) => setB2bSharePercent(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#17202e] rounded-lg appearance-none cursor-pointer accent-[#305EFF]"
                />
                <div className="flex justify-between text-[11px] font-mono text-[#cdd0d6]/50">
                  <span>0% (B2C Only)</span>
                  <span>40% (Hybrid)</span>
                  <span>100% (Pure B2B)</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-[12px] bg-[#17202e] border border-white/5 text-xs text-[#cdd0d6] flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-[#305EFF] shrink-0" />
              <span>
                Calculated using calibrated KDD 2010 uplift models with Sleeping Dogs penalty suppression.
              </span>
            </div>
          </div>

          {/* Right Column: Calculated Yield & Impact Dashboard */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-[15px] bg-[#202a3e] border border-white/10 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-white">
                  Estimated Financial Yield
                </span>
                <span className="text-xs font-mono text-[#305EFF] font-bold">73% Recovery Yield</span>
              </div>

              {/* Primary Metric: Monthly Recoverable Cash */}
              <div className="p-5 rounded-[12px] bg-[#17202e] border border-[#305EFF]/40 space-y-1">
                <span className="text-xs font-mono text-[#cdd0d6]/70 uppercase">
                  Net Recoverable Cash / Month
                </span>
                <div className="text-3xl sm:text-4xl font-bold font-mono text-white">
                  {formatINR(monthlyRecovered)}
                </div>
                <span className="text-xs text-[#305EFF] flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Annual Run-Rate: {formatINR(annualRecovered)} added EBITDA</span>
                </span>
              </div>

              {/* Secondary Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-[12px] bg-[#17202e] border border-white/5 space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs font-mono text-[#cdd0d6]">
                    <Clock className="w-3.5 h-3.5 text-[#305EFF]" />
                    <span>DSO Reduction</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white">67d → 41d</div>
                  <div className="text-[11px] text-[#305EFF] font-mono font-semibold">-39% Days Sales Outstanding</div>
                </div>

                <div className="p-4 rounded-[12px] bg-[#17202e] border border-white/5 space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs font-mono text-[#cdd0d6]">
                    <DollarSign className="w-3.5 h-3.5 text-[#305EFF]" />
                    <span>Sec 43B(h) Tax Relief</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-white">{formatINR(taxSavings)}</div>
                  <div className="text-[11px] text-[#305EFF] font-mono font-semibold">Corporate Deductions Protected</div>
                </div>
              </div>

              <div className="p-3.5 rounded-[10px] bg-[#17202e] border border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-[#cdd0d6]/70">Surcharge Penalties Avoided:</span>
                <span className="text-white font-bold">{formatINR(penaltyAvoided)} / mo</span>
              </div>
            </div>

            {/* Launch Console CTA */}
            <button
              onClick={onLaunchConsole}
              className="idle-btn-primary text-xs w-full py-3.5 flex items-center justify-center space-x-2"
            >
              <span>Test Live With Your Pipeline Data</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};

export default EnterpriseRoiCalculator;
