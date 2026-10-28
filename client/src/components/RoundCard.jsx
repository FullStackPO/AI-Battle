import React, { useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { 
  Copy, 
  Check, 
  Trophy, 
  Scale, 
  Code2, 
  User, 
  Bot, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function RoundCard({
  round,
  roundIndex,
  isLatest,
  model1,
  model2,
  judge,
  onViewJson
}) {
  const [copiedAlpha, setCopiedAlpha] = useState(false);
  const [copiedBeta, setCopiedBeta] = useState(false);

  const data = round.data;
  const score1 = data.judge_response?.solution_1_score ?? 0;
  const score2 = data.judge_response?.solution_2_score ?? 0;
  const winner = score1 > score2 ? 'model1' : score2 > score1 ? 'model2' : 'tie';

  const handleCopyAlpha = () => {
    navigator.clipboard.writeText(data.solution_1);
    setCopiedAlpha(true);
    setTimeout(() => setCopiedAlpha(false), 2000);
  };

  const handleCopyBeta = () => {
    navigator.clipboard.writeText(data.solution_2);
    setCopiedBeta(true);
    setTimeout(() => setCopiedBeta(false), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-5 py-4 border-b border-zinc-800/60 last:border-0">
      {/* Round Index Marker */}
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
          Round {round.roundNumber}
        </span>
        <div className="h-px flex-1 bg-zinc-800/60" />
      </div>

      {/* 1. User Prompt Bubble */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 text-zinc-300">
          <User className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-medium text-zinc-400 mb-1">
            You asked
          </div>
          <p className="text-sm text-zinc-100 font-sans leading-relaxed whitespace-pre-wrap">
            {data.problem}
          </p>
        </div>
      </div>

      {/* 2. Side-by-Side Model Responses (Clean Desktop Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Model A Card */}
        <div className={`flex flex-col rounded-xl border bg-zinc-900/40 overflow-hidden ${
          winner === 'model1' ? 'border-indigo-500/50 ring-1 ring-indigo-500/20' : 'border-zinc-800'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
              <span className="text-xs font-semibold text-zinc-200">
                {model1?.name || "Model A"}
              </span>
              <span className="text-[11px] text-zinc-500 font-normal">
                ({model1?.version || "Gemini 1.5 Pro"})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {winner === 'model1' && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Trophy className="w-3 h-3" />
                  Winner
                </span>
              )}
              <button
                onClick={handleCopyAlpha}
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer text-xs flex items-center gap-1"
                title="Copy solution"
              >
                {copiedAlpha ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{copiedAlpha ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Solution Markdown */}
          <div className="p-4 overflow-x-auto custom-scroll text-sm flex-1">
            <MarkdownRenderer content={data.solution_1} />
          </div>
        </div>

        {/* Model B Card */}
        <div className={`flex flex-col rounded-xl border bg-zinc-900/40 overflow-hidden ${
          winner === 'model2' ? 'border-purple-500/50 ring-1 ring-purple-500/20' : 'border-zinc-800'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <span className="text-xs font-semibold text-zinc-200">
                {model2?.name || "Model B"}
              </span>
              <span className="text-[11px] text-zinc-500 font-normal">
                ({model2?.version || "Claude 3.5 Sonnet"})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {winner === 'model2' && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Trophy className="w-3 h-3" />
                  Winner
                </span>
              )}
              <button
                onClick={handleCopyBeta}
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer text-xs flex items-center gap-1"
                title="Copy solution"
              >
                {copiedBeta ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{copiedBeta ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Solution Markdown */}
          <div className="p-4 overflow-x-auto custom-scroll text-sm flex-1">
            <MarkdownRenderer content={data.solution_2} />
          </div>
        </div>
      </div>

      {/* 3. Friendly Judge AI Verdict Card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 flex flex-col gap-4">
        {/* Verdict Top Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-zinc-200 block">
                Judge AI Verdict
              </span>
              <span className="text-[11px] text-zinc-500">
                Automated Arbiter Evaluation
              </span>
            </div>
          </div>

          {/* Winner Badge */}
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
              winner === 'model1'
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                : winner === 'model2'
                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
            }`}>
              <Trophy className="w-3.5 h-3.5" />
              <span>
                {winner === 'model1' ? 'Model A is the Winner' : winner === 'model2' ? 'Model B is the Winner' : 'Tied Result'}
              </span>
            </div>

            <button
              onClick={() => onViewJson(data)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="View Raw JSON Schema"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="text-[11px]">JSON</span>
            </button>
          </div>
        </div>

        {/* Score Meters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Model A Score */}
          <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span className="text-xs text-zinc-300 font-medium">Model A Score</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-indigo-400">{score1}</span>
              <span className="text-xs text-zinc-500">/ 10</span>
            </div>
          </div>

          {/* Model B Score */}
          <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="text-xs text-zinc-300 font-medium">Model B Score</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-purple-400">{score2}</span>
              <span className="text-xs text-zinc-500">/ 10</span>
            </div>
          </div>
        </div>

        {/* Plain-English Feedback Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Feedback Model A */}
          <div className="p-3.5 rounded-lg bg-zinc-950/40 border border-zinc-800/60 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-indigo-400">
              <span>Feedback for Model A</span>
              <span className="text-zinc-500">{score1}/10</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {data.judge_response?.solution_1_feedback}
            </p>
          </div>

          {/* Feedback Model B */}
          <div className="p-3.5 rounded-lg bg-zinc-950/40 border border-zinc-800/60 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-purple-400">
              <span>Feedback for Model B</span>
              <span className="text-zinc-500">{score2}/10</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {data.judge_response?.solution_2_feedback}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
