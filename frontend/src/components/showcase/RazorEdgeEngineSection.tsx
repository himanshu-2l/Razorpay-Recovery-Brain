import React, { useState } from 'react';
import { Zap, RefreshCw, Cpu, CheckCircle2 } from 'lucide-react';

interface GatewayRail {
  id: string;
  name: string;
  code: string;
  status: 'healthy' | 'degraded' | 'tripped';
  uptime: string;
  latencyMs: number;
  divertedVolume?: string;
}

export const RazorEdgeEngineSection: React.FC = () => {
  const [tripped, setTripped] = useState<boolean>(false);

  const initialRails: GatewayRail[] = [
    { id: 'hdfc', name: 'HDFC Bank Enterprise Gateway', code: 'HDFC_GW_01', status: tripped ? 'tripped' : 'healthy', uptime: tripped ? '87.4%' : '99.98%', latencyMs: tripped ? 4820 : 118, divertedVolume: tripped ? '₹14.8L / min Diverted' : undefined },
    { id: 'icici', name: 'ICICI Priority Instant Switch', code: 'ICICI_SW_02', status: 'healthy', uptime: '99.99%', latencyMs: 92 },
    { id: 'axis', name: 'Axis Bank Aggregator Rails', code: 'AXIS_AG_01', status: 'healthy', uptime: '99.92%', latencyMs: 134 },
    { id: 'sbi', name: 'State Bank of India Core Switch', code: 'SBI_SYS_04', status: 'healthy', uptime: '99.85%', latencyMs: 146 },
    { id: 'npci_upi', name: 'NPCI Direct UPI Autopay Intent', code: 'UPI_DIRECT_2', status: 'healthy', uptime: '99.99%', latencyMs: 64 },
  ];

  return (
    <section className="py-24 border-t border-white/10 bg-[#17202e] relative text-white overflow-hidden">
      {/* Razor Laser Divider Line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#305EFF] to-transparent opacity-80" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Header with Razorblade Angled Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center space-x-2 px-4 py-1 bg-[#202a3e] border border-[#305EFF]/50 text-xs font-mono font-semibold text-[#305EFF]"
                 style={{ clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)' }}>
              <Cpu className="w-3.5 h-3.5 text-[#305EFF]" />
              <span>RAZOR-EDGE SUB-150MS SWITCHBOARD</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold font-['Open_Sans'] tracking-[-0.036em] text-white leading-tight">
              Razor-Sharp Circuit Breaking.{' '}
              <br className="hidden sm:block" />
              <span className="text-[#305EFF]">Zero Surcharges Incurred.</span>
            </h2>

            <p className="text-sm sm:text-base font-['Open_Sans'] leading-relaxed text-[#cdd0d6]">
              When an upstream banking network chokes, legacy gateways freeze the buyer's screen for 15 seconds. 
              The Razor Edge switchboard isolates failing routes in under 150ms and reroutes checkout volume seamlessly.
            </p>
          </div>

          {/* Interactive Outage Trigger Button with Razor Chamfer */}
          <div className="self-start md:self-end">
            <button
              onClick={() => setTripped(!tripped)}
              className={`px-6 py-2.5 text-xs font-mono font-bold tracking-wider uppercase flex items-center space-x-2 transition-all cursor-pointer ${
                tripped
                  ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                  : 'bg-white text-black hover:bg-[#305EFF] hover:text-black'
              }`}
              style={{ clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)' }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${tripped ? 'animate-spin' : ''}`} />
              <span>{tripped ? 'Heal & Reset Gateway Switch' : 'Simulate 503 Spike On HDFC'}</span>
            </button>
          </div>
        </div>

        {/* Speed Comparison: Razor Edge vs Legacy Retries */}
        <div className="rounded-[15px] bg-[#202a3e] border border-white/10 p-6 sm:p-8 space-y-6 text-left relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#17202e] border border-[#305EFF]/40 text-[#305EFF] flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-base font-bold font-['Open_Sans'] text-white">
                  Latency Battle Benchmark
                </h4>
                <span className="text-xs font-mono text-[#cdd0d6]/70">Automated Circuit Breaking vs. Blind Retries</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-[#cdd0d6]/70">Razor Latency Multiplier:</span>
              <span className="px-2 py-0.5 rounded bg-[#17202e] text-[#305EFF] border border-[#305EFF]/40 font-bold">
                25.6x Faster
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Razor Edge Circuit Breaker Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#305EFF] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Razor Edge Failover Protocol
                </span>
                <span className="text-white font-bold">148 ms (Instant Redirect)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#17202e] overflow-hidden border border-white/10">
                <div className="h-full bg-[#305EFF] rounded-full transition-all duration-500" style={{ width: '4%' }} />
              </div>
            </div>

            {/* Standard Gateway Latency Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-red-400 font-medium">Legacy Payment Gateway Timeout Hang</span>
                <span className="text-[#cdd0d6]/60">3,800 ms (Buyer Abandons Cart)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#17202e] overflow-hidden border border-white/10">
                <div className="h-full bg-red-400/70 rounded-full transition-all duration-500" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Live Bank Rails Switchboard Matrix */}
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between text-xs font-mono text-[#cdd0d6]/70">
            <span>LIVE INTERCONNECT SWITCHBOARD (RBI NPCI HIGHWAY)</span>
            <span className="flex items-center gap-1.5 text-[#305EFF]">
              <span className="w-2 h-2 rounded-full bg-[#305EFF] animate-ping" />
              TELEMETRY STREAM SYNCHRONIZED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {initialRails.map((rail) => (
              <div
                key={rail.id}
                className={`p-4 rounded-[12px] border transition-all text-left space-y-3 ${
                  rail.status === 'tripped'
                    ? 'bg-red-950/30 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                    : 'bg-[#202a3e] border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#cdd0d6]/60">{rail.code}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    rail.status === 'tripped'
                      ? 'bg-red-900/40 border-red-500 text-red-300'
                      : 'bg-[#17202e] border-[#305EFF]/40 text-[#305EFF]'
                  }`}>
                    {rail.status === 'tripped' ? 'CIRCUIT OPEN' : 'ACTIVE'}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-bold font-['Open_Sans'] text-white truncate">
                    {rail.name}
                  </h4>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-xs font-mono">
                    <span className="text-[#cdd0d6]/70">Latency</span>
                    <span className={rail.status === 'tripped' ? 'text-red-400 font-bold' : 'text-white'}>
                      {rail.latencyMs}ms
                    </span>
                  </div>
                </div>

                {rail.divertedVolume && (
                  <div className="text-[11px] font-mono text-amber-300 bg-amber-950/40 p-1.5 rounded border border-amber-800/40 text-center">
                    {rail.divertedVolume}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default RazorEdgeEngineSection;
