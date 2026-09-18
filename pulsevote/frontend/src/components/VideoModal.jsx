import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Zap, Radio, Sparkles } from 'lucide-react';

export const VideoModal = ({ isOpen, onClose, onTryLive }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [simulatedTime, setSimulatedTime] = useState(14); // seconds
  const [activeStep, setActiveStep] = useState(1);

  // Simulated playback progression
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = setInterval(() => {
      setSimulatedTime((prev) => {
        const next = prev >= 45 ? 0 : prev + 1;
        if (next < 15) setActiveStep(1); // User voting
        else if (next < 30) setActiveStep(2); // Redis ZSET processing
        else setActiveStep(3); // Live WebSocket broadcast
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#111713] border border-[#2E3F31] rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white">
        {/* Top Video Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#223024] bg-[#162018]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="font-extrabold text-sm tracking-wide text-stone-200">
              PulseVote 1-Minute Live Demo & Architecture Walkthrough
            </span>
            <span className="text-[10px] bg-forest-800/80 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              1080p HD
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Canvas / Live Interactive Simulation */}
        <div className="relative aspect-video bg-[#0A0E0B] p-6 sm:p-10 flex flex-col justify-between overflow-hidden">
          {/* Watermark Logo in Corner */}
          <div className="absolute top-4 right-6 opacity-30 text-xs font-bold tracking-widest uppercase pointer-events-none">
            ⚡ PulseVote Live Stream
          </div>

          {/* Dynamic Scene Content */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* SCENE 1: User Vote Submission */}
            {activeStep === 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-[#18231A] p-6 rounded-2xl border border-[#2D4030] shadow-xl text-center space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                  <span>Step 1 of 3: Instant Vote Submission</span>
                </div>
                <h4 className="text-lg font-bold text-white">
                  "Which programming language do you love the most?"
                </h4>
                <div className="p-3 rounded-xl bg-forest-900/60 border border-emerald-500/50 flex items-center justify-between text-sm font-semibold">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs">Py</span>
                    <span>Python</span>
                  </div>
                  <span className="text-emerald-400 font-bold">✓ Selected & Cast</span>
                </div>
                <p className="text-xs text-stone-400">
                  Voter clicks "Vote Now" → HTTP POST /api/polls/:id/vote
                </p>
              </motion.div>
            )}

            {/* SCENE 2: Redis ZSET Processing */}
            {activeStep === 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-[#0F1611] p-6 rounded-2xl border border-emerald-500/40 shadow-xl space-y-3 font-mono text-xs"
              >
                <div className="flex items-center justify-between text-emerald-400 border-b border-emerald-900/50 pb-2">
                  <span className="font-bold flex items-center gap-1.5 font-sans">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Step 2: Redis In-Memory Execution
                  </span>
                  <span className="text-[10px] bg-emerald-900/40 px-2 py-0.5 rounded text-emerald-300">0.8 ms</span>
                </div>
                <div className="space-y-1.5 text-stone-300">
                  <p className="text-amber-300">&gt; ZINCRBY poll:65f1a:votes 1 opt-py</p>
                  <p className="text-emerald-400">&quot;217&quot; (Updated score in O(log N))</p>
                  <p className="text-amber-300">&gt; PUBLISH poll:65f1a:events &#123;&quot;opt-py&quot;: 217&#125;</p>
                  <p className="text-stone-400">&gt; (integer) 1 clients received</p>
                </div>
                <div className="pt-2 text-[11px] text-stone-400 font-sans">
                  💡 Zero MongoDB document lock contention. Sub-millisecond latency.
                </div>
              </motion.div>
            )}

            {/* SCENE 3: WebSocket Live Broadcast */}
            {activeStep === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-[#18231A] p-6 rounded-2xl border border-[#2D4030] shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>Step 3: Gorilla WebSocket Live Fan-Out</span>
                  </div>
                  <span className="text-xs text-stone-400">427 Viewers</span>
                </div>

                <div className="space-y-2 text-left">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>Python</span>
                    <span className="text-emerald-400 font-bold">42% (217 votes)</span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "40%" }}
                      animate={{ width: "42%" }}
                      transition={{ duration: 0.6 }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>

                <p className="text-xs text-stone-300 text-center font-medium">
                  🎉 Results animated instantly across every open browser tab without refreshing!
                </p>
              </motion.div>
            )}
          </div>

          {/* Bottom Video Progress Bar Scrubber */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer">
              <div
                style={{ width: `${(simulatedTime / 45) * 100}%` }}
                className="h-full bg-emerald-400 transition-all duration-300 rounded-full"
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-stone-200 hover:text-white transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setSimulatedTime(0)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-stone-200 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-stone-200 hover:text-white transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <span className="text-stone-400 font-mono text-[11px]">
                  0:{simulatedTime < 10 ? `0${simulatedTime}` : simulatedTime} / 0:45
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-emerald-400 font-semibold hidden sm:inline">
                  ⚡ Redis ZSET + Gorilla WebSocket
                </span>
                <button
                  onClick={onTryLive}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded-full text-xs shadow-sm transition-all"
                >
                  Try It Live →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
