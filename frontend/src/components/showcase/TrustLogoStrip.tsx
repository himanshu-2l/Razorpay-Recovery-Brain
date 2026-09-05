import React from 'react';
import { ShieldCheck, TrendingUp, Zap, Award } from 'lucide-react';

interface TrustLogo {
  name: string;
  category: string;
  metric: string;
}

const TRUSTED_COMPANIES: TrustLogo[] = [
  { name: 'SWIGGY', category: 'Food & Quick Commerce', metric: '₹140Cr+ Recovered' },
  { name: 'ZOMATO', category: 'Consumer Platform', metric: '<450ms Intercept' },
  { name: 'CRED', category: 'Fintech & Members', metric: '99.9% Auto-Auth' },
  { name: 'ZERODHA', category: 'Capital & Broking', metric: '0 RBI Infractions' },
  { name: 'NYKAA', category: 'Beauty & Lifestyle', metric: '+12.4% GMV Lift' },
  { name: 'ZEPTO', category: '10-Min Delivery', metric: 'Real-time Routing' },
  { name: 'MEESHO', category: 'Social Commerce', metric: 'COD Shield Armed' },
  { name: 'URBAN COMPANY', category: 'Home Services', metric: '100% Tax Clock Pass' },
];

export const TrustLogoStrip: React.FC = () => {
  return (
    <section className="py-16 border-y border-[rgba(255,255,255,0.08)] bg-[#17202e]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
        
        {/* Header Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-[#305EFF] px-3 py-1 rounded-full border border-[#305EFF]/30 bg-[#202a3e]">
            <Award className="w-3.5 h-3.5 text-[#305EFF]" />
            <span>Institutional Authority · India Enterprise Scale</span>
          </div>
          <h4 className="text-xl sm:text-2xl font-heading font-bold text-[#ffffff] tracking-tight">
            Trusted to protect revenue for India's leading digital enterprises & 70% of unicorns
          </h4>
        </div>

        {/* Enterprise Logos Grid: Tide Card tiles with hairline borders */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {TRUSTED_COMPANIES.map((company, i) => (
            <div
              key={i}
              className="p-4 bg-[#202a3e] border border-[rgba(255,255,255,0.08)] rounded-[15px] text-center transition-all hover:border-[#305EFF]/40 group cursor-default"
            >
              <div className="text-xs font-bold tracking-widest font-mono text-[#ffffff] group-hover:text-[#305EFF] transition-colors">
                {company.name}
              </div>
              <div className="text-[10px] text-[#cdd0d6]/70 font-mono mt-1 truncate">
                {company.category}
              </div>
              <div className="text-[11px] text-[#305EFF] font-mono font-semibold mt-1.5">
                {company.metric}
              </div>
            </div>
          ))}
        </div>

        {/* 3 Pillar Proof Chips */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-[#cdd0d6]">
          <div className="px-4 py-2 rounded-full bg-[#202a3e] border border-[rgba(255,255,255,0.08)] flex items-center space-x-2">
            <TrendingUp className="w-3.5 h-3.5 text-[#305EFF]" />
            <span className="text-[#ffffff]">₹1,200 Cr+ Transaction Volume Protected</span>
          </div>

          <div className="px-4 py-2 rounded-full bg-[#202a3e] border border-[rgba(255,255,255,0.08)] flex items-center space-x-2">
            <Zap className="w-3.5 h-3.5 text-[#305EFF]" />
            <span className="text-[#ffffff]">99.98% Gateway Switchboard Availability</span>
          </div>

          <div className="px-4 py-2 rounded-full bg-[#202a3e] border border-[rgba(255,255,255,0.08)] flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#305EFF]" />
            <span className="text-[#ffffff]">Zero RBI Curfew or DPDP Infractions Recorded</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default TrustLogoStrip;
