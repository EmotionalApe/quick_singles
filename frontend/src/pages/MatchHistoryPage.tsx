import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { getAllMatches } from '../api/matches';
import type { MatchHistoryResponse, AllMatchesResponse } from '../types/match';
import { MatchHistoryCard } from '../components/MatchHistoryCard';

export const MatchHistoryPage: React.FC = () => {
  const [matches, setMatches] = useState<MatchHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response: AllMatchesResponse = await getAllMatches();
        setMatches(response.matches);
      } catch {
        setError('Failed to fetch match history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f2f8] text-black">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6">
        <div className="w-full max-w-sm">
          <div className="mb-4">
            <Link
              to="/"
              className="text-xs font-bold text-slate-500 hover:text-black transition-colors"
            >
              ← Back
            </Link>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-black">
              Match History
            </h1>
          </div>

          {loading ? (
            <div className="rounded-2xl border-2 border-black bg-white p-5 text-center text-xs font-bold text-slate-600 shadow-[3px_3px_0px_#000]">
              Loading match history...
            </div>
          ) : error ? (
            <div className="rounded-2xl border-2 border-black bg-white p-5 text-center text-xs font-bold text-red-600 shadow-[3px_3px_0px_#000]">
              {error}
            </div>
          ) : matches.length === 0 ? (
            <div className="rounded-2xl border-2 border-black bg-white p-5 text-center text-xs font-bold text-slate-600 shadow-[3px_3px_0px_#000]">
              No matches found.
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto space-y-3">
              {matches.map((match) => (
                <MatchHistoryCard key={match.match_id} match={match} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};