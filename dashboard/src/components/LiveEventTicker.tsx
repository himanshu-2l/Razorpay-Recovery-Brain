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
  instant_retry: 'text-blue-400',
  smart_delay_retry: 'text-cyan-400',
  whatsapp_soft_nudge: 'text-emerald-400',
  dynamic_discount_checkout: 'text-amber-400',
  mandate_relink: 'text-purple-400',
  hinglish_voice_call: 'text-pink-400',
  human_escalation: 'text-red-400',
};

export const LiveEventTicker: React.FC = () => {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [totalAmountRecovered, setTotalAmountRecovered] = useState(0);
  const esRef = useRef<EventSource | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const connect = () => {
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

          setEvents(prev => [event, ...prev].slice(0, 30)); // keep last 30

          if (data.type === 'webhook_processed') {
            setTotalProcessed(p => p + 1);
            const amt = data.payload?.amount ?? 0;
            if (data.payload?.compliance === 'allowed' && amt > 0) {
              setTotalAmountRecovered(p => p + amt);
            }
          }

          // Auto-scroll to top
          if (listRef.current) {
            listRef.current.scrollTop = 0;
          }
        } catch { /* ignore parse errors */ }
      };

      es.onerror = () => {
        setConnected(false);
        es.close();
        // Reconnect after 5s
        setTimeout(connect, 5000);
      };
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
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center space-x-2">
          <Radio className={`w-3.5 h-3.5 ${connected ? 'text-emerald-400 animate-pulse' : 'text-gray-500'}`} />
          <span className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
            Live Event Stream
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
            connected
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-white/5 border-white/10 text-gray-500'
          }`}>
            {connected ? 'SSE CONNECTED' : 'RECONNECTING...'}
          </span>
        </div>

        {/* Live counters */}
        <div className="flex items-center space-x-4">
          {totalProcessed > 0 && (
            <div className="flex items-center space-x-1 text-[10px] font-mono text-blue-300">
              <Zap className="w-3 h-3" />
              <span>{totalProcessed} processed</span>
            </div>
          )}
          {totalAmountRecovered > 0 && (
            <div className="flex items-center space-x-1 text-[10px] font-mono text-emerald-400">
              <TrendingUp className="w-3 h-3" />
              <span>{formatAmount(totalAmountRecovered)} recovered this session</span>
            </div>
          )}
        </div>
      </div>

      {/* Event List */}
      <div
        ref={listRef}
        className="max-h-[180px] overflow-y-auto divide-y divide-white/[0.03]"
      >
        {events.length === 0 ? (
          <div className="py-8 text-center text-[11px] font-mono text-gray-500 space-y-1">
            <p>Waiting for events...</p>
            <p className="text-gray-600">Fire a webhook from the Webhook Sandbox tab to see live events here</p>
          </div>
        ) : (
          events.map(ev => (
            <div
              key={ev.id}
              className="flex items-start space-x-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors animate-in slide-in-from-top-2 duration-200"
            >
              <span className="text-sm mt-0.5 shrink-0">
                {EVENT_ICONS[ev.payload?.event ?? ev.type] ?? '📡'}
              </span>

              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center space-x-2 flex-wrap gap-1">
                  <span className="text-[11px] font-mono font-bold text-white">
                    {ev.payload?.event ?? ev.type}
                  </span>
                  {ev.payload?.latency_ms !== undefined && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${
                      ev.payload.latency_ms < 300
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    }`}>
                      {ev.payload.latency_ms}ms
                    </span>
                  )}
                  {ev.payload?.compliance && (
                    ev.payload.compliance === 'allowed'
                      ? <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      : <ShieldX className="w-3 h-3 text-red-400" />
                  )}
                  {ev.payload?.amount ? (
                    <span className="text-[10px] font-mono text-amber-300">
                      {formatAmount(ev.payload.amount)}
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center space-x-3 flex-wrap gap-1">
                  {ev.payload?.root_cause && (
                    <span className="text-[10px] font-mono text-gray-400 truncate max-w-[180px]">
                      {ev.payload.root_cause.replace(/_/g, ' ')}
                    </span>
                  )}
                  {ev.payload?.intervention && (
                    <span className={`text-[10px] font-mono font-semibold ${
                      INTERVENTION_COLORS[ev.payload.intervention] ?? 'text-gray-300'
                    }`}>
                      → {ev.payload.intervention.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              </div>

              <span className="text-[9px] font-mono text-gray-600 shrink-0 mt-0.5">
                {formatTs(ev.ts)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
