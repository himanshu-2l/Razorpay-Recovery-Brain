import React, { useState } from 'react';
import { PhoneCall, PhoneOff, Mic, Volume2, CheckCircle2, Calendar, Sparkles } from 'lucide-react';
import type { VoiceCallDemoResponse } from '../types';

export const VoiceStudio: React.FC = () => {
  const [isCalling, setIsCalling] = useState(false);
  const [callData, setCallData] = useState<VoiceCallDemoResponse | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  const [debtorName, setDebtorName] = useState('Rajesh Sharma');
  const [invoiceAmount, setInvoiceAmount] = useState(85000);
  const [invoiceNumber, setInvoiceNumber] = useState('INV-20268421');

  const triggerCall = async () => {
    setIsCalling(true);
    setActiveStep(0);

    try {
      const response = await fetch('http://localhost:8000/api/demo/voice-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumber,
          debtor_name: debtorName,
          amount: invoiceAmount,
          invoice_number: invoiceNumber,
          days_overdue: 67,
        }),
      });
      const data = await response.json();
      setCallData(data);

      // Animate the conversation steps
      if (data.conversation?.flow) {
        data.conversation.flow.forEach((_item: unknown, idx: number) => {
          setTimeout(() => {
            setActiveStep(idx + 1);
          }, (idx + 1) * 900);
        });
      }
    } catch (err) {
      console.error('Error triggering voice call:', err);
    } finally {
      setTimeout(() => {
        setIsCalling(false);
      }, 7000);
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
          </div>

          <button
            onClick={triggerCall}
            disabled={isCalling}
            className={`px-6 py-3 rounded-full font-semibold text-sm flex items-center space-x-2 transition-all shadow-xl active:scale-95 ${
              isCalling
                ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-600/30'
            }`}
          >
            {isCalling ? (
              <>
                <PhoneOff className="w-4 h-4" />
                <span>Call Active in Hinglish...</span>
              </>
            ) : (
              <>
                <PhoneCall className="w-4 h-4" />
                <span>Simulate Real-Time Voice Call</span>
              </>
            )}
          </button>
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
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-gray-400 block mb-1">Phone Number (E.164)</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-gray-400 block mb-1">Invoice Number</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-gray-400 block mb-1">Overdue Amount (₹)</label>
              <input
                type="number"
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono"
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
                <Volume2 className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                  Live Conversational Feed & Audio Spectrum
                </span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                isCalling ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' : 'bg-white/5 text-gray-400 border-white/10'
              }`}>
                {isCalling ? 'STREAMING ACTIVE' : 'CALL STANDBY'}
              </span>
            </div>

            {/* Audio Visualizer Waves */}
            <div className="h-16 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center space-x-1.5 px-4">
              {Array.from({ length: 36 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isCalling
                      ? 'bg-gradient-to-t from-purple-500 via-[#2B7FFF] to-emerald-400'
                      : 'bg-white/10 h-2'
                  }`}
                  style={{
                    height: isCalling ? `${Math.max(6, (Math.sin(i * 0.4 + activeStep) + 1) * 22)}px` : '4px',
                  }}
                />
              ))}
            </div>

            {/* Conversation Messages */}
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {!callData ? (
                <div className="py-12 text-center text-gray-500 font-mono text-xs space-y-2">
                  <Mic className="w-6 h-6 mx-auto text-gray-600" />
                  <p>Click "Simulate Real-Time Voice Call" to hear the Hinglish debt negotiation agent in action.</p>
                </div>
              ) : (
                callData.conversation?.flow?.slice(0, activeStep).map((msg) => (
                  <div
                    key={msg.step}
                    className={`p-3.5 rounded-2xl text-xs space-y-1.5 animate-in fade-in duration-300 ${
                      msg.speaker === 'agent'
                        ? 'bg-purple-600/15 border border-purple-500/20 ml-0 mr-12'
                        : 'bg-white/[0.04] border border-white/10 ml-12 mr-0'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={msg.speaker === 'agent' ? 'text-purple-300 font-bold uppercase' : 'text-blue-300 font-bold uppercase'}>
                        {msg.speaker === 'agent' ? '🤖 Razorpay AI Voice Agent' : `👤 ${debtorName}`}
                      </span>
                      <span className="text-gray-500">Step {msg.step}</span>
                    </div>
                    {/* Primary Hinglish Speech */}
                    <div className="font-medium text-white text-[13px]">
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
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between animate-in zoom-in-95 duration-300">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                    Promise-to-Pay Logged
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
