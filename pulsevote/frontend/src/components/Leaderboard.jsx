import React from 'react';
import { Trophy, TrendingUp } from 'lucide-react';

export const Leaderboard = ({ options = [] }) => {
  const sorted = [...options].sort((a, b) => b.votes - a.votes);

  return (
    <div className="bg-white rounded-2xl border border-[#EBE5DB] p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-amber-500" />
        <h4 className="font-bold text-base text-charcoal">Real-Time Leaderboard</h4>
        <span className="text-[11px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-200 ml-auto">
          Redis ZSET
        </span>
      </div>

      <div className="space-y-3">
        {sorted.map((opt, idx) => (
          <div
            key={opt.id || idx}
            className="flex items-center justify-between p-2.5 rounded-xl bg-paper/60 border border-[#F0EBE1]"
          >
            <div className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                idx === 0
                  ? 'bg-amber-100 text-amber-800'
                  : idx === 1
                  ? 'bg-slate-200 text-slate-800'
                  : idx === 2
                  ? 'bg-amber-700/10 text-amber-900'
                  : 'text-charcoal/50'
              }`}>
                {idx + 1}
              </span>
              <span className="font-semibold text-sm text-charcoal">{opt.text}</span>
            </div>
            <span className="text-xs font-bold text-forest-900 bg-forest-50 px-2 py-1 rounded-md">
              {opt.votes} votes
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
