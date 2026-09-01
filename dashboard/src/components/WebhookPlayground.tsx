import React, { useState } from 'react';
import {
  Send,
  Zap,
  Clock,
  ShieldCheck,
  Code2,
  Sparkles,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import type { CaseItem } from '../types';

interface WebhookResponse {
  status: string;
  event: string;
  trace_id: string;
  latency_ms: number;
  case: CaseItem;
}

const PRESET_PAYLOADS: Record<string, { label: string; event: string; icon: string; description: string; json: object }> = {
  payment_failed_npci: {
    label: 'Payment Failed (NPCI Bank Timeout)',
    event: 'payment.failed',
    icon: '⚡',
    description: 'Technical failure at NPCI switch. Smart retry queues optimal mandate retry without user disturbance.',
    json: {
      event: 'payment.failed',
      payload: {
        payment: {
          entity: {
            id: 'pay_Hk829Jsn1920L',
            amount: 250000,
            currency: 'INR',
            status: 'failed',
            method: 'upi',
            error_code: 'BAD_REQUEST_ERROR',
            error_description: 'Transaction timed out at NPCI switch. Bank core system unresponsive.',
            error_source: 'bank',
            error_step: 'payment_authorization',
            error_reason: 'bank_network_failure',
            customer_id: 'cust_live_001',
            email: 'aarav.mehta@example.com',
            contact: '+919876543210',
            notes: {
              customer_name: 'Aarav Mehta',
              order_id: 'order_N821948291'
            }
          }
        }
      }
    }
  },
  subscription_halted_mandate: {
    label: 'Subscription Halted (Mandate Limit)',
    event: 'subscription.halted',
    icon: '🔄',
    description: 'Recurring autopay declined due to card/mandate limit. Generates dynamic backup payment link.',
    json: {
      event: 'subscription.halted',
      payload: {
        subscription: {
          entity: {
            id: 'sub_G9204918234Kl',
            plan_id: 'plan_enterprise_monthly',
            charge_amount: 199900,
            status: 'halted',
            error_code: 'MANDATE_LIMIT_EXCEEDED',
            error_description: 'Mandate debit limit exceeded on issuing bank. RBI 24hr pre-debit required.',
            customer_id: 'cust_sub_992'
          }
        },
        customer: {
          entity: {
            id: 'cust_sub_992',
            name: 'Pooja Verma',
            email: 'pooja.v@example.com',
            contact: '+919812345678'
          }
        }
      }
    }
  },
  invoice_overdue_sme: {
    label: 'Invoice Overdue (B2B 48-Day Aging)',
    event: 'invoice.overdue',
    icon: '📞',
    description: 'High-value delayed SME receivable. Escalates to Hinglish conversational voice recovery agent.',
    json: {
      event: 'invoice.overdue',
      payload: {
        invoice: {
          entity: {
            id: 'inv_8429104820',
            invoice_number: 'INV-20268421',
            amount: 125000,
            days_overdue: 48,
            customer_name: 'Kavita Industries Pvt Ltd',
            customer_phone: '+919823456789',
            dispute_flag: false
          }
        }
      }
    }
  },
  order_abandoned_high_intent: {
    label: 'Cart Abandoned (High LTV Intent)',
    event: 'order.abandoned',
    icon: '🛒',
    description: 'Checkout drop-off at payment selection. Generates personalized 1-click WhatsApp payment intent.',
    json: {
      event: 'order.abandoned',
      payload: {
        order: {
          entity: {
            id: 'order_Cart918237',
            amount: 450000,
            stage: 'payment_method_selection',
            items_count: 2,
            customer_id: 'cust_cart_441',
            customer_name: 'Rohan Gupta',
            customer_phone: '+919712345678',
            customer_email: 'rohan.gupta@example.com'
          }
        }
      }
    }
  }
};

export const WebhookPlayground: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<string>('payment_failed_npci');
  const [jsonPayload, setJsonPayload] = useState<string>(
    JSON.stringify(PRESET_PAYLOADS.payment_failed_npci.json, null, 2)
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [response, setResponse] = useState<WebhookResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [history, setHistory] = useState<WebhookResponse[]>([]);

  const handleSelectPreset = (key: string) => {
    setSelectedPreset(key);
    setJsonPayload(JSON.stringify(PRESET_PAYLOADS[key].json, null, 2));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWebhook = async () => {
    try {
      setIsSubmitting(true);
      const parsed = JSON.parse(jsonPayload);

      const res = await fetch('http://localhost:8000/api/webhook/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });

      const data = await res.json();
      setResponse(data);
      if (data.status === 'processed') {
        setHistory((prev) => [data, ...prev.slice(0, 4)]);
      }
    } catch (err) {
      console.error('Error dispatching webhook:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-blue-500/20 relative overflow-hidden glow-blue">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[#2B7FFF] text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LIVE WEBHOOK INGESTION ENGINE · SUB-500MS SLA</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight font-display">
              Real-Time Webhook Diagnostic Sandbox
            </h2>
            <p className="text-xs text-gray-400 max-w-2xl">
              Dispatch raw Razorpay webhook payloads directly to the Revenue Recovery Brain. Observe instant root-cause diagnosis, intelligent intervention selection, and strict RBI compliance validation in real-time.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 rounded-2xl bg-black/40 border border-white/10 text-right">
              <span className="text-[10px] font-mono text-gray-400 block uppercase">Target Endpoint</span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">POST /api/webhook/razorpay</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[400px] h-[250px] bg-blue-600/10 blur-[90px] pointer-events-none -z-0" />
      </div>

      {/* Preset Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(PRESET_PAYLOADS).map(([key, item]) => {
          const isSelected = selectedPreset === key;
          return (
            <button
              key={key}
              onClick={() => handleSelectPreset(key)}
              className={`p-3.5 rounded-2xl text-left transition-all border ${
                isSelected
                  ? 'bg-blue-600/15 border-blue-500/40 shadow-lg shadow-blue-500/10'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-lg">{item.icon}</span>
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-gray-400'
                }`}>
                  {item.event}
                </span>
              </div>
              <div className="text-xs font-semibold text-white mb-1">{item.label}</div>
              <div className="text-[11px] text-gray-400 line-clamp-2">{item.description}</div>
            </button>
          );
        })}
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: JSON Payload Editor */}
        <div className="lg:col-span-6 glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                  Webhook Payload (JSON)
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 text-[11px] text-gray-400 hover:text-white transition-all font-mono"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>

            <textarea
              value={jsonPayload}
              onChange={(e) => setJsonPayload(e.target.value)}
              rows={16}
              className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-blue-300 focus:outline-none focus:border-blue-500/50 resize-none selection:bg-blue-500/30"
              spellCheck={false}
            />
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              onClick={() => setJsonPayload(JSON.stringify(PRESET_PAYLOADS[selectedPreset].json, null, 2))}
              className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 text-xs font-mono border border-white/10 transition-all flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset JSON</span>
            </button>

            <button
              onClick={handleSendWebhook}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'Diagnosing Webhook...' : 'Dispatch Webhook (<500ms)'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Diagnostic Response View */}
        <div className="lg:col-span-6 glass-panel p-5 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                  Live Diagnostic Output
                </span>
              </div>
              {response?.latency_ms !== undefined && (
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
                  <Clock className="w-3 h-3" />
                  <span>{response.latency_ms} ms</span>
                </div>
              )}
            </div>

            {!response ? (
              <div className="py-20 text-center text-gray-500 font-mono text-xs space-y-2">
                <Send className="w-6 h-6 mx-auto text-gray-600 opacity-60" />
                <p>Click "Dispatch Webhook" to execute real-time AI diagnosis and rule validation.</p>
              </div>
            ) : (
              <div className="space-y-3.5 animate-in fade-in duration-300">
                
                {/* Meta Pills */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                    Trace: <span className="text-white font-bold">{response.trace_id}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300">
                    Event: <span className="font-bold">{response.event}</span>
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg border font-bold ${
                    response.case.compliance_status === 'allowed'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}>
                    {response.case.compliance_status === 'allowed' ? '✅ COMPLIANT' : '⚠️ GUARD RESCHEDULED'}
                  </span>
                </div>

                {/* Root Cause Card */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-gray-400 uppercase font-semibold">Diagnosed Root Cause</span>
                    <span className="text-blue-400 font-bold">
                      Confidence: {(response.case.root_cause_confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white font-mono">
                    {response.case.root_cause}
                  </div>
                  <div className="text-[11px] text-gray-300 font-mono">
                    {response.case.reasoning_chain}
                  </div>
                </div>

                {/* Chosen Intervention Card */}
                <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-purple-300 uppercase font-semibold">Chosen Smart Intervention</span>
                    <span className="text-emerald-400 font-bold">
                      Status: {response.case.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white font-mono flex items-center space-x-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>{response.case.chosen_intervention.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                  <div className="text-[11px] text-gray-300 font-mono">
                    {response.case.intervention_reason}
                  </div>
                </div>

                {/* Alternatives Rejected */}
                {response.case.alternatives_rejected?.length > 0 && (
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                    <span className="text-[10px] font-mono text-gray-400 uppercase font-semibold block">
                      Alternatives Explicitly Rejected:
                    </span>
                    <div className="space-y-1">
                      {response.case.alternatives_rejected.map((alt, idx) => (
                        <div key={idx} className="text-[11px] font-mono text-gray-400 flex items-start space-x-1.5">
                          <span className="text-red-400">✕</span>
                          <span>
                            <strong className="text-gray-300">{alt.action}</strong>: {alt.rejected_because}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* RBI Compliance Rule */}
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-[11px] font-mono space-y-1">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>RBI Compliance Verification:</span>
                  </div>
                  <div className="text-gray-300">
                    Rule: <span className="text-white font-bold">{response.case.compliance_rule}</span>
                  </div>
                  <div className="text-gray-400 text-[10px]">
                    {response.case.compliance_details}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Micro Footer Notice */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-400">
            <span>Deterministic State Machine Active</span>
            <span>Razorpay API v1 Emulated</span>
          </div>

        </div>

      </div>

      {/* Recent Dispatched History */}
      {history.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-400">
            Session Webhook History
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {history.map((h, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 font-mono text-xs">
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>{h.trace_id}</span>
                  <span className="text-emerald-400">{h.latency_ms}ms</span>
                </div>
                <div className="font-semibold text-white truncate">{h.event}</div>
                <div className="text-[11px] text-purple-300 truncate">
                  {h.case.chosen_intervention.replace(/_/g, ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
