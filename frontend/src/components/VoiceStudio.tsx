import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  Volume2,
  VolumeX,
  CheckCircle2,
  Calendar,
  Sparkles,
  Radio,
  Zap,
  Activity,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import type { VoiceCallDemoResponse } from '../types';
import { API_BASE } from '../api';

const PERSONAS = [
  {
    id: 'first_time_miss',
    label: 'First-Time Miss',
    badge: 'Soft Nudge',
    strategy: 'Courtesy Reminder & Simple Link',
    defaultName: 'Rajesh Sharma',
    defaultAmount: 85000,
    defaultInvoice: 'INV-20268421',
    defaultOverdue: 14,
  },
  {
    id: 'repeat_delinquent',
    label: 'Repeat Delinquent',
    badge: 'Structured Terms',
    strategy: 'Milestone Split & Partial Settle',
    defaultName: 'Priya Mehta',
    defaultAmount: 145000,
    defaultInvoice: 'INV-20264910',
    defaultOverdue: 62,
  },
  {
    id: 'dispute_pending',
    label: 'Disputed Charge',
    badge: 'Hold & Docket',
    strategy: 'Immediate Pause & Evidence Docket',
    defaultName: 'Amit Patel',
    defaultAmount: 230000,
    defaultInvoice: 'INV-20263301',
    defaultOverdue: 38,
  },
  {
    id: 'broken_ptp',
    label: 'Broken PTP Follow-up',
    badge: 'MSME 43B(h) Clock',
    strategy: 'Section 43B(h) 45-day Tax Urgency',
    defaultName: 'Sunita Devi',
    defaultAmount: 95000,
    defaultInvoice: 'INV-20269922',
    defaultOverdue: 42,
  },
];

export const VoiceStudio: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState<string>('first_time_miss');
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [callData, setCallData] = useState<VoiceCallDemoResponse | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [phoneNumber, setPhoneNumber] = useState<string>('+91 98765 43210');
  const [debtorName, setDebtorName] = useState<string>('Rajesh Sharma');
  const [invoiceAmount, setInvoiceAmount] = useState<number>(85000);
  const [invoiceNumber, setInvoiceNumber] = useState<string>('INV-20268421');
  const [daysOverdue, setDaysOverdue] = useState<number>(14);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<'agent' | 'debtor' | null>(null);
  const [gpuMode, setGpuMode] = useState<boolean>(false);
  const [gpuStatus, setGpuStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [twilioCallStatus, setTwilioCallStatus] = useState<null | { mode: string; message: string; call_sid?: string }>(null);
  const [isTwilioCalling, setIsTwilioCalling] = useState(false);
  const [telephonyProvider, setTelephonyProvider] = useState<'twilio' | 'bolna'>('bolna');
  const [telephonyMeta, setTelephonyMeta] = useState<{
    bolna?: { configured: boolean; status: string; wallet_balance: number; agents_count: number };
    twilio?: { configured: boolean; status: string };
    whatsapp?: { configured: boolean; status: string };
  } | null>(null);
  const [whatsAppStatus, setWhatsAppStatus] = useState<null | { mode: string; message: string; payment_link?: string }>(null);
  const [isWhatsAppSending, setIsWhatsAppSending] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const handleSelectPersona = (personaId: string) => {
    const p = PERSONAS.find((item) => item.id === personaId);
    if (!p) return;
    setSelectedPersona(personaId);
    setDebtorName(p.defaultName);
    setInvoiceAmount(p.defaultAmount);
    setInvoiceNumber(p.defaultInvoice);
    setDaysOverdue(p.defaultOverdue);
    if (isCalling) stopCall();
    setCallData(null);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    const checkGpu = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/llm/health`, { method: 'GET' });
        const data = await res.json();
        setGpuStatus(data.status === 'online' ? 'online' : 'offline');
      } catch {
        setGpuStatus('offline');
      }
    };
    checkGpu();
    const gpuInterval = setInterval(checkGpu, 30000);

    const fetchTelephonyStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/demo/telephony-status`);
        if (res.ok) {
          const data = await res.json();
          setTelephonyMeta(data);
          // If Bolna is active and Twilio needs SID, default to Bolna
          if (data.bolna?.configured && !data.twilio?.configured) {
            setTelephonyProvider('bolna');
          }
        }
      } catch (err) {
        console.warn('Failed to load telephony status', err);
      }
    };
    fetchTelephonyStatus();

    return () => {
      if (synthRef.current) synthRef.current.cancel();
      timeoutsRef.current.forEach(clearTimeout);
      clearInterval(gpuInterval);
    };
  }, []);

  const speakText = (text: string, speaker: 'agent' | 'debtor') => {
    if (!audioEnabled || !synthRef.current) return;

    try {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = synthRef.current.getVoices();
      const hindiOrIndianVoice = voices.find(
        (v) => v.lang.includes('hi') || v.lang.includes('IN') || v.name.includes('India')
      );

      if (hindiOrIndianVoice) {
        utterance.voice = hindiOrIndianVoice;
      }

      if (speaker === 'agent') {
        utterance.pitch = 1.1;
        utterance.rate = 1.0;
      } else {
        utterance.pitch = 0.9;
        utterance.rate = 0.95;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setCurrentSpeaker(speaker);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentSpeaker(null);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setCurrentSpeaker(null);
      };

      synthRef.current.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  const stopCall = () => {
    if (synthRef.current) synthRef.current.cancel();
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setIsCalling(false);
    setIsSpeaking(false);
    setCurrentSpeaker(null);
  };

  const triggerCall = async () => {
    stopCall();
    setIsCalling(true);
    setActiveStep(0);

    try {
      const endpoint = gpuMode && gpuStatus === 'online'
        ? `${API_BASE}/api/llm/voice-call-dynamic`
        : `${API_BASE}/api/demo/voice-call`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumber,
          debtor_name: debtorName,
          debtor_company: 'Client Enterprises',
          amount: invoiceAmount,
          invoice_number: invoiceNumber,
          days_overdue: daysOverdue,
          persona: selectedPersona,
        }),
      });
      const data = await response.json();

      const finalData: VoiceCallDemoResponse = data.mode === 'scripted'
        ? await (await fetch(`${API_BASE}/api/demo/voice-call`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone_number: phoneNumber,
              debtor_name: debtorName,
              amount: invoiceAmount,
              invoice_number: invoiceNumber,
              days_overdue: daysOverdue,
              persona: selectedPersona,
            }),
          })).json()
        : data;

      setCallData(finalData);

      if (finalData.conversation?.flow) {
        const flow = finalData.conversation.flow;
        let cumulativeDelay = 300;

        flow.forEach((item, idx: number) => {
          const t1 = setTimeout(() => {
            setActiveStep(idx + 1);
            speakText(item.text, item.speaker);
          }, cumulativeDelay);
          timeoutsRef.current.push(t1);

          const duration = Math.max(2200, item.text.length * 75);
          cumulativeDelay += duration;
        });

        const endTimeout = setTimeout(() => {
          setIsCalling(false);
          setIsSpeaking(false);
          setCurrentSpeaker(null);
        }, cumulativeDelay + 800);
        timeoutsRef.current.push(endTimeout);
      }
    } catch (err) {
      console.error('Error triggering voice call:', err);
      setIsCalling(false);
    }
  };

  const handleTriggerRealCall = async () => {
    setIsTwilioCalling(true);
    setTwilioCallStatus(null);
    try {
      const res = await fetch(`${API_BASE}/api/demo/trigger-real-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_number: phoneNumber,
          customer_name: debtorName,
          amount_inr: invoiceAmount,
          invoice_number: invoiceNumber,
          provider: telephonyProvider,
        }),
      });
      const data = await res.json();
      setTwilioCallStatus({
        mode: data.mode || data.provider || 'unknown',
        message: data.message || 'Call initiated',
        call_sid: data.call_sid || data.call_id || (data.agent_id ? `Agent: ${data.agent_id}` : undefined),
      });
    } catch (err) {
      setTwilioCallStatus({
        mode: 'error',
        message: 'Failed to contact backend call gateway.',
      });
    } finally {
      setIsTwilioCalling(false);
    }
  };

  const handleTriggerRealWhatsApp = async () => {
    setIsWhatsAppSending(true);
    setWhatsAppStatus(null);
    try {
      const res = await fetch(`${API_BASE}/api/demo/trigger-real-whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_number: phoneNumber,
          customer_name: debtorName,
          amount_inr: invoiceAmount,
          invoice_number: invoiceNumber,
        }),
      });
      const data = await res.json();
      setWhatsAppStatus({
        mode: data.mode || 'unknown',
        message: data.message || 'WhatsApp dispatched',
        payment_link: data.payment_link,
      });
    } catch (err: any) {
      setWhatsAppStatus({
        mode: 'error',
        message: err.message || 'Failed to trigger WhatsApp message.',
      });
    } finally {
      setIsWhatsAppSending(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ── Studio Header Banner ────────────────────────────────────────────── */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 relative overflow-hidden glow-blue">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>VOICE RECOVERY SUITE · NOTIFICATION CALL & OFFLINE DIALOGUE SIMULATOR</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight font-sans">
              B2B Receivables Voice Recovery Studio
            </h2>
            <p className="text-xs text-gray-400 max-w-2xl">
              Indian SME payment delays average 73 days against 30-day terms. Features: (1) <strong className="text-purple-300">Compliant Automated Notification Calls</strong> via Twilio/Bolna with RBI curfew gating, and (2) <strong className="text-purple-300">Offline Hinglish Dialogue Simulator</strong> with 4 negotiation personas, structured intent extraction, and an 800ms architectural target SLA budget.
            </p>
            {/* GPU Server Status Pill */}
            <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border ${
              gpuStatus === 'online'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : gpuStatus === 'offline'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-white/5 border-white/10 text-gray-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                gpuStatus === 'online' ? 'bg-emerald-400 animate-pulse' :
                gpuStatus === 'offline' ? 'bg-red-400' : 'bg-gray-500'
              }`} />
              <span>GPU Server · Ollama · {gpuStatus === 'online' ? 'ONLINE' : gpuStatus === 'offline' ? 'OFFLINE' : 'CHECKING...'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setGpuMode(!gpuMode)}
              disabled={gpuStatus !== 'online' || isCalling}
              className={`px-3 py-1.5 rounded-full text-[10px] font-mono font-semibold border transition-all ${
                gpuMode && gpuStatus === 'online'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : gpuStatus !== 'online'
                  ? 'bg-white/[0.02] border-white/5 text-gray-600 cursor-not-allowed'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              {gpuMode && gpuStatus === 'online' ? '🧠 Llama-3-8B LIVE' : '📄 Strategy Engine'}
            </button>

            <button
              onClick={() => {
                if (isCalling && synthRef.current) synthRef.current.cancel();
                setAudioEnabled(!audioEnabled);
              }}
              className={`p-3 rounded-full border transition-all ${
                audioEnabled
                  ? 'bg-purple-600/20 text-purple-300 border-purple-500/30 hover:bg-purple-600/30'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
              }`}
              title={audioEnabled ? 'Audio Speech Synthesis ON' : 'Audio Muted'}
            >
              {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
            </button>

            {/* Telephony Provider Selector */}
            <div className="flex items-center bg-black/40 border border-white/10 rounded-full p-1 text-xs">
              <button
                onClick={() => setTelephonyProvider('twilio')}
                className={`px-3 py-1.5 rounded-full font-medium transition-all ${
                  telephonyProvider === 'twilio'
                    ? 'bg-blue-600/30 border border-blue-500/50 text-blue-200'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                title="Twilio Programmable Voice with Polly.Aditi"
              >
                Twilio
              </button>
              <button
                onClick={() => setTelephonyProvider('bolna')}
                className={`px-3 py-1.5 rounded-full font-medium transition-all flex items-center space-x-1.5 ${
                  telephonyProvider === 'bolna'
                    ? 'bg-purple-600/30 border border-purple-500/50 text-purple-200'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                title="Bolna AI Indian Conversational Backup"
              >
                <span>Bolna AI</span>
                {telephonyMeta?.bolna?.configured && (
                  <span className="text-[10px] bg-purple-500/30 text-purple-200 px-1.5 py-0.5 rounded-full font-mono">
                    ₹{telephonyMeta.bolna.wallet_balance?.toFixed(0) ?? 500}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={handleTriggerRealCall}
              disabled={isTwilioCalling}
              className={`px-5 py-3 rounded-full font-semibold text-sm flex items-center space-x-2 transition-all shadow-xl active:scale-95 text-white disabled:opacity-50 ${
                telephonyProvider === 'bolna'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/30'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
              }`}
              title={telephonyProvider === 'bolna' ? 'Dial phone using Bolna AI Conversational Agent' : 'Dial phone using Twilio Programmable Voice'}
            >
              <Radio className={`w-4 h-4 ${isTwilioCalling ? 'animate-pulse' : ''}`} />
              <span>
                {isTwilioCalling
                  ? 'Connecting...'
                  : telephonyProvider === 'bolna'
                  ? 'Call (Bolna AI)'
                  : 'Call (Twilio Voice)'}
              </span>
            </button>

            <button
              onClick={handleTriggerRealWhatsApp}
              disabled={isWhatsAppSending}
              className="px-5 py-3 rounded-full font-semibold text-sm flex items-center space-x-2 transition-all shadow-xl active:scale-95 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white shadow-green-600/30 disabled:opacity-50"
              title="Send real WhatsApp message with Razorpay payment link"
            >
              <MessageSquare className={`w-4 h-4 ${isWhatsAppSending ? 'animate-pulse' : ''}`} />
              <span>{isWhatsAppSending ? 'Sending WhatsApp...' : 'Send WhatsApp (Razorpay Link)'}</span>
            </button>

            <button
              onClick={isCalling ? stopCall : triggerCall}
              className={`px-6 py-3 rounded-full font-semibold text-sm flex items-center space-x-2 transition-all shadow-xl active:scale-95 ${
                isCalling
                  ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                  : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-600/30'
              }`}
            >
              {isCalling ? (
                <>
                  <PhoneOff className="w-4 h-4" />
                  <span>End Dialogue Simulator</span>
                </>
              ) : (
                <>
                  <PhoneCall className="w-4 h-4" />
                  <span>Run Dialogue Simulator (Offline)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {twilioCallStatus && (
          <div className={`mt-4 p-3 rounded-xl border text-xs flex items-center justify-between relative z-10 ${
            twilioCallStatus.mode === 'live_twilio' || twilioCallStatus.mode === 'live_bolna'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span><strong>{twilioCallStatus.mode.toUpperCase()}:</strong> {twilioCallStatus.message}</span>
            </div>
            {twilioCallStatus.call_sid && (
              <span className="font-mono text-[11px] opacity-75">{twilioCallStatus.call_sid}</span>
            )}
          </div>
        )}

        {whatsAppStatus && (
          <div className={`mt-4 p-3 rounded-xl border text-xs flex items-center justify-between relative z-10 ${
            whatsAppStatus.mode === 'live_twilio' || whatsAppStatus.mode === 'live_meta'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span><strong>WHATSAPP ({whatsAppStatus.mode.toUpperCase()}):</strong> {whatsAppStatus.message}</span>
            </div>
            {whatsAppStatus.payment_link && (
              <a
                href={whatsAppStatus.payment_link}
                target="_blank"
                rel="noreferrer"
                className="underline font-mono text-[11px] hover:text-white"
              >
                Open Razorpay Link ↗
              </a>
            )}
          </div>
        )}

        <div className="absolute top-0 right-0 w-[400px] h-[250px] bg-purple-600/10 blur-[90px] pointer-events-none -z-0" />
      </div>

      {/* ── Collection Persona Strategy Selector Bar ────────────────────────── */}
      <div className="glass-panel p-3 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 px-2 text-xs font-mono font-bold text-gray-400 uppercase">
          <Activity className="w-4 h-4 text-purple-400" />
          <span>Collection Persona Strategy:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPersona(p.id)}
              disabled={isCalling}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all flex items-center space-x-2 ${
                selectedPersona === p.id
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 font-bold shadow-lg shadow-purple-500/10'
                  : 'bg-white/[0.02] text-gray-400 border border-white/5 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <span>{p.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-white font-medium">
                {p.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left Column: Target Debtor Parameters ─────────────────────────── */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-purple-400">
              Debtor & Case Setup
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              {PERSONAS.find((p) => p.id === selectedPersona)?.strategy}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-mono text-gray-400 block mb-1">Debtor Name</label>
              <input
                type="text"
                value={debtorName}
                onChange={(e) => setDebtorName(e.target.value)}
                disabled={isCalling}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-gray-400 block mb-1">Phone Number (E.164)</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isCalling}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-mono text-gray-400 block mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  disabled={isCalling}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-gray-400 block mb-1">Days Overdue</label>
                <input
                  type="number"
                  value={daysOverdue}
                  onChange={(e) => setDaysOverdue(Number(e.target.value))}
                  disabled={isCalling}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-gray-400 block mb-1">Overdue Amount (₹)</label>
              <input
                type="number"
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                disabled={isCalling}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>

          {/* Compliance Checklist */}
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-2 pt-3">
            <span className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-wider block">
              Responsible Collections Policy (RBI FPC-Inspired):
            </span>
            <div className="space-y-1 text-[11px] text-gray-300 font-mono">
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                <span>Contact window: 8 AM–7 PM IST only</span>
              </div>
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                <span>Zero coercive or threatening language</span>
              </div>
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                <span>Automated AI Assistant disclosure required</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Live Telephony Waveform & Bilingual Transcript ──── */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
                <span className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                  Offline Dialogue Simulation & Intent Extraction (LLM / Script)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {currentSpeaker && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                    currentSpeaker === 'agent' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {currentSpeaker === 'agent' ? 'Agent Speaking' : 'Debtor Speaking'}
                  </span>
                )}
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isCalling ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' : 'bg-white/5 text-gray-400 border-white/10'
                }`}>
                  {isCalling ? 'STREAMING ACTIVE' : 'CALL STANDBY'}
                </span>
              </div>
            </div>

            {/* Audio Visualizer Waves */}
            <div className="h-14 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center space-x-1 px-3 overflow-hidden">
              {Array.from({ length: 42 }).map((_, i) => {
                const waveHeight = isSpeaking
                  ? Math.max(6, (Math.sin(i * 0.45 + activeStep * 2 + Date.now() * 0.002) + 1.2) * 20)
                  : isCalling
                  ? Math.max(4, (Math.sin(i * 0.3 + activeStep) + 1) * 8)
                  : 4;

                return (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isSpeaking
                        ? currentSpeaker === 'agent'
                          ? 'bg-gradient-to-t from-purple-500 via-[#2B7FFF] to-emerald-400'
                          : 'bg-gradient-to-t from-blue-500 via-indigo-400 to-teal-300'
                        : isCalling
                        ? 'bg-purple-600/40'
                        : 'bg-white/10'
                    }`}
                    style={{ height: `${waveHeight}px` }}
                  />
                );
              })}
            </div>

            {/* ── Sub-800ms Architectural Reference Target SLA Budget ─────────────────── */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-[11px] space-y-1.5">
              <div className="flex items-center justify-between text-gray-400">
                <span className="flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-bold text-white uppercase text-[10px]">Architectural Reference Target SLA (Unintegrated Stack):</span>
                </span>
                <span className="text-emerald-400 font-bold">571.2ms / 800ms Target Budget (Theoretical)</span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 text-[9px] text-center">
                <div className="p-1 rounded bg-white/[0.03] border border-white/5">
                  <span className="text-gray-500 block">VAD (Silero)</span>
                  <span className="text-cyan-300 font-bold">65ms*</span>
                </div>
                <div className="p-1 rounded bg-white/[0.03] border border-white/5">
                  <span className="text-gray-500 block">STT (Deepgram)</span>
                  <span className="text-cyan-300 font-bold">120ms*</span>
                </div>
                <div className="p-1 rounded bg-white/[0.03] border border-white/5">
                  <span className="text-gray-500 block">LOCAL CONTEXT</span>
                  <span className="text-emerald-300 font-bold">4.2ms</span>
                </div>
                <div className="p-1 rounded bg-white/[0.03] border border-white/5">
                  <span className="text-gray-500 block">LLM TTFT (vLLM)</span>
                  <span className="text-purple-300 font-bold">210ms*</span>
                </div>
                <div className="p-1 rounded bg-white/[0.03] border border-white/5">
                  <span className="text-gray-500 block">TTS (Cartesia)</span>
                  <span className="text-pink-300 font-bold">130ms*</span>
                </div>
              </div>
              <p className="text-[9px] text-gray-500 italic pt-0.5">
                *Target SLA budget for unintegrated 3rd-party streaming components, not live measured telemetry. Context is locally measured.
              </p>
            </div>

            {/* Conversation Messages with Intent Metadata */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {!callData ? (
                <div className="py-12 text-center text-gray-500 font-mono text-xs space-y-2">
                  <Mic className="w-6 h-6 mx-auto text-gray-600" />
                  <p>Select a persona strategy and click "Run Dialogue Simulator" to view simulated Hinglish debt recovery.</p>
                </div>
              ) : (
                callData.conversation?.flow?.slice(0, activeStep).map((msg) => (
                  <div
                    key={msg.step}
                    className={`p-3.5 rounded-2xl text-xs space-y-1.5 transition-all duration-300 ${
                      msg.speaker === 'agent'
                        ? 'bg-purple-600/15 border border-purple-500/20 ml-0 mr-10 shadow-lg shadow-purple-600/5'
                        : 'bg-white/[0.04] border border-white/10 ml-10 mr-0'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={msg.speaker === 'agent' ? 'text-purple-300 font-bold uppercase' : 'text-blue-300 font-bold uppercase'}>
                        {msg.speaker === 'agent' ? '🤖 AI Voice Agent (Simulated Dialogue)' : `👤 ${debtorName}`}
                      </span>

                      {/* Structured Intent Tag */}
                      {msg.intent && (
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] border ${
                          msg.intent === 'PROMISE_TO_PAY'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : msg.intent === 'HARDSHIP_DEFERRAL'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : msg.intent === 'ESCALATE_TO_HUMAN'
                            ? 'bg-red-500/20 text-red-300 border-red-500/30'
                            : 'bg-white/5 text-gray-400 border-white/10'
                        }`}>
                          {msg.intent}
                        </span>
                      )}
                    </div>

                    <div className="font-medium text-white text-[13px] leading-relaxed">
                      "{msg.text}"
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Promise-to-Pay / Dispute Status Card ─────────────────────────── */}
          {callData?.conversation?.promise_to_pay && activeStep >= (selectedPersona === 'dispute_pending' ? 4 : 5) && (
            <div className={`p-4 rounded-2xl border flex items-center justify-between animate-in zoom-in-95 duration-300 mt-2 ${
              selectedPersona === 'dispute_pending'
                ? 'bg-red-950/20 border-red-500/30'
                : 'bg-emerald-950/20 border-emerald-500/30'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  selectedPersona === 'dispute_pending'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {selectedPersona === 'dispute_pending' ? <AlertCircle className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                </div>
                <div>
                  <span className={`text-[10px] font-mono uppercase font-bold ${
                    selectedPersona === 'dispute_pending' ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {selectedPersona === 'dispute_pending' ? 'Dispute Docket Logged · Outreach Paused' : 'Promise-to-Pay Logged & Verified'}
                  </span>
                  <div className="text-xs font-semibold text-white">
                    {selectedPersona === 'dispute_pending'
                      ? `DISP-${invoiceNumber} assigned to Senior Billing Manager`
                      : `₹${callData.conversation.promise_to_pay.amount.toLocaleString()} scheduled for ${callData.conversation.promise_to_pay.date}`}
                  </div>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${
                selectedPersona === 'dispute_pending'
                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {selectedPersona === 'dispute_pending' ? 'HOLD ACTIVE' : 'AUDIT SIGNED'}
              </span>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
