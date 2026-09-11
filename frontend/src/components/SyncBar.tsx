import React from 'react';

interface SyncBarProps {
  lastSyncedAt: Date | null;
  isSyncing: boolean;
  onSync: () => Promise<void>;
  compact?: boolean;
}

export const SyncBar: React.FC<SyncBarProps> = ({
  lastSyncedAt,
  isSyncing,
  onSync,
  compact = false,
}) => {
  const formatTime = (date: Date | null) => {
    if (!date) return 'Not synced yet';
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div
      className={`flex items-center justify-between rounded-xl border border-black bg-white px-3 py-1.5 shadow-[1.5px_1.5px_0px_#000] ${
        compact ? 'text-[11px]' : 'text-xs'
      }`}
    >
      <div className="flex items-center gap-1.5 text-slate-600 font-medium">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 shrink-0" />
        <span>
          Synced at{' '}
          <strong className="font-bold text-black">
            {formatTime(lastSyncedAt)}
          </strong>
        </span>
      </div>

      <button
        type="button"
        disabled={isSyncing}
        onClick={onSync}
        className={`flex items-center gap-1.5 rounded-lg border border-black bg-[#ffd260] px-2.5 py-1 font-black text-black shadow-[1px_1px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#ffca40] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          compact ? 'text-[10px]' : 'text-xs'
        }`}
        title="Fetch latest scores"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-3.5 w-3.5 shrink-0 ${isSyncing ? 'animate-spin' : ''}`}
        >
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
        </svg>
        <span>{isSyncing ? 'Syncing...' : 'Sync Scores'}</span>
      </button>
    </div>
  );
};
