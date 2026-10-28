import React from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Code2, 
  Settings, 
  PanelLeftClose, 
  Sparkles,
  Trophy
} from 'lucide-react';

export default function Sidebar({
  battles,
  currentBattleId,
  onSelectBattle,
  onNewBattle,
  onOpenSettings,
  onExportJson,
  isOpen,
  onToggle
}) {
  if (!isOpen) return null;

  return (
    <aside className="w-64 h-screen flex-shrink-0 flex flex-col justify-between border-r border-zinc-800/80 bg-zinc-950 text-zinc-300 z-40 select-none">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="font-semibold text-sm text-zinc-100 tracking-tight">
              AI Battle
            </span>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* New Battle Button */}
        <div className="p-3">
          <button
            onClick={onNewBattle}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs transition-all active:scale-[0.98] cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Battle</span>
          </button>
        </div>

        {/* Battle List */}
        <div className="flex-1 overflow-y-auto custom-scroll px-3 py-1 flex flex-col gap-1">
          <span className="px-2 py-1 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
            Recent Battles
          </span>

          {battles.map((battle) => {
            const isActive = battle.id === currentBattleId;
            const roundCount = battle.rounds?.length || 0;
            const latestRound = battle.rounds?.[battle.rounds.length - 1];
            const s1 = latestRound?.data?.judge_response?.solution_1_score;
            const s2 = latestRound?.data?.judge_response?.solution_2_score;

            return (
              <button
                key={battle.id}
                onClick={() => onSelectBattle(battle.id)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800/80 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <MessageSquare className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                <div className="flex-1 truncate">
                  <div className="truncate text-xs">
                    {battle.title || 'Untitled Battle'}
                  </div>
                  <div className="text-[10px] text-zinc-500 flex items-center gap-2 mt-0.5">
                    <span>{roundCount} {roundCount === 1 ? 'round' : 'rounds'}</span>
                    {s1 !== undefined && s2 !== undefined && (
                      <span className="text-zinc-400">
                        {s1} vs {s2} pts
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-zinc-800/80 flex flex-col gap-1">
        <button
          onClick={onExportJson}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors cursor-pointer"
        >
          <Code2 className="w-4 h-4 text-zinc-400" />
          <span>Export Schema JSON</span>
        </button>
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4 text-zinc-400" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
