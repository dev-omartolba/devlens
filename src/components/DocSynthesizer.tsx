'use client';

import React, { useState } from 'react';
import { BookOpen, Copy, Check, Download, Play, FileText, Sparkles } from 'lucide-react';
import { AIProvider, DocumentationResult, ProviderConfig } from '@/lib/ai/types';

interface DocSynthesizerProps {
  selectedProvider: AIProvider;
  providerConfig: ProviderConfig;
  onSaveToHistory: (title: string, snippet: string, summary: string, tags: string[]) => void;
}

const DEFAULT_DOC_SNIPPET = `export async function synchronizeUserData(
  userId: string,
  options?: { forceRefresh?: boolean; timeoutMs?: number }
) {
  const timeout = options?.timeoutMs ?? 5000;
  const isStale = options?.forceRefresh ?? false;

  const cached = await localCache.get(userId);
  if (cached && !isStale) {
    return cached;
  }

  const response = await fetchRemoteUser(userId, { timeout });
  await localCache.set(userId, response);
  return response;
}`;

export const DocSynthesizer: React.FC<DocSynthesizerProps> = ({
  selectedProvider,
  providerConfig,
  onSaveToHistory,
}) => {
  const [code, setCode] = useState<string>(DEFAULT_DOC_SNIPPET);
  const [language, setLanguage] = useState<string>('typescript');
  const [format, setFormat] = useState<'tsdoc' | 'jsdoc' | 'python-docstring' | 'markdown-spec'>('tsdoc');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DocumentationResult | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedMd, setCopiedMd] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!code.trim()) {
      setErrorMessage('Please provide code to document.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          format,
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

      const data: DocumentationResult = await res.json();
      setResult(data);

      onSaveToHistory(
        `Documentation (${format})`,
        code.slice(0, 100),
        `Generated ${format} documentation comments and API spec`,
        [language, 'docs', format]
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to synthesize documentation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (result) {
      navigator.clipboard.writeText(result.documentedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!result) return;
    const blob = new Blob([result.markdownDoc], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'API_DOCUMENTATION.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Input Pane (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-md">
          <div className="px-4 py-2.5 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-xs font-semibold text-zinc-200">Source Code</span>
            </div>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-zinc-900 border border-zinc-700/80 rounded px-2 py-0.5 text-xs text-zinc-200 focus:outline-none"
            >
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="go">Go</option>
            </select>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={16}
            placeholder="Paste functions, types, or interfaces to document..."
            className="w-full bg-transparent p-3.5 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-y"
          />
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-zinc-400 block">Documentation Format Standard</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['tsdoc', 'jsdoc', 'python-docstring', 'markdown-spec'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border text-center font-mono capitalize transition-all ${
                  format === fmt
                    ? 'bg-purple-500/15 border-purple-500/40 text-purple-300 font-semibold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {fmt.replace('-', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !code.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            <span>Synthesize Documentation</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Right Output Pane (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        {!result && !isLoading && (
          <div className="h-full min-h-[400px] border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-zinc-950/40">
            <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-purple-400">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-medium text-zinc-200 mb-1">Documentation Studio Ready</h3>
            <p className="text-xs text-zinc-500 max-w-md">
              Generates production-grade TSDoc/JSDoc tags, param types, throw definitions, and exportable Markdown documentation.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="min-h-[400px] border border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-zinc-950/40 space-y-3">
            <div className="h-10 w-10 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-xs text-zinc-400 font-mono">Synthesizing docstrings and API contracts...</p>
          </div>
        )}

        {result && !isLoading && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Documented Code Card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
              <div className="px-4 py-2 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-purple-400" />
                  Documented Code Output
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors flex items-center gap-1"
                >
                  {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="p-4 text-xs font-mono text-zinc-200 overflow-x-auto max-h-[380px] leading-relaxed bg-zinc-950">
                {result.documentedCode}
              </pre>
            </div>

            {/* Markdown Spec Card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
              <div className="px-4 py-2 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                  Markdown API Spec
                </span>
                <button
                  onClick={handleDownloadMarkdown}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  <span>Download .md</span>
                </button>
              </div>

              <div className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto max-h-[200px] leading-relaxed whitespace-pre-wrap">
                {result.markdownDoc}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
