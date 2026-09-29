'use client';

import React from 'react';
import { Sparkles, Terminal, Settings, History, ShieldCheck, Zap } from 'lucide-react';
import { AIProvider } from '@/lib/ai/types';

interface HeaderProps {
  selectedProvider: AIProvider;
  onProviderChange: (p: AIProvider) => void;
  onOpenSettings: () => void;
  onToggleHistory: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  selectedProvider,
  onProviderChange,
  onOpenSettings,
  onToggleHistory,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-indigo-500/20">
          <div className="h-full w-full bg-zinc-950 rounded-[11px] flex items-center justify-center">
            <Terminal className="h-5 w-5 text-cyan-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold tracking-tight text-white flex items-center gap-1.5">
              DevLens
              <span className="text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                v1.0
              </span>
            </h1>
          </div>
          <p className="text-xs text-zinc-400 hidden sm:block">AI-Powered Code Intelligence & Diagnostic Engine</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Provider Selector */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-xs">
          <button
            onClick={() => onProviderChange('heuristic')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-medium ${
              selectedProvider === 'heuristic'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Fast offline heuristic diagnostic engine (zero API keys needed)"
          >
            <Zap className="h-3 w-3" />
            <span className="hidden md:inline">Offline</span> Engine
          </button>

          <button
            onClick={() => onProviderChange('gemini')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-medium ${
              selectedProvider === 'gemini'
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="h-3 w-3" />
            Gemini
          </button>

          <button
            onClick={() => onProviderChange('openai')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-medium ${
              selectedProvider === 'openai'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            GPT-4o
          </button>

          <button
            onClick={() => onProviderChange('claude')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-medium ${
              selectedProvider === 'claude'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Claude
          </button>
        </div>

        {/* History Button */}
        <button
          onClick={onToggleHistory}
          className="relative p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
          title="Analysis History"
        >
          <History className="h-4 w-4" />
          {historyCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-indigo-500 text-[10px] text-white font-mono rounded-full h-4 w-4 flex items-center justify-center">
              {historyCount > 9 ? '9+' : historyCount}
            </span>
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
          title="Provider & API Key Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
