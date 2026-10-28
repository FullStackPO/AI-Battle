import React, { useState, useRef } from 'react';
import { ArrowUp, Sparkles, RefreshCw } from 'lucide-react';
import { sampleChallengePrompts } from '../data/mockBattles';

export default function PromptInputArea({
  onSendMessage,
  isEvaluating,
  roundNumber
}) {
  const [problemText, setProblemText] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!problemText.trim() || isEvaluating) return;
    onSendMessage(problemText.trim());
    setProblemText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectPreset = (preset) => {
    setProblemText(preset.prompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="w-full flex flex-col gap-2.5 pt-2">
      {/* Quick Suggestion Pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] text-zinc-500 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          Try:
        </span>
        {sampleChallengePrompts.slice(0, 4).map((p) => (
          <button
            key={p.title}
            type="button"
            onClick={() => handleSelectPreset(p)}
            className="px-2.5 py-1 rounded-full text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="relative rounded-2xl bg-zinc-900 border border-zinc-800 focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700 transition-all p-3 shadow-lg">
        <textarea
          ref={textareaRef}
          rows={2}
          value={problemText}
          onChange={(e) => setProblemText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isEvaluating}
          placeholder={
            roundNumber > 1
              ? "Ask a follow-up or challenge the models with a new problem..."
              : "Enter a problem for Model A and Model B to solve..."
          }
          className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none resize-none disabled:opacity-50 pr-12 font-sans"
        />

        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 mt-1">
          <span className="text-[11px] text-zinc-500">
            Shift + Enter for new line • Enter to send
          </span>

          <button
            type="submit"
            disabled={!problemText.trim() || isEvaluating}
            className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
              !problemText.trim() || isEvaluating
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-zinc-100 hover:bg-white text-zinc-950 active:scale-95 shadow-sm'
            }`}
            title="Send problem"
          >
            {isEvaluating ? (
              <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
