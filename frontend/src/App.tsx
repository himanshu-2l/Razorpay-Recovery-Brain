import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import type { ViewMode, ConsoleTab } from './components/Navbar';
import { ShowcaseHero } from './components/showcase/ShowcaseHero';
import { TrustLogoStrip } from './components/showcase/TrustLogoStrip';
import { ProofRibbon } from './components/showcase/ProofRibbon';
import { TheFiveLeaksSection } from './components/showcase/TheFiveLeaksSection';
import { ProductWorkflowSection } from './components/showcase/ProductWorkflowSection';
import { RazorEdgeEngineSection } from './components/showcase/RazorEdgeEngineSection';
import { Razorpay3DArchitectureStack } from './components/showcase/Razorpay3DArchitectureStack';
import { ThreePillarsSection } from './components/showcase/ThreePillarsSection';
import { CrossLeakShowcase } from './components/showcase/CrossLeakShowcase';
import { EnterpriseRoiCalculator } from './components/showcase/EnterpriseRoiCalculator';
import { LiveSimulatorSandbox } from './components/showcase/LiveSimulatorSandbox';
import { ComplianceTrustSeal } from './components/showcase/ComplianceTrustSeal';
import { ShowcaseFaqSection } from './components/showcase/ShowcaseFaqSection';
import { StickyBottomBar } from './components/showcase/StickyBottomBar';
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
import { FailureInjectionPanel } from './components/FailureInjectionPanel';
import { RecoveryFlow3D } from './components/RecoveryFlow3D';
import { Dashboard } from './pages/Dashboard';
import type { BatchSummary, CaseItem } from './types';
import { API_BASE } from './api';

const MainLayout: React.FC = () => {
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
    } catch {
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
    <div
      className="min-h-screen font-body flex flex-col justify-between bg-[#17202e] text-[#ffffff] selection:bg-[#305EFF]/20 selection:text-[#305EFF] relative overflow-x-hidden"
    >
      {/* Deep-Sea Horizon Glow */}
      <div className="absolute top-0 inset-x-0 h-[650px] pointer-events-none horizon-glow opacity-80" />
      
      {/* Universal Dual-Mode Navbar with Theme Toggle */}
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

            {/* Institutional Unicorn Trust Strip */}
            <TrustLogoStrip />

            {/* Proof Metrics Ribbon */}
            <ProofRibbon summary={summary} />

            {/* The 5 Silent Revenue Leaks in Indian Payments */}
            <TheFiveLeaksSection />

            {/* Autonomous End-to-End Product Lifecycle & Simulation */}
            <ProductWorkflowSection
              onLaunchConsole={() => setViewMode('console')}
              onOpenSimulator={scrollToSimulator}
            />

            {/* Razor-Edge Sub-150ms Switchboard & Latency Benchmark */}
            <RazorEdgeEngineSection />

            {/* Autonomous Decoupled 3-Plane Architecture Card Stack */}
            <Razorpay3DArchitectureStack />

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

            {/* Enterprise Revenue Recovery ROI Calculator */}
            <EnterpriseRoiCalculator onLaunchConsole={() => setViewMode('console')} />

            {/* Interactive Failure Scenario Simulator */}
            <LiveSimulatorSandbox />

            {/* Compliance & Trust Seal */}
            <ComplianceTrustSeal onLaunchConsole={() => setViewMode('console')} />

            {/* Enterprise FAQ Accordion */}
            <ShowcaseFaqSection />

            {/* Floating Sticky Navigation Bar */}
            <StickyBottomBar
              onLaunchConsole={() => setViewMode('console')}
              onOpenSimulator={scrollToSimulator}
              totalAtRisk={summary?.total_at_risk || 9579541}
            />
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

                {/* 3D Recovery Flow Visualization Centerpiece */}
                <RecoveryFlow3D summary={summary} cases={cases} onSelectCase={handleSelectCase} />

                {/* Clean Case Ledger */}
                <CaseTable cases={cases} onSelectCase={handleSelectCase} />
              </div>
            )}

            {consoleTab === 'recovery_flow' && (
              <div className="space-y-4">
                <Dashboard
                  summary={summary}
                  cases={cases}
                  onSelectCase={handleSelectCase}
                  onNavigateTab={setConsoleTab}
                />
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

            {consoleTab === 'chaos' && (
              <div className="space-y-4">
                <FailureInjectionPanel />
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

      {/* Deep-Sea Terminal Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.08)] py-8 text-center text-sm font-body space-y-2 bg-[#17202e] text-[#cdd0d6] relative z-10">
        <div className="flex items-center justify-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#305EFF] animate-ping" />
          <span className="font-heading font-semibold text-sm text-[#ffffff]">
            Autonomous Revenue Recovery Engine · High-Frequency Settlement Infrastructure
          </span>
        </div>
        <p className="text-xs text-[#cdd0d6]/70 font-mono">
          Engineered with FastAPI, Banking APIs & React · Deep-Sea Financial Terminal Architecture
        </p>
      </footer>

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <MainLayout />
    </ThemeProvider>
  );
};

export default App;
