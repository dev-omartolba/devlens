'use client';

import React, { useState } from 'react';
import { Play, RotateCcw, AlertTriangle, ShieldAlert, CheckCircle2, Bug, Sparkles, Clock, FileCode, Layers } from 'lucide-react';
import { AIProvider, DiagnosticResult, ProviderConfig } from '@/lib/ai/types';
import { SAMPLE_PRESETS, SamplePreset } from '@/lib/presets';
import { DiffViewer } from './DiffViewer';

interface DiagnosticStudioProps {
  selectedProvider: AIProvider;
  providerConfig: ProviderConfig;
  onSaveToHistory: (title: string, snippet: string, summary: string, tags: string[]) => void;
}

export const DiagnosticStudio: React.FC<DiagnosticStudioProps> = ({
  selectedProvider,
  providerConfig,
  onSaveToHistory,
}) => {
  const [errorTrace, setErrorTrace] = useState<string>(SAMPLE_PRESETS[0].errorTrace);
  const [code, setCode] = useState<string>(SAMPLE_PRESETS[0].code);
  const [activePreset, setActivePreset] = useState<string>(SAMPLE_PRESETS[0].id);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectPreset = (preset: SamplePreset) => {
    setActivePreset(preset.id);
    setErrorTrace(preset.errorTrace);
    setCode(preset.code);
    setResult(null);
    setErrorMessage(null);
  };

  const handleRunDiagnostic = async () => {
    if (!errorTrace.trim()) {
      setErrorMessage('Please provide an error stack trace or compiler diagnostic message.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorTrace,
          code,
          providerConfig: {
            ...providerConfig,
            provider: selectedProvider,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data: DiagnosticResult = await res.json();
      setResult(data);

      onSaveToHistory(
        data.parsedTrace.errorType || 'Error Diagnosis',
        code.slice(0, 100),
        data.explanation.summary,
        [data.parsedTrace.language, data.parsedTrace.category]
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete diagnostic analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setErrorTrace('');
    setCode('');
    setResult(null);
    setErrorMessage(null);
    setActivePreset('');
  };

  return (
    <div className="space-y-6">
      {/* Preset Scenario Selector */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            Quick Presets / Real-World Scenarios
          </span>
          <span className="text-[11px] text-zinc-500">Click any preset to prefill inputs</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all text-left flex items-center gap-1.5 ${
                activePreset === preset.id
                  ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 font-medium'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Error Trace Input */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-md">
            <div className="px-4 py-2.5 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <Bug className="h-3.5 w-3.5 text-rose-400" />
                Error Stack Trace / Compiler Output
              </label>
              <span className="text-[10px] text-rose-400/80 font-mono">Required</span>
            </div>
            <textarea
              value={errorTrace}
              onChange={(e) => setErrorTrace(e.target.value)}
              placeholder="Paste stack trace, TypeScript compilation error, or runtime panic here..."
              rows={7}
              className="w-full bg-transparent p-3.5 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-y"
            />
          </div>

          {/* Code Snippet Input */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-md">
            <div className="px-4 py-2.5 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <FileCode className="h-3.5 w-3.5 text-indigo-400" />
                Target Source Code Snippet
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">Optional for auto-patch</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste the relevant function or module code here..."
              rows={11}
              className="w-full bg-transparent p-3.5 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-y"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRunDiagnostic}
              disabled={isLoading || !errorTrace.trim()}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:opacity-50 text-white font-medium text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Diagnosis...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Diagnose & Generate Patch</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Reset fields"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Right Column: Diagnostic Intelligence Results (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {!result && !isLoading && (
            <div className="h-full min-h-[400px] border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-zinc-950/40">
              <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-cyan-400">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-medium text-zinc-200 mb-1">Diagnostic Workbench Ready</h3>
              <p className="text-xs text-zinc-500 max-w-md mb-4">
                Select a preset scenario above or paste your error trace. DevLens will parse the AST, identify root causes, detect security smells, and synthesize a unified git patch.
              </p>
              <button
                onClick={handleRunDiagnostic}
                className="text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 border border-cyan-800/60 px-3.5 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5"
              >
                <Play className="h-3 w-3 fill-current" />
                Run Current Preset
              </button>
            </div>
          )}

          {isLoading && (
            <div className="min-h-[400px] border border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-zinc-950/40 space-y-3">
              <div className="h-10 w-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-xs text-zinc-400 font-mono">Parsing call frames & evaluating diagnostic rules...</p>
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Status Header Badge */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 shadow-md flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded font-semibold">
                      {result.parsedTrace.errorType}
                    </span>
                    <span className="text-[11px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded">
                      {result.parsedTrace.language}
                    </span>
                    <span className="text-[11px] font-mono uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded">
                      {result.parsedTrace.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">{result.explanation.summary}</h3>
                </div>

                <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                  <div className="flex items-center gap-1 text-zinc-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{result.latencyMs}ms</span>
                  </div>
                  <div className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300">
                    Engine: <strong className="text-cyan-400 uppercase">{result.providerUsed}</strong>
                  </div>
                </div>
              </div>

              {/* Root Cause & Impact */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Bug className="h-3.5 w-3.5 text-rose-400" />
                    Root Cause Analysis
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">{result.explanation.rootCause}</p>
                </div>

                <div className="pt-2 border-t border-zinc-800/80">
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Runtime Consequences
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{result.explanation.consequences}</p>
                </div>
              </div>

              {/* Security Findings (if any) */}
              {result.securityFindings && result.securityFindings.length > 0 && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Security Vulnerability Smell Detected ({result.securityFindings.length})</span>
                  </div>
                  {result.securityFindings.map((finding) => (
                    <div key={finding.ruleId} className="p-3 rounded-lg bg-zinc-950/80 border border-rose-500/20 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-rose-300">{finding.title}</span>
                        <span className="font-mono text-[10px] text-rose-400 uppercase bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/30">
                          {finding.severity} • {finding.cwe}
                        </span>
                      </div>
                      <p className="text-zinc-400">{finding.description}</p>
                      <p className="text-emerald-400 font-mono text-[11px] pt-1">
                        <strong>Remediation:</strong> {finding.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Preventative Tips */}
              {result.explanation.preventativeTips && result.explanation.preventativeTips.length > 0 && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Engineering Best Practices & Preventative Actions
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-400">
                    {result.explanation.preventativeTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Patch & Diff Viewer */}
              {result.suggestedFix && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                      Suggested Code Patch
                    </h4>
                    <span className="text-xs text-zinc-400 font-sans">{result.suggestedFix.description}</span>
                  </div>

                  <DiffViewer
                    unifiedDiff={result.suggestedFix.unifiedDiff}
                    patchedCode={result.suggestedFix.patchedCode}
                    fileName={result.parsedTrace.primaryLocation?.fileName || 'snippet.ts'}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
