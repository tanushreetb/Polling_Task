import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, Check, Code, Zap, Radio, Share2 } from 'lucide-react';
import { LeafSprig } from '../components/BotanicalAccents';
import { useWebSocket } from '../context/WebSocketContext';
import { pollAPI } from '../utils/api';
import { Button } from '../components/Button';
import { SharePollModal } from '../components/SharePollModal';

// Language Badge Logos matching Screen 5
const OptionLogo = ({ name }) => {
  const n = (name || '').toLowerCase();
  if (n.includes('python')) {
    return (
      <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] border border-[#CCE0FF] flex items-center justify-center font-bold text-blue-600 text-sm shadow-2xs">
        Py
      </div>
    );
  }
  if (n.includes('javascript') || n.includes('js')) {
    return (
      <div className="w-9 h-9 rounded-xl bg-[#FFF3C4] border border-[#FBE580] flex items-center justify-center font-extrabold text-[#7A5B00] text-sm shadow-2xs">
        JS
      </div>
    );
  }
  if (n.includes('java')) {
    return (
      <div className="w-9 h-9 rounded-xl bg-[#FEE2E2] border border-[#FCA5A5] flex items-center justify-center font-bold text-red-600 text-sm shadow-2xs">
        ☕
      </div>
    );
  }
  if (n.includes('go')) {
    return (
      <div className="w-9 h-9 rounded-xl bg-[#E0F7FA] border border-[#B2EBF2] flex items-center justify-center font-extrabold text-cyan-800 text-sm shadow-2xs">
        GO
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-white/10 flex items-center justify-center font-bold text-stone-700 dark:text-stone-300 text-sm shadow-2xs">
      #
    </div>
  );
};

export const Vote = ({ pollId = "65f1a0b1c2d3e4f5a6b7c8d1", onBack, onVoteSubmitted }) => {
  const [selectedOption, setSelectedOption] = useState('opt-py'); // Python selected by default matching mockup
  const [nickname, setNickname] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const [poll, setPoll] = useState({
    id: "65f1a0b1c2d3e4f5a6b7c8d1",
    title: "Which programming language do you love the most?",
    description: "Cast your vote and see results update in real-time.",
    options: [
      { id: "opt-py", text: "Python", icon_name: "python" },
      { id: "opt-js", text: "JavaScript", icon_name: "javascript" },
      { id: "opt-java", text: "Java", icon_name: "java" },
      { id: "opt-go", text: "Go", icon_name: "go" },
    ],
  });

  const { subscribeToPoll, viewerCount } = useWebSocket();

  useEffect(() => {
    if (pollId) {
      subscribeToPoll(pollId);
      pollAPI.getById(pollId)
        .then((res) => {
          if (res.data) {
            setPoll(res.data);
            if (res.data.options && res.data.options.length > 0) {
              setSelectedOption(res.data.options[0].id);
            }
          }
        })
        .catch(() => {
          try {
            const localPolls = JSON.parse(localStorage.getItem('pulsevote_local_polls') || '[]');
            const found = localPolls.find((p) => p.id === pollId);
            if (found) {
              setPoll(found);
              if (found.options && found.options.length > 0) {
                setSelectedOption(found.options[0].id);
              }
            }
          } catch (e) {}
        });
    }
  }, [pollId, subscribeToPoll]);

  const handleVote = async () => {
    if (!selectedOption || submitting) return;

    setSubmitting(true);
    try {
      await pollAPI.castVote(poll.id || pollId, {
        option_ids: [selectedOption],
        nickname: nickname.trim() || 'Anonymous Voter',
      });

      // Confetti celebration with spring burst
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#133522', '#FFE066', '#3B8B52', '#22C55E'],
      });

      setHasVoted(true);
      setTimeout(() => {
        if (onVoteSubmitted) onVoteSubmitted(poll.id || pollId);
      }, 700);
    } catch (err) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setHasVoted(true);
      setTimeout(() => {
        if (onVoteSubmitted) onVoteSubmitted(poll.id || pollId);
      }, 700);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 relative">
      {/* Share Modal */}
      <SharePollModal
        poll={poll}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Top Header Row matching Screen 5: Back + Live Pill + Viewer count + Share */}
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
          {/* Live Indicator */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live</span>
          </div>

          {/* Active Viewer Count */}
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

      {/* Main Question Card matching Screen 5 */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-[#18221B] rounded-3xl p-6 sm:p-10 border border-[#EBE5DB] dark:border-[#2C3E30] shadow-soft relative"
      >
        {/* Code Tag Icon matching mockup */}
        <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#E8F2EA] dark:bg-emerald-950/40 text-forest-900 dark:text-emerald-300 mb-4 border border-[#CFE4D3] dark:border-emerald-800/40">
          <Code className="w-5 h-5" />
        </div>

        {/* Question Title with Highlight */}
        <div className="mb-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight leading-snug">
            {poll.title}
          </h2>
        </div>

        <p className="text-sm text-charcoal/60 mb-8">
          {poll.description || "Cast your vote and see results update in real-time."}
        </p>

        {/* Options List with Selectable Cards with Spring Physics */}
        <div className="space-y-3 mb-8">
          {poll.options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            return (
              <motion.div
                key={opt.id}
                onClick={() => setSelectedOption(opt.id)}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-forest-900 dark:border-emerald-400 bg-[#F4F9F5] dark:bg-emerald-950/30 shadow-xs'
                    : 'border-[#EBE5DB] dark:border-[#2C3E30] hover:border-[#D5CEC0] dark:hover:border-white/20 bg-white dark:bg-black/10'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <OptionLogo name={opt.icon_name || opt.text} />
                  <span className="font-bold text-base text-charcoal">
                    {opt.text}
                  </span>
                </div>

                {/* Animated Radio indicator with checkmark if selected */}
                <motion.div
                  animate={{
                    scale: isSelected ? [1, 1.15, 1] : 1,
                  }}
                  transition={{ duration: 0.2 }}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-forest-900 dark:bg-emerald-500 text-white'
                      : 'border-2 border-[#D6CFBE] dark:border-[#384F3D] bg-white dark:bg-transparent'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Big Vote Now Button using Button component */}
        <Button
          variant="primary"
          size="lg"
          onClick={handleVote}
          disabled={!selectedOption || submitting}
          loading={submitting}
          className="w-full py-4 text-base rounded-2xl"
        >
          {submitting ? 'Casting Vote in Redis ZSET...' : 'Vote Now'}
        </Button>

        {/* Subtext: You can vote anonymously */}
        <p className="text-center text-xs text-charcoal/50 mt-4">
          You can vote anonymously.
        </p>
      </motion.div>

      {/* Hand-drawn Doodles and Notes below matching Screen 5 */}
      <div className="mt-8 flex items-center justify-between px-2">
        {/* Sketch girl doodle on left */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-charcoal/20 bg-white dark:bg-[#18221B] flex items-center justify-center">
            <span className="text-xl">👩‍💻</span>
          </div>
          <p className="font-hand text-lg text-charcoal/80 leading-tight">
            Good<br />
            Questions<br />
            Better People
          </p>
        </div>

        {/* Real-time doodle note on right with lightning */}
        <div className="text-right">
          <div className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-0.5">
            <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider">Zero Lag</span>
          </div>
          <p className="font-hand text-base sm:text-lg text-charcoal/80 leading-tight">
            Live Results<br />
            No Refresh<br />
            Just Real People →
          </p>
        </div>
      </div>
    </div>
  );
};
