import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { initialBattles } from './data/mockBattles';
import { executeBattle } from './services/aiBattleEngine';
import Sidebar from './components/Sidebar';
import ArenaHeader from './components/ArenaHeader';
import RoundCard from './components/RoundCard';
import PromptInputArea from './components/PromptInputArea';
import JsonModal from './components/JsonModal';
import SettingsModal from './components/SettingsModal';
import { Sparkles, Swords, RefreshCw, MessageSquarePlus } from 'lucide-react';
import './App.css';

const LOCAL_STORAGE_KEY = 'synapse_ai_battles_v2';

export default function App() {
  const [battles, setBattles] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Failed to load battles from localStorage:", e);
    }
    return initialBattles;
  });

  const [currentBattleId, setCurrentBattleId] = useState(() => {
    return battles[0]?.id || 'battle-1042';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [activeJsonModal, setActiveJsonModal] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const mainScrollRef = useRef(null);

  // Synchronize battles with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(battles));
    } catch (e) {
      console.warn("Failed to save battles to localStorage:", e);
    }
  }, [battles]);

  const currentBattle = battles.find((b) => b.id === currentBattleId) || battles[0];

  const fireVictoryConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#a855f7', '#10b981', '#f4f4f5']
      });
    } catch (e) {
      // Ignored
    }
  };

  // Submit a problem message in the battle thread
  const handleSendMessage = async (problemText) => {
    if (!problemText || isEvaluating) return;

    setIsEvaluating(true);

    try {
      const battleResult = await executeBattle(problemText);

      const nextRoundNumber = (currentBattle?.rounds?.length || 0) + 1;
      const score1 = battleResult.judge_response?.solution_1_score ?? 9.0;
      const score2 = battleResult.judge_response?.solution_2_score ?? 8.5;
      const winner = score1 > score2 ? 'solution_1' : score2 > score1 ? 'solution_2' : 'tie';

      const newRound = {
        roundNumber: nextRoundNumber,
        title: problemText.length > 30 ? problemText.slice(0, 30) + '...' : problemText,
        data: battleResult, // Strictly { problem, solution_1, solution_2, judge_response }
        telemetry: {
          winner
        }
      };

      setBattles((prevBattles) =>
        prevBattles.map((b) => {
          if (b.id === currentBattleId) {
            return {
              ...b,
              rounds: [...(b.rounds || []), newRound]
            };
          }
          return b;
        })
      );

      fireVictoryConfetti();

      // Scroll to new round smoothly
      setTimeout(() => {
        if (mainScrollRef.current) {
          mainScrollRef.current.scrollTo({
            top: mainScrollRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 150);
    } catch (err) {
      console.error("Battle execution error:", err);
      alert("Failed to evaluate battle. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNewBattle = () => {
    const newId = `battle-${Date.now().toString().slice(-4)}`;
    const newMatch = {
      id: newId,
      title: `Battle #${newId.replace('battle-', '')}`,
      model1: {
        id: 'gemini-1.5-pro',
        name: 'Model A',
        version: 'Gemini 1.5 Pro'
      },
      model2: {
        id: 'claude-3.5-sonnet',
        name: 'Model B',
        version: 'Claude 3.5 Sonnet'
      },
      judge: {
        name: 'Arbiter AI'
      },
      rounds: []
    };

    setBattles((prev) => [newMatch, ...prev]);
    setCurrentBattleId(newId);
  };

  const handleResetBattles = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setBattles(initialBattles);
    setCurrentBattleId(initialBattles[0].id);
  };

  const handleExportFullMatchJson = () => {
    const exportData = {
      match_id: currentBattle?.id,
      title: currentBattle?.title,
      messages: currentBattle?.rounds?.map((r) => r.data) || []
    };
    setActiveJsonModal({
      isOpen: true,
      title: `Match Data JSON (${currentBattle?.title})`,
      data: exportData
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 antialiased font-sans">
      {/* 1. Sidebar */}
      <Sidebar
        battles={battles}
        currentBattleId={currentBattleId}
        onSelectBattle={setCurrentBattleId}
        onNewBattle={handleNewBattle}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExportJson={handleExportFullMatchJson}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(false)}
      />

      {/* 2. Main Content Workspace */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-zinc-950">
        {/* Top Header */}
        <ArenaHeader
          battleTitle={currentBattle?.title}
          roundNumber={currentBattle?.rounds?.length || 1}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          onExportJson={handleExportFullMatchJson}
          onNewBattle={handleNewBattle}
        />

        {/* Scrollable Center Feed */}
        <main
          ref={mainScrollRef}
          className="flex-1 overflow-y-auto custom-scroll px-4 sm:px-6 py-6 pb-24"
        >
          <div className="max-w-5xl mx-auto w-full flex flex-col gap-6">
            {/* Empty State Banner if no rounds yet */}
            {(!currentBattle?.rounds || currentBattle.rounds.length === 0) && (
              <div className="p-10 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-center flex flex-col items-center justify-center gap-3 my-8">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-300">
                  <Swords className="w-6 h-6" />
                </div>
                <h2 className="text-base font-semibold text-zinc-100">
                  Enter a problem to start the battle
                </h2>
                <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
                  Enter any coding problem, algorithmic challenge, or reasoning question. Model A and Model B will both generate solutions, and Judge AI will score them and give feedback.
                </p>
              </div>
            )}

            {/* List of all rounds in this battle (Supports Multiple Messages) */}
            {currentBattle?.rounds?.map((round, idx) => {
              const isLatest = idx === currentBattle.rounds.length - 1;
              return (
                <RoundCard
                  key={`round-${round.roundNumber}-${idx}`}
                  round={round}
                  roundIndex={idx}
                  isLatest={isLatest}
                  model1={currentBattle.model1}
                  model2={currentBattle.model2}
                  judge={currentBattle.judge}
                  onViewJson={(data) => {
                    setActiveJsonModal({
                      isOpen: true,
                      title: `Round ${round.roundNumber} JSON Data`,
                      data
                    });
                  }}
                />
              );
            })}

            {/* Loading Indicator while evaluating */}
            {isEvaluating && (
              <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-center gap-3 text-xs text-zinc-400 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Model A and Model B are generating solutions and Judge AI is reviewing...</span>
              </div>
            )}

            {/* Bottom Input Area */}
            <PromptInputArea
              onSendMessage={handleSendMessage}
              isEvaluating={isEvaluating}
              roundNumber={(currentBattle?.rounds?.length || 0) + 1}
            />
          </div>
        </main>
      </div>

      {/* JSON Viewer / Export Modal */}
      <JsonModal
        isOpen={Boolean(activeJsonModal?.isOpen)}
        onClose={() => setActiveJsonModal(null)}
        title={activeJsonModal?.title || "Battle JSON"}
        data={activeJsonModal?.data}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetBattles={handleResetBattles}
      />
    </div>
  );
}
