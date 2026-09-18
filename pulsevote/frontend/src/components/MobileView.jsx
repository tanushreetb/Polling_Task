import React, { useState } from 'react';
import { Search, Home, Plus, Vote, Menu, Sparkles } from 'lucide-react';
import { PulseWaveIcon } from './BotanicalAccents';

export const MobileView = ({ onSelectPoll, onOpenCreate }) => {
  const [selectedCategory, setSelectedCategory] = useState('Trending');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['Trending', 'Tech', 'Fun', 'Lifestyle'];

  const samplePolls = [
    {
      id: "poll-m1",
      title: "Which laptop brand do you prefer?",
      votes: "1.2K votes",
      category: "Tech",
    },
    {
      id: "poll-m2",
      title: "Work from office or remote?",
      votes: "856 votes",
      category: "Lifestyle",
    },
    {
      id: "poll-m3",
      title: "AI: Boon or threat?",
      votes: "422 votes",
      category: "Tech",
    },
  ];

  return (
    <div className="w-full max-w-sm mx-auto bg-paper border-4 border-charcoal/80 rounded-[40px] shadow-2xl overflow-hidden my-8 p-4 flex flex-col justify-between min-h-[640px]">
      {/* Phone Notch & Status */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-charcoal/70 px-4 py-1 mb-2">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-charcoal/70" />
            <span className="w-2.5 h-2 rounded-xs border border-charcoal/70" />
          </div>
        </div>

        {/* Top Header */}
        <div className="flex items-center justify-between px-2 mb-4">
          <div className="flex items-center gap-2">
            <PulseWaveIcon className="w-5 h-5 text-forest-900" />
            <span className="font-extrabold text-lg text-forest-900">PulseVote</span>
          </div>
          <button className="p-1.5 text-charcoal">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Title */}
        <div className="px-2 mb-4">
          <h2 className="text-3xl font-extrabold text-charcoal leading-tight">
            Ask <br />
            Anything. <br />
            <span className="font-hand text-3xl font-normal text-forest-800">See</span> <br />
            Everything. <br />
            <span className="text-forest-900">Live.</span>
          </h2>
        </div>

        {/* Search Bar */}
        <div className="px-2 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search polls..."
              className="w-full pl-9 pr-3 py-2 rounded-full border border-[#D9D3C7] bg-white text-xs text-charcoal outline-none focus:border-forest-900"
            />
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 px-2 overflow-x-auto pb-2 scrollbar-none mb-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-forest-900 text-white'
                  : 'bg-white border border-[#D9D3C7] text-charcoal/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Poll List Cards */}
        <div className="space-y-2 px-2">
          {samplePolls.map((poll) => (
            <div
              key={poll.id}
              onClick={() => onSelectPoll && onSelectPoll(poll)}
              className="bg-white rounded-xl p-3 border border-[#EBE5DB] flex items-center justify-between gap-3 cursor-pointer hover:border-forest-900 transition-colors"
            >
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-charcoal truncate">
                  {poll.title}
                </h4>
                <p className="text-[11px] text-charcoal/50 mt-0.5">{poll.votes}</p>
              </div>
              <span className="text-xs font-bold text-forest-900">→</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="bg-white rounded-3xl p-2 border border-[#EBE5DB] flex items-center justify-around shadow-sm mt-4">
        <button className="flex flex-col items-center text-[10px] font-bold text-forest-900">
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        {/* Center Floating Plus Button */}
        <button
          onClick={onOpenCreate}
          className="w-10 h-10 -mt-5 rounded-full bg-forest-900 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        <button className="flex flex-col items-center text-[10px] font-bold text-charcoal/60 hover:text-charcoal">
          <Vote className="w-4 h-4" />
          <span>My Polls</span>
        </button>
      </div>
    </div>
  );
};
