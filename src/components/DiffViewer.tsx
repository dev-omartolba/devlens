'use client';

import React, { useState } from 'react';
import { Copy, Check, Download, GitCommit } from 'lucide-react';

interface DiffViewerProps {
  unifiedDiff: string;
  patchedCode?: string;
  fileName?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  unifiedDiff,
  patchedCode,
  fileName = 'patch.diff',
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!unifiedDiff || unifiedDiff.trim().length === 0) {
    return (
      <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 text-zinc-400 text-xs text-center font-mono">
        No modifications needed — code already complies with diagnostic safety rules.
      </div>
    );
  }

  const handleCopyDiff = () => {
    navigator.clipboard.writeText(unifiedDiff);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    if (patchedCode) {
      navigator.clipboard.writeText(patchedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleDownloadPatch = () => {
    const blob = new Blob([unifiedDiff], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.endsWith('.diff') || fileName.endsWith('.patch') ? fileName : `${fileName}.patch`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const lines = unifiedDiff.split('\n');

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
      {/* Diff Toolbar */}
      <div className="px-4 py-2 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-zinc-300 font-mono">
          <GitCommit className="h-3.5 w-3.5 text-cyan-400" />
          <span>Unified Git Patch</span>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-400">{fileName}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {patchedCode && (
            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors flex items-center gap-1"
              title="Copy patched code snippet"
            >
              {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copiedCode ? 'Copied Full Code' : 'Copy Full Code'}</span>
            </button>
          )}

          <button
            onClick={handleCopyDiff}
            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors flex items-center gap-1"
            title="Copy Unified Diff"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? 'Copied Patch' : 'Copy Patch'}</span>
          </button>

          <button
            onClick={handleDownloadPatch}
            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
            title="Download .patch file"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Diff Content Viewer */}
      <div className="p-3 font-mono text-[13px] leading-relaxed overflow-x-auto max-h-[460px] select-text">
        {lines.map((line, idx) => {
          let lineClass = 'text-zinc-400';
          let bgClass = 'hover:bg-zinc-900/50';

          if (line.startsWith('+++') || line.startsWith('---')) {
            lineClass = 'text-zinc-500 font-bold';
            bgClass = 'bg-zinc-900/40';
          } else if (line.startsWith('@@')) {
            lineClass = 'text-cyan-400 bg-cyan-950/20 font-semibold';
            bgClass = 'bg-cyan-950/20';
          } else if (line.startsWith('+')) {
            lineClass = 'text-emerald-400';
            bgClass = 'bg-emerald-950/30';
          } else if (line.startsWith('-')) {
            lineClass = 'text-rose-400';
            bgClass = 'bg-rose-950/30';
          }

          return (
            <div key={idx} className={`flex px-2 py-0.5 rounded-sm ${bgClass} transition-colors`}>
              <span className="w-8 select-none text-zinc-600 text-right pr-3 text-xs">{idx + 1}</span>
              <span className={`flex-1 font-mono whitespace-pre ${lineClass}`}>{line || ' '}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
