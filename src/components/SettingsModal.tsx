'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, Cpu, Check, AlertCircle } from 'lucide-react';
import { ProviderConfig } from '@/lib/ai/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ProviderConfig;
  onSaveConfig: (newConfig: ProviderConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [openAiKey, setOpenAiKey] = useState<string>('');
  const [claudeKey, setClaudeKey] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setGeminiKey(localStorage.getItem('devlens_key_gemini') || '');
      setOpenAiKey(localStorage.getItem('devlens_key_openai') || '');
      setClaudeKey(localStorage.getItem('devlens_key_claude') || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('devlens_key_gemini', geminiKey);
      localStorage.setItem('devlens_key_openai', openAiKey);
      localStorage.setItem('devlens_key_claude', claudeKey);
    }

    onSaveConfig({
      ...config,
      apiKey: config.provider === 'gemini' ? geminiKey : config.provider === 'openai' ? openAiKey : claudeKey,
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">AI Provider Credentials & Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-300 flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-cyan-400" />
          <span>
            API keys are stored exclusively in your local browser sandbox (<code className="font-mono">localStorage</code>) and are never logged, tracked, or persisted on our servers.
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1 flex items-center justify-between">
              <span>Google Gemini API Key</span>
              <span className="text-[10px] text-zinc-500 font-mono">Optional</span>
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1 flex items-center justify-between">
              <span>OpenAI API Key</span>
              <span className="text-[10px] text-zinc-500 font-mono">Optional</span>
            </label>
            <input
              type="password"
              value={openAiKey}
              onChange={(e) => setOpenAiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1 flex items-center justify-between">
              <span>Anthropic Claude API Key</span>
              <span className="text-[10px] text-zinc-500 font-mono">Optional</span>
            </label>
            <input
              type="password"
              value={claudeKey}
              onChange={(e) => setClaudeKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span>Zero keys? Offline Heuristic Engine is always active!</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-zinc-800 text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs flex items-center gap-1 shadow-lg shadow-cyan-500/20"
            >
              {isSaved ? <Check className="h-3.5 w-3.5" /> : null}
              <span>{isSaved ? 'Saved!' : 'Save Credentials'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
