
import React, { useState } from 'react';
import { Grid, AIResponse } from '../types.ts';
import { getAIHint } from '../services/geminiService.ts';

interface AIHintPanelProps {
  grid: Grid;
  score: number;
  onApplyHint: (dir: string) => void;
}

const AIHintPanel: React.FC<AIHintPanelProps> = ({ grid, score, onApplyHint }) => {
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<AIResponse | null>(null);

  const fetchHint = async () => {
    setLoading(true);
    setHint(null);
    try {
      const result = await getAIHint(grid, score);
      setHint(result);
    } catch (err) {
      console.error(err);
      alert("Error fetching hint. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-100 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Gemini Strategist</h2>
        </div>
        <button
          onClick={fetchHint}
          disabled={loading}
          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
            loading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
        >
          {loading ? 'Thinking...' : 'Get Hint'}
        </button>
      </div>

      {hint && (
        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 mb-2">
             <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Recommended Move:</span>
             <span className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold text-sm">{hint.recommendedMove}</span>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed italic">
            "{hint.reasoning}"
          </p>
          <button 
            onClick={() => onApplyHint(hint.recommendedMove)}
            className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors"
          >
            Apply This Move
          </button>
        </div>
      )}

      {!hint && !loading && (
        <p className="text-slate-400 text-sm text-center italic py-2">
          Stuck? Ask Gemini for the optimal next move.
        </p>
      )}
    </div>
  );
};

export default AIHintPanel;
