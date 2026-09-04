import React, { useState } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  PhoneCall,
  RefreshCw,
  Layers,
  Terminal,
  FlaskConical,
  ChevronDown,
  ExternalLink,
  Cpu,
  Zap,
} from 'lucide-react';

export type ViewMode = 'showcase' | 'console';
export type ConsoleTab = 'overview' | 'cases' | 'voice' | 'compliance' | 'abtest' | 'webhook' | 'architecture' | 'chaos';

interface NavbarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  consoleTab: ConsoleTab;
  setConsoleTab: (tab: ConsoleTab) => void;
  onRefreshBatch: () => void;
  isProcessing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  setViewMode,
  consoleTab,
  setConsoleTab,
  onRefreshBatch,
  isProcessing,
}) => {
  const [showStackMenu, setShowStackMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#030712]/90 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Header Bar */}
        <div className="h-16 flex items-center justify-between">
          
          {/* Left: Brand & Agentic Stack Dropdown */}
          <div className="flex items-center space-x-4">
            {/* Logo Brand */}
            <div
              className="flex items-center space-x-2.5 cursor-pointer select-none"
              onClick={() => setViewMode('showcase')}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0052cc] via-[#2b82fb] to-[#1d4ed8] flex items-center justify-center shadow-lg shadow-blue-500/25">
                <span className="font-bold text-white tracking-tighter text-lg italic">R</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base text-white tracking-tight">Razorpay</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-[#2b82fb] border border-blue-500/30 flex items-center space-x-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Agent Studio</span>
                </span>
              </div>
            </div>

            {/* Agentic Stacks Dropdown */}
            <div className="relative hidden xl:block">
              <button
                onClick={() => setShowStackMenu(!showStackMenu)}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] hover:bg-white/[0.08] text-[11px] font-mono text-gray-400 hover:text-white border border-white/5 transition-all cursor-pointer"
              >
                <span>Agentic Stack</span>
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </button>

              {showStackMenu && (
                <div
                  className="absolute left-0 mt-2 w-64 rounded-xl glass-panel border border-white/10 p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  onMouseLeave={() => setShowStackMenu(false)}
                >
                  <div className="px-2.5 py-1 text-[10px] font-mono text-gray-500 uppercase">
                    Razorpay AI Agent Ecosystem
                  </div>
                  <a
                    href="https://razorpay.com/agentic-payments/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-white/[0.06] text-xs text-gray-300 hover:text-white group"
                  >
                    <span>Agentic Payments</span>
                    <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-white" />
                  </a>
                  <a
                    href="https://razorpay.com/agent-studio/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-white/[0.06] text-xs text-gray-300 hover:text-white group"
                  >
                    <span>Agent Studio</span>
                    <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-white" />
                  </a>
                  <a
                    href="https://razorpay.com/agentic-business-banking/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-white/[0.06] text-xs text-gray-300 hover:text-white group"
                  >
                    <span>RazorpayX Agentic Banking</span>
                    <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-white" />
                  </a>
                  <div className="px-2.5 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 font-medium flex items-center justify-between mt-1">
                    <span>Revenue Recovery Brain</span>
                    <span className="text-[10px] font-mono text-blue-400">ACTIVE TRACK</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Center: The Dual-Mode Switcher */}
          <div className="flex items-center p-1 rounded-full bg-white/[0.04] border border-white/10 shadow-inner">
            <button
              onClick={() => setViewMode('showcase')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'showcase'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Product Showcase</span>
            </button>

            <button
              onClick={() => setViewMode('console')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'console'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Operations Console</span>
            </button>
          </div>

          {/* Right: Quick Action & Status */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono text-emerald-400 font-medium tracking-wide">
                ENGINE ONLINE
              </span>
            </div>

            {viewMode === 'showcase' ? (
              <button
                onClick={() => setViewMode('console')}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-lg shadow-blue-600/25 transition-all active:scale-95 cursor-pointer"
              >
                <span>Launch Console</span>
              </button>
            ) : (
              <button
                onClick={onRefreshBatch}
                disabled={isProcessing}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-medium border border-white/10 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>{isProcessing ? 'Diagnosing...' : 'Regenerate'}</span>
              </button>
            )}
          </div>

        </div>

        {/* Sub-Navigation Bar when in Console Mode */}
        {viewMode === 'console' && (
          <div className="py-2.5 border-t border-white/5 flex items-center justify-between overflow-x-auto">
            <nav className="flex items-center space-x-1">
              <button
                onClick={() => setConsoleTab('overview')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center space-x-1.5 ${
                  consoleTab === 'overview'
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-3 h-3" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setConsoleTab('cases')}
                className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center space-x-1.5 transition-all cursor-pointer ${
                  consoleTab === 'cases'
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Case Ledger</span>
              </button>
              <button
                onClick={() => setConsoleTab('voice')}
                className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
                  consoleTab === 'voice'
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <PhoneCall className="w-3 h-3" />
                <span>Hinglish Voice Studio</span>
              </button>
              <button
                onClick={() => setConsoleTab('compliance')}
                className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
                  consoleTab === 'compliance'
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>RBI Compliance</span>
              </button>
              <button
                onClick={() => setConsoleTab('abtest')}
                className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
                  consoleTab === 'abtest'
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FlaskConical className="w-3 h-3" />
                <span>A/B Methodology</span>
              </button>
              <button
                onClick={() => setConsoleTab('webhook')}
                className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
                  consoleTab === 'webhook'
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3 h-3" />
                <span>Webhook Sandbox</span>
              </button>
              <button
                onClick={() => setConsoleTab('architecture')}
                className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
                  consoleTab === 'architecture'
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Cpu className="w-3 h-3" />
                <span>Decision Engine</span>
              </button>
              <button
                onClick={() => setConsoleTab('chaos')}
                className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
                  consoleTab === 'chaos'
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 font-semibold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Adversarial Chaos</span>
              </button>
            </nav>

            <button
              onClick={() => setViewMode('showcase')}
              className="text-[11px] font-mono text-gray-500 hover:text-gray-300 flex items-center space-x-1 cursor-pointer pl-4"
            >
              <span>View Product Story</span>
              <Sparkles className="w-3 h-3 text-blue-400" />
            </button>
          </div>
        )}

      </div>
    </header>
  );
};
