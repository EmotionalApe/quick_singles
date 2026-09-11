import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const GameSelectionPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f3f2f8] text-black">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-sm space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black">
              Quick Singles
            </h1>
            <p className="text-xs font-semibold text-slate-600">
              Select a game to start scoring
            </p>
          </div>

          {/* Cards */}
          <div className="space-y-4">
            {/* Cricket Card */}
            <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[3px_3px_0px_#000]">
              <h2 className="text-lg font-black text-black mb-1">
                Cricket
              </h2>
              <p className="text-xs text-slate-600 mb-4">
                Full-featured live cricket scoring with overs, wickets, and run rates.
              </p>
              <Link
                to="/cricket"
                className="flex w-full items-center justify-center rounded-xl border-2 border-black bg-[#ffd260] py-2.5 px-4 text-sm font-black text-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#ffca40] transition-all"
              >
                Play Cricket 🏏
              </Link>
            </div>

            {/* Table Tennis Card */}
            <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[3px_3px_0px_#000]">
              <h2 className="text-lg font-black text-black mb-1">
                Table Tennis
              </h2>
              <p className="text-xs text-slate-600 mb-4">
                Fast-paced table tennis scoring with serves and match points.
              </p>
              <Link
                to="/tt"
                className="flex w-full items-center justify-center rounded-xl border-2 border-black bg-[#ffd260] py-2.5 px-4 text-sm font-black text-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#ffca40] transition-all"
              >
                Play Table Tennis 🏓
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
