import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  BrainCircuit, 
  Zap, 
  PhoneCall, 
  ShieldCheck, 
  Play, 
  Pause, 
  ArrowRight, 
  Activity
} from 'lucide-react';

interface WorkflowStep {
  id: number;
  stageCode: string;
  title: string;
  tagline: string;
  latency: string;
  icon: React.ElementType;
  description: string;
  trigger: string;
  actionTaken: string;
  safetyCheck: string;
  payloadSnippet: string;
  metricLabel: string;
  metricValue: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 0,
    stageCode: 'STAGE 01',
    title: 'Millisecond Intercept',
    tagline: 'Signal Detection & Cart Capture',
    latency: '42 ms',
    icon: AlertTriangle,
    description:
      'The moment a customer payment stumbles at checkout—whether a card network timeout, failed OTP, or checkout drop—the engine intercepts the transaction in <800ms before the buyer closes the tab.',
    trigger: 'Webhook trigger: payment.failed · Error ZA03 (Bank Network Timeout)',
    actionTaken: 'Idempotency token locked. Session preserved in Redis buffer.',
    safetyCheck: 'Validates merchant auth signature and customer consent flags.',
    payloadSnippet: JSON.stringify({
      event: 'payment.failed',
      error_code: 'ZA03_TIMEOUT',
      cart_value_inr: 4890.00,
      bank: 'HDFC_CORE',
      captured_in_ms: 42
    }, null, 2),
    metricLabel: 'Capture Latency',
    metricValue: '42 ms',
  },
  {
    id: 1,
    stageCode: 'STAGE 02',
    title: 'Root-Cause & CATE Uplift',
    tagline: 'Autonomous AI Diagnosis & Scoring',
    latency: '86 ms',
    icon: BrainCircuit,
    description:
      'Instead of blind retries, the engine runs KDD 2010 CATE uplift modeling. It separates temporary gateway hiccups from permanent card blocks, calculating Expected Net Recoverable Value (ENRV) with Sleeping Dogs defense.',
    trigger: 'CATE Model Inference: P(Recovery | Intervention) * Value - Cost',
    actionTaken: 'Classified as Technical Downtime (TD). ENRV calculated at +₹4,620.',
    safetyCheck: 'Sleeping Dogs check: Suppresses permanent fraud to preserve merchant trust.',
    payloadSnippet: JSON.stringify({
      classification: 'TECHNICAL_DOWNTIME_TD',
      cate_enrv_score: 4620.00,
      recovery_probability: 0.942,
      sleeping_dogs_flag: false
    }, null, 2),
    metricLabel: 'Diagnostic Accuracy',
    metricValue: '99.2%',
  },
  {
    id: 2,
    stageCode: 'STAGE 03',
    title: 'Razor-Edge Circuit Breaker',
    tagline: 'Sub-150ms Switchboard Failover',
    latency: '148 ms',
    icon: Zap,
    description:
      'With HDFC switches experiencing peak-hour latency, the switchboard trips a circuit breaker in 148ms, bypassing degraded routes and shifting the transaction to ICICI priority rails or direct UPI Intent.',
    trigger: 'HDFC error spike detected (12.4% error rate over 30s window)',
    actionTaken: 'Circuit breaker opened in 148ms. Diverted 1,240 checkouts to ICICI switch.',
    safetyCheck: 'Zero merchant surcharge penalty incurred; buyer session uninterrupted.',
    payloadSnippet: JSON.stringify({
      circuit_state: 'OPEN',
      degraded_gateway: 'HDFC_GW_01',
      fallback_switch: 'ICICI_PRIORITY_RAILS',
      switch_time_ms: 148,
      surcharges_incurred: 0
    }, null, 2),
    metricLabel: 'Failover Speed',
    metricValue: '148 ms',
  },
  {
    id: 3,
    stageCode: 'STAGE 04',
    title: 'Conversational Voice & WhatsApp',
    tagline: 'Dignified Multi-Channel Recovery',
    latency: '480 ms',
    icon: PhoneCall,
    description:
      'For high-value B2B vendor invoices and subscription churn, the AI dispatches an authentic Hinglish voice call or verified WhatsApp link with 1-click UPI Intent—strictly enforcing the RBI calling curfew.',
    trigger: 'Day 38 invoice reaching Section 43B(h) MSME 45-day tax deadline',
    actionTaken: 'Dispatched verified WhatsApp business link with pre-filled 1-click UPI Intent.',
    safetyCheck: 'RBI Calling Curfew check: Verified between 08:00 and 19:00 IST. NEVER asks for CVV/OTP.',
    payloadSnippet: JSON.stringify({
      channel: 'WHATSAPP_VERIFIED_BUSINESS',
      language: 'Hinglish (Hindi-English mix)',
      tax_clock_days_remaining: 7,
      rbi_curfew_status: 'ALLOWED_DAYTIME',
      credentials_requested: 'NONE'
    }, null, 2),
    metricLabel: 'Telephony Turnaround',
    metricValue: '<480 ms',
  },
  {
    id: 4,
    stageCode: 'STAGE 05',
    title: 'Cryptographic Settlement',
    tagline: 'SHA-256 Merkle Audit & DPDP Vault',
    latency: '680 ms',
    icon: ShieldCheck,
    description:
      'The buyer completes 1-click UPI payment. Cash settles instantly. Every intervention parameter, gateway hop, and customer consent is permanently sealed into a tamper-evident SHA-256 Merkle chain.',
    trigger: 'Payment capture confirmed via NPCI Autopay Webhook',
    actionTaken: '₹4,890.00 settled to merchant account. Section 43B(h) tax clock cleared.',
    safetyCheck: 'DPDP Act 2023: Customer PII automatically scrubbed; immutable Merkle audit proof saved.',
    payloadSnippet: JSON.stringify({
      status: 'RECOVERED_AND_SETTLED',
      amount_settled_inr: 4890.00,
      merkle_block: '#004829 · 3a1f9e2b...',
      msme_sec43bh_cleared: true,
      dpdp_anonymization: 'COMPLETED'
    }, null, 2),
    metricLabel: 'Settlement Integrity',
    metricValue: '100% Verified',
  },
];

interface ProductWorkflowSectionProps {
  onLaunchConsole?: () => void;
  onOpenSimulator?: () => void;
}

export const ProductWorkflowSection: React.FC<ProductWorkflowSectionProps> = ({
  onLaunchConsole,
  onOpenSimulator,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Auto-play simulation loop
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= WORKFLOW_STEPS.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2400);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const current = WORKFLOW_STEPS[activeStep];
  const IconComp = current.icon;

  const startSimulation = () => {
    setActiveStep(0);
    setIsPlaying(true);
  };

  const stopSimulation = () => {
    setIsPlaying(false);
  };

  return (
    <section id="workflow" className="py-24 border-t border-white/10 bg-[#17202e] relative text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#202a3e] border border-[#305EFF]/40 text-xs font-semibold text-[#305EFF]">
              <Activity className="w-3.5 h-3.5 text-[#305EFF]" />
              <span>END-TO-END AUTONOMOUS LIFECYCLE</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold font-['Open_Sans'] tracking-[-0.036em] text-white leading-tight">
              How the Revenue Brain Works.{' '}
              <br className="hidden sm:block" />
              <span className="text-[#305EFF]">From Drop-Off to Settlement.</span>
            </h2>

            <p className="text-sm sm:text-base font-['Open_Sans'] leading-relaxed text-[#cdd0d6]">
              A continuous, transparent 5-stage state machine that catches leaking payments in milliseconds, protects merchant margins, and automates recovery without human intervention.
            </p>
          </div>

          {/* Simulation Controls */}
          <div className="flex items-center space-x-3 self-start md:self-end">
            <button
              onClick={isPlaying ? stopSimulation : startSimulation}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                  : 'bg-[#305EFF] text-white hover:bg-[#4D7CFF] shadow-[0_0_15px_rgba(48,94,255,0.4)]'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-white" />
                  <span>Pause Workflow</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Simulate Live Pipeline Run</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── 5-Node Connected Pipeline Progress Rail ────────────────────────────── */}
        <div className="relative pt-4 pb-2">
          {/* Background Rail Line */}
          <div className="hidden lg:block absolute top-[28px] left-[5%] right-[5%] h-0.5 bg-white/10 z-0">
            {/* Active glowing progress segment */}
            <div
              className="h-full bg-gradient-to-r from-[#305EFF] to-[#4D7CFF] transition-all duration-500"
              style={{ width: `${(activeStep / (WORKFLOW_STEPS.length - 1)) * 100}%` }}
            />
          </div>

          {/* 5 Step Nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 relative z-10">
            {WORKFLOW_STEPS.map((step, idx) => {
              const isCurrent = activeStep === idx;
              const isPassed = activeStep > idx;
              const StepIcon = step.icon;

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveStep(idx);
                  }}
                  className={`p-4 rounded-[15px] border transition-all text-left flex flex-col justify-between cursor-pointer relative ${
                    isCurrent
                      ? 'bg-[#202a3e] border-[#305EFF] shadow-[0_0_15px_rgba(48,94,255,0.25)]'
                      : isPassed
                      ? 'bg-[#202a3e]/80 border-white/20 hover:border-white/30'
                      : 'bg-[#202a3e]/40 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className={`text-[11px] font-mono font-bold ${isCurrent ? 'text-[#305EFF]' : 'text-[#cdd0d6]/60'}`}>
                      {step.stageCode}
                    </span>
                    <div className={`p-1.5 rounded-full ${
                      isCurrent
                        ? 'bg-[#305EFF] text-white'
                        : isPassed
                        ? 'bg-[#17202e] text-[#305EFF]'
                        : 'bg-[#17202e] text-[#cdd0d6]/50'
                    }`}>
                      <StepIcon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-bold font-['Open_Sans'] text-white truncate">
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-[#cdd0d6]/70 truncate mt-0.5">
                      {step.tagline}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#cdd0d6]/60">Latency</span>
                    <span className={isCurrent ? 'text-[#305EFF] font-bold' : 'text-white'}>
                      {step.latency}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Active Stage Detailed Inspector Pad ────────────────────────────────── */}
        <div className="rounded-[15px] bg-[#202a3e] border border-white/10 p-6 sm:p-8 text-left relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Stage Narrative & Action Card */}
            <div className="lg:col-span-7 space-y-6">
              {/* Stage Identity Row */}
              <div className="flex items-center space-x-3 pb-4 border-b border-white/10">
                <div className="w-12 h-12 rounded-full bg-[#17202e] border border-[#305EFF]/40 text-[#305EFF] flex items-center justify-center">
                  <IconComp className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-[#305EFF]">
                      {current.stageCode}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#17202e] border border-white/10 font-mono text-[#cdd0d6]">
                      Elapsed: {current.latency}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-['Open_Sans'] text-white">
                    {current.title} · {current.tagline}
                  </h3>
                </div>
              </div>

              {/* Stage Description */}
              <p className="text-sm sm:text-base font-['Open_Sans'] text-[#cdd0d6] leading-relaxed">
                {current.description}
              </p>

              {/* Execution Diagnostics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-[12px] bg-[#17202e] border border-white/5 space-y-1">
                  <span className="text-xs font-mono uppercase text-[#305EFF] font-bold block">
                    Trigger Condition
                  </span>
                  <p className="text-xs text-[#cdd0d6] leading-snug">
                    {current.trigger}
                  </p>
                </div>

                <div className="p-4 rounded-[12px] bg-[#17202e] border border-white/5 space-y-1">
                  <span className="text-xs font-mono uppercase text-green-400 font-bold block">
                    Autonomous Action Taken
                  </span>
                  <p className="text-xs text-[#cdd0d6] leading-snug">
                    {current.actionTaken}
                  </p>
                </div>
              </div>

              {/* Statutory Safety Guardrail */}
              <div className="p-4 rounded-[12px] bg-[#17202e] border border-[#305EFF]/30 space-y-1.5">
                <div className="flex items-center space-x-2 text-xs font-mono text-[#305EFF] font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Statutory Compliance & Guardrail Enforcement</span>
                </div>
                <p className="text-xs text-white font-['Open_Sans'] leading-relaxed">
                  {current.safetyCheck}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onOpenSimulator}
                  className="idle-btn-ghost text-xs px-5 py-2.5 flex items-center space-x-2"
                >
                  <Play className="w-3.5 h-3.5 fill-[#305EFF]" />
                  <span>Test in Sandbox</span>
                </button>
                <button
                  onClick={onLaunchConsole}
                  className="idle-btn-primary text-xs px-6 py-2.5 flex items-center space-x-2 font-semibold"
                >
                  <span>Inspect Live Batch Stream</span>
                  <ArrowRight className="w-3.5 h-3.5 text-black" />
                </button>
              </div>
            </div>

            {/* Right Column: Live Data Packet & Payload Inspector */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-[12px] bg-[#17202e] border border-white/10 overflow-hidden">
                {/* Terminal Bar */}
                <div className="px-4 py-3 border-b border-white/10 bg-[#17202e] flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#305EFF]" />
                    <span className="text-[#cdd0d6] ml-2">
                      telemetry_payload.json
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#202a3e] border border-[#305EFF]/40 text-[#305EFF]">
                    {current.metricLabel}: {current.metricValue}
                  </span>
                </div>

                {/* Raw JSON Code Block */}
                <div className="p-4 font-mono text-xs text-[#305EFF] overflow-x-auto bg-[#17202e]">
                  <pre className="text-xs leading-relaxed text-[#cdd0d6]">
                    {current.payloadSnippet}
                  </pre>
                </div>
              </div>

              {/* Progress Summary Card */}
              <div className="p-4 rounded-[12px] bg-[#17202e] border border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-[#cdd0d6]/70">Pipeline Completion:</span>
                <span className="text-[#305EFF] font-bold">
                  Stage {activeStep + 1} of 5 ({Math.round(((activeStep + 1) / 5) * 100)}%)
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default ProductWorkflowSection;
