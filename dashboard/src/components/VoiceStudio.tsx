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
  Radio
} from 'lucide-react';
import type { VoiceCallDemoResponse } from '../types';

export const VoiceStudio: React.FC = () => {
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [callData, setCallData] = useState<VoiceCallDemoResponse | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [phoneNumber, setPhoneNumber] = useState<string>('+91 98765 43210');
  const [debtorName, setDebtorName] = useState<string>('Rajesh Sharma');
  const [invoiceAmount, setInvoiceAmount] = useState<number>(85000);
  const [invoiceNumber, setInvoiceNumber] = useState<string>('INV-20268421');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<'agent' | 'debtor' | null>(null);
  const [gpuMode, setGpuMode] = useState<boolean>(false); // LLM-generated dialogue
  const [gpuStatus, setGpuStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Ping GPU server health on mount
    const checkGpu = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/llm/health', { method: 'GET' });
        const data = await res.json();
        setGpuStatus(data.status === 'online' ? 'online' : 'offline');
      } catch {
        setGpuStatus('offline');
      }
    };
    checkGpu();
    const gpuInterval = setInterval(checkGpu, 30000); // re-check every 30s

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      timeoutsRef.current.forEach(clearTimeout);
      clearInterval(gpuInterval);
    };
  }, []);

  const speakText = (text: string, speaker: 'agent' | 'debtor') => {
    if (!audioEnabled || !synthRef.current) return;

    try {
      synthRef.current.cancel(); // cancel any previous utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Select voice if available
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
    if (synthRef.current) {
      synthRef.current.cancel();
    }
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
      // Route to LLM-generated dialogue if GPU mode is active
      const endpoint = gpuMode && gpuStatus === 'online'
        ? 'http://localhost:8000/api/llm/voice-call-dynamic'
        : 'http://localhost:8000/api/demo/voice-call';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumber,
          debtor_name: debtorName,
          debtor_company: 'Client Enterprises',
          amount: invoiceAmount,
          invoice_number: invoiceNumber,
          days_overdue: 67,
        }),
      });
      const data = await response.json();

      // Normalize: LLM endpoint and scripted endpoint have same .conversation.flow shape
      const normalizedData = data.mode === 'scripted'
        ? null // GPU was offline, re-call scripted
        : data;

      const finalData = normalizedData ?? await (await fetch('http://localhost:8000/api/demo/voice-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumber,
          debtor_name: debtorName,
          amount: invoiceAmount,
          invoice_number: invoiceNumber,
          days_overdue: 67,
        }),
      })).json();

      setCallData(finalData);

      if (finalData.conversation?.flow) {
        const flow = finalData.conversation.flow;
        let cumulativeDelay = 300;

        flow.forEach((item: { step: number; speaker: 'agent' | 'debtor'; text: string }, idx: number) => {
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

  return (
    <div className="space-y-6">
      
      {/* Studio Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 relative overflow-hidden glow-blue">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE WINNING DIFFERENTIATOR · LIVE HINGLISH VOICE CHANNEL</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight font-display">
              B2B Receivables Voice Recovery Studio
            </h2>
            <p className="text-xs text-gray-400 max-w-2xl">
              Indian SME payment delays average 73 days against 30-day terms. Our conversational AI agent initiates bounded, empathetic calls in natural Hinglish, negotiates a realistic date, and logs a verified Promise-to-Pay directly to the ledger.
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
            {/* LLM Mode Toggle */}
            <button
              onClick={() => setGpuMode(!gpuMode)}
              disabled={gpuStatus !== 'online' || isCalling}
              title={gpuStatus !== 'online' ? 'GPU server offline — start Ollama to enable' : gpuMode ? 'Switch to scripted mode' : 'Switch to LLM-generated mode'}
              className={`px-3 py-1.5 rounded-full text-[10px] font-mono font-semibold border transition-all ${
                gpuMode && gpuStatus === 'online'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : gpuStatus !== 'online'
                  ? 'bg-white/[0.02] border-white/5 text-gray-600 cursor-not-allowed'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              {gpuMode && gpuStatus === 'online' ? '🧠 Llama-3-8B LIVE' : '📄 Scripted Mode'}
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
                  <span>End Live Simulation</span>
                </>
              ) : (
                <>
                  <PhoneCall className="w-4 h-4" />
                  <span>Simulate Real-Time Voice Call</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Ambient Purple Glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[250px] bg-purple-600/10 blur-[90px] pointer-events-none -z-0" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Call Controls & Dial Configuration */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-purple-400">
            Target Debtor Parameters
          </span>

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
              RBI Fair Practices Hard Guards:
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
                <span>Max 2 voice calls / week per debtor</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Telephony Waveform & Bilingual Transcript */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
                <span className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                  Live Conversational Feed & Voice Synthesis
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

            {/* Audio Visualizer Waves with Dynamic Speech Animation */}
            <div className="h-16 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center space-x-1 px-3 overflow-hidden">
              {Array.from({ length: 42 }).map((_, i) => {
                const waveHeight = isSpeaking
                  ? Math.max(6, (Math.sin(i * 0.45 + activeStep * 2 + Date.now() * 0.002) + 1.2) * 22)
                  : isCalling
                  ? Math.max(4, (Math.sin(i * 0.3 + activeStep) + 1) * 10)
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
                    style={{
                      height: `${waveHeight}px`,
                    }}
                  />
                );
              })}
            </div>

            {/* Conversation Messages */}
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {!callData ? (
                <div className="py-14 text-center text-gray-500 font-mono text-xs space-y-2">
                  <Mic className="w-6 h-6 mx-auto text-gray-600" />
                  <p>Click "Simulate Real-Time Voice Call" to hear the Hinglish debt negotiation agent in action with audio speech synthesis.</p>
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
                      <span className={msg.speaker === 'agent' ? 'text-purple-300 font-bold uppercase flex items-center space-x-1' : 'text-blue-300 font-bold uppercase flex items-center space-x-1'}>
                        <span>{msg.speaker === 'agent' ? '🤖 Razorpay AI Voice Agent' : `👤 ${debtorName}`}</span>
                      </span>
                      <span className="text-gray-400">Step {msg.step}</span>
                    </div>
                    {/* Primary Hinglish Speech */}
                    <div className="font-medium text-white text-[13px] leading-relaxed">
                      "{msg.text}"
                    </div>
                    {/* Secondary English Translation */}
                    <div className="text-[11px] text-gray-400 italic font-mono">
                      Translation: {msg.translation}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Promise-to-Pay Logged Card */}
          {callData?.conversation?.promise_to_pay && activeStep >= 6 && (
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between animate-in zoom-in-95 duration-300 mt-2">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                    Promise-to-Pay Logged & Verified
                  </span>
                  <div className="text-xs font-semibold text-white">
                    ₹{callData.conversation.promise_to_pay.amount.toLocaleString()} scheduled for {callData.conversation.promise_to_pay.date}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                AUDIT SIGNED
              </span>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
