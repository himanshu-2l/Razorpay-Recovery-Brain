import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import type { ViewMode, ConsoleTab } from './components/Navbar';
import { ShowcaseHero } from './components/showcase/ShowcaseHero';
import { ProofRibbon } from './components/showcase/ProofRibbon';
import { StickyStoryTour } from './components/showcase/StickyStoryTour';
import { ThreePillarsSection } from './components/showcase/ThreePillarsSection';
import { CrossLeakShowcase } from './components/showcase/CrossLeakShowcase';
import { LiveSimulatorSandbox } from './components/showcase/LiveSimulatorSandbox';
import { ComplianceTrustSeal } from './components/showcase/ComplianceTrustSeal';
import { StatsGrid } from './components/StatsGrid';
import { CaseTable } from './components/CaseTable';
import { CaseDetailModal } from './components/CaseDetailModal';
import { VoiceStudio } from './components/VoiceStudio';
import { ComplianceShield } from './components/ComplianceShield';
import { WebhookPlayground } from './components/WebhookPlayground';
import { ImpactCounter } from './components/ImpactCounter';
import { LiveEventTicker } from './components/LiveEventTicker';
import { ABTestResults } from './components/ABTestResults';
import { ArchitectureFlow } from './components/ArchitectureFlow';
import type { BatchSummary, CaseItem } from './types';
import { API_BASE } from './api';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('showcase');
  const [consoleTab, setConsoleTab] = useState<ConsoleTab>('overview');
  const [summary, setSummary] = useState<BatchSummary | null>(null);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Fetch initial summary and cases
  const fetchData = async () => {
    try {
      setLoading(true);
      const summaryRes = await fetch(`${API_BASE}/api/batch/summary`);
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      } else {
        await handleGenerateBatch();
        return;
      }

      const casesRes = await fetch(`${API_BASE}/api/cases?limit=100`);
      if (casesRes.ok) {
        const casesData = await casesRes.json();
        setCases(casesData.cases || []);
      }
    } catch (err) {
      console.warn('Backend not responding, attempting batch generation...', err);
      await handleGenerateBatch();
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBatch = async () => {
    try {
      setIsProcessing(true);
      const res = await fetch(`${API_BASE}/api/batch/generate`, { method: 'POST' });
      if (res.ok) {
        const summaryRes = await fetch(`${API_BASE}/api/batch/summary`);
        const summaryData = await summaryRes.json();
        setSummary(summaryData);

        const casesRes = await fetch(`${API_BASE}/api/cases?limit=100`);
        const casesData = await casesRes.json();
        setCases(casesData.cases || []);
      }
    } catch (err) {
      console.error('Error generating batch:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectCase = async (c: CaseItem) => {
    try {
      const res = await fetch(`${API_BASE}/api/cases/${c.id}`);
      if (res.ok) {
        const detailedCase = await res.json();
        setSelectedCase(detailedCase);
      } else {
        setSelectedCase(c);
      }
    } catch (err) {
      setSelectedCase(c);
    }
  };

  const scrollToSimulator = () => {
    const el = document.getElementById('simulator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-[#f3f4f6] font-sans selection:bg-blue-500/30 selection:text-white flex flex-col justify-between razorpay-grid">
      
      {/* Universal Dual-Mode Navbar */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        consoleTab={consoleTab}
        setConsoleTab={setConsoleTab}
        onRefreshBatch={handleGenerateBatch}
        isProcessing={isProcessing}
      />

      {/* Main View Mode Switcher */}
      <main className="flex-1 w-full">
        
        {/* ========================================================================= */}
        {/* MODE 1: PRODUCT SHOWCASE (Razorpay Magic Checkout & Agent Studio style)    */}
        {/* ========================================================================= */}
        {viewMode === 'showcase' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Hero Section */}
            <ShowcaseHero
              onLaunchConsole={() => setViewMode('console')}
              onOpenSimulator={scrollToSimulator}
              totalAtRisk={summary?.total_at_risk || 9579541}
              totalRecovered={summary?.total_recovered || 253723}
              recoveryRate={summary?.recovery_rate || 2.6}
            />

            {/* Proof Metrics Ribbon */}
            <ProofRibbon summary={summary} />

            {/* 4-Chapter Sticky Story Tour (Magic Checkout Pinned Style) */}
            <StickyStoryTour />

            {/* Core Innovations / Three Pillars */}
            <ThreePillarsSection
              onOpenCompliance={() => {
                setViewMode('console');
                setConsoleTab('compliance');
              }}
              onOpenVoice={() => {
                setViewMode('console');
                setConsoleTab('voice');
              }}
              onOpenWebhook={() => {
                setViewMode('console');
                setConsoleTab('webhook');
              }}
            />

            {/* Cross-Leak Identity Unification Moat */}
            <CrossLeakShowcase />

            {/* Interactive Failure Scenario Simulator */}
            <LiveSimulatorSandbox />

            {/* Compliance & Trust Seal */}
            <ComplianceTrustSeal onLaunchConsole={() => setViewMode('console')} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: OPERATIONS CONSOLE (Uncluttered SaaS Dashboard Workspace)          */}
        {/* ========================================================================= */}
        {viewMode === 'console' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
            
            {/* Console Sub-View Routing */}
            {consoleTab === 'overview' && (
              <div className="space-y-8">
                {/* 4 KPI Cards */}
                <StatsGrid summary={summary} loading={loading} />

                {/* Real-Time Live Ticker */}
                <LiveEventTicker />

                {/* Economic Yield & Impact Summary */}
                <ImpactCounter />

                {/* Clean Case Ledger */}
                <CaseTable cases={cases} onSelectCase={handleSelectCase} />
              </div>
            )}

            {consoleTab === 'cases' && (
              <div className="space-y-4">
                <CaseTable cases={cases} onSelectCase={handleSelectCase} />
              </div>
            )}

            {consoleTab === 'voice' && (
              <div className="space-y-4">
                <VoiceStudio />
              </div>
            )}

            {consoleTab === 'compliance' && (
              <div className="space-y-4">
                <ComplianceShield summary={summary} />
              </div>
            )}

            {consoleTab === 'abtest' && (
              <div className="space-y-4">
                <ABTestResults />
              </div>
            )}

            {consoleTab === 'webhook' && (
              <div className="space-y-4">
                <WebhookPlayground />
              </div>
            )}

            {consoleTab === 'architecture' && (
              <div className="space-y-4">
                <ArchitectureFlow cases={cases} />
              </div>
            )}

          </div>
        )}

      </main>

      {/* Case Detail Modal / Drawer */}
      <CaseDetailModal
        caseItem={selectedCase}
        onClose={() => setSelectedCase(null)}
      />

      {/* Authentic Razorpay Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-gray-500 font-mono space-y-2 bg-[#02050c]">
        <div className="flex items-center justify-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-gray-300 font-medium">Razorpay AI Buildathon 2026 · Track 03: AI Revenue Recovery</span>
        </div>
        <p className="text-[11px] text-gray-400">
          Engineered with FastAPI, Razorpay Test Mode APIs, and React · Dual-Mode Architecture (Showcase + Operations Console)
        </p>
      </footer>

    </div>
  );
};

export default App;
