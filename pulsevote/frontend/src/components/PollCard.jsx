import React from 'react';
import { MoreVertical, CheckCircle2, Clock } from 'lucide-react';

export const PollCard = ({ poll, onSelect, onResults }) => {
  const isRecentActive = poll.is_active !== false;

  return (
    <div className="bg-white border border-[#E8E3D9] hover:border-[#D0C9BD] rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 transition-all hover:shadow-card group">
      {/* Left info */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 rounded-xl bg-[#F4EFE6] border border-[#E5DFD4] flex items-center justify-center text-forest-900 font-bold text-lg shrink-0">
          {poll.title ? poll.title.charAt(0).toUpperCase() : '?'}
        </div>
        <div className="min-w-0">
          <h4
            onClick={onSelect}
            className="font-bold text-base text-charcoal truncate hover:text-forest-900 cursor-pointer transition-colors"
          >
            {poll.title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-charcoal/60 mt-1">
            <span>{poll.total_votes || 0} votes</span>
            <span>•</span>
            <span>Created recently</span>
          </div>
        </div>
      </div>

      {/* Right status & actions */}
      <div className="flex items-center gap-3 shrink-0">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isRecentActive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isRecentActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          {isRecentActive ? 'Active' : 'Closed'}
        </span>

        <button
          onClick={onResults}
          title="View Results"
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#D9D3C7] hover:bg-forest-900 hover:text-white transition-colors"
        >
          Results
        </button>

        <button className="text-charcoal/40 hover:text-charcoal p-1 rounded-lg">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
