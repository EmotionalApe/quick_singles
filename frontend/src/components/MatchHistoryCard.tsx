import React from 'react';
import type { MatchHistoryCardProps } from '../types/match';
import { Link } from 'react-router-dom';

export const MatchHistoryCard: React.FC<MatchHistoryCardProps> = ({ match }) => {
    const inningsOne = `${match.innings_1.score}/${match.innings_1.wickets}`;
    const inningsTwo = `${match.innings_2.score}/${match.innings_2.wickets}`;
    const resultText = match.result
        ? match.result.winner
            ? `${match.result.winner} won`
            : 'Match tied'
        : 'Match ongoing';

    return (
        <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[3px_3px_0px_#000]">
            <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-black text-black">
                    {match.team_1} vs {match.team_2}
                </h3>
                <span className="rounded-full border border-black bg-[#ffd260] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-black">
                    {match.status === 'COMPLETED' ? 'Completed' : 'Live'}
                </span>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-black bg-slate-50 px-2.5 py-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Innings 1
                    </span>
                    <span className="text-xs font-black text-black">
                        {inningsOne} ({match.innings_1.overs} ov)
                    </span>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-xl border border-black bg-slate-50 px-2.5 py-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Innings 2
                    </span>
                    <span className="text-xs font-black text-black">
                        {inningsTwo} ({match.innings_2.overs} ov)
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