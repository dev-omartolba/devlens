'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { DiagnosticStudio } from '@/components/DiagnosticStudio';
import { CodeExplainer } from '@/components/CodeExplainer';
import { DocSynthesizer } from '@/components/DocSynthesizer';
import { TestForge } from '@/components/TestForge';
import { HistoryDrawer } from '@/components/HistoryDrawer';
import { SettingsModal } from '@/components/SettingsModal';
import { HistoryStore } from '@/lib/storage/historyStore';
import { AIProvider, HistoryItem, ProviderConfig } from '@/lib/ai/types';
import { Stethoscope, Cpu, BookOpen, FlaskConical } from 'lucide-react';

type Tab = 'diagnostics' | 'explainer' | 'docs' | 'tests';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('diagnostics');
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('heuristic');
  const [providerConfig, setProviderConfig] = useState<ProviderConfig>({
    provider: 'heuristic',
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
    setHistoryItems(HistoryStore.getAll());

    // Restore chosen provider from storage if available
    const savedProvider = localStorage.getItem('devlens_provider') as AIProvider;
    if (savedProvider) {
      setSelectedProvider(savedProvider);
      setProviderConfig((prev) => ({ ...prev, provider: savedProvider }));
    }
  }, []);

  const handleProviderChange = (provider: AIProvider) => {
    setSelectedProvider(provider);
    setProviderConfig((prev) => ({
      ...prev,
      provider,
      apiKey:
        typeof window !== 'undefined'
          ? localStorage.getItem(`devlens_key_${provider}`) || undefined
          : undefined,
    }));
    if (typeof window !== 'undefined') {
      localStorage.setItem('devlens_provider', provider);
    }
  };

  const handleSaveToHistory = (
    title: string,
    snippet: string,
    summary: string,
    tags: string[]
  ) => {
    const item = HistoryStore.add({
      type: activeTab === 'diagnostics' ? 'diagnostic' : activeTab === 'explainer' ? 'explanation' : activeTab === 'docs' ? 'documentation' : 'tests',
      title,
      snippet,
      language: tags[0] || 'typescript',
      tags,
      resultSummary: summary,
    });
    setHistoryItems((prev) => [item, ...prev].slice(0, 50));
  };

  const handleClearHistory = () => {
    HistoryStore.clear();
    setHistoryItems([]);
  };

  const handleRemoveHistoryItem = (id: string) => {
    HistoryStore.remove(id);
    setHistoryItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        selectedProvider={selectedProvider}
        onProviderChange={handleProviderChange}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
        historyCount={historyItems.length}
      />

      {/* Main Subheader Navigation */}
      <div className="border-b border-zinc-800 bg-zinc-900/40 px-6 py-2.5 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'diagnostics'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Stethoscope className="h-3.5 w-3.5" />
            <span>Diagnostic Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('explainer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'explainer'
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>Code Explainer</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'docs'
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Doc Synthesizer</span>
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'tests'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FlaskConical className="h-3.5 w-3.5" />
            <span>Test Forge</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-500 hidden sm:flex">
          <a
            href="https://github.com/dev-omartolba/devlens"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </div>

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'diagnostics' && (
          <DiagnosticStudio
            selectedProvider={selectedProvider}
            providerConfig={providerConfig}
            onSaveToHistory={handleSaveToHistory}
          />
        )}

        {activeTab === 'explainer' && (
          <CodeExplainer
            selectedProvider={selectedProvider}
            providerConfig={providerConfig}
            onSaveToHistory={handleSaveToHistory}
          />
        )}

        {activeTab === 'docs' && (
          <DocSynthesizer
            selectedProvider={selectedProvider}
            providerConfig={providerConfig}
            onSaveToHistory={handleSaveToHistory}
          />
        )}

        {activeTab === 'tests' && (
          <TestForge
            selectedProvider={selectedProvider}
            providerConfig={providerConfig}
            onSaveToHistory={handleSaveToHistory}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 px-6 py-4 text-center text-xs text-zinc-500">
        <p>
          DevLens • Built with Next.js 16, TypeScript, Tailwind CSS, AST Parser & Pluggable Multi-LLM Architecture.
        </p>
      </footer>

      {/* Slide-out History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={historyItems}
        onClear={handleClearHistory}
        onRemoveItem={handleRemoveHistoryItem}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={providerConfig}
        onSaveConfig={setProviderConfig}
      />
    </div>
  );
}
