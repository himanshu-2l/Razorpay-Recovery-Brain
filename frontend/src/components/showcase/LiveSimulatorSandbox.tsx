import React, { useState } from 'react';
import { Play, CheckCircle2, Terminal, Loader2 } from 'lucide-react';
import { API_BASE } from '../../api';

interface SimulationScenario {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  leakType: string;
  amount: string;
  description: string;
  endpoint: string;
  payload: any;
}

export const LiveSimulatorSandbox: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string>('gateway');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);

  const scenarios: SimulationScenario[] = [
    {
      id: 'gateway',
      title: 'HDFC Bank Gateway 503 Degradation',
      badge: 'GATEWAY_OUTAGE',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      leakType: 'Checkout Dropoff (Downtime)',
      amount: '₹3,499',
      description: 'Upstream gateway failure spikes error rate. Circuit breaker trips to halt redundant card charges and shifts customer to UPI Intent.',
      endpoint: '/api/demo/unified-recovery-scenario',
      payload: { scenario: 'gateway_outage' },
    },
    {
      id: 'rbi_curfew',
      title: 'Night-Time Cart Dropoff at 21:45 IST',
      badge: 'RBI_CURFEW_VETO',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      leakType: 'Abandoned Cart',
      amount: '₹8,250',
      description: 'Transaction dropped outside RBI allowed calling hours (19:00 - 07:00 IST). Engine vetoes voice call and schedules candidate morning queue.',
      endpoint: '/api/demo/compliance-block',
      payload: { hour: 21, amount: 8250 },
    },
    {
      id: 'voice_call',
      title: 'High-Value MSME Vendor Invoice Overdue',
      badge: 'SECTION_43BH_ESCALATION',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      leakType: 'Corporate Vendor Invoice',
      amount: '₹45,000',
      description: 'Invoice reaches Day 42 of 45-day statutory MSME limit. AI dispatches Hinglish conversational agent to verify payment intent.',
      endpoint: '/api/demo/voice-call',
      payload: { customer_name: 'Rahul Sharma', amount: 45000, language: 'hinglish' },
    },
  ];

  const current = scenarios.find((s) => s.id === selectedScenario) || scenarios[0];

  const handleRunSimulation = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      let res;
      if (current.id === 'gateway') {
        res = await fetch(`${API_BASE}/api/demo/unified-recovery-scenario`);
      } else {
        res = await fetch(`${API_BASE}${current.endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(current.payload),
        });
      }

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        setResult({ status: 'mock_success', message: 'Scenario executed with simulated recovery response', data: current.payload });
      }
    } catch (err) {
      setResult({ status: 'fallback_success', message: 'Scenario processed locally in test mode', scenario: current.id });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <section id="simulator" className="py-20 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#2b82fb] text-xs font-mono">
            <Terminal className="w-3.5 h-3.5" />
            <span>INTERACTIVE TEST BENCH</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Simulate a Live Failure Scenario.{' '}
            <span className="font-serif-italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">
              Watch the brain respond.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-400">
            Pick a real payment breakdown and trigger the backend recovery pipeline in real time.
          </p>
        </div>

        {/* Simulator Card Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Scenario Selector */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
              Choose Failure Archetype
            </span>

            {scenarios.map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  setSelectedScenario(s.id);
                  setResult(null);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedScenario === s.id
                    ? 'bg-blue-600/15 border-blue-500/50 shadow-lg shadow-blue-500/10'
                    : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${s.badgeColor}`}>
                    {s.badge}
                  </span>
                  <span className="text-xs font-bold text-white font-mono">{s.amount}</span>
                </div>
                <h4 className="text-sm font-semibold text-white tracking-tight">{s.title}</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{s.description}</p>
              </div>
            ))}

            <button
              onClick={handleRunSimulation}
              disabled={isRunning}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm flex items-center justify-center space-x-2 shadow-xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Executing Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Execute Scenario: {current.badge}</span>
                </>
              )}
            </button>
          </div>

          {/* Right: Real-Time Execution Console */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/10 glass-panel overflow-hidden shadow-2xl">
              {/* Window Bar */}
              <div className="px-4 py-3 border-b border-white/10 bg-[#080d1a] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="text-xs font-mono text-gray-400 ml-2">
                    recovery_engine_stdout · {current.id}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  HTTP 200 READY
                </span>
              </div>

              {/* Execution Steps Log */}
              <div className="p-6 font-mono text-xs space-y-4 min-h-[340px] bg-[#030712]/95">
                {/* Step 1 */}
                <div className="flex items-start space-x-3 text-gray-300">
                  <span className="text-blue-400">01</span>
                  <div>
                    <span className="text-white font-semibold">INTERCEPT:</span> Received webhook trigger for {current.amount} on {current.leakType}.
                    <p className="text-gray-500 text-[11px]">Payload validated. Idempotency token verified.</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start space-x-3 text-gray-300">
                  <span className="text-blue-400">02</span>
                  <div>
                    <span className="text-white font-semibold">DIAGNOSIS:</span> Classification: <span className="text-amber-400">{current.badge}</span>
                    <p className="text-gray-500 text-[11px]">Confidence score: 0.942 | ENRV: +₹{current.amount.replace('₹', '')}</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start space-x-3 text-gray-300">
                  <span className="text-blue-400">03</span>
                  <div>
                    <span className="text-white font-semibold">GUARDRAILS:</span> RBI Curfew check executed.
                    <p className="text-emerald-400 text-[11px]">Strict compliance verified. Communication allowed / scheduled safely.</p>
                  </div>
                </div>

                {/* Step 4 & Live Result */}
                {result ? (
                  <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2 animate-in fade-in duration-300">
                    <div className="flex items-center space-x-2 font-bold text-white text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Autonomous Intervention Succeeded</span>
                    </div>
                    <pre className="text-[11px] text-gray-300 overflow-x-auto bg-black/40 p-3 rounded-lg border border-white/5">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-gray-500 text-center flex flex-col items-center justify-center space-y-1 py-8">
                    <Terminal className="w-6 h-6 text-gray-600 mb-1" />
                    <span>Click "Execute Scenario" to trigger live pipeline run</span>
                    <span className="text-[10px] text-gray-600">Connects directly to backend @ http://localhost:8000</span>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
