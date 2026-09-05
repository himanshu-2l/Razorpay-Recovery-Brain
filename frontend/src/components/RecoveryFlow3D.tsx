import React, { useState, useMemo, useRef } from 'react';
import {
  Sparkles,
  Activity,
  PhoneCall,
  CheckCircle2,
  RotateCw,
  Zap,
  Info,
  Clock,
  ArrowRight,
} from 'lucide-react';
import type { BatchSummary, CaseItem } from '../types';

interface RecoveryFlow3DProps {
  summary?: BatchSummary | null;
  cases?: CaseItem[];
  onSelectCase?: (c: CaseItem) => void;
}

type VizView = 'all' | 'network' | 'waterfall' | 'pyramid' | 'heatmap';

export const RecoveryFlow3D: React.FC<RecoveryFlow3DProps> = ({
  summary,
  cases = [],
  onSelectCase,
}) => {
  const [activeViz, setActiveViz] = useState<VizView>('all');
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [selectedAgent, setSelectedAgent] = useState<string>('vasool');
  const [selectedTier, setSelectedTier] = useState<number>(0);
  const [hoveredCell, setHoveredCell] = useState<{
    day: number;
    hour: number;
    sentiment: number;
    calls: number;
    outcome: string;
    amount: number;
    duration: string;
  } | null>(null);

  // Mouse tilt tracking for 3D perspective
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!is3DMode || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const handleInspectCase = () => {
    if (!onSelectCase || cases.length === 0) return;
    const agentLeakType =
      selectedAgent === 'prevent'
        ? 'payment_failure'
        : selectedAgent === 'rescue'
        ? 'checkout_abandonment'
        : selectedAgent === 'renew'
        ? 'subscription_failure'
        : 'b2b_receivable';
    const targetCase = cases.find((c) => c.leak_type === agentLeakType) || cases[0];
    if (targetCase) onSelectCase(targetCase);
  };

  // 1. Agent Activity Data derived from cases & summary
  const agentStats = useMemo(() => {
    const defaultStats = {
      prevent: {
        name: 'PREVENT',
        title: 'Payment Failure Defense',
        recovered: 1420000,
        casesCount: 42,
        successRate: 91.2,
        color: '#06b6d4',
        border: 'border-cyan-500/40',
        bg: 'bg-cyan-500/10',
        textColor: 'text-cyan-400',
        focus: 'Smart Retries & Routing',
        latency: '8ms',
      },
      rescue: {
        name: 'RESCUE',
        title: 'Cart Abandonment Rescue',
        recovered: 890000,
        casesCount: 28,
        successRate: 84.5,
        color: '#a855f7',
        border: 'border-purple-500/40',
        bg: 'bg-purple-500/10',
        textColor: 'text-purple-400',
        focus: 'UPI Links & WhatsApp',
        latency: '45s',
      },
      renew: {
        name: 'RENEW',
        title: 'Subscription Churn Recovery',
        recovered: 680000,
        casesCount: 19,
        successRate: 88.0,
        color: '#10b981',
        border: 'border-emerald-500/40',
        bg: 'bg-emerald-500/10',
        textColor: 'text-emerald-400',
        focus: 'Mandate Auto-Debit Fixes',
        latency: '1.2h',
      },
      vasool: {
        name: 'VASOOL',
        title: 'B2B Debt & 43B(h) Voice AI',
        recovered: 2140000,
        casesCount: 35,
        successRate: 79.4,
        color: '#f59e0b',
        border: 'border-amber-500/40',
        bg: 'bg-amber-500/10',
        textColor: 'text-amber-400',
        focus: 'Hinglish Telephony & PTP',
        latency: '4.2d',
      },
    };

    if (!cases.length) return defaultStats;

    // Aggregate from actual cases if available
    let preventRec = 0, rescueRec = 0, renewRec = 0, vasoolRec = 0;
    let preventCount = 0, rescueCount = 0, renewCount = 0, vasoolCount = 0;

    cases.forEach((c) => {
      const rec = c.amount_recovered || 0;
      if (c.leak_type === 'payment_failure') {
        preventRec += rec;
        preventCount++;
      } else if (c.leak_type === 'checkout_abandonment') {
        rescueRec += rec;
        rescueCount++;
      } else if (c.leak_type === 'subscription_failure') {
        renewRec += rec;
        renewCount++;
      } else if (c.leak_type === 'b2b_receivable') {
        vasoolRec += rec;
        vasoolCount++;
      }
    });

    return {
      prevent: {
        ...defaultStats.prevent,
        recovered: preventRec || defaultStats.prevent.recovered,
        casesCount: preventCount || defaultStats.prevent.casesCount,
      },
      rescue: {
        ...defaultStats.rescue,
        recovered: rescueRec || defaultStats.rescue.recovered,
        casesCount: rescueCount || defaultStats.rescue.casesCount,
      },
      renew: {
        ...defaultStats.renew,
        recovered: renewRec || defaultStats.renew.recovered,
        casesCount: renewCount || defaultStats.renew.casesCount,
      },
      vasool: {
        ...defaultStats.vasool,
        recovered: vasoolRec || defaultStats.vasool.recovered,
        casesCount: vasoolCount || defaultStats.vasool.casesCount,
      },
    };
  }, [cases]);

  // 2. Waterfall Financial Breakdown
  const waterfallData = useMemo(() => {
    const totalAtRisk = summary?.total_at_risk || 9579541;
    const directRecovered = summary?.total_recovered || 2537230;
    const unrecoverable = Math.round(totalAtRisk * 0.192); // ~19.2% fraudulent/unreachable
    const inProgress = Math.round(totalAtRisk * 0.335); // ~33.5% active negotiations
    const proactivelyPrevented = Math.round(totalAtRisk * 0.174); // ~17.4% prevented via pre-dunning
    const netProtectedRevenue = directRecovered + proactivelyPrevented;

    return [
      {
        id: 'at_risk',
        label: 'Gross At Risk',
        amount: totalAtRisk,
        type: 'initial',
        color: 'from-rose-600 to-red-500',
        barColor: '#ef4444',
        border: 'border-rose-500/40',
        desc: 'Unpaid invoices, failed checkouts & recurring churn',
        pct: 100,
      },
      {
        id: 'unrecoverable',
        label: 'Structural Unrecoverable',
        amount: -unrecoverable,
        type: 'subtract',
        color: 'from-gray-600 to-slate-500',
        barColor: '#6b7280',
        border: 'border-gray-500/40',
        desc: 'Invalid GSTIN, dissolved entities, hard fraud declines',
        pct: Math.round((unrecoverable / totalAtRisk) * 100),
      },
      {
        id: 'in_progress',
        label: 'Active In-Flight',
        amount: -inProgress,
        type: 'subtract',
        color: 'from-amber-600 to-yellow-500',
        barColor: '#f59e0b',
        border: 'border-amber-500/40',
        desc: 'Scheduled voice callbacks & active UPI payment links',
        pct: Math.round((inProgress / totalAtRisk) * 100),
      },
      {
        id: 'recovered',
        label: 'Direct Recovered',
        amount: directRecovered,
        type: 'add',
        color: 'from-emerald-600 to-teal-500',
        barColor: '#10b981',
        border: 'border-emerald-500/40',
        desc: 'Settled funds captured via Razorpay Payment Links',
        pct: Math.round((directRecovered / totalAtRisk) * 100),
      },
      {
        id: 'prevented',
        label: 'Proactively Prevented',
        amount: proactivelyPrevented,
        type: 'add',
        color: 'from-blue-600 to-cyan-500',
        barColor: '#3b82f6',
        border: 'border-blue-500/40',
        desc: 'Smart gateway reroutes & pre-dunning card updates',
        pct: Math.round((proactivelyPrevented / totalAtRisk) * 100),
      },
      {
        id: 'net_protected',
        label: 'Net Protected Capital',
        amount: netProtectedRevenue,
        type: 'total',
        color: 'from-emerald-500 via-teal-400 to-cyan-400',
        barColor: '#059669',
        border: 'border-emerald-400/50',
        desc: 'Total capital preserved by Razorpay Autonomous Agents',
        pct: Math.round((netProtectedRevenue / totalAtRisk) * 100),
      },
    ];
  }, [summary]);

  // 3. B2B Aging Pyramid Tiers
  const agingTiers = [
    {
      id: 0,
      bracket: '0 - 30 Days',
      status: 'Current & Active Terms',
      amount: 4250000,
      invoices: 64,
      probability: 94.2,
      dsoImpact: -12.4,
      color: '#10b981',
      glow: 'shadow-emerald-500/30',
      border: 'border-emerald-500/50',
      bg: 'bg-emerald-500/10',
      statutory: 'Within Credit Period',
      strategy: 'Soft WhatsApp nudge & Razorpay UPI 1-Click Link',
    },
    {
      id: 1,
      bracket: '31 - 60 Days',
      status: 'First Escalation & Dunning',
      amount: 2680000,
      invoices: 31,
      probability: 76.8,
      dsoImpact: -8.6,
      color: '#f59e0b',
      glow: 'shadow-amber-500/30',
      border: 'border-amber-500/50',
      bg: 'bg-amber-500/10',
      statutory: 'Approaching MSME 45-day threshold',
      strategy: '5% Early Settlement Rebate + Email Statement',
    },
    {
      id: 2,
      bracket: '61 - 90 Days',
      status: 'Critical Delinquency',
      amount: 1820000,
      invoices: 14,
      probability: 51.4,
      dsoImpact: -5.2,
      color: '#f97316',
      glow: 'shadow-orange-500/30',
      border: 'border-orange-500/50',
      bg: 'bg-orange-500/10',
      statutory: 'Section 43B(h) Clause Triggered',
      strategy: 'Vasool AI Conversational Hinglish Voice Call',
    },
    {
      id: 3,
      bracket: '90+ Days',
      status: 'Statutory Section 43B(h) Clock Breach',
      amount: 830000,
      invoices: 7,
      probability: 28.6,
      dsoImpact: -2.1,
      color: '#ef4444',
      glow: 'shadow-red-500/30',
      border: 'border-red-500/50',
      bg: 'bg-red-500/10',
      statutory: 'Immediate Tax Deduction Forfeiture Risk',
      strategy: 'Statutory Demand Notice + Dual Settlement Plan',
    },
  ];

  // 4. Voice Call Sentiment 7x24 Heatmap Generation
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const heatmapData = useMemo(() => {
    // Generate deterministic 7x24 grid with realistic call distributions
    const grid: Array<Array<{
      hour: number;
      isRbiAllowed: boolean;
      calls: number;
      sentiment: number; // -1 to 1
      outcome: string;
      amount: number;
      duration: string;
    }>> = [];

    for (let d = 0; d < 7; d++) {
      const row = [];
      for (let h = 0; h < 24; h++) {
        // RBI Permitted Window: 8 AM (8) to 7 PM (19) on business days, limited on weekends
        const isRbiAllowed = (h >= 8 && h < 19) && (d < 6);
        let calls = 0;
        let sentiment = 0;
        let outcome = 'No calls scheduled (Outside RBI window)';
        let amount = 0;
        let duration = '0s';

        if (isRbiAllowed) {
          // Peak call intensity around 10-12 AM and 3-5 PM
          const isPeak = (h >= 10 && h <= 12) || (h >= 15 && h <= 17);
          calls = isPeak ? Math.floor(12 + ((d * 7 + h * 3) % 18)) : Math.floor(3 + ((d * 3 + h) % 7));
          
          // Sentiment distribution: predominantly positive/neutral in morning, slightly lower late afternoon
          const pseudoRand = ((d * 31 + h * 17) % 100) / 100;
          if (pseudoRand > 0.35) {
            sentiment = 0.5 + pseudoRand * 0.45; // Positive PTP
            outcome = 'PTP Agreed (Promise-to-Pay via Razorpay Link)';
            amount = 145000 + ((d * h * 1234) % 350000);
            duration = `${Math.floor(2 + pseudoRand * 2)}m ${Math.floor(pseudoRand * 50)}s`;
          } else if (pseudoRand > 0.12) {
            sentiment = 0.05 + pseudoRand * 0.2; // Neutral/reschedule
            outcome = 'Callback Rescheduled / Dispute Raised';
            amount = 85000 + ((d * h * 987) % 200000);
            duration = `${Math.floor(1 + pseudoRand * 2)}m ${Math.floor(pseudoRand * 40)}s`;
          } else {
            sentiment = -0.4 - pseudoRand * 0.5; // Hostile/refused
            outcome = 'Payment Refused / Disconnected';
            amount = 45000 + ((d * h * 456) % 150000);
            duration = `${Math.floor(0.5 + pseudoRand)}m ${Math.floor(pseudoRand * 30)}s`;
          }
        }

        row.push({
          hour: h,
          isRbiAllowed,
          calls,
          sentiment,
          outcome,
          amount,
          duration,
        });
      }
      grid.push(row);
    }
    return grid;
  }, []);

  const formatLakhs = (val: number) => {
    const absVal = Math.abs(val);
    if (absVal >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (absVal >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="space-y-6"
    >
      {/* Visual Command Header */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-48 bg-gradient-to-bl from-blue-600/10 via-purple-600/10 to-transparent blur-2xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50" />
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                <span>3D Recovery Flow Intelligence Engine</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  2.5D PERSPECTIVE
                </span>
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl">
              Real-time multi-agent cashflow telemetry mapping autonomous triage, financial waterfall balance,
              Section 43B(h) aging risk pyramid, and Hinglish telephony sentiment.
            </p>
          </div>

          {/* Visualization Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 3D vs 2D Perspective Toggle */}
            <button
              onClick={() => setIs3DMode(!is3DMode)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                is3DMode
                  ? 'bg-blue-600/30 border-blue-500/50 text-blue-200 shadow-md shadow-blue-500/20'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${is3DMode ? 'text-blue-400' : ''}`} />
              <span>{is3DMode ? '3D Isometric Tilt: ON' : '2D Planar Mode'}</span>
            </button>

            {/* View Selector Pills */}
            <div className="flex items-center p-1 rounded-lg bg-black/40 border border-white/10 text-xs">
              <button
                onClick={() => setActiveViz('all')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  activeViz === 'all'
                    ? 'bg-white/15 text-white font-semibold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                All 4 Modules
              </button>
              <button
                onClick={() => setActiveViz('network')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  activeViz === 'network'
                    ? 'bg-white/15 text-cyan-300 font-semibold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Agent Network
              </button>
              <button
                onClick={() => setActiveViz('waterfall')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  activeViz === 'waterfall'
                    ? 'bg-white/15 text-emerald-300 font-semibold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Cashflow Waterfall
              </button>
              <button
                onClick={() => setActiveViz('pyramid')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  activeViz === 'pyramid'
                    ? 'bg-white/15 text-amber-300 font-semibold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                B2B Aging Pyramid
              </button>
              <button
                onClick={() => setActiveViz('heatmap')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  activeViz === 'heatmap'
                    ? 'bg-white/15 text-purple-300 font-semibold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Voice Heatmap
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. AGENT ACTIVITY GLOBE / NETWORK (2.5D Isometric Network)                */}
      {/* ========================================================================= */}
      {(activeViz === 'all' || activeViz === 'network') && (
        <div className="glass-panel rounded-2xl p-6 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Module 01 · Agent Activity Network & Real-Time Flow
                </h3>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                4 Specialized Autonomous Recovery Agents orbiting the Central ENRV Decision Engine.
              </p>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              <Zap className="w-3.5 h-3.5" />
              <span>Sub-10ms Cross-Agent Handoff</span>
            </div>
          </div>

          {/* 3D Perspective Stage */}
          <div
            className="w-full min-h-[440px] rounded-xl bg-gradient-to-b from-[#050b18] to-[#02050c] border border-white/5 relative flex items-center justify-center p-6 overflow-hidden select-none"
            style={{
              perspective: is3DMode ? '1000px' : 'none',
            }}
          >
            {/* Background Isometric Grid */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #0052cc 1px, transparent 1px), linear-gradient(to bottom, #0052cc 1px, transparent 1px)',
                backgroundSize: '36px 36px',
                transform: is3DMode
                  ? `rotateX(${45 + mousePos.y * 10}deg) scale(1.6) translateY(${mousePos.x * 20}px)`
                  : 'none',
                transformOrigin: 'center center',
              }}
            />

            {/* Central 3D Canvas Stage */}
            <div
              className="relative w-full max-w-2xl h-[380px] flex items-center justify-center transition-transform duration-300 ease-out"
              style={{
                transform: is3DMode
                  ? `rotateX(${15 - mousePos.y * 18}deg) rotateY(${mousePos.x * 22}deg) translateZ(10px)`
                  : 'none',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Dynamic SVG Directed Edges & Pulsing Particles */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                  <linearGradient id="edge-prevent" x1="50%" y1="50%" x2="50%" y2="15%">
                    <stop offset="0%" stopColor="#2b82fb" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="edge-rescue" x1="50%" y1="50%" x2="85%" y2="50%">
                    <stop offset="0%" stopColor="#2b82fb" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="edge-renew" x1="50%" y1="50%" x2="50%" y2="85%">
                    <stop offset="0%" stopColor="#2b82fb" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="edge-vasool" x1="50%" y1="50%" x2="15%" y2="50%">
                    <stop offset="0%" stopColor="#2b82fb" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3" />
                  </linearGradient>
                </defs>

                {/* Hub Spoke Lines */}
                <line x1="50%" y1="50%" x2="50%" y2="16%" stroke="url(#edge-prevent)" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="50%" y1="50%" x2="84%" y2="50%" stroke="url(#edge-rescue)" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="50%" y1="50%" x2="50%" y2="84%" stroke="url(#edge-renew)" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="50%" y1="50%" x2="16%" y2="50%" stroke="url(#edge-vasool)" strokeWidth="2" strokeDasharray="4 4" />

                {/* Cross-Agent Flow Ring */}
                <circle cx="50%" cy="50%" r="35%" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" strokeDasharray="6 6" />

                {/* Traveling Capital Particles (Animated via CSS) */}
                <circle cx="50%" cy="32%" r="4" fill="#06b6d4" className="animate-ping opacity-75" />
                <circle cx="68%" cy="50%" r="4" fill="#a855f7" className="animate-ping opacity-75" />
                <circle cx="50%" cy="68%" r="4" fill="#10b981" className="animate-ping opacity-75" />
                <circle cx="32%" cy="50%" r="4" fill="#f59e0b" className="animate-ping opacity-75" />
              </svg>

              {/* Central Hub: Autonomous Recovery Brain Core */}
              <div
                className="absolute z-20 flex flex-col items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-[#0052cc] via-[#1d4ed8] to-[#0a1b4d] border-2 border-blue-400 shadow-2xl shadow-blue-600/50 cursor-pointer transition-transform hover:scale-110"
                style={{
                  transform: is3DMode ? 'translateZ(30px)' : 'none',
                }}
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-[11px] font-bold text-white tracking-wider mt-1">RECOVERY</span>
                <span className="text-[9px] font-mono text-cyan-300 font-semibold">BRAIN CORE</span>
              </div>

              {/* Agent Node 1: PREVENT (Top - North) */}
              <div
                onClick={() => setSelectedAgent('prevent')}
                className={`absolute top-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center p-3 rounded-xl glass-panel border transition-all cursor-pointer ${
                  selectedAgent === 'prevent'
                    ? 'border-cyan-400 ring-2 ring-cyan-500/40 scale-105 shadow-xl shadow-cyan-500/30'
                    : 'border-white/10 hover:border-cyan-500/40'
                }`}
                style={{
                  transform: is3DMode ? 'translateZ(20px)' : 'none',
                  minWidth: '150px',
                }}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span className="text-xs font-bold text-white font-mono">PREVENT</span>
                </div>
                <div className="text-[13px] font-bold text-cyan-300 mt-1">
                  {formatLakhs(agentStats.prevent.recovered)}
                </div>
                <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                  {agentStats.prevent.casesCount} Failures Mitigated
                </div>
                <span className="mt-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {agentStats.prevent.successRate}% Success
                </span>
              </div>

              {/* Agent Node 2: RESCUE (Right - East) */}
              <div
                onClick={() => setSelectedAgent('rescue')}
                className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center p-3 rounded-xl glass-panel border transition-all cursor-pointer ${
                  selectedAgent === 'rescue'
                    ? 'border-purple-400 ring-2 ring-purple-500/40 scale-105 shadow-xl shadow-purple-500/30'
                    : 'border-white/10 hover:border-purple-500/40'
                }`}
                style={{
                  transform: is3DMode ? 'translateZ(20px)' : 'none',
                  minWidth: '150px',
                }}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  <span className="text-xs font-bold text-white font-mono">RESCUE</span>
                </div>
                <div className="text-[13px] font-bold text-purple-300 mt-1">
                  {formatLakhs(agentStats.rescue.recovered)}
                </div>
                <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                  {agentStats.rescue.casesCount} Carts Rescued
                </div>
                <span className="mt-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {agentStats.rescue.successRate}% Success
                </span>
              </div>

              {/* Agent Node 3: RENEW (Bottom - South) */}
              <div
                onClick={() => setSelectedAgent('renew')}
                className={`absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center p-3 rounded-xl glass-panel border transition-all cursor-pointer ${
                  selectedAgent === 'renew'
                    ? 'border-emerald-400 ring-2 ring-emerald-500/40 scale-105 shadow-xl shadow-emerald-500/30'
                    : 'border-white/10 hover:border-emerald-500/40'
                }`}
                style={{
                  transform: is3DMode ? 'translateZ(20px)' : 'none',
                  minWidth: '150px',
                }}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-white font-mono">RENEW</span>
                </div>
                <div className="text-[13px] font-bold text-emerald-300 mt-1">
                  {formatLakhs(agentStats.renew.recovered)}
                </div>
                <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                  {agentStats.renew.casesCount} Subscriptions Kept
                </div>
                <span className="mt-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {agentStats.renew.successRate}% Success
                </span>
              </div>

              {/* Agent Node 4: VASOOL (Left - West) */}
              <div
                onClick={() => setSelectedAgent('vasool')}
                className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center p-3 rounded-xl glass-panel border transition-all cursor-pointer ${
                  selectedAgent === 'vasool'
                    ? 'border-amber-400 ring-2 ring-amber-500/40 scale-105 shadow-xl shadow-amber-500/30'
                    : 'border-white/10 hover:border-amber-500/40'
                }`}
                style={{
                  transform: is3DMode ? 'translateZ(20px)' : 'none',
                  minWidth: '150px',
                }}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-xs font-bold text-white font-mono">VASOOL</span>
                </div>
                <div className="text-[13px] font-bold text-amber-300 mt-1">
                  {formatLakhs(agentStats.vasool.recovered)}
                </div>
                <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                  {agentStats.vasool.casesCount} Invoices Collected
                </div>
                <span className="mt-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {agentStats.vasool.successRate}% Success
                </span>
              </div>
            </div>
          </div>

          {/* Selected Agent Detailed Telemetry Strip */}
          <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white tracking-wide font-mono">
                  ACTIVE PIPELINE: {agentStats[selectedAgent as keyof typeof agentStats].name} · {agentStats[selectedAgent as keyof typeof agentStats].title}
                </span>
                <p className="text-[11px] text-gray-400">
                  Core Strategy: {agentStats[selectedAgent as keyof typeof agentStats].focus} · Response SLA: {agentStats[selectedAgent as keyof typeof agentStats].latency}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <span className="text-xs font-mono text-gray-400">Total Yield Contributed</span>
                <div className="text-base font-bold text-white font-mono">
                  {formatLakhs(agentStats[selectedAgent as keyof typeof agentStats].recovered)}
                </div>
              </div>
              {Boolean(onSelectCase && cases.length) && (
                <button
                  type="button"
                  onClick={handleInspectCase}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-xs font-semibold text-blue-200 transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <span>Inspect Case</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. REAL-TIME RECOVERY WATERFALL CHART                                     */}
      {/* ========================================================================= */}
      {(activeViz === 'all' || activeViz === 'waterfall') && (
        <div className="glass-panel rounded-2xl p-6 border border-white/10 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Module 02 · Real-Time Recovery Cashflow Waterfall
                </h3>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Financial audit breakdown from Gross Debt at Risk to Net Protected Working Capital.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-medium">
                47.3% Total Protected Yield
              </span>
            </div>
          </div>

          {/* Waterfall Grid Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            {waterfallData.map((item, idx) => {
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl glass-panel border transition-all flex flex-col justify-between group hover:-translate-y-1 ${item.border}`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 mb-1">
                      <span>STEP 0{idx + 1}</span>
                      <span className={`font-semibold ${
                        item.type === 'subtract'
                          ? 'text-rose-400'
                          : item.type === 'add'
                          ? 'text-emerald-400'
                          : item.type === 'total'
                          ? 'text-cyan-400'
                          : 'text-gray-300'
                      }`}>
                        {item.type === 'subtract' ? '-' : item.type === 'add' ? '+' : ''}{item.pct}%
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white tracking-tight leading-snug">
                      {item.label}
                    </div>
                  </div>

                  <div className="my-4">
                    {/* Simulated Vertical Bar Fill */}
                    <div className="w-full bg-white/5 rounded-lg h-24 flex items-end p-1 relative overflow-hidden">
                      <div
                        className={`w-full rounded-md bg-gradient-to-t ${item.color} transition-all duration-700 relative`}
                        style={{
                          height: `${Math.max(20, Math.min(100, item.pct))}%`,
                        }}
                      >
                        <div className="absolute inset-0 bg-white/10 animate-pulse opacity-40" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-bold text-white font-mono">
                      {formatLakhs(item.amount)}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 leading-tight">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Financial Net Insight */}
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                <strong>Net Capital Preservation Lift:</strong> Autonomous recovery protects ₹45.3 Lakhs without adding agency commissions or manual calls.
              </span>
            </div>
            <span className="font-mono text-emerald-400 font-bold hidden sm:inline">
              +312% vs Traditional Dunning
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. B2B AGING PYRAMID (3D/2.5D Isometric Stacked Tiers)                     */}
      {/* ========================================================================= */}
      {(activeViz === 'all' || activeViz === 'pyramid') && (
        <div className="glass-panel rounded-2xl p-6 border border-white/10 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Module 03 · 3D B2B Debt Aging Pyramid & Section 43B(h) Clock
                </h3>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Isometric debt distribution tiered by Days Sales Outstanding (DSO) and statutory penalty risk.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              <Clock className="w-3.5 h-3.5" />
              <span>DSO Reduced from 58.4d → 34.2d (-24.2 Days)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: 3D Stacked Pyramid Visual */}
            <div
              className="lg:col-span-6 flex flex-col items-center justify-center p-6 rounded-xl bg-gradient-to-b from-[#060c1c] to-[#02050c] border border-white/5 relative min-h-[360px]"
              style={{
                perspective: is3DMode ? '1000px' : 'none',
              }}
            >
              <div
                className="w-full max-w-sm flex flex-col items-center space-y-2.5 transition-transform duration-300"
                style={{
                  transform: is3DMode
                    ? `rotateX(${20 - mousePos.y * 15}deg) rotateY(${mousePos.x * 15}deg)`
                    : 'none',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Pyramid Tiers from Top (Apex) to Bottom (Base) */}
                {[...agingTiers].reverse().map((tier) => {
                  const isSelected = selectedTier === tier.id;
                  // Dynamic widths for pyramid shape (tier 3 apex is narrowest, tier 0 base is widest)
                  const widthPct = tier.id === 3 ? 'w-44' : tier.id === 2 ? 'w-60' : tier.id === 1 ? 'w-76' : 'w-92';

                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id)}
                      className={`${widthPct} p-3 rounded-lg border cursor-pointer transition-all duration-300 flex items-center justify-between select-none ${
                        isSelected
                          ? `${tier.bg} ${tier.border} scale-105 shadow-xl ${tier.glow}`
                          : 'bg-white/[0.03] border-white/10 hover:border-white/30'
                      }`}
                      style={{
                        transform: is3DMode
                          ? `translateZ(${isSelected ? '24px' : '0px'})`
                          : 'none',
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: tier.color }}
                        />
                        <span className="text-xs font-bold text-white font-mono">
                          {tier.bracket}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-white font-mono">
                          {formatLakhs(tier.amount)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono ml-2">
                          ({tier.probability}% Prob)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <span className="text-[10px] font-mono text-gray-500 mt-4">
                Click any tier to inspect statutory exposure & recovery plan
              </span>
            </div>

            {/* Right: Selected Tier Deep Dive */}
            <div className="lg:col-span-6 space-y-4">
              {(() => {
                const tier = agingTiers.find((t) => t.id === selectedTier) || agingTiers[0];
                return (
                  <div className={`p-5 rounded-xl glass-panel border ${tier.border} space-y-4`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: tier.color }}
                          />
                          <h4 className="text-base font-bold text-white">
                            {tier.bracket} · {tier.status}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Statutory Status: {tier.statutory}
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-white/10 text-white">
                        {tier.invoices} Active Invoices
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                        <span className="text-[10px] font-mono text-gray-400">Total at Risk</span>
                        <div className="text-sm font-bold text-white font-mono mt-0.5">
                          {formatLakhs(tier.amount)}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                        <span className="text-[10px] font-mono text-gray-400">Recovery Probability</span>
                        <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                          {tier.probability}%
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 col-span-2 sm:col-span-1">
                        <span className="text-[10px] font-mono text-gray-400">DSO Acceleration</span>
                        <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">
                          {tier.dsoImpact} Days
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <span className="text-[11px] font-mono text-blue-300 font-semibold block mb-1">
                        Autonomous Recovery Playbook:
                      </span>
                      <p className="text-xs text-gray-300">
                        {tier.strategy}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. VOICE CALL SENTIMENT 7x24 HEATMAP                                      */}
      {/* ========================================================================= */}
      {(activeViz === 'all' || activeViz === 'heatmap') && (
        <div className="glass-panel rounded-2xl p-6 border border-white/10 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Module 04 · Hinglish Voice Call Telephony & Sentiment Heatmap
                </h3>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                7x24 Matrix of 1,428 Vasool AI calls strictly bound to RBI Calling Window (8:00 AM – 7:00 PM).
              </p>
            </div>
            
            {/* Legend */}
            <div className="flex items-center space-x-3 text-[11px] font-mono">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span className="text-gray-400">PTP Agreed (+0.8)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                <span className="text-gray-400">Neutral (0.0)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                <span className="text-gray-400">Hostile (-0.6)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#080d1a] border border-white/10" />
                <span className="text-gray-500">RBI Prohibited</span>
              </div>
            </div>
          </div>

          {/* The 7x24 Grid Heatmap */}
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[720px] space-y-1.5">
              {/* Hour Labels */}
              <div className="flex items-center text-[9px] font-mono text-gray-500 pl-10">
                {Array.from({ length: 24 }).map((_, h) => (
                  <div key={h} className="flex-1 text-center">
                    {h % 3 === 0 ? `${h}:00` : ''}
                  </div>
                ))}
              </div>

              {/* Rows: Days */}
              {heatmapData.map((row, dayIdx) => (
                <div key={dayIdx} className="flex items-center space-x-1">
                  <span className="w-9 text-[10px] font-mono font-medium text-gray-400">
                    {DAYS[dayIdx]}
                  </span>

                  <div className="flex-1 flex items-center space-x-1">
                    {row.map((cell) => {
                      // Determine cell color
                      let cellColor = 'bg-[#080d1a] border-white/5 opacity-40';
                      if (cell.isRbiAllowed && cell.calls > 0) {
                        if (cell.sentiment > 0.3) {
                          cellColor = 'bg-emerald-500/80 hover:bg-emerald-400 border-emerald-400/40 shadow-sm shadow-emerald-500/20';
                        } else if (cell.sentiment >= 0) {
                          cellColor = 'bg-amber-500/80 hover:bg-amber-400 border-amber-400/40 shadow-sm shadow-amber-500/20';
                        } else {
                          cellColor = 'bg-rose-500/80 hover:bg-rose-400 border-rose-400/40 shadow-sm shadow-rose-500/20';
                        }
                      }

                      return (
                        <div
                          key={cell.hour}
                          onMouseEnter={() =>
                            setHoveredCell({
                              day: dayIdx,
                              hour: cell.hour,
                              sentiment: cell.sentiment,
                              calls: cell.calls,
                              outcome: cell.outcome,
                              amount: cell.amount,
                              duration: cell.duration,
                            })
                          }
                          className={`flex-1 h-6 rounded-sm border transition-all cursor-pointer ${cellColor} ${
                            cell.hour >= 8 && cell.hour < 19 && dayIdx < 6 ? 'ring-1 ring-white/5' : ''
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Tooltip / Detail Card */}
          <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {hoveredCell && hoveredCell.calls > 0 ? (
              <div className="flex items-center space-x-3 w-full justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                    <PhoneCall className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white font-mono">
                        {DAYS[hoveredCell.day]} @ {hoveredCell.hour}:00 IST
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {hoveredCell.calls} Calls Handled
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Outcome: <strong>{hoveredCell.outcome}</strong> · Avg Duration: {hoveredCell.duration}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-gray-400">Captured Value</span>
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    {formatLakhs(hoveredCell.amount)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <Info className="w-4 h-4 text-gray-500" />
                <span>
                  Hover over any heatmap block to inspect call outcomes, Hinglish sentiment scores, and recovered funds.
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecoveryFlow3D;
