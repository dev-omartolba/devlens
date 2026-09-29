'use client';

import React, { useState } from 'react';
import { X, Trash2, Download, Search, History, Clock, FileCode } from 'lucide-react';
import { HistoryItem } from '@/lib/ai/types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onClear: () => void;
  onRemoveItem: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onClear,
  onRemoveItem,
}) => {
  const [search, setSearch] = useState<string>('');

  if (!isOpen) return null;

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.snippet.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `devlens_audit_history_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Analysis History ({items.length})</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Search & Actions Bar */}
      <div className="p-3 border-b border-zinc-800/80 space-y-2">
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search diagnostics by tag or snippet..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <button
            onClick={handleExportJSON}
            disabled={items.length === 0}
            className="text-zinc-400 hover:text-white flex items-center gap-1 disabled:opacity-40"
          >
            <Download className="h-3 w-3" />
            <span>Export Audit Log</span>
          </button>

          <button
            onClick={onClear}
            disabled={items.length === 0}
            className="text-rose-400 hover:text-rose-300 flex items-center gap-1 disabled:opacity-40"
          >
            <Trash2 className="h-3 w-3" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">
            No diagnostic sessions found.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700 space-y-1.5 transition-all text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-200">{item.title}</span>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="text-zinc-500 hover:text-rose-400 p-0.5 rounded"
                  title="Remove item"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>

              <p className="text-zinc-400 text-[11px] line-clamp-2">{item.resultSummary}</p>

              <div className="flex flex-wrap gap-1 pt-1">
                {item.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="text-[10px] text-zinc-500 pt-1 flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                <span>{new Date(item.timestamp).toLocaleTimeString()} • {new Date(item.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
