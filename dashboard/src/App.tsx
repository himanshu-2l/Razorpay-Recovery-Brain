import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { StatsGrid } from './components/StatsGrid';
import { CaseTable } from './components/CaseTable';
import { CaseDetailModal } from './components/CaseDetailModal';
import { VoiceStudio } from './components/VoiceStudio';
import { ComplianceShield } from './components/ComplianceShield';
import { WebhookPlayground } from './components/WebhookPlayground';
import { ImpactCounter } from './components/ImpactCounter';
import { LiveEventTicker } from './components/LiveEventTicker';
import { StickyAgentShowcase } from './components/StickyAgentShowcase';
import type { BatchSummary, CaseItem } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'voice' | 'compliance' | 'sandbox' | 'webhook'>('overview');
  const [summary, setSummary] = useState<BatchSummary | null>(null);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Fetch initial summary and cases
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch summary
      const summaryRes = await fetch('http://localhost:8000/api/batch/summary');
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      } else {
        // Generate new batch if none exists yet
        await handleGenerateBatch();
        return;
      }

      // Fetch cases
      const casesRes = await fetch('http://localhost:8000/api/cases?limit=100');
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
      const res = await fetch('http://localhost:8000/api/batch/generate', { method: 'POST' });
      if (res.ok) {
        const summaryRes = await fetch('http://localhost:8000/api/batch/summary');
        const summaryData = await summaryRes.json();
        setSummary(summaryData);

        const casesRes = await fetch('http://localhost:8000/api/cases?limit=100');
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
      const res = await fetch(`http://localhost:8000/api/cases/${c.id}`);
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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#050507] text-[#f3f4f6] font-sans selection:bg-blue-500/30 selection:text-white flex flex-col justify-between">
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefreshBatch={handleGenerateBatch}
        isProcessing={isProcessing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-10">
        
        {/* Hero Section */}
        <HeroBanner
          onOpenVoice={() => setActiveTab('voice')}
          onOpenComplianceDemo={() => setActiveTab('compliance')}
          onRefreshBatch={handleGenerateBatch}
          isProcessing={isProcessing}
          totalAtRisk={summary?.total_at_risk || 0}
          totalRecovered={summary?.total_recovered || 0}
          recoveryRate={summary?.recovery_rate || 0}
        />

        {/* View Switcher Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <StatsGrid summary={summary} loading={loading} />
            <LiveEventTicker />
            <StickyAgentShowcase
              onOpenVoice={() => setActiveTab('voice')}
              onOpenCompliance={() => setActiveTab('compliance')}
              onOpenWebhook={() => setActiveTab('sandbox')}
            />
            <ImpactCounter />
            <CaseTable cases={cases} onSelectCase={handleSelectCase} />
          </div>
        )}

        {activeTab === 'cases' && (
          <div className="animate-in fade-in duration-300">
            <CaseTable cases={cases} onSelectCase={handleSelectCase} />
          </div>
        )}

        {(activeTab === 'sandbox' || activeTab === 'webhook') && (
          <div className="animate-in fade-in duration-300">
            <WebhookPlayground />
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="animate-in fade-in duration-300">
            <VoiceStudio />
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="animate-in fade-in duration-300">
            <ComplianceShield summary={summary} />
          </div>
        )}

      </main>

      {/* Case Detail Modal */}
      <CaseDetailModal
        caseItem={selectedCase}
        onClose={() => setSelectedCase(null)}
      />

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-gray-400 font-mono space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-gray-300 font-medium">Razorpay AI Buildathon 2026 · Track 03: AI Revenue Recovery</span>
        </div>
        <p className="text-[11px] text-gray-400">
          Engineered with FastAPI, Razorpay Test Mode APIs, and React · Unified Architecture & Hinglish Telephony Agent
        </p>
      </footer>

    </div>
  );
};

export default App;
