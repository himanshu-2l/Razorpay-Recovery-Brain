import React from 'react';
import { ShieldCheck, PhoneCall, RefreshCw, Layers, Terminal, Sparkles, Webhook } from 'lucide-react';

interface NavbarProps {
  activeTab: 'overview' | 'cases' | 'voice' | 'compliance' | 'sandbox' | 'webhook';
  setActiveTab: (tab: 'overview' | 'cases' | 'voice' | 'compliance' | 'sandbox' | 'webhook') => void;
  onRefreshBatch: () => void;
  isProcessing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onRefreshBatch,
  isProcessing,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050507]/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Studio Tag */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
          <div className="flex items-center space-x-2">
            {/* Razorpay stylized glyph */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2B7FFF] to-[#1865F2] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="font-bold text-white tracking-tighter text-lg italic">R</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base text-white tracking-tight">Razorpay</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-[#2B7FFF] border border-blue-500/20 flex items-center space-x-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Agent Studio</span>
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">
                Revenue Recovery Brain
              </span>
            </div>
          </div>
        </div>

        {/* Center Nav Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-white/[0.04] p-1 rounded-full border border-white/5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-black shadow-md shadow-white/10'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Command Center
          </button>
          <button
            onClick={() => setActiveTab('cases')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'cases'
                ? 'bg-white text-black shadow-md shadow-white/10'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>50+ Cases</span>
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'sandbox'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-gray-400 hover:text-blue-300'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Webhook Sandbox</span>
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'voice'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-gray-400 hover:text-purple-300'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Hinglish Voice Agent</span>
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'compliance'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'text-gray-400 hover:text-emerald-400'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>RBI Compliance</span>
          </button>
          <button
            onClick={() => setActiveTab('webhook')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'webhook'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-gray-400 hover:text-blue-300'
            }`}
          >
            <Webhook className="w-3.5 h-3.5" />
            <span>Webhook Sandbox</span>
          </button>
        </nav>

        {/* Right CTA / Live Engine Status */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-mono text-emerald-400 font-medium tracking-wide">
              API TEST MODE
            </span>
          </div>

          <button
            onClick={onRefreshBatch}
            disabled={isProcessing}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-lg shadow-blue-600/25 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'Diagnosing...' : 'Regenerate Batch'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
