import React, { useState, useEffect, useRef } from 'react';
import { Radio, Zap, TrendingUp, ShieldX, ShieldCheck } from 'lucide-react';
import { API_BASE } from '../api';

interface LiveEvent {
  id: string;
  type: string;
  ts: string;
  payload?: {
    event?: string;
    trace_id?: string;
    latency_ms?: number;
    root_cause?: string;
    intervention?: string;
    amount?: number;
    compliance?: string;
  };
}

const EVENT_ICONS: Record<string, string> = {
  'payment.failed': '⚡',
  'subscription.halted': '🔄',
  'invoice.overdue': '📄',
  'order.abandoned': '🛒',
  'webhook_processed': '🧠',
  'connected': '🔗',
  'heartbeat': '💓',
};

const INTERVENTION_COLORS: Record<string, string> = {
  instant_retry: 'text-[#305EFF]',
  smart_delay_retry: 'text-[#305EFF]',
  whatsapp_soft_nudge: 'text-[#305EFF]',
  dynamic_discount_checkout: 'text-amber-300',
  mandate_relink: 'text-[#305EFF]',
  hinglish_voice_call: 'text-[#305EFF]',
  human_escalation: 'text-red-400',
};

const INITIAL_TELEMETRY_EVENTS: LiveEvent[] = [
  {
    id: 'init-1',
    type: 'payment.failed',
    ts: new Date(Date.now() - 1000 * 12).toISOString(),
    payload: {
      event: 'payment.failed',
      trace_id: 'tr_8f9c2d1',
      latency_ms: 4.2,
      root_cause: 'TECHNICAL_DEGRADATION',
      intervention: 'instant_retry',
      amount: 4500,
      compliance: 'allowed',
    },
  },
  {
    id: 'init-2',
    type: 'subscription.halted',
    ts: new Date(Date.now() - 1000 * 35).toISOString(),
    payload: {
      event: 'subscription.halted',
      trace_id: 'tr_4a1e9b2',
      latency_ms: 6.8,
      root_cause: 'MANDATE_MAX_LIMIT_EXCEEDED',
      intervention: 'mandate_relink',
      amount: 12999,
      compliance: 'allowed',
    },
  },
  {
    id: 'init-3',
    type: 'invoice.overdue',
    ts: new Date(Date.now() - 1000 * 68).toISOString(),
    payload: {
      event: 'invoice.overdue',
      trace_id: 'tr_7c3a01d',
      latency_ms: 8.1,
      root_cause: 'MSME_SECTION_43B_H_OVERDUE',
      intervention: 'hinglish_voice_call',
      amount: 85000,
      compliance: 'allowed',
    },
  },
  {
    id: 'init-4',
    type: 'order.abandoned',
    ts: new Date(Date.now() - 1000 * 110).toISOString(),
    payload: {
      event: 'order.abandoned',
      trace_id: 'tr_1b6f88e',
      latency_ms: 3.9,
      root_cause: 'HIGH_INTENT_CART_DROP',
      intervention: 'whatsapp_soft_nudge',
      amount: 3299,
      compliance: 'allowed',
    },
  },
];

export const LiveEventTicker: React.FC = () => {
  const [events, setEvents] = useState<LiveEvent[]>(INITIAL_TELEMETRY_EVENTS);
  const [connected, setConnected] = useState(true);
  const [totalProcessed, setTotalProcessed] = useState(4);
  const [totalAmountRecovered, setTotalAmountRecovered] = useState(105798);
  const esRef = useRef<EventSource | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const connect = () => {
      try {
        const es = new EventSource(`${API_BASE}/api/stream/events`);
        esRef.current = es;

        es.onopen = () => setConnected(true);

        es.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.type === 'heartbeat') return;

            const event: LiveEvent = {
              id: `${Date.now()}-${Math.random()}`,
              type: data.type,
              ts: data.ts,
              payload: data.payload,
            };

            setEvents(prev => [event, ...prev].slice(0, 30));

            if (data.type === 'webhook_processed' || data.type === 'payment.failed') {
              setTotalProcessed(p => p + 1);
              const amt = data.payload?.amount ?? 0;
              if (data.payload?.compliance === 'allowed' && amt > 0) {
                setTotalAmountRecovered(p => p + amt);
              }
            }

            if (listRef.current) {
              listRef.current.scrollTop = 0;
            }
          } catch { /* ignore parse errors */ }
        };

        es.onerror = () => {
          setConnected(false);
          es.close();
          setTimeout(connect, 6000);
        };
      } catch {
        setConnected(false);
      }
    };

    connect();

    return () => {
      esRef.current?.close();
    };
  }, []);

  const formatTs = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch { return ts; }
  };

  const formatAmount = (n: number) =>
    n > 0 ? `₹${n.toLocaleString('en-IN')}` : '';

  return (
    <div className="rounded-[15px] bg-[#202a3e] border border-white/10 overflow-hidden text-left">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#17202e]">
        <div className="flex items-center space-x-2">
          <Radio className={`w-3.5 h-3.5 ${connected ? 'text-[#305EFF] animate-pulse' : 'text-white/40'}`} />
          <span className="text-xs font-mono uppercase tracking-wider text-white">
            Live Telemetry Stream
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
            connected
              ? 'bg-[#202a3e] border-[#305EFF]/40 text-[#305EFF]'
              : 'bg-[#202a3e] border-amber-500/40 text-amber-300'
          }`}>
            {connected ? 'SSE ACTIVE' : 'RECONNECTING...'}
          </span>
        </div>

        {/* Live counters */}
        <div className="flex items-center space-x-4 font-mono text-xs">
          {totalProcessed > 0 && (
            <div className="flex items-center space-x-1 text-[#305EFF]">
              <Zap className="w-3.5 h-3.5" />
              <span>{totalProcessed} processed</span>
            </div>
          )}
          {totalAmountRecovered > 0 && (
            <div className="flex items-center space-x-1 text-[#305EFF]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{formatAmount(totalAmountRecovered)} recovered</span>
            </div>
          )}
        </div>
      </div>

      {/* Event List */}
      <div
        ref={listRef}
        className="max-h-[180px] overflow-y-auto divide-y divide-white/5 bg-[#17202e]"
      >
        {events.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-[#cdd0d6]/60 space-y-1">
            <p>Waiting for live events...</p>
            <p className="text-[11px] text-[#cdd0d6]/40">Fire a webhook from Webhook Sandbox to see live signals here</p>
          </div>
        ) : (
          events.map(ev => (
            <div
              key={ev.id}
              className="flex items-start space-x-3 px-4 py-2.5 hover:bg-[#202a3e]/60 transition-colors text-xs font-mono"
            >
              <span className="text-sm mt-0.5 shrink-0">
                {EVENT_ICONS[ev.payload?.event ?? ev.type] ?? '📡'}
              </span>

              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center space-x-2 flex-wrap gap-1">
                  <span className="font-bold text-white">
                    {ev.payload?.event ?? ev.type}
                  </span>
                  {ev.payload?.latency_ms !== undefined && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#202a3e] text-[#cdd0d6] border border-white/10">
                      {ev.payload.latency_ms}ms
                    </span>
                  )}
                  {ev.payload?.compliance && (
                    ev.payload.compliance === 'allowed'
                      ? <ShieldCheck className="w-3.5 h-3.5 text-[#305EFF]" />
                      : <ShieldX className="w-3.5 h-3.5 text-red-400" />
                  )}
                  {ev.payload?.amount ? (
                    <span className="font-bold text-[#305EFF]">
                      {formatAmount(ev.payload.amount)}
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center space-x-3 flex-wrap gap-1 text-[11px]">
                  {ev.payload?.root_cause && (
                    <span className="text-[#cdd0d6]/70 truncate max-w-[200px]">
                      {ev.payload.root_cause.replace(/_/g, ' ')}
                    </span>
                  )}
                  {ev.payload?.intervention && (
                    <span className={`font-semibold ${
                      INTERVENTION_COLORS[ev.payload.intervention] ?? 'text-white'
                    }`}>
                      → {ev.payload.intervention.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              </div>

              <span className="text-[10px] text-[#cdd0d6]/50 shrink-0 mt-0.5">
                {formatTs(ev.ts)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveEventTicker;
