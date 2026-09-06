import React from 'react';
import type { Match } from '../types/match';

interface MatchResultCardProps {
  match: Match;
}

export const MatchResultCard: React.FC<MatchResultCardProps> = ({ match }) => {
  const result = match.result;

  const renderResultText = () => {
    if (!result) {
      return 'Match has ended.';
    }

    if (result.type === 'CHASE') {
      return (
        <div>
          <div className="text-2xl font-black text-black">
            {result.winner} Won
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-600">
            {result.winner} chased the target successfully.
          </p>
        </div>
      );
    }

    if (result.type === 'RUNS') {
      return (
        <div>
          <div className="text-2xl font-black text-black">
            {result.winner} Won
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-600">
            {result.winner} won by {result.margin} run{result.margin === 1 ? '' : 's'}.
          </p>
        </div>
      );
    }

    if (result.type === 'TIE') {
      return (
        <div>
          <div className="text-2xl font-black text-black">
            Match Tied
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-600">
            Both teams finished level on {match.innings_1.score} runs.
          </p>
        </div>
      );
    }

    return (
      <div className="text-xl font-black text-black">
        {result.winner ? `${result.winner} Won` : 'Match Completed'}
      </div>
    );
  };

  return (
    <div className="rounded-2xl border-2 border-black bg-white p-5 text-center shadow-[3px_3px_0px_#000]">
      <span className="inline-block rounded-full border border-black bg-[#d7f0db] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black mb-2">
        Final Result
      </span>

      {renderResultText()}

      {/* Innings score breakdown */}
      <div className="mt-4 grid grid-cols-2 gap-2 max-w-sm mx-auto">
        <div className="rounded-xl border border-black bg-slate-50 p-2.5">
          <div className="text-[11px] text-slate-500 font-bold">{match.team_1}</div>
          <div className="text-xl font-black text-black mt-0.5">
            {match.innings_1.score}
            <span className="text-slate-400 text-base font-normal"> / {match.innings_1.wickets}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {match.innings_1.overs} overs
          </div>
        </div>

        <div className="rounded-xl border border-black bg-slate-50 p-2.5">
          <div className="text-[11px] text-slate-500 font-bold">{match.team_2}</div>
          <div className="text-xl font-black text-black mt-0.5">
            {match.innings_2.score}
            <span className="text-slate-400 text-base font-normal"> / {match.innings_2.wickets}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {match.innings_2.overs} overs
          </div>
        </div>
      </div>
    </div>
  );
};
