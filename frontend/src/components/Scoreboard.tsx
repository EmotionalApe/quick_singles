import React from 'react';
import type { Match } from '../types/match';

interface ScoreboardProps {
  match: Match;
  compact?: boolean;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ match, compact = false }) => {
  const isFirstInnings = match.current_innings === 1;
  const battingTeam = isFirstInnings ? match.team_1 : match.team_2;
  const bowlingTeam = isFirstInnings ? match.team_2 : match.team_1;
  const currentInningsScore = isFirstInnings ? match.innings_1 : match.innings_2;

  // Calculate run rate
  const parseOversToBalls = (oversStr: string): number => {
    const parts = oversStr.split('.');
    const completedOvers = parseInt(parts[0] || '0', 10);
    const balls = parseInt(parts[1] || '0', 10);
    return completedOvers * 6 + balls;
  };

  const ballsBowled = parseOversToBalls(currentInningsScore.overs);
  const currentRunRate =
    ballsBowled > 0
      ? ((currentInningsScore.score / ballsBowled) * 6).toFixed(2)
      : '0.00';

  // Second innings target metrics
  const target = match.current_innings === 2 ? match.innings_1.score + 1 : null;
  const runsNeeded =
    target !== null ? Math.max(0, target - match.innings_2.score) : null;
  const totalMaxBalls = match.overs_per_innings * 6;
  const secondInningsBallsBowled = parseOversToBalls(match.innings_2.overs);
  const ballsRemaining =
    match.current_innings === 2
      ? Math.max(0, totalMaxBalls - secondInningsBallsBowled)
      : null;

  const getStatusText = () => {
    switch (match.status) {
      case 'INNINGS_1':
        return '1st Innings';
      case 'INNINGS_2':
        return '2nd Innings';
      case 'INNINGS_BREAK':
        return 'Innings Break';
      case 'COMPLETED':
        return 'Completed';
      default:
        return match.status;
    }
  };

  // Compact Scorer Mode Scoreboard
  if (compact) {
    return (
      <div className="rounded-2xl border-2 border-black bg-white p-3 shadow-[3px_3px_0px_#000]">
        {/* Header: Teams & Match Status */}
        <div className="flex items-center justify-between text-xs font-bold text-black border-b border-black/10 pb-1.5 mb-2">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-extrabold">{battingTeam}</span>
            <span className="text-slate-400 font-normal">vs</span>
            <span className="text-slate-600 font-medium">{bowlingTeam}</span>
          </div>
          <span className="rounded-full border border-black bg-[#d7f0db] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0">
            {getStatusText()}
          </span>
        </div>

        {/* Main Score Row: Score, Overs, Run Rate in one clean line */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black tracking-tight text-black">
              {currentInningsScore.score}
            </span>
            <span className="text-xl font-light text-slate-400">/</span>
            <span className="text-2xl font-bold text-black">
              {currentInningsScore.wickets}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="rounded-md border border-black bg-slate-50 px-2 py-0.5">
              {currentInningsScore.overs} / {match.overs_per_innings} ov
            </span>
            <span className="text-slate-600 text-[11px]">
              CRR: {currentRunRate}
            </span>
          </div>
        </div>

        {/* 2nd innings target pill or 1st innings brief note */}
        {match.current_innings === 2 && target !== null && match.status !== 'COMPLETED' && (
          <div className="mt-2 rounded-lg border border-black bg-[#ffd260]/40 px-2.5 py-1 text-[11px] font-bold text-black flex items-center justify-between">
            <span>Target: {target}</span>
            <span>Need {runsNeeded} runs ({ballsRemaining}b)</span>
          </div>
        )}
      </div>
    );
  }

  // Viewer Mode Scoreboard
  return (
    <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[3px_3px_0px_#000]">
      {/* Match Header */}
      <div className="flex items-center justify-between border-b-2 border-black/10 pb-3 mb-4">
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {match.overs_per_innings} Overs Match
          </div>
          <div className="text-base font-black text-black mt-0.5">
            {match.team_1} vs {match.team_2}
          </div>
        </div>
        <span className="rounded-full border-2 border-black bg-[#d7f0db] px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-[1px_1px_0px_#000]">
          {getStatusText()}
        </span>
      </div>

      {/* Main Score Area */}
      <div className="text-center py-2">
        <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
          Batting: <span className="text-black font-black">{battingTeam}</span>
        </div>

        <div className="my-1 flex items-baseline justify-center gap-2">
          <span className="text-5xl sm:text-6xl font-black tracking-tight text-black">
            {currentInningsScore.score}
          </span>
          <span className="text-3xl sm:text-4xl font-light text-slate-400">/</span>
          <span className="text-4xl sm:text-5xl font-bold text-black">
            {currentInningsScore.wickets}
          </span>
        </div>

        <div className="flex items-center justify-center gap-3 text-xs font-bold text-black mt-2">
          <span className="rounded-lg border-2 border-black bg-slate-100 px-3 py-1 shadow-[1px_1px_0px_#000]">
            {currentInningsScore.overs} / {match.overs_per_innings} Overs
          </span>
          <span className="rounded-lg border-2 border-black bg-slate-100 px-3 py-1 shadow-[1px_1px_0px_#000]">
            CRR: {currentRunRate}
          </span>
        </div>

        {/* 2nd innings chase details */}
        {match.current_innings === 2 && target !== null && match.status !== 'COMPLETED' && (
          <div className="mt-4 rounded-xl border-2 border-black bg-[#ffd260]/40 p-3 text-center text-xs font-bold text-black">
            Target: <span className="font-black text-sm">{target}</span> • Need{' '}
            <span className="font-black text-sm">{runsNeeded}</span> runs from{' '}
            <span>{ballsRemaining} balls</span>
          </div>
        )}
      </div>

      {/* Both innings overview */}
      <div className="mt-4 grid grid-cols-2 gap-2 border-t-2 border-black/10 pt-3 text-xs font-bold">
        <div className="rounded-xl border border-black bg-slate-50 p-2.5">
          <div className="text-slate-500 text-[11px] truncate">{match.team_1} (1st)</div>
          <div className="text-sm font-black text-black mt-0.5">
            {match.innings_1.score}/{match.innings_1.wickets}{' '}
            <span className="text-[11px] font-normal text-slate-500">
              ({match.innings_1.overs} ov)
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-black bg-slate-50 p-2.5">
          <div className="text-slate-500 text-[11px] truncate">{match.team_2} (2nd)</div>
          <div className="text-sm font-black text-black mt-0.5">
            {match.current_innings === 1 ? (
              <span className="text-slate-400 font-normal italic">Yet to bat</span>
            ) : (
              <>
                {match.innings_2.score}/{match.innings_2.wickets}{' '}
                <span className="text-[11px] font-normal text-slate-500">
                  ({match.innings_2.overs} ov)
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
