import React, { useState } from 'react';
import { Zap, Code2, Send, CheckCircle2, XCircle, Loader2, Terminal, ShieldCheck } from 'lucide-react';
import { API_BASE } from '../api';

type WebhookEvent = 'payment.failed.bank_timeout' | 'payment.failed.insufficient_funds' | 'subscription.halted' | 'invoice.overdue' | 'order.abandoned' | 'payment.captured.late_auth';

interface ScenarioPreset {
  id: WebhookEvent;
  label: string;
  description: string;
  color: string;
  borderColor: string;
  tagColor: string;
  leakType: string;
  payload: object;
}

const SCENARIOS: ScenarioPreset[] = [
  {
    id: 'payment.failed.bank_timeout',
    label: 'Payment Failed · Bank Timeout',
    description: 'NPCI switch timeout — Classic Technical Degradation. Instant Retry expected.',
    color: 'bg-blue-950/30',
    borderColor: 'border-blue-500/40',
    tagColor: 'text-blue-300',
    leakType: 'TD',
    payload: {
      event: 'payment.failed',
      payload: {
        payment: {
          entity: {
            id: 'pay_demo_timeout_001',
            method: 'upi',
            amount: 249900,
            customer_id: 'cust_demo_001',
            email: 'aarav.mehta@example.com',
            contact: '+919876543210',
            error_code: 'GATEWAY_ERROR',
            error_description: 'Transaction timed out at NPCI UPI switch',
            error_source: 'bank',
            notes: { customer_name: 'Aarav Mehta' },
          },
        },
      },
    },
  },
  {
    id: 'payment.failed.insufficient_funds',
    label: 'Payment Failed · Insufficient Funds',
    description: 'Genuine NSF decline — Business Decline. WhatsApp soft nudge expected.',
    color: 'bg-amber-950/30',
    borderColor: 'border-amber-500/40',
    tagColor: 'text-amber-300',
    leakType: 'BD',
    payload: {
      event: 'payment.failed',
      payload: {
        payment: {
          entity: {
            id: 'pay_demo_nsf_002',
            method: 'netbanking',
            amount: 599900,
            customer_id: 'cust_demo_002',
            email: 'priya.sharma@example.com',
            contact: '+919712345678',
            error_code: 'BAD_REQUEST_ERROR',
            error_description: 'Your payment was declined by the bank due to insufficient funds',
            error_source: 'customer',
            notes: { customer_name: 'Priya Sharma' },
          },
        },
      },
    },
  },
  {
    id: 'subscription.halted',
    label: 'Subscription Halted · Mandate Expired',
    description: 'UPI Autopay debit limit exceeded. Subscription at churn risk. MRR impact ₹1,999/mo.',
    color: 'bg-purple-950/30',
    borderColor: 'border-purple-500/40',
    tagColor: 'text-purple-300',
    leakType: 'MRR',
    payload: {
      event: 'subscription.halted',
      payload: {
        subscription: {
          entity: {
            id: 'sub_demo_halt_003',
            plan_id: 'plan_pro_monthly',
            charge_amount: 199900,
            error_description: 'UPI Autopay mandate debit limit exceeded on issuing bank',
          },
        },
        customer: {
          entity: {
            id: 'cust_demo_sub_003',
            name: 'Pooja Verma',
            email: 'pooja.v@example.com',
            contact: '+919812345678',
          },
        },
      },
    },
  },
  {
    id: 'invoice.overdue',
    label: 'B2B Invoice Overdue · 48 Days',
    description: 'SME receivable beyond 31-60 day aging bucket. Hinglish voice agent engaged.',
    color: 'bg-red-950/30',
    borderColor: 'border-red-500/40',
    tagColor: 'text-red-300',
    leakType: 'B2B',
    payload: {
      event: 'invoice.overdue',
      payload: {
        invoice: {
          entity: {
            invoice_number: 'INV-20268421',
            amount: 125000,
            days_overdue: 48,
            customer_id: 'cust_b2b_004',
            customer_name: 'Kavita Industries Pvt Ltd',
            customer_phone: '+919823456789',
            dispute_flag: false,
          },
        },
      },
    },
  },
  {
    id: 'order.abandoned',
    label: 'Cart Abandoned · ₹4,500 · High Intent',
    description: 'Payment method selection stage drop-off. Dynamic discount offer expected.',
    color: 'bg-emerald-950/30',
    borderColor: 'border-emerald-500/40',
    tagColor: 'text-emerald-300',
    leakType: 'CART',
    payload: {
      event: 'order.abandoned',
      payload: {
        order: {
          entity: {
            id: 'order_demo_005',
            amount: 450000,
            items_count: 2,
            stage: 'payment_method_selection',
            customer_id: 'cust_cart_005',
            customer_name: 'Rohan Gupta',
            customer_phone: '+919712345678',
            customer_email: 'rohan.gupta@example.com',
          },
        },
      },
    },
  },
  {
    id: 'payment.captured.late_auth',
    label: 'Late Authorization · Intercept & Invalidate',
    description: 'Asynchronous bank success arrives after failure. Sub-5ms intercept halts pending calls/SMS.',
    color: 'bg-teal-950/30',
    borderColor: 'border-teal-500/40',
    tagColor: 'text-teal-300',
    leakType: 'LATE_AUTH',
    payload: {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_demo_timeout_001',
            order_id: 'order_demo_001',
            method: 'upi',
            amount: 249900,
            customer_id: 'cust_demo_001',
            email: 'aarav.mehta@example.com',
            contact: '+919876543210',
            notes: { customer_name: 'Aarav Mehta' },
          },
        },
      },
    },
  },
];

interface WebhookResponse {
  status: string;
  event: string;
  trace_id: string;
  latency_ms: number;
  message?: string;
  idempotency_key?: string;
  case?: {
    id: string;
    leak_type: string;
    root_cause: string;
    root_cause_confidence: number;
    reasoning_chain: string;
    chosen_intervention: string;
    intervention_reason: string;
    compliance_status: string;
    compliance_rule: string;
    amount_at_risk: number;
    amount_recovered?: number;
    reconciliation?: {
      reconciled_at: string;
      trigger_event: string;
      event_id: string;
      previous_status: string;
      pending_actions_cancelled: boolean;
    };
    alternatives_rejected?: Array<{ action: string; rejected_because: string }>;
  };
}

const LEAK_TYPE_LABELS: Record<string, string> = {
  payment_failure: 'Payment Failure',
  checkout_abandonment: 'Cart Abandonment',
  subscription_failure: 'Subscription Churn',
  b2b_receivable: 'B2B Invoice',
};

const COMPLIANCE_COLORS: Record<string, string> = {
  allowed: 'text-emerald-400',
  blocked_time_window: 'text-red-400',
  blocked_frequency: 'text-red-400',
  blocked_exhausted: 'text-red-400',
  rescheduled: 'text-amber-400',
};

export const WebhookPlayground: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<WebhookEvent>('payment.failed.bank_timeout');
  const [jsonPayload, setJsonPayload] = useState<string>(
    JSON.stringify(SCENARIOS[0].payload, null, 2)
  );
  const [isCustom, setIsCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<WebhookResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScenarioSelect = (scenario: ScenarioPreset) => {
    setSelectedScenario(scenario.id);
    setJsonPayload(JSON.stringify(scenario.payload, null, 2));
    setIsCustom(false);
    setResponse(null);
    setError(null);
  };

  const handleFireWebhook = async () => {
    setIsLoading(true);
    setResponse(null);
    setError(null);

    let parsedPayload: object;
    try {
      parsedPayload = JSON.parse(jsonPayload);
    } catch {
      setError('Invalid JSON — please fix your payload.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/webhook/razorpay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedPayload),
      });
      const data: WebhookResponse = await res.json();
      setResponse(data);
    } catch {
      setError('Backend unreachable — make sure the FastAPI server is running on port 8000.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-blue-500/20 relative overflow-hidden glow-blue">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono">
              <Zap className="w-3.5 h-3.5" />
              <span>LIVE SANDBOX · RAZORPAY WEBHOOK SIMULATOR</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight font-display">
              Interactive Webhook Playground
            </h2>
            <p className="text-xs text-gray-400 max-w-2xl">
              Fire real Razorpay-format webhook events at the Recovery Brain. Select a preset scenario or paste raw JSON.
              The engine diagnoses root cause, selects the optimal intervention, and runs compliance checks — all in under 500ms.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-[11px] font-mono text-gray-400 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
              POST /api/webhook/razorpay
            </div>
            <div className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              avg. latency &lt; 500ms
            </div>
          </div>
        </div>
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[200px] bg-blue-600/8 blur-[100px] pointer-events-none -z-0" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left: Scenario Picker + JSON Editor */}
        <div className="lg:col-span-2 space-y-4">

          {/* Presets */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-400">
              Preset Event Scenarios
            </span>
            <div className="space-y-2">
              {SCENARIOS.map(scenario => (
                <button
                  key={scenario.id}
                  onClick={() => handleScenarioSelect(scenario)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedScenario === scenario.id && !isCustom
                      ? `${scenario.color} ${scenario.borderColor}`
                      : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white font-mono">{scenario.label}</span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${scenario.color} ${scenario.tagColor} border ${scenario.borderColor}`}>
                      {scenario.leakType}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 leading-relaxed">{scenario.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* JSON Editor */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" /> Payload Editor
              </span>
              {isCustom && (
                <span className="text-[10px] font-mono text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  Custom
                </span>
              )}
            </div>
            <textarea
              value={jsonPayload}
              onChange={e => {
                setJsonPayload(e.target.value);
                setIsCustom(true);
              }}
              rows={14}
              spellCheck={false}
              className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] text-emerald-300 font-mono resize-none focus:outline-none focus:border-blue-500/40 transition-colors"
            />
            <button
              onClick={handleFireWebhook}
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/25 transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing through Brain...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Fire Webhook →</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Live Response Viewer */}
        <div className="lg:col-span-3 space-y-4">

          {!response && !error && !isLoading && (
            <div className="glass-panel rounded-2xl border border-white/10 flex flex-col items-center justify-center py-24 space-y-3">
              <Terminal className="w-10 h-10 text-gray-600" />
              <p className="text-sm text-gray-500 font-mono">Select a scenario and fire a webhook</p>
              <p className="text-[11px] text-gray-600 font-mono">The AI Brain's diagnosis will appear here</p>
            </div>
          )}

          {isLoading && (
            <div className="glass-panel rounded-2xl border border-blue-500/20 glow-blue flex flex-col items-center justify-center py-24 space-y-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-blue-500/20" />
                <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-2 border-t-blue-400 animate-spin" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm text-blue-300 font-mono font-semibold">Processing Webhook...</p>
                <p className="text-[11px] text-gray-500 font-mono">Diagnosing root cause · Checking compliance · Routing intervention</p>
              </div>
            </div>
          )}

          {error && (
            <div className="glass-panel p-6 rounded-2xl border border-red-500/30 space-y-3">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-sm font-bold text-red-300 font-mono">Error</span>
              </div>
              <p className="text-xs text-red-300 font-mono leading-relaxed">{error}</p>
            </div>
          )}

          {response && !isLoading && (
            <div className="space-y-4 animate-in fade-in duration-200">

              {/* Top: Trace Header */}
              <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="text-sm font-bold text-white font-mono">{response.status.toUpperCase()}</span>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">{response.trace_id}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`text-xs font-mono font-bold px-3 py-1.5 rounded-full ${
                    response.latency_ms < 300 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    response.latency_ms < 500 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {response.latency_ms}ms
                  </div>
                  <div className="text-xs font-mono text-gray-400 px-2 py-1 rounded-full bg-white/[0.04] border border-white/10">
                    {response.event}
                  </div>
                </div>
              </div>

              {/* Late Authorization Intercept Banner */}
              {response.case?.reconciliation && (
                <div className="glass-panel p-5 rounded-2xl border border-teal-500/40 bg-teal-950/20 space-y-3 glow-teal">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-300">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400">
                        Late Authorization Intercepted · Outreach Halted
                      </div>
                      <div className="text-[11px] text-gray-300 font-mono">
                        Asynchronous bank payment arrived after initial failure. All in-flight calls and SMS cancelled in &lt;5ms.
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="text-[9px] font-mono text-gray-400 uppercase">Status</div>
                      <div className="text-xs font-bold text-teal-300 font-mono">RECONCILED</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="text-[9px] font-mono text-gray-400 uppercase">Recovered</div>
                      <div className="text-xs font-bold text-white font-mono">
                        ₹{response.case.amount_recovered?.toLocaleString('en-IN') || response.case.amount_at_risk?.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="text-[9px] font-mono text-gray-400 uppercase">Pending Outreach</div>
                      <div className="text-xs font-bold text-emerald-400 font-mono">CANCELLED (SAFE)</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="text-[9px] font-mono text-gray-400 uppercase">Audit Ledger</div>
                      <div className="text-xs font-bold text-teal-300 font-mono truncate" title={response.case.reconciliation.event_id}>
                        {response.case.reconciliation.event_id}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {response.case && (
                <>
                  {/* Root Cause Analysis */}
                  <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
                      Root Cause Analysis
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20">
                        <div className="text-[10px] font-mono text-blue-400 uppercase mb-1">Leak Type</div>
                        <div className="text-sm font-bold text-white font-mono">
                          {LEAK_TYPE_LABELS[response.case.leak_type] || response.case.leak_type}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20">
                        <div className="text-[10px] font-mono text-amber-400 uppercase mb-1">Root Cause</div>
                        <div className="text-sm font-bold text-white font-mono truncate" title={response.case.root_cause}>
                          {response.case.root_cause}
                        </div>
                      </div>
                    </div>

                    {/* Confidence Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-gray-400">Diagnosis Confidence</span>
                        <span className="text-[10px] font-mono font-bold text-white">
                          {(response.case.root_cause_confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            response.case.root_cause_confidence >= 0.85 ? 'bg-emerald-400' :
                            response.case.root_cause_confidence >= 0.65 ? 'bg-amber-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${response.case.root_cause_confidence * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Reasoning Chain */}
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-[10px] font-mono text-gray-400 uppercase mb-1.5">Reasoning Chain</div>
                      <p className="text-[11px] text-gray-300 font-mono leading-relaxed">
                        {response.case.reasoning_chain}
                      </p>
                    </div>
                  </div>

                  {/* Chosen Intervention */}
                  <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 space-y-3">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
                      Chosen Intervention
                    </span>
                    <div className="flex items-center justify-between">
                      <div className="text-base font-bold text-white font-mono">
                        {(response.case.chosen_intervention || 'N/A').replace(/_/g, ' ').toUpperCase()}
                      </div>
                      <div className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                        COMPLIANCE_COLORS[response.case.compliance_status || ''] || 'text-gray-400'
                      } ${
                        response.case.compliance_status === 'allowed' 
                          ? 'bg-emerald-500/10 border-emerald-500/20' 
                          : 'bg-red-500/10 border-red-500/20'
                      }`}>
                        {(response.case.compliance_status || 'UNKNOWN').replace(/_/g, ' ').toUpperCase()}
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 font-mono leading-relaxed">
                      {response.case.intervention_reason}
                    </p>
                    {response.case.compliance_rule && (
                      <div className="text-[10px] font-mono text-gray-500">
                        Rule: {response.case.compliance_rule}
                      </div>
                    )}
                  </div>

                  {/* Alternatives Rejected */}
                  {response.case.alternatives_rejected && response.case.alternatives_rejected.length > 0 && (
                    <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
                        Alternatives Rejected
                      </span>
                      <div className="space-y-2">
                        {response.case.alternatives_rejected.map((alt, idx) => (
                          <div key={idx} className="flex items-start space-x-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                            <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                            <div>
                              <span className="text-[11px] font-mono font-bold text-gray-300">
                                {alt.action.replace(/_/g, ' ')}
                              </span>
                              <p className="text-[10px] font-mono text-gray-500 mt-0.5">{alt.rejected_because}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amount at Risk */}
                  <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-400">Amount at Risk</span>
                    <span className="text-lg font-bold text-white font-mono">
                      ₹{response.case.amount_at_risk.toLocaleString('en-IN')}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
