import React from 'react';
import {
  Sparkles,
  LayoutDashboard,
  RefreshCw,
  Layers,
  PhoneCall,
  ShieldCheck,
  Terminal,
  FlaskConical,
  Cpu,
  Zap,
  Activity,
  ArrowRight,
} from 'lucide-react';

export type ViewMode = 'showcase' | 'console';
export type ConsoleTab = 'overview' | 'recovery_flow' | 'cases' | 'voice' | 'compliance' | 'abtest' | 'webhook' | 'architecture' | 'chaos';

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
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgba(255,255,255,0.08)] bg-[#17202e]/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Header Bar (64px height) */}
        <div className="h-16 flex items-center justify-between">
          
          {/* Left: Brand */}
          <div className="flex items-center space-x-3">
            <div
              className="flex items-center space-x-2.5 cursor-pointer select-none group"
              onClick={() => setViewMode('showcase')}
            >
              {/* Cyan Signal Mark */}
              <div className="w-8 h-8 rounded-full bg-[#202a3e] border border-[#305EFF] flex items-center justify-center text-[#305EFF] shadow-[0_0_12px_rgba(106,228,255,0.25)]">
                <Zap className="w-4 h-4 fill-[#305EFF]" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-heading font-bold text-lg tracking-tight text-[#ffffff]">
                  Revenue Recovery <span className="text-[#305EFF]">Brain</span>
                </span>
                <span className="idle-badge text-[10px] hidden sm:inline-flex">
                  Track 03
                </span>
              </div>
            </div>
          </div>

          {/* Center: Ecosystem Tab Filter Bar (Pills 80px radius) */}
          <div className="flex items-center p-1 rounded-full bg-[#202a3e] border border-[rgba(255,255,255,0.08)]">
            <button
              onClick={() => setViewMode('showcase')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-heading transition-all cursor-pointer ${
                viewMode === 'showcase'
                  ? 'bg-[#ffffff] text-[#000000] font-semibold'
                  : 'text-[#cdd0d6] hover:text-[#ffffff]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Platform Reveal</span>
            </button>

            <button
              onClick={() => setViewMode('console')}
              className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-heading transition-all cursor-pointer ${
                viewMode === 'console'
                  ? 'bg-[#ffffff] text-[#000000] font-semibold'
                  : 'text-[#cdd0d6] hover:text-[#ffffff]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Operations Console</span>
            </button>
          </div>

          {/* Right: Actions & Chain Status Pill */}
          <div className="flex items-center space-x-3">
            {/* Status Pill Badge */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-[#202a3e] border border-[#305EFF]/40 text-xs font-mono text-[#305EFF]">
              <span className="w-2 h-2 rounded-full bg-[#305EFF] animate-ping" />
              <span>ACTIVE RAILS</span>
            </div>

            {/* Console Regenerate Button */}
            {viewMode === 'console' ? (
              <button
                onClick={onRefreshBatch}
                disabled={isProcessing}
                className="idle-btn-ghost text-xs px-3.5 py-1.5 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>{isProcessing ? 'Simulating...' : 'Regenerate'}</span>
              </button>
            ) : (
              <button
                onClick={() => setViewMode('console')}
                className="idle-btn-primary text-xs px-4 py-1.5 flex items-center space-x-1.5"
              >
                <span>Launch Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* Sub-Navigation Bar when in Console Mode */}
        {viewMode === 'console' && (
          <div className="py-2.5 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between overflow-x-auto">
            <nav className="flex items-center space-x-1">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'recovery_flow', label: 'Recovery Flow (3D)', icon: Activity },
                { id: 'cases', label: 'Case Ledger', icon: Layers },
                { id: 'voice', label: 'Hinglish Voice', icon: PhoneCall },
                { id: 'compliance', label: 'RBI Compliance', icon: ShieldCheck },
                { id: 'abtest', label: 'A/B Methodology', icon: FlaskConical },
                { id: 'webhook', label: 'Webhook Sandbox', icon: Terminal },
                { id: 'architecture', label: 'Decision Engine', icon: Cpu },
                { id: 'chaos', label: 'Adversarial Chaos', icon: Zap },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = consoleTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setConsoleTab(tab.id as ConsoleTab)}
                    className={`px-3 py-1.5 text-xs font-mono rounded-full transition-all cursor-pointer flex items-center space-x-1.5 ${
                      isActive
                        ? 'bg-[#305EFF]/15 text-[#305EFF] border border-[#305EFF]/40 font-semibold'
                        : 'text-[#cdd0d6] hover:text-[#ffffff] hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <button
              onClick={() => setViewMode('showcase')}
              className="text-xs font-mono flex items-center space-x-1 text-[#305EFF] hover:underline cursor-pointer pl-4 whitespace-nowrap"
            >
              <span>Back to Showcase</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </header>
  );
};

export default Navbar;
