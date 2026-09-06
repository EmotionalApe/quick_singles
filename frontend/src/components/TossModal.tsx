import React, { useState, useEffect, useRef } from 'react';

interface TossModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CoinSide = 'HEADS' | 'TAILS';

export const TossModal: React.FC<TossModalProps> = ({ isOpen, onClose }) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipResult, setFlipResult] = useState<CoinSide | null>(null);
  const [animationClass, setAnimationClass] = useState<string>('');
  const [flipKey, setFlipKey] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean reset every time modal opens
  useEffect(() => {
    if (isOpen) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsFlipping(false);
      setFlipResult(null);
      setAnimationClass('');
      setFlipKey((k) => k + 1);
    }
  }, [isOpen]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isFlipping) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFlipping, onClose]);

  if (!isOpen) return null;

  const handleFlip = () => {
    if (isFlipping) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    const outcome: CoinSide = Math.random() < 0.5 ? 'HEADS' : 'TAILS';
    setIsFlipping(true);
    setFlipResult(null);
    setFlipKey((k) => k + 1);
    setAnimationClass(outcome === 'HEADS' ? 'animate-flip-heads' : 'animate-flip-tails');

    timerRef.current = setTimeout(() => {
      setFlipResult(outcome);
      setIsFlipping(false);
      setAnimationClass('');
    }, 1800);
  };


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={!isFlipping ? onClose : undefined}
    >
      <div
        className="w-full max-w-xs rounded-2xl border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000] relative text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isFlipping}
          className="absolute top-3.5 right-3.5 flex h-7 w-7 items-center justify-center rounded-lg border border-black bg-slate-100 text-xs font-black text-black hover:bg-slate-200 transition-colors disabled:opacity-50"
          aria-label="Close modal"
        >
          ✕
        </button>

        <h2 className="text-lg font-black tracking-tight text-black mb-1">
          Coin Toss
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Flip a coin for Heads or Tails
        </p>

        {/* 3D Coin Graphic */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="perspective-1000">
            <div
              key={flipKey}
              className={`relative h-28 w-28 transform-style-3d cursor-pointer ${animationClass}`}
              onClick={!isFlipping ? handleFlip : undefined}
              style={{
                transform: !animationClass && flipResult === 'TAILS' ? 'rotateY(180deg)' : undefined,
              }}
            >

              {/* HEADS SIDE */}
              <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center rounded-full border-4 border-black bg-[#ffd260] shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
                <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-dashed border-black/40">
                  <span className="text-3xl font-black text-black tracking-tight">H</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-black/70">
                    HEADS
                  </span>
                </div>
              </div>

              {/* TAILS SIDE */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center rounded-full border-4 border-black bg-[#fcd34d] shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
                <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-dashed border-black/40">
                  <span className="text-3xl font-black text-black tracking-tight">T</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-black/70">
                    TAILS
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Outcome announcement */}
          <div className="mt-4 min-h-[36px] flex items-center justify-center">
            {isFlipping ? (
              <p className="text-xs font-black text-slate-600 animate-pulse">
                Flipping...
              </p>
            ) : flipResult ? (
              <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-[#d7f0db] px-4 py-1 text-sm font-black text-black shadow-[1.5px_1.5px_0px_#000] animate-in zoom-in-95 duration-150">
                <span>🪙</span>
                <span>{flipResult}!</span>
              </div>
            ) : (
              <p className="text-xs font-bold text-slate-400">
                Tap coin or click below to flip
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleFlip}
          disabled={isFlipping}
          className="w-full rounded-xl border-2 border-black bg-[#ffd260] py-2.5 px-4 text-xs font-black text-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#ffca40] transition-all disabled:opacity-50"
        >
          {isFlipping ? 'Flipping...' : flipResult ? 'Flip Again' : 'Flip Coin'}
        </button>
      </div>
    </div>
  );
};
