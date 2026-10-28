import React, { useState } from 'react';
import { PanelLeft, Plus, Share2, Code2, Check, Sparkles } from 'lucide-react';

export default function ArenaHeader({
  battleTitle,
  roundNumber,
  isSidebarOpen,
  onToggleSidebar,
  onExportJson,
  onNewBattle
}) {
  const [copiedShare, setCopiedShare] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full px-4 sm:px-6 py-3 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {!isSidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
            title="Open sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <h1 className="text-sm sm:text-base font-semibold text-zinc-100 tracking-tight truncate max-w-[200px] sm:max-w-md">
            {battleTitle || 'AI Battle Arena'}
          </h1>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-900 border border-zinc-800 text-zinc-400">
            {roundNumber} {roundNumber === 1 ? 'Round' : 'Rounds'}
          </span>
        </div>
      </div>

      {/* Model comparison pill and Actions */}
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5 font-medium text-indigo-400">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            Model A
          </span>
          <span className="text-zinc-600">vs</span>
          <span className="flex items-center gap-1.5 font-medium text-purple-400">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            Model B
          </span>
        </div>

        <button
          onClick={handleShare}
          className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800/80 transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Share link"
        >
          {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copiedShare ? 'Copied' : 'Share'}</span>
        </button>

        <button
          onClick={onExportJson}
          className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800/80 transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Export Schema JSON"
        >
          <Code2 className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">JSON</span>
        </button>

        <button
          onClick={onNewBattle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>
    </header>
  );
}
