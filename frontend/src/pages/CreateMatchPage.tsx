import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { createMatch } from '../api/matches';

export const CreateMatchPage: React.FC = () => {
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [overs, setOvers] = useState<number | ''>(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTeam1 = team1.trim();
    const trimmedTeam2 = team2.trim();

    if (!trimmedTeam1) {
      setError('Please enter Team 1 name');
      return;
    }
    if (!trimmedTeam2) {
      setError('Please enter Team 2 name');
      return;
    }
    if (trimmedTeam1.toLowerCase() === trimmedTeam2.toLowerCase()) {
      setError('Team names must be different');
      return;
    }
    if (trimmedTeam1.length > 100 || trimmedTeam2.length > 100) {
      setError('Team names must be 100 characters or fewer');
      return;
    }

    const numOvers = Number(overs);
    if (!numOvers || numOvers < 1 || numOvers > 100) {
      setError('Overs per innings must be between 1 and 100');
      return;
    }

    try {
      setLoading(true);
      const res = await createMatch({
        team_1: trimmedTeam1,
        team_2: trimmedTeam2,
        overs: numOvers,
      });

      navigate(`/match/${res.match_id}`, {
        state: { isNewMatch: true },
      });
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === 'string'
          ? detail
          : 'Failed to create match. Please check backend connection.'
      );
    } finally {
      setLoading(false);
    }
  };

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
              Create Match
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border-2 border-black bg-white p-5 shadow-[3px_3px_0px_#000] space-y-4"
          >
            {error && (
              <div className="rounded-xl border border-black bg-[#fee2e2] p-2.5 text-xs font-bold text-black">
                {error}
              </div>
            )}

            {/* Team 1 */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                Team 1 (Batting First)
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={team1}
                onChange={(e) => setTeam1(e.target.value)}
                placeholder="e.g. Hyderabad"
                className="w-full rounded-xl border-2 border-black bg-slate-50 px-3.5 py-2 text-xs font-bold text-black placeholder-slate-400 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Team 2 */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                Team 2 (Bowling First)
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={team2}
                onChange={(e) => setTeam2(e.target.value)}
                placeholder="e.g. Chennai"
                className="w-full rounded-xl border-2 border-black bg-slate-50 px-3.5 py-2 text-xs font-bold text-black placeholder-slate-400 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Overs */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                Overs
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={overs}
                  onChange={(e) =>
                    setOvers(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-20 rounded-xl border-2 border-black bg-slate-50 px-3 py-1.5 text-xs font-black text-black text-center focus:bg-white focus:outline-none"
                />
                <div className="flex items-center gap-1">
                  {[5, 10, 15, 20].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setOvers(preset)}
                      className={`rounded-lg border border-black px-2 py-1 text-[11px] font-bold transition-colors ${
                        overs === preset
                          ? 'bg-[#ffd260] text-black shadow-[1px_1px_0px_#000]'
                          : 'bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl border-2 border-black bg-[#ffd260] py-2.5 px-4 text-xs font-black text-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#ffca40] transition-all disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Start Match'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
