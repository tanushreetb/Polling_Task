import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Radio, BarChart3, PieChart, Sparkles, Share2 } from 'lucide-react';
import { LeafSprig } from './BotanicalAccents';
import { useWebSocket } from '../context/WebSocketContext';
import { pollAPI } from '../utils/api';
import { Button } from './Button';
import { SharePollModal } from './SharePollModal';

// Option Logos
const OptionIcon = ({ name, className = "w-6 h-6" }) => {
  const n = (name || '').toLowerCase();
  if (n.includes('python')) {
    return (
      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 text-xs">
        Py
      </div>
    );
  }
  if (n.includes('javascript') || n.includes('js')) {
    return (
      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 flex items-center justify-center font-extrabold text-amber-900 dark:text-amber-300 text-xs">
        JS
      </div>
    );
  }
  if (n.includes('java')) {
    return (
      <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/40 flex items-center justify-center font-bold text-red-600 dark:text-red-400 text-xs">
        ☕
      </div>
    );
  }
  if (n.includes('go')) {
    return (
      <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-900/40 flex items-center justify-center font-extrabold text-cyan-700 dark:text-cyan-400 text-xs">
        GO
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-white/10 flex items-center justify-center font-bold text-stone-700 dark:text-stone-300 text-xs">
      #
    </div>
  );
};

export const LiveResults = ({ pollId = "65f1a0b1c2d3e4f5a6b7c8d1", onBack }) => {
  const [viewMode, setViewMode] = useState('bar'); // 'bar' | 'donut'
  const [showShareModal, setShowShareModal] = useState(false);
  const [poll, setPoll] = useState({
    id: pollId,
    title: "Which programming language do you love the most?",
    total_votes: 511,
    options: [
      { id: "opt-py", text: "Python", votes: 216, percentage: 42.3, icon_name: "python" },
      { id: "opt-js", text: "JavaScript", votes: 132, percentage: 25.8, icon_name: "javascript" },
      { id: "opt-java", text: "Java", votes: 98, percentage: 19.2, icon_name: "java" },
      { id: "opt-go", text: "Go", votes: 65, percentage: 12.7, icon_name: "go" },
    ],
  });

  const { subscribeToPoll, addVoteListener, viewerCount } = useWebSocket();

  useEffect(() => {
    if (pollId) {
      subscribeToPoll(pollId);
      pollAPI.getResults(pollId)
        .then((res) => {
          if (res.data) setPoll(res.data);
        })
        .catch(() => {
          try {
            const localPolls = JSON.parse(localStorage.getItem('pulsevote_local_polls') || '[]');
            const found = localPolls.find((p) => p.id === pollId);
            if (found) {
              setPoll(found);
            }
          } catch (e) {}
        });
    }

    const unsubscribe = addVoteListener((event) => {
      if (event.options) {
        setPoll((prev) => ({
          ...prev,
          total_votes: event.total_votes,
          options: event.options,
        }));
      }
    });

    return unsubscribe;
  }, [pollId, subscribeToPoll, addVoteListener]);

  const total = poll.total_votes || 0;
  const barColors = [
    '#1B4D3E', // Forest green
    '#D97706', // Amber
    '#DC2626', // Red
    '#0284C7', // Sky blue
    '#7C3AED', // Purple
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 relative">
      {/* Share Modal */}
      <SharePollModal
        poll={{ ...poll, id: poll.id || pollId }}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Botanical Sprig Accents in Corners with subtle float */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-4 -left-12 pointer-events-none opacity-40 hidden md:block"
      >
        <LeafSprig className="w-16 h-16 text-forest-900 rotate-45" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -bottom-8 -right-10 pointer-events-none opacity-40 hidden md:block"
      >
        <LeafSprig className="w-20 h-20 text-forest-900 -rotate-45" />
      </motion.div>

      {/* Navigation & Header */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>Live</span>
          </div>

          {/* Viewer count */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-charcoal/70 bg-white dark:bg-[#18221B] px-3 py-1 rounded-full border border-[#E5DFD4] dark:border-[#2C3E30]">
            <span>👥</span>
            <span>{viewerCount}</span>
          </div>

          {/* Share & QR button */}
          <button
            onClick={() => setShowShareModal(true)}
            className="p-1.5 rounded-full border border-[#E5DFD4] dark:border-[#2C3E30] bg-white dark:bg-[#18221B] text-charcoal/70 hover:text-forest-900 transition-colors"
            title="Share Poll & QR"
            aria-label="Share Poll"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Container Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-[#18221B] rounded-3xl p-6 sm:p-10 border border-[#EBE5DB] dark:border-[#2C3E30] shadow-soft relative overflow-hidden"
      >
        {/* Title & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0EBE1] dark:border-[#2C3E30]">
          <div>
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-6 h-6 text-forest-900 dark:text-emerald-400" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal">
                Live Results
              </h2>
            </div>
            <p className="text-sm text-charcoal/60 mt-1 flex items-center gap-1.5">
              <span>{total.toLocaleString()} people have voted</span>
              <span>•</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Synced via Redis ZSET</span>
            </p>
          </div>

          {/* View Switcher Toggle */}
          <div className="inline-flex p-1 bg-[#F4EFE6] dark:bg-black/30 rounded-xl self-start sm:self-center border border-[#E5DFD4] dark:border-[#2C3E30]">
            <button
              onClick={() => setViewMode('bar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'bar'
                  ? 'bg-forest-900 text-white shadow-xs'
                  : 'text-charcoal/70 hover:text-charcoal'
              }`}
            >
              Bar View
            </button>
            <button
              onClick={() => setViewMode('donut')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'donut'
                  ? 'bg-forest-900 text-white shadow-xs'
                  : 'text-charcoal/70 hover:text-charcoal'
              }`}
            >
              Donut View
            </button>
          </div>
        </div>

        {/* Question Title */}
        <div className="py-4">
          <h3 className="text-xl font-bold text-charcoal">{poll.title}</h3>
        </div>

        {/* Bar View Mode with Animated Spring Progress Bars */}
        {viewMode === 'bar' && (
          <div className="space-y-6 pt-2">
            {poll.options.map((opt, idx) => {
              const pct = total > 0 ? Number(((opt.votes / total) * 100).toFixed(1)) : 0;
              const color = barColors[idx % barColors.length];

              return (
                <motion.div
                  key={opt.id || idx}
                  layout
                  transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <OptionIcon name={opt.icon_name || opt.text} />
                      <span className="font-bold text-charcoal text-base">
                        {opt.text}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-charcoal text-base mr-2">
                        {pct}%
                      </span>
                      <span className="text-xs text-charcoal/50">
                        {opt.votes.toLocaleString()} votes
                      </span>
                    </div>
                  </div>

                  {/* Animated Spring Progress Bar */}
                  <div className="w-full h-3.5 bg-[#F0EBE1] dark:bg-black/30 rounded-full overflow-hidden p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(pct, 2)}%` }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                      style={{ backgroundColor: color }}
                      className="h-full rounded-full relative overflow-hidden"
                    >
                      {/* Shimmer sweep effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent w-full"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Donut View Mode */}
        {viewMode === 'donut' && (
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {poll.options.reduce((acc, opt, i) => {
                  const pct = total > 0 ? (opt.votes / total) * 100 : 0;
                  const strokeDasharray = `${pct} ${100 - pct}`;
                  const strokeDashoffset = -acc.offset;
                  acc.elements.push(
                    <circle
                      key={opt.id || i}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={barColors[i % barColors.length]}
                      strokeWidth="16"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-700"
                    />
                  );
                  acc.offset += pct;
                  return acc;
                }, { elements: [], offset: 0 }).elements}
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-extrabold text-charcoal">{total}</span>
                <span className="block text-[11px] font-semibold text-charcoal/60 uppercase tracking-wider">
                  Total Votes
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 mt-8 w-full max-w-sm">
              {poll.options.map((opt, i) => (
                <div key={opt.id || i} className="flex items-center gap-2 text-xs font-semibold text-charcoal">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: barColors[i % barColors.length] }}
                  />
                  <span className="truncate">{opt.text}</span>
                  <span className="text-charcoal/50 ml-auto">
                    {total > 0 ? Math.round((opt.votes / total) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Handwritten Quote Card matching screenshot */}
        <div className="mt-10 p-5 rounded-2xl bg-[#E8F2EA] dark:bg-emerald-950/30 border border-[#CFE4D3] dark:border-emerald-800/40 relative">
          <p className="font-hand text-xl sm:text-2xl text-forest-900 dark:text-emerald-300 leading-snug">
            “Different minds. Brighter answers.”
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-medium text-forest-800/80 dark:text-emerald-400/80 font-sans">
              — PulseVote Live Room
            </span>
            <span className="text-xs text-forest-800/70 dark:text-emerald-400/70 font-sans">
              Real-Time WebSocket Stream Active
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
