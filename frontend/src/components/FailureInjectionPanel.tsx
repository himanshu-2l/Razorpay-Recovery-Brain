import React, { useState, useEffect } from 'react';
import {
  Zap,
  GitFork,
  TimerReset,
  Copy,
  Clock,
  Gauge,
  CheckCircle2,
  XCircle,
  Play,
  Loader2,
  Shield,
  Terminal,
  Database,
  Cpu,
} from 'lucide-react';
import { API_BASE } from '../api';

interface ChaosScenario {
  key: string;
  title: string;
  category: string;
  invariant: string;
  target_engine: string;
  description: string;
}

interface ExecutionResult {
  scenario: string;
  success: boolean;
  duration_ms: number;
  explanation: string;
  [key: string]: any;
}

const scenarioIcons: Record<string, React.ElementType> = {
  concurrent_webhooks: GitFork,
  stale_lease_recovery: TimerReset,
  double_dispatch_interception: Copy,
  curfew_regulatory_breach: Clock,
  multi_worker_rate_limit_burst: Gauge,
};

export const FailureInjectionPanel: React.FC = () => {
  const [scenarios, setScenarios] = useState<ChaosScenario[]>([]);
  const [runningKey, setRunningKey] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, ExecutionResult>>({});
  const [activeTab, setActiveTab] = useState<string>('concurrent_webhooks');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/failure-injection/scenarios`);
      if (res.ok) {
        const data = await res.json();
        setScenarios(data.scenarios || []);
      }
    } catch (err) {
      console.error('Failed to load chaos scenarios:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunScenario = async (key: string) => {
    setRunningKey(key);
    setActiveTab(key);
    try {
      const res = await fetch(`${API_BASE}/api/failure-injection/run/${key}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.result) {
        setResults((prev) => ({ ...prev, [key]: data.result }));
      }
    } catch (err) {
      console.error(`Error running scenario ${key}:`, err);
    } finally {
      setRunningKey(null);
    }
  };

  const activeResult = results[activeTab];
  const activeScenario = scenarios.find((s) => s.key === activeTab);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-purple-950/30 p-6 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4 text-blue-400 animate-pulse" />
              <span>Adversarial Stress Testing & Proof Engine</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Prove System Invariants Live Under Real-World Stress
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Trigger live adversarial failure scenarios directly against production SQLite WAL Mutex,
              Cryptographic Audit Ledger, and Compliance Engine to verify zero false-positives and at-most-once execution.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              <Shield className="w-4 h-4" />
              <span>Guarantees Active</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium">
              <Database className="w-4 h-4" />
              <span>SQLite WAL Powered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Scenario Selector + Live Inspection Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 5 Scenario Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Executable Stress Scenarios
          </h3>

          {loading && (
            <div className="flex items-center justify-center p-8 text-slate-400 text-sm">
              <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-400" />
              Loading scenario catalog...
            </div>
          )}

          {!loading && scenarios.map((scenario) => {
            const Icon = scenarioIcons[scenario.key] || Zap;
            const isRunning = runningKey === scenario.key;
            const isSelected = activeTab === scenario.key;
            const result = results[scenario.key];

            return (
              <div
                key={scenario.key}
                onClick={() => setActiveTab(scenario.key)}
                className={`group relative rounded-xl border p-4 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500/60 bg-blue-950/20 shadow-lg shadow-blue-500/10'
                    : 'border-white/10 bg-slate-900/40 hover:border-white/20 hover:bg-slate-900/70'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2.5 rounded-lg ${
                      isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400 group-hover:text-white'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                          {scenario.title}
                        </span>
                        {result && (
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            result.success ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {result.success ? 'VERIFIED' : 'FAILED'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {scenario.invariant}
                      </p>
                      <div className="flex items-center space-x-2 mt-2 text-[11px] text-slate-500">
                        <Cpu className="w-3 h-3 text-blue-400" />
                        <span>{scenario.target_engine}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={isRunning}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRunScenario(scenario.key);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                      isRunning
                        ? 'bg-blue-600/50 text-white cursor-wait'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Running</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        <span>Run Test</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Live Proof & Telemetry Inspector (7 cols) */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl h-full flex flex-col justify-between">
            {activeScenario ? (
              <div className="space-y-6">
                {/* Scenario Header */}
                <div className="flex items-start justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                      {activeScenario.category}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">
                      {activeScenario.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {activeScenario.description}
                    </p>
                  </div>

                  <button
                    disabled={runningKey === activeScenario.key}
                    onClick={() => handleRunScenario(activeScenario.key)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-blue-500/25 transition-all"
                  >
                    {runningKey === activeScenario.key ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Simulating Stress...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>Execute Scenario</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Invariant & Architecture Specs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                      Target Guarantee
                    </span>
                    <span className="text-xs font-semibold text-slate-200 mt-1 block">
                      {activeScenario.invariant}
                    </span>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                      Guarding Engine
                    </span>
                    <span className="text-xs font-semibold text-blue-400 mt-1 block">
                      {activeScenario.target_engine}
                    </span>
                  </div>
                </div>

                {/* Execution Results Section */}
                {activeResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                        <Terminal className="w-4 h-4 text-blue-400" />
                        <span>Live Verification Telemetry</span>
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-400">Execution Latency:</span>
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {activeResult.duration_ms} ms
                        </span>
                      </div>
                    </div>

                    {/* Proof Badge Banner */}
                    <div className={`rounded-xl border p-4 ${
                      activeResult.success
                        ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                        : 'border-rose-500/30 bg-rose-950/20 text-rose-200'
                    }`}>
                      <div className="flex items-start space-x-3">
                        {activeResult.success ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className="text-xs font-bold tracking-wide uppercase block">
                            {activeResult.success ? 'Guarantee Proven & Invariant Verified' : 'Anomaly Detected'}
                          </span>
                          <p className="text-xs mt-1 text-slate-300 leading-relaxed">
                            {activeResult.explanation}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Scenario Specific Proof Details */}
                    {activeTab === 'concurrent_webhooks' && activeResult.thread_traces && (
                      <div className="space-y-2">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Thread Race Outcome ({activeResult.total_workers} Concurrent Workers)
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
                          {activeResult.thread_traces.map((t: any) => (
                            <div
                              key={t.worker_id}
                              className={`rounded-lg border p-2 text-center text-xs ${
                                t.acquired
                                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-bold'
                                  : 'border-white/5 bg-white/[0.02] text-slate-400'
                              }`}
                            >
                              <div className="text-[10px] text-slate-500">Worker #{t.worker_id}</div>
                              <div className="mt-1 font-mono text-[11px]">
                                {t.acquired ? 'WON LOCK' : 'BLOCKED'}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{t.latency_ms}ms</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'stale_lease_recovery' && (
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                          <span className="text-[10px] text-slate-500 block">Crashed Process ID</span>
                          <span className="font-mono text-rose-400 font-medium">{activeResult.previous_worker}</span>
                        </div>
                        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                          <span className="text-[10px] text-slate-500 block">Reclaimed By Worker</span>
                          <span className="font-mono text-emerald-400 font-medium">{activeResult.new_worker}</span>
                        </div>
                      </div>
                    )}

                    {/* Raw State JSON Toggle */}
                    <div className="rounded-xl border border-white/5 bg-black/40 p-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                        <span className="font-mono">SQLite WAL Transaction Payload</span>
                        <span className="text-emerald-400 font-mono">Status: 200 OK</span>
                      </div>
                      <pre className="text-[10px] font-mono text-slate-300 overflow-x-auto max-h-36 p-2 bg-black/50 rounded-lg">
                        {JSON.stringify(activeResult, null, 2)}
                      </pre>
                    </div>

                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                    <Play className="w-8 h-8 text-blue-500/40 mb-3 fill-current" />
                    <span className="text-sm font-semibold text-slate-300">
                      Scenario Ready for Execution
                    </span>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Click "Execute Scenario" above to fire real adversarial requests against the live engine and view millisecond proofs.
                    </p>
                  </div>
                )}

              </div>
            ) : null}

            {/* Bottom Footer Note */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center space-x-1">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span>Zero mock bypass: executes against actual SQLite WAL tables</span>
              </span>
              <span>Compliant with DPDP Act & RBI Guidelines</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
