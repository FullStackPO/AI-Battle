import React, { useState, useEffect } from 'react';
import { X, Key, Save, Check, Trash2, Settings } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, onResetBattles }) {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('synapse_gemini_api_key') || '';
    setApiKey(key);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('synapse_gemini_api_key', apiKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-md rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-900">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-zinc-300" />
            <h3 className="text-sm font-semibold text-zinc-100">Settings</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4 text-xs">
          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 leading-relaxed">
            <span className="text-zinc-200 font-medium block mb-0.5">Offline Simulation Active</span>
            The app runs dual model battles automatically with realistic scoring and feedback. You can optionally enter a Gemini API key below for live external model responses.
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-300 font-medium flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-zinc-400" />
              Gemini API Key (Optional)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono text-xs"
            />
          </div>

          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
            <div>
              <div className="text-zinc-300 font-medium">Reset Data</div>
              <div className="text-[11px] text-zinc-500">Restore default sample battles</div>
            </div>
            <button
              onClick={() => {
                if (window.confirm("Reset all battles back to defaults?")) {
                  onResetBattles();
                  onClose();
                }
              }}
              className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saved ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
