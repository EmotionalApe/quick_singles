import React, { useState } from 'react';
import type { Match } from '../types/match';

interface InningsBreakCardProps {
  match: Match;
  onStartSecondInnings: () => Promise<void>;
}

export const InningsBreakCard: React.FC<InningsBreakCardProps> = ({
  match,
  onStartSecondInnings,
}) => {
  const [isStarting, setIsStarting] = useState(false);
  const target = match.innings_1.score + 1;

  const handleStart = async () => {
    try {
      setIsStarting(true);
      await onStartSecondInnings();
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-black bg-white p-5 text-center shadow-[3px_3px_0px_#000]">
      <div className="inline-block rounded-full border border-black bg-[#ffd260] px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-black mb-2">
        Innings Break
      </div>

      <h3 className="text-xl font-black text-black">
        1st Innings Complete
      </h3>

      <div className="my-3 rounded-xl border border-black bg-slate-50 p-3 max-w-xs mx-auto">
        <div className="text-xs font-bold text-slate-500">
          {match.team_1} scored
        </div>
        <div className="text-2xl font-black text-black mt-0.5">
          {match.innings_1.score}
          <span className="text-slate-400 font-light text-xl"> / {match.innings_1.wickets}</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          in {match.innings_1.overs} overs
        </div>
      </div>

      <div className="text-sm font-black text-black">
        {match.team_2} needs <span className="underline decoration-2 font-black">{target} runs</span> to win
      </div>

      <div className="mt-4">
        {match.viewer_role === 'SCORER' ? (
          <button
            type="button"
            disabled={isStarting}
            onClick={handleStart}
            className="rounded-xl border-2 border-black bg-[#ffd260] px-5 py-2.5 text-xs font-black text-black shadow-[2.5px_2.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#ffca40] transition-all disabled:opacity-50"
          >
            {isStarting ? 'Starting...' : 'Start Second Innings'}
          </button>
        ) : (
          <div className="rounded-xl border border-black bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 inline-block">
            Waiting for second innings to start...
          </div>
        )}
      </div>
    </div>
  );
};
