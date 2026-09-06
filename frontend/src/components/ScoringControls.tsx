import React, { useState } from 'react';
import type { EventType } from '../types/match';

interface ScoringControlsProps {
  onScore: (type: EventType, runs?: number) => Promise<void>;
  disabled?: boolean;
}

export const ScoringControls: React.FC<ScoringControlsProps> = ({
  onScore,
  disabled = false,
}) => {
  const [activeSubMenu, setActiveSubMenu] = useState<'WIDE' | 'NO_BALL' | 'WICKET' | null>(null);

  const handleScoreAndClose = async (type: EventType, runs?: number) => {
    setActiveSubMenu(null);
    await onScore(type, runs);
  };

  // Submenu for WIDE
  if (activeSubMenu === 'WIDE') {
    return (
      <div className="rounded-2xl border-2 border-black bg-white p-2.5 sm:p-3 shadow-[3px_3px_0px_#000]">
        <div className="mb-2 flex items-center justify-between border-b border-black/10 pb-1 text-xs font-bold text-black">
          <span>Wide Delivery (1 run penalty + extras)</span>
          <button
            type="button"
            onClick={() => setActiveSubMenu(null)}
            className="rounded px-2 py-0.5 text-[11px] font-bold text-slate-500 hover:text-black"
          >
            Cancel
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1.5 mb-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleScoreAndClose('WIDE', 0)}
            className="flex h-11 flex-col items-center justify-center rounded-xl border-2 border-black bg-[#fed7aa] text-xs font-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#fdba74]"
          >
            <span>1 WD</span>
            <span className="text-[9px] font-bold text-slate-700">standard</span>
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleScoreAndClose('WIDE', 1)}
            className="flex h-11 flex-col items-center justify-center rounded-xl border-2 border-black bg-white text-xs font-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-slate-50"
          >
            <span>+1</span>
            <span className="text-[9px] font-bold text-slate-500">2 runs</span>
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleScoreAndClose('WIDE', 2)}
            className="flex h-11 flex-col items-center justify-center rounded-xl border-2 border-black bg-white text-xs font-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-slate-50"
          >
            <span>+2</span>
            <span className="text-[9px] font-bold text-slate-500">3 runs</span>
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleScoreAndClose('WIDE', 4)}
            className="flex h-11 flex-col items-center justify-center rounded-xl border-2 border-black bg-[#d7f0db] text-xs font-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#c6ebd0]"
          >
            <span>+4</span>
            <span className="text-[9px] font-bold text-slate-700">5 (four)</span>
          </button>
        </div>
      </div>
    );
  }

  // Submenu for NO BALL
  if (activeSubMenu === 'NO_BALL') {
    return (
      <div className="rounded-2xl border-2 border-black bg-white p-2.5 sm:p-3 shadow-[3px_3px_0px_#000]">
        <div className="mb-2 flex items-center justify-between border-b border-black/10 pb-1 text-xs font-bold text-black">
          <span>No Ball (1 run penalty + bat/extras)</span>
          <button
            type="button"
            onClick={() => setActiveSubMenu(null)}
            className="rounded px-2 py-0.5 text-[11px] font-bold text-slate-500 hover:text-black"
          >
            Cancel
          </button>
        </div>

        <div className="grid grid-cols-5 gap-1.5 mb-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleScoreAndClose('NO_BALL', 0)}
            className="flex h-11 flex-col items-center justify-center rounded-xl border-2 border-black bg-[#fed7aa] text-xs font-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#fdba74]"
          >
            <span>1 NB</span>
            <span className="text-[9px] font-bold text-slate-700">standard</span>
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleScoreAndClose('NO_BALL', 1)}
            className="flex h-11 flex-col items-center justify-center rounded-xl border-2 border-black bg-white text-xs font-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-slate-50"
          >
            <span>+1</span>
            <span className="text-[9px] font-bold text-slate-500">2 runs</span>
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleScoreAndClose('NO_BALL', 2)}
            className="flex h-11 flex-col items-center justify-center rounded-xl border-2 border-black bg-white text-xs font-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-slate-50"
          >
            <span>+2</span>
            <span className="text-[9px] font-bold text-slate-500">3 runs</span>
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleScoreAndClose('NO_BALL', 4)}
            className="flex h-11 flex-col items-center justify-center rounded-xl border-2 border-black bg-[#d7f0db] text-xs font-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#c6ebd0]"
          >
            <span>+4</span>
            <span className="text-[9px] font-bold text-slate-700">5 runs</span>
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleScoreAndClose('NO_BALL', 6)}
            className="flex h-11 flex-col items-center justify-center rounded-xl border-2 border-black bg-[#ffd260] text-xs font-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#ffca40]"
          >
            <span>+6</span>
            <span className="text-[9px] font-bold text-slate-700">7 runs</span>
          </button>
        </div>
      </div>
    );
  }

  // Submenu for WICKET
  if (activeSubMenu === 'WICKET') {
    return (
      <div className="rounded-2xl border-2 border-black bg-white p-2.5 sm:p-3 shadow-[3px_3px_0px_#000]">
        <div className="mb-2 flex items-center justify-between border-b border-black/10 pb-1 text-xs font-bold text-black">
          <span>Wicket Delivery</span>
          <button
            type="button"
            onClick={() => setActiveSubMenu(null)}
            className="rounded px-2 py-0.5 text-[11px] font-bold text-slate-500 hover:text-black"
          >
            Cancel
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-1">
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleScoreAndClose('WICKET', 0)}
            className="flex h-12 flex-col items-center justify-center rounded-xl border-2 border-black bg-[#fee2e2] text-xs font-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#fecaca]"
          >
            <span>Out (0)</span>
            <span className="text-[9px] font-bold text-slate-600">Bowled/Caught</span>
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleScoreAndClose('WICKET', 1)}
            className="flex h-12 flex-col items-center justify-center rounded-xl border-2 border-black bg-white text-xs font-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-slate-50"
          >
            <span>Run Out +1</span>
            <span className="text-[9px] font-bold text-slate-500">1 run done</span>
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleScoreAndClose('WICKET', 2)}
            className="flex h-12 flex-col items-center justify-center rounded-xl border-2 border-black bg-white text-xs font-black shadow-[1.5px_1.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-slate-50"
          >
            <span>Run Out +2</span>
            <span className="text-[9px] font-bold text-slate-500">2 runs done</span>
          </button>
        </div>
      </div>
    );
  }

  // Normal 3x3 Keypad
  const buttons: Array<{
    label: string;
    action: () => void;
    colorClasses: string;
  }> = [
    {
      label: '0',
      action: () => onScore('RUN', 0),
      colorClasses: 'bg-white hover:bg-slate-50 text-black',
    },
    {
      label: '1',
      action: () => onScore('RUN', 1),
      colorClasses: 'bg-white hover:bg-slate-50 text-black',
    },
    {
      label: '2',
      action: () => onScore('RUN', 2),
      colorClasses: 'bg-white hover:bg-slate-50 text-black',
    },
    {
      label: '3',
      action: () => onScore('RUN', 3),
      colorClasses: 'bg-white hover:bg-slate-50 text-black',
    },
    {
      label: '4',
      action: () => onScore('RUN', 4),
      colorClasses: 'bg-[#d7f0db] hover:bg-[#c6ebd0] text-black',
    },
    {
      label: '6',
      action: () => onScore('RUN', 6),
      colorClasses: 'bg-[#ffd260] hover:bg-[#ffca40] text-black',
    },
    {
      label: 'W',
      action: () => setActiveSubMenu('WICKET'),
      colorClasses: 'bg-[#fee2e2] hover:bg-[#fecaca] text-black',
    },
    {
      label: 'WD',
      action: () => setActiveSubMenu('WIDE'),
      colorClasses: 'bg-[#fed7aa] hover:bg-[#fdba74] text-black',
    },
    {
      label: 'NB',
      action: () => setActiveSubMenu('NO_BALL'),
      colorClasses: 'bg-[#fed7aa] hover:bg-[#fdba74] text-black',
    },
  ];

  return (
    <div className="rounded-2xl border-2 border-black bg-white p-2.5 sm:p-3 shadow-[3px_3px_0px_#000]">
      <div className="grid grid-cols-3 gap-2">
        {buttons.map((btn) => (
          <button
            key={btn.label}
            type="button"
            disabled={disabled}
            onClick={btn.action}
            className={`flex h-12 sm:h-13 items-center justify-center rounded-xl border-2 border-black text-xl sm:text-2xl font-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all select-none ${
              btn.colorClasses
            } ${
              disabled
                ? 'opacity-40 cursor-not-allowed pointer-events-none'
                : 'cursor-pointer'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};
