import React, { useState } from 'react';

interface ShareModalProps {
  matchId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  matchId,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const matchUrl = `${window.location.origin}/match/${matchId}`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(matchUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = matchUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm rounded-2xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000]">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-black">
            Share Match Link
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-black hover:bg-slate-100 font-bold"
          >
            ✕
          </button>
        </div>

        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
          Anyone with this link can follow live scores or take over as scorer.
        </p>

        <div className="mt-3 flex items-center gap-2 rounded-xl border-2 border-black bg-slate-50 p-1.5">
          <input
            type="text"
            readOnly
            value={matchUrl}
            className="w-full bg-transparent px-2 text-xs font-medium text-black outline-none select-all"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded-lg border border-black bg-[#ffd260] px-3 py-1 text-xs font-bold text-black shadow-[1px_1px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#ffca40] transition-all"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-black bg-white px-3.5 py-1.5 text-xs font-bold text-black hover:bg-slate-50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
