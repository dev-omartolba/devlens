'use client';

import React, { useState } from 'react';
import { FlaskConical, Copy, Check, Download, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AIProvider, ProviderConfig, TestGenResult } from '@/lib/ai/types';

interface TestForgeProps {
  selectedProvider: AIProvider;
  providerConfig: ProviderConfig;
  onSaveToHistory: (title: string, snippet: string, summary: string, tags: string[]) => void;
}

const DEFAULT_TEST_SNIPPET = `export function calculateDiscount(price: number, discountPercentage: number, isVip: boolean): number {
  if (price < 0 || discountPercentage < 0 || discountPercentage > 100) {
    throw new Error('Invalid price or discount bounds');
  }

  let finalDiscount = discountPercentage;
  if (isVip) {
    finalDiscount = Math.min(100, finalDiscount + 5);
  }

  const reduction = (price * finalDiscount) / 100;
  return Number((price - reduction).toFixed(2));
}`;

export const TestForge: React.FC<TestForgeProps> = ({
  selectedProvider,
  providerConfig,
  onSaveToHistory,
}) => {
  const [code, setCode] = useState<string>(DEFAULT_TEST_SNIPPET);
  const [language, setLanguage] = useState<string>('typescript');
  const [framework, setFramework] = useState<'vitest' | 'jest' | 'pytest'>('vitest');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<TestGenResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!code.trim()) {
      setErrorMessage('Please provide target code to test.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          framework,
          providerConfig: {
            ...providerConfig,
            provider: selectedProvider,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Server responded with ${res.status}`);
      }

      const data: TestGenResult = await res.json();
      setResult(data);

      onSaveToHistory(
        `Test Suite (${framework})`,
        code.slice(0, 100),
        `Generated ${framework} test suite with ${data.coverageEstimate}`,
        [language, 'tests', framework]
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to synthesize test suite.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.testCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const ext = framework === 'pytest' ? 'test_module.py' : `module.test.${language === 'python' ? 'py' : 'ts'}`;
    const blob = new Blob([result.testCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = ext;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Input Pane (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-md">
          <div className="px-4 py-2.5 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-xs font-semibold text-zinc-200">Implementation Code</span>
            </div>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-zinc-900 border border-zinc-700/80 rounded px-2 py-0.5 text-xs text-zinc-200 focus:outline-none"
            >
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
            </select>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={16}
            placeholder="Paste function or class logic to generate unit tests..."
            className="w-full bg-transparent p-3.5 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-y"
          />
        </div>

        {/* Framework Selection */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-zinc-400 block">Target Testing Framework</label>
          <div className="grid grid-cols-3 gap-2">
            {(['vitest', 'jest', 'pytest'] as const).map((fw) => (
              <button
                key={fw}
                onClick={() => setFramework(fw)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border text-center font-mono capitalize transition-all ${
                  framework === fw
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-semibold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {fw}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !code.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            <span>Synthesize Test Suite</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Output Pane (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        {!result && !isLoading && (
          <div className="h-full min-h-[400px] border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-zinc-950/40">
            <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-cyan-400">
              <FlaskConical className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-medium text-zinc-200 mb-1">Test Forge Ready</h3>
            <p className="text-xs text-zinc-500 max-w-md">
              Synthesizes complete assertions, fixtures, parameter boundary scenarios, and rejection guards.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="min-h-[400px] border border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-zinc-950/40 space-y-3">
            <div className="h-10 w-10 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
            <p className="text-xs text-zinc-400 font-mono">Synthesizing edge case vectors & assertions...</p>
          </div>
        )}

        {result && !isLoading && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Header with Coverage Badge */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 shadow-md flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-semibold">
                  {framework.toUpperCase()} SUITE
                </span>
                <h4 className="text-sm font-semibold text-white mt-1">Generated Automated Test Suite</h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Est. Coverage</span>
                <span className="text-sm font-bold font-mono text-emerald-400">{result.coverageEstimate}</span>
              </div>
            </div>

            {/* Test Code Viewer */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
              <div className="px-4 py-2 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-200">Generated Spec File</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors flex items-center gap-1"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? 'Copied' : 'Copy Tests'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                    title="Download test file"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <pre className="p-4 text-xs font-mono text-zinc-200 overflow-x-auto max-h-[380px] leading-relaxed bg-zinc-950">
                {result.testCode}
              </pre>
            </div>

            {/* Test Cases Overview */}
            {result.testSuites && result.testSuites.length > 0 && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Included Assertion Vectors
                </h4>
                <div className="space-y-1.5">
                  {result.testSuites.flatMap((s) => s.cases).map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-zinc-900/50 border border-zinc-800/80">
                      <span className="text-zinc-300">{c.description}</span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {c.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
