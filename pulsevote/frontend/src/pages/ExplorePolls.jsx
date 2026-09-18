import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Vote as VoteIcon,
  BarChart3,
  Share2,
  Sparkles,
  Plus,
  Clock,
  TrendingUp,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/Button';
import { SharePollModal } from '../components/SharePollModal';
import { LeafSprig } from '../components/BotanicalAccents';
import { pollAPI } from '../utils/api';

const DEFAULT_EXPLORE_POLLS = [
  {
    id: "65f1a0b1c2d3e4f5a6b7c8d1",
    title: "Which programming language do you love the most?",
    description: "Compare Python, JavaScript, Java, and Go in 2026 development workflows.",
    category: "Technology",
    total_votes: 512,
    created_at_text: "Active now",
    is_active: true,
    thumbnail: "💻",
    creator_name: "Tanushree",
    options_count: 4,
  },
  {
    id: "65f1a0b1c2d3e4f5a6b7c8d2",
    title: "Best tech trend shaping the software industry in 2026?",
    description: "Vote on AI Agents, Edge Compute, Quantum Simulators, or WebAssembly.",
    category: "Trending",
    total_votes: 384,
    created_at_text: "2 days ago",
    is_active: true,
    thumbnail: "🚀",
    creator_name: "Alex M.",
    options_count: 4,
  },
  {
    id: "65f1a0b1c2d3e4f5a6b7c8d3",
    title: "Which learning resource helped your career the most?",
    description: "Hands-on projects, official docs, video bootcamps, or open source.",
    category: "Education",
    total_votes: 620,
    created_at_text: "1 week ago",
    is_active: false,
    thumbnail: "📚",
    creator_name: "DevCommunity",
    options_count: 4,
  },
  {
    id: "65f1a0b1c2d3e4f5a6b7c8d4",
    title: "What is your primary web framework preference?",
    description: "Next.js, Vite + React, SvelteKit, or Nuxt for fast web applications.",
    category: "Technology",
    total_votes: 279,
    created_at_text: "3 days ago",
    is_active: true,
    thumbnail: "⚡",
    creator_name: "FrontendGuild",
    options_count: 4,
  },
  {
    id: "65f1a0b1c2d3e4f5a6b7c8d5",
    title: "Ideal work culture balance for engineering teams?",
    description: "100% Remote, Hybrid (2-3 days), or Full Office Collaboration.",
    category: "Trending",
    total_votes: 430,
    created_at_text: "Yesterday",
    is_active: true,
    thumbnail: "🌐",
    creator_name: "CulturePulse",
    options_count: 3,
  },
];

export const ExplorePolls = ({ onSelectPoll, onPollResults, onOpenCreate }) => {
  const [polls, setPolls] = useState(DEFAULT_EXPLORE_POLLS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeSharePoll, setActiveSharePoll] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let localPolls = [];
    try {
      localPolls = JSON.parse(localStorage.getItem('pulsevote_local_polls') || '[]');
    } catch (e) {}

    setLoading(true);
    pollAPI
      .list()
      .then((res) => {
        const fetched = res.data?.polls || (Array.isArray(res.data) ? res.data : []);
        // Merge: local polls first, then fetched polls, then fallbacks
        const combined = [...localPolls];
        fetched.forEach((fp) => {
          if (!combined.some((p) => p.id === fp.id)) {
            combined.push(fp);
          }
        });
        DEFAULT_EXPLORE_POLLS.forEach((dp) => {
          if (!combined.some((p) => p.id === dp.id)) {
            combined.push(dp);
          }
        });
        setPolls(combined);
      })
      .catch(() => {
        const combined = [...localPolls];
        DEFAULT_EXPLORE_POLLS.forEach((dp) => {
          if (!combined.some((p) => p.id === dp.id)) {
            combined.push(dp);
          }
        });
        setPolls(combined);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', 'Technology', 'Trending', 'Education', 'Active'];

  const filteredPolls = polls.filter((poll) => {
    const matchesSearch =
      poll.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poll.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Active') return poll.is_active !== false;
    return poll.category === selectedCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative">
      {/* Share Modal */}
      <SharePollModal
        poll={activeSharePoll}
        isOpen={Boolean(activeSharePoll)}
        onClose={() => setActiveSharePoll(null)}
      />

      {/* Botanical Accents in Corner */}
      <div className="absolute top-6 -left-8 pointer-events-none opacity-30 hidden lg:block">
        <LeafSprig className="w-20 h-20 text-forest-900 rotate-12" />
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 dark:bg-emerald-950/40 border border-forest-200 dark:border-emerald-800/40 text-forest-900 dark:text-emerald-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Community Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charcoal tracking-tight">
            Explore All Polls
          </h1>
          <p className="text-sm sm:text-base text-charcoal/70 mt-2 max-w-xl">
            Vote, discover collective perspectives in real-time, or share any poll with friends and teams.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={onOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create a Poll
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white dark:bg-[#18221B] p-3 rounded-2xl border border-[#EBE5DB] dark:border-[#2C3E30] shadow-soft">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search polls by title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-transparent outline-none text-charcoal placeholder:text-charcoal/40"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-forest-900 text-white shadow-xs'
                  : 'text-charcoal/70 hover:bg-stone-100 dark:hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Polls Grid */}
      {filteredPolls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolls.map((poll) => {
            const isActive = poll.is_active !== false;
            return (
              <motion.div
                key={poll.id}
                whileHover={{ y: -3 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                className="bg-white dark:bg-[#18221B] rounded-3xl p-6 border border-[#EBE5DB] dark:border-[#2C3E30] shadow-soft hover:shadow-card hover:border-forest-900/30 flex flex-col justify-between transition-all group relative overflow-hidden"
              >
                <div>
                  {/* Card Top Row: Thumbnail + Status pill + Share */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F4EFE6] dark:bg-white/5 border border-[#E8E1D5] dark:border-white/10 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shadow-xs">
                      {poll.thumbnail || '📊'}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                          }`}
                        />
                        <span>{isActive ? 'Active' : 'Closed'}</span>
                      </span>

                      {/* Share & QR Icon */}
                      <button
                        onClick={() => setActiveSharePoll(poll)}
                        className="p-2 rounded-xl border border-[#EBE5DB] dark:border-[#2C3E30] hover:bg-stone-100 dark:hover:bg-white/10 text-charcoal/70 hover:text-forest-900 transition-colors"
                        title="Get Share Link & QR"
                        aria-label="Share poll"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Poll Title */}
                  <h3
                    onClick={() => onSelectPoll && onSelectPoll(poll)}
                    className="font-extrabold text-lg text-charcoal group-hover:text-forest-900 transition-colors leading-snug cursor-pointer line-clamp-2 mb-2"
                  >
                    {poll.title}
                  </h3>

                  {/* Poll Description */}
                  {poll.description && (
                    <p className="text-xs text-charcoal/65 line-clamp-2 mb-4 leading-relaxed">
                      {poll.description}
                    </p>
                  )}
                </div>

                {/* Card Footer: Metadata + Action Buttons */}
                <div className="pt-4 border-t border-[#F0EBE1] dark:border-[#2C3E30] mt-3">
                  <div className="flex items-center justify-between text-xs text-charcoal/60 mb-3">
                    <span>
                      <strong className="text-charcoal font-bold">{poll.total_votes || 0}</strong> votes
                    </span>
                    <span>{poll.creator_name ? `By ${poll.creator_name}` : 'Public poll'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onSelectPoll && onSelectPoll(poll)}
                      rightIcon={<span>→</span>}
                    >
                      Vote Now
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPollResults && onPollResults(poll.id)}
                    >
                      Live Results
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-[#18221B] rounded-3xl border border-[#EBE5DB] dark:border-[#2C3E30] p-8">
          <VoteIcon className="w-12 h-12 text-forest-900/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-charcoal">No polls found</h3>
          <p className="text-xs text-charcoal/60 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your search query or create a brand new poll to kick off the discussion.
          </p>
          <Button variant="primary" size="sm" onClick={onOpenCreate}>
            Create New Poll
          </Button>
        </div>
      )}
    </div>
  );
};
