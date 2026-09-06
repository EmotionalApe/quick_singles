import React from 'react';

interface RecentEventsProps {
  events: string[];
}

export const RecentEvents: React.FC<RecentEventsProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-black bg-white px-3 py-1.5 text-xs text-slate-500 shadow-[2px_2px_0px_#000]">
        <span className="font-bold text-black">Recent</span>
        <span className="text-[11px] italic">Innings started</span>
      </div>
    );
  }

  const getEventBadgeStyle = (item: string) => {
    if (item.startsWith('W')) {
      return 'bg-[#fee2e2] text-black border-2 border-black font-black';
    }
    if (item === '6' || item.includes('+6')) {
      return 'bg-[#ffd260] text-black border-2 border-black font-black';
    }
    if (item === '4' || item.includes('+4') || item.includes('5WD')) {
      return 'bg-[#d7f0db] text-black border-2 border-black font-black';
    }
    if (item.includes('WD') || item.includes('NB')) {
      return 'bg-[#fed7aa] text-black border-2 border-black font-bold';
    }
    if (item === '0') {
      return 'bg-slate-100 text-slate-500 border border-black font-semibold';
    }
    return 'bg-white text-black border border-black font-bold';
  };

  return (
    <div className="rounded-xl border-2 border-black bg-white p-2.5 shadow-[2px_2px_0px_#000]">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
          Recent Deliveries
        </span>
        <span className="text-[10px] text-slate-400 font-medium">latest →</span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {events.map((ev, index) => (
          <span
            key={index}
            className={`inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-lg px-1.5 text-xs shadow-[1px_1px_0px_#000] shrink-0 ${getEventBadgeStyle(
              ev
            )}`}
          >
            {ev}
          </span>
        ))}
      </div>
    </div>
  );
};
