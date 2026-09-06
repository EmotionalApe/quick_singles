import React from 'react';
import { Link } from 'react-router-dom';
import type { ViewerRole } from '../types/match';

interface NavbarProps {
  matchId?: number;
  role?: ViewerRole;
  onShareClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  matchId,
  role,
  onShareClick,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-black bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-2 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-black hover:opacity-80 transition-opacity"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-black bg-[#ffd260] font-black text-xs shadow-[1px_1px_0px_#000]">
            QS
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-black tracking-tight text-black">
              Quick Singles
            </span>
            <span className="rounded-full border border-black bg-[#d7f0db] px-2 py-0.2 text-[10px] font-bold text-black uppercase tracking-wider">
              Live
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {matchId && role && (
            <span
              className={`inline-flex items-center rounded-full border-2 border-black px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider shadow-[1px_1px_0px_#000] ${
                role === 'SCORER'
                  ? 'bg-[#ffd260] text-black'
                  : 'bg-white text-black'
              }`}
            >
              {role}
            </span>
          )}

          {onShareClick && (
            <button
              onClick={onShareClick}
              className="rounded-lg border-2 border-black bg-white px-2.5 py-1 text-xs font-bold text-black shadow-[1.5px_1.5px_0px_#000] hover:bg-slate-50 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            >
              Share
            </button>
          )}

          <Link
            to="/create"
            className="rounded-lg border-2 border-black bg-[#ffd260] px-2.5 py-1 text-xs font-bold text-black shadow-[1.5px_1.5px_0px_#000] hover:bg-[#ffca40] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            + New
          </Link>
        </div>
      </div>
    </header>
  );
};
