import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { TossModal } from '../components/TossModal';

export const HomePage: React.FC = () => {
  const [matchCode, setMatchCode] = useState('');
  const [error, setError] = useState('');
  const [isTossOpen, setIsTossOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenMatch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = matchCode.trim();
    if (!trimmed) {
      setError('Enter a match ID');
      return;
    }

    const matchIdMatch = trimmed.match(/\/match\/(\d+)/);
    const numericId = matchIdMatch ? matchIdMatch[1] : trimmed.replace(/\D/g, '');

    if (!numericId) {
      setError('Enter a valid numeric ID');
      return;
    }

    navigate(`/match/${numericId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f2f8] text-black">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-sm space-y-4">
          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black">
              Quick Singles
            </h1>
            <p className="text-xs font-semibold text-slate-600">
              Simple, fast live cricket scoring
            </p>
          </div>

          {/* Cards */}
          <div className="space-y-3">
            {/* Create Match Card */}
            <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[3px_3px_0px_#000]">
              <h2 className="text-sm font-black text-black mb-1">
                New Match
              </h2>
              <p className="text-xs text-slate-600 mb-3.5">
                Set teams and overs to start scoring immediately.
              </p>
              <Link
                to="/create"
                className="flex w-full items-center justify-center rounded-xl border-2 border-black bg-[#ffd260] py-2.5 px-4 text-xs font-black text-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#ffca40] transition-all"
              >
                Create Match
              </Link>
            </div>

            {/* Back to Games */}
            <div className="pt-2 text-center">
               <Link
                 to="/"
                 className="text-xs font-bold text-slate-500 hover:text-black transition-colors"
               >
                 ← Back to Games
               </Link>
            </div>

            {/* Quick Toss Card */}
            <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[3px_3px_0px_#000]">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-black text-black">
                  Match Toss
                </h2>
                <span className="rounded-full border border-black bg-[#ffd260] px-2 py-0.5 text-[10px] font-black text-black uppercase tracking-wider">
                  Quick Flip
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3.5">
                Flip a coin to decide who bats or bowls first.
              </p>
              <button
                type="button"
                onClick={() => setIsTossOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-white py-2.5 px-4 text-xs font-black text-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-slate-50 transition-all"
              >
                <span>🪙</span>
                <span>Conduct Toss</span>
              </button>
            </div>


            {/* Open Match Card */}
            <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[3px_3px_0px_#000]">
              <h2 className="text-sm font-black text-black mb-1">
                Open Existing Match
              </h2>
              <p className="text-xs text-slate-600 mb-3">
                Enter match ID or link to view or score.
              </p>
              <form onSubmit={handleOpenMatch} className="space-y-2">
                <input
                  type="text"
                  value={matchCode}
                  onChange={(e) => {
                    setMatchCode(e.target.value);
                    setError('');
                  }}
                  placeholder="Match ID (e.g. 5)"
                  className="w-full rounded-xl border-2 border-black bg-slate-50 px-3.5 py-2 text-xs font-bold text-black placeholder-slate-400 focus:bg-white focus:outline-none"
                />
                {error && <p className="text-xs font-bold text-red-600">{error}</p>}
                <button
                  type="submit"
                  className="w-full rounded-xl border-2 border-black bg-white py-2 px-4 text-xs font-bold text-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-slate-50 transition-all"
                >
                  Open Match
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <TossModal
        isOpen={isTossOpen}
        onClose={() => setIsTossOpen(false)}
      />
    </div>
  );
};

