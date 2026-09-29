import React from 'react';
import type { MatchHistoryCardProps } from '../types/match';
import { Link } from 'react-router-dom';

export const MatchHistoryCard: React.FC<MatchHistoryCardProps> = ({ match }) => {
  const inningsOne = `${match.innings_1.score}/${match.innings_1.wickets} (${match.innings_1.overs} ov)`;
  const inningsTwo =
    match.status === 'INNINGS_1'
      ? 'Yet to bat'
      : `${match.innings_2.score}/${match.innings_2.wickets} (${match.innings_2.overs} ov)`;

  let resultText = 'Match ongoing';
  if (match.status === 'COMPLETED') {
    if (match.result) {
      if (match.result.type === 'RUNS' && match.result.winner) {
        resultText = `${match.result.winner} won by ${match.result.margin} run${match.result.margin === 1 ? '' : 's'}`;
      } else if (match.result.type === 'CHASE' && match.result.winner) {
        resultText = `${match.result.winner} won (chased target)`;
      } else if (match.result.type === 'TIE') {
        resultText = 'Match tied';
      } else if (match.result.winner) {
        resultText = `${match.result.winner} won`;
      } else {
        resultText = 'Match completed';
      }
    } else {
      resultText = 'Match completed';
    }
  }

  return (
    <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[3px_3px_0px_#000]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-black text-black">
          {match.team_1} vs {match.team_2}
        </h3>
        <span
          className={`rounded-full border border-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
            match.status === 'COMPLETED'
              ? 'bg-slate-100 text-slate-700'
              : 'bg-[#ffd260] text-black'
          }`}
        >
          {match.status === 'COMPLETED' ? 'Completed' : 'Live'}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-black bg-slate-50 px-2.5 py-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            Innings 1 ({match.team_1})
          </span>
          <span className="text-xs font-black text-black">
            {inningsOne}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-black bg-slate-50 px-2.5 py-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            Innings 2 ({match.team_2})
          </span>
          <span
            className={`text-xs font-black ${
              match.status === 'INNINGS_1' ? 'text-slate-400 font-semibold' : 'text-black'
            }`}
          >
            {inningsTwo}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t-2 border-black pt-3">
        <p className="text-[11px] font-black uppercase tracking-wider text-slate-600">
          Result: <span className="text-black">{resultText}</span>
        </p>

        <Link
          to={`/match/${match.match_id}`}
          className="text-xs font-bold text-slate-500 hover:text-black transition-colors"
        >
          View Match →
        </Link>
      </div>
    </div>
  );
};
