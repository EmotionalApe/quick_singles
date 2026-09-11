import React, { useState } from 'react';

interface ScorerActionsProps {
  onUndo: () => Promise<void>;
  onEndInnings: () => Promise<void>;
  onLeaveScorer: () => Promise<void>;
  onSync?: () => Promise<void>;
  isSyncing?: boolean;
  lastSyncedAt?: Date | null;
  disabled?: boolean;
}

export const ScorerActions: React.FC<ScorerActionsProps> = ({
  onUndo,
  onEndInnings,
  onLeaveScorer,
  onSync,
  isSyncing = false,
  lastSyncedAt = null,
  disabled = false,
}) => {
  const [confirmDialog, setConfirmDialog] = useState<
    'END_INNINGS' | 'LEAVE_SCORER' | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEndInningsConfirm = async () => {
    try {
      setIsProcessing(true);
      await onEndInnings();
    } finally {
      setIsProcessing(false);
      setConfirmDialog(null);
    }
  };

  const handleLeaveScorerConfirm = async () => {
    try {
      setIsProcessing(true);
      await onLeaveScorer();
    } finally {
      setIsProcessing(false);
      setConfirmDialog(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        {/* Left Side: Undo Ball and Sync */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={disabled || isProcessing}
            onClick={onUndo}
            className="rounded-xl border-2 border-black bg-white px-3 py-1.5 text-xs font-bold text-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-40"
          >
            Undo Ball
          </button>

          {onSync && (
            <button
              type="button"
              disabled={disabled || isProcessing || isSyncing}
              onClick={onSync}
              className="flex items-center gap-1 rounded-xl border-2 border-black bg-white px-2.5 py-1.5 text-xs font-bold text-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-40 hover:bg-slate-50"
              title={
                lastSyncedAt
                  ? `Last synced: ${lastSyncedAt.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}`
                  : 'Sync scores'
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-3 w-3 shrink-0 ${isSyncing ? 'animate-spin' : ''}`}
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
              <span>{isSyncing ? '...' : 'Sync'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* End Innings Button */}
          <button
            type="button"
            disabled={disabled || isProcessing}
            onClick={() => setConfirmDialog('END_INNINGS')}
            className="rounded-xl border-2 border-black bg-[#ffd260] px-3 py-1.5 text-xs font-bold text-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-40"
          >
            End Innings
          </button>

          {/* Leave Scorer Button */}
          <button
            type="button"
            disabled={disabled || isProcessing}
            onClick={() => setConfirmDialog('LEAVE_SCORER')}
            className="rounded-xl border-2 border-black bg-[#fee2e2] px-3 py-1.5 text-xs font-bold text-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-40"
          >
            Leave Scorer
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000]">
            <h3 className="text-base font-black text-black">
              {confirmDialog === 'END_INNINGS'
                ? 'End Current Innings?'
                : 'Leave Scorer Role?'}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              {confirmDialog === 'END_INNINGS'
                ? 'Are you sure you want to end this innings? The batting side will cease scoring.'
                : 'Another user will be able to take over as scorer, and you will become a viewer.'}
            </p>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setConfirmDialog(null)}
                className="rounded-xl border border-black bg-white px-3 py-1.5 text-xs font-bold text-black hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={
                  confirmDialog === 'END_INNINGS'
                    ? handleEndInningsConfirm
                    : handleLeaveScorerConfirm
                }
                className={`rounded-xl border-2 border-black px-3.5 py-1.5 text-xs font-bold text-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all ${
                  confirmDialog === 'END_INNINGS'
                    ? 'bg-[#ffd260]'
                    : 'bg-[#fee2e2]'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
