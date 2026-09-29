'use client';

import React, { useState } from 'react';
import { Cpu, Play, ShieldAlert, CheckCircle2, Gauge, Activity, Layers, RotateCcw } from 'lucide-react';
import { AIProvider, ExplanationResult, ProviderConfig } from '@/lib/ai/types';

interface CodeExplainerProps {
  selectedProvider: AIProvider;
  providerConfig: ProviderConfig;
  onSaveToHistory: (title: string, snippet: string, summary: string, tags: string[]) => void;
}

const DEFAULT_SNIPPET = `// LRU Cache implementation with TTL expiry
export class TimedLRUCache<K, V> {
  private capacity: number;
  private ttlMs: number;
  private cache: Map<K, { value: V; expiresAt: number }>;

  constructor(capacity: number, ttlMs: number) {
    this.capacity = capacity;
    this.ttlMs = ttlMs;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    // Refresh LRU recency
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }
}`;

export const CodeExplainer: React.FC<CodeExplainerProps> = ({
  selectedProvider,
  providerConfig,
  onSaveToHistory,
}) => {
  const [code, setCode] = useState<string>(DEFAULT_SNIPPET);
  const [language, setLanguage] = useState<string>('typescript');
  const [detailLevel, setDetailLevel] = useState<'high-level' | 'in-depth' | 'line-by-line'>('in-depth');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ExplanationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExplain = async () => {
    if (!code.trim()) {
      setErrorMessage('Please provide a source code snippet to explain.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          detailLevel,
          providerConfig: {
            ...providerConfig,
            provider: selectedProvider,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Server responded with status ${res.status}`);
      }

      const data: ExplanationResult = await res.json();
      setResult(data);

      onSaveToHistory(
        `Code Analysis (${language})`,
        code.slice(0, 100),
        data.architectureOverview.slice(0, 140) + '...',
        [language, 'explainer', data.complexity.estimatedTimeComplexity]
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to explain code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Code Input (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-md">
          <div className="px-4 py-2.5 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-xs font-semibold text-zinc-200">Source Code Input</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-zinc-900 border border-zinc-700/80 rounded px-2 py-0.5 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="go">Go</option>
                <option value="sql">SQL</option>
                <option value="rust">Rust</option>
              </select>
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={18}
            placeholder="Paste any function, algorithm, or module code here..."
            className="w-full bg-transparent p-3.5 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-y"
          />
        </div>

        {/* Options & Action */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-xs">
            {(['high-level', 'in-depth', 'line-by-line'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setDetailLevel(level)}
                className={`px-2 py-1 rounded capitalize ${
                  detailLevel === level
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {level.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCode('');
                setResult(null);
              }}
              className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
              title="Clear"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={handleExplain}
              disabled={isLoading || !code.trim()}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current" />
              )}
              <span>Analyze & Explain</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Results View (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        {!result && !isLoading && (
          <div className="h-full min-h-[400px] border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-zinc-950/40">
            <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-indigo-400">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-medium text-zinc-200 mb-1">Architectural Explainer Ready</h3>
            <p className="text-xs text-zinc-500 max-w-md">
              DevLens will evaluate Big-O algorithmic complexity, cyclomatic maintainability scores, modular flow, and OWASP security compliance.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="min-h-[400px] border border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-zinc-950/40 space-y-3">
            <div className="h-10 w-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-xs text-zinc-400 font-mono">Synthesizing architectural breakdown & complexity metrics...</p>
          </div>
        )}

        {result && !isLoading && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Complexity & Quality Meters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Time Complexity</span>
                <span className="text-base font-bold font-mono text-cyan-400">{result.complexity.estimatedTimeComplexity}</span>
              </div>

              <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Space Complexity</span>
                <span className="text-base font-bold font-mono text-indigo-400">{result.complexity.estimatedSpaceComplexity}</span>
              </div>

              <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Cyclomatic Risk</span>
                <span className={`text-xs font-bold font-mono uppercase px-2 py-0.5 rounded border inline-block ${
                  result.complexity.cyclomaticRisk === 'low'
                    ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800'
                    : result.complexity.cyclomaticRisk === 'moderate'
                    ? 'text-amber-400 bg-amber-950/40 border-amber-800'
                    : 'text-rose-400 bg-rose-950/40 border-rose-800'
                }`}>
                  {result.complexity.cyclomaticRisk}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Maintainability</span>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold font-mono text-emerald-400">{result.complexity.maintainabilityScore}/100</span>
                </div>
              </div>
            </div>

            {/* Architecture Overview */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-cyan-400" />
                Architectural Summary
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed">{result.architectureOverview}</p>
            </div>

            {/* Key Components Breakdown */}
            {result.keyComponents && result.keyComponents.length > 0 && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5 text-indigo-400" />
                  Key Functional Components
                </h4>
                <div className="space-y-2.5">
                  {result.keyComponents.map((comp, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs space-y-1">
                      <div className="font-semibold text-white">{comp.name}</div>
                      <div className="text-zinc-400">{comp.purpose}</div>
                      <div className="text-indigo-400/90 text-[11px] font-mono pt-1">
                        <strong>Flow:</strong> {comp.logicFlow}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Audit (if detected) */}
            {result.securityFindings && result.securityFindings.length > 0 && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Security Vulnerability Smell Detected</span>
                </div>
                {result.securityFindings.map((f) => (
                  <div key={f.ruleId} className="p-3 rounded-lg bg-zinc-950 border border-rose-500/20 text-xs">
                    <div className="font-semibold text-rose-300">{f.title} ({f.cwe})</div>
                    <div className="text-zinc-400 mt-1">{f.description}</div>
                    <div className="text-emerald-400 font-mono text-[11px] mt-1">{f.recommendation}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Best Practices */}
            {result.bestPractices && result.bestPractices.length > 0 && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Code Quality Recommendations
                </h4>
                <ul className="space-y-1.5 text-xs text-zinc-400">
                  {result.bestPractices.map((bp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{bp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
