import React, { useState } from 'react';
import { ShieldCheck, Clock, AlertTriangle } from 'lucide-react';
import type { BatchSummary } from '../types';
import { API_BASE } from '../api';

interface ComplianceShieldProps {
  summary: BatchSummary | null;
}

export const ComplianceShield: React.FC<ComplianceShieldProps> = ({ summary }) => {
  const [testHour, setTestHour] = useState<number>(21); // 9 PM IST
  const [demoBlockResult, setDemoBlockResult] = useState<any>(null);
  const [testingBlock, setTestingBlock] = useState<boolean>(false);

  const testComplianceBlock = async () => {
    setTestingBlock(true);
    try {
      const res = await fetch(`${API_BASE}/api/demo/compliance-block?hour=${testHour}`, {
        method: 'POST',
      });
      const data = await res.json();
      setDemoBlockResult(data);
    } catch (err) {
      console.error('Error running compliance demo:', err);
    } finally {
      setTestingBlock(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-emerald-500/20 relative overflow-hidden glow-emerald">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>THE GATE · BOUNDED INTERVENTION ENGINE</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight font-display">
              Responsible Collections Policy & Compliance Shield
            </h2>
            <p className="text-xs text-gray-400 max-w-2xl">
              "The compliance layer visibly refusing to act is more impressive than the agent acting." Enforces strict non-negotiable checks (inspired by RBI Fair Practices Code principles: 8 AM – 7 PM window, weekly frequency caps, and economic floor stopping rules) before execution.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Interactive 9 PM Window Block Demo */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center space-x-2 text-white text-sm font-bold font-display">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Live Simulation: Time-Window Violation Test</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
              Interactive Test
            </span>
          </div>

          <p className="text-xs text-gray-300">
            Select an hour of the day in Indian Standard Time (IST). Attempting recovery after 7:00 PM or before 8:00 AM will trigger an immediate compliance veto.
          </p>

          <div className="flex items-center space-x-3">
            <label className="text-xs font-mono text-gray-400">Simulate Hour (IST):</label>
            <select
              value={testHour}
              onChange={(e) => setTestHour(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-mono text-white focus:outline-none"
            >
              <option value={9} className="bg-black">09:00 AM (Within Window)</option>
              <option value={14} className="bg-black">02:00 PM (Within Window)</option>
              <option value={18} className="bg-black">06:30 PM (Within Window)</option>
              <option value={21} className="bg-black">09:00 PM (Blocked · Night)</option>
              <option value={23} className="bg-black">11:00 PM (Blocked · Night)</option>
              <option value={5} className="bg-black">05:00 AM (Blocked · Early)</option>
            </select>

            <button
              onClick={testComplianceBlock}
              disabled={testingBlock}
              className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all shadow-md active:scale-95"
            >
              {testingBlock ? 'Validating...' : 'Trigger Action'}
            </button>
          </div>

          {/* Block / Allowed Display Box */}
          {demoBlockResult && (
            <div className={`p-4 rounded-2xl border space-y-2 animate-in fade-in duration-200 ${
              demoBlockResult.result === 'allowed'
                ? 'bg-emerald-950/20 border-emerald-500/30'
                : 'bg-red-950/20 border-red-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-bold uppercase ${
                  demoBlockResult.result === 'allowed' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {demoBlockResult.result === 'allowed' ? '✅ ACTION ALLOWED' : '❌ ACTION BLOCKED BY COMPLIANCE'}
                </span>
                <span className="text-[10px] font-mono text-gray-400">{demoBlockResult.attempted_at}</span>
              </div>
              <div className="text-xs text-white font-mono">
                <strong>Rule Cited:</strong> {demoBlockResult.rule_cited}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-mono text-[11px]">
                {demoBlockResult.details}
              </p>
            </div>
          )}

          {/* Hard Rules Breakdown */}
          <div className="pt-2 space-y-2">
            <span className="text-[11px] font-mono uppercase text-gray-400 font-semibold block">
              Hardcoded Rules Enforced in System:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-gray-300">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <strong className="text-white block">Contact Window:</strong>
                <span className="text-gray-400">8:00 AM – 7:00 PM IST only</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <strong className="text-white block">Frequency Cap:</strong>
                <span className="text-gray-400">Max 3 contacts / week</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <strong className="text-white block">Daily Cap:</strong>
                <span className="text-gray-400">Max 1 contact / day</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <strong className="text-white block">Exhaustion Rule:</strong>
                <span className="text-gray-400">7 total tries → Human Escalate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Honest Exception List (What we couldn't recover & why) */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center space-x-2 text-white text-sm font-bold font-display">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Honest Exception List · Unrecovered Cases</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {summary?.exceptions?.length || 0} Cases
            </span>
          </div>

          <p className="text-xs text-gray-300">
            Winning submissions don't cherry-pick. Here are the genuine edge cases the brain deliberately stopped or escalated with justification:
          </p>

          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {!summary?.exceptions || summary.exceptions.length === 0 ? (
              <div className="text-xs text-gray-500 font-mono py-8 text-center">
                No exceptions in current batch.
              </div>
            ) : (
              summary.exceptions.slice(0, 6).map((exc, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs space-y-1">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-semibold text-white">{exc.customer}</span>
                    <span className="text-red-400 font-bold">₹{exc.amount.toLocaleString()}</span>
                  </div>
                  <div className="text-[10px] font-mono text-gray-400">
                    Root Cause: <span className="text-amber-300">{exc.root_cause}</span> · Status: <span className="text-purple-300">{exc.status}</span>
                  </div>
                  <p className="text-[11px] text-gray-300 italic">
                    Reason: {exc.reason}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
