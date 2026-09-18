import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, QrCode, BarChart3, HelpCircle, ChevronDown, ChevronUp, Cpu } from 'lucide-react';
import { StickyNote } from './StickyNote';
import { LeafSprig } from './BotanicalAccents';
import { Button } from './Button';

export const HowItWorks = ({ onStartPoll }) => {
  const [showTechDetails, setShowTechDetails] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      {/* Corner Botanical Sprig */}
      <div className="absolute top-6 -left-10 pointer-events-none opacity-40 hidden md:block">
        <LeafSprig className="w-20 h-20 text-forest-900 rotate-12" />
      </div>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest-900/10 dark:bg-forest-900/20 text-forest-900 text-xs font-bold mb-3 border border-forest-900/20">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Simple & Fast</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-charcoal tracking-tight">
          How PulseVote Works
        </h2>
        <p className="text-base sm:text-lg text-charcoal/70 mt-3 leading-relaxed">
          Collect real opinions from your audience in 3 easy, seamless steps.
        </p>
      </div>

      {/* 3 Step Process Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative mb-12">
        {/* Step 1 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EBE5DB] shadow-soft relative flex flex-col justify-between hover:shadow-card transition-all">
          <div className="absolute -top-4 -right-2">
            <span className="w-9 h-9 rounded-full bg-forest-900 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
              1
            </span>
          </div>

          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mb-5 border border-amber-100 dark:border-amber-900/40 text-2xl font-bold">
              ✍️
            </div>
            <h3 className="text-xl font-bold text-charcoal mb-2">
              1. Ask Your Question
            </h3>
            <p className="text-sm text-charcoal/70 leading-relaxed">
              Type the question you want to ask and add choices for people to pick. You can allow multiple choices and keep answers anonymous.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F0EBE1] dark:border-[#2C3E30] flex items-center gap-2 text-xs font-semibold text-forest-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Setup takes under 30 seconds</span>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EBE5DB] shadow-soft relative flex flex-col justify-between hover:shadow-card transition-all">
          <div className="absolute -top-4 -right-2">
            <span className="w-9 h-9 rounded-full bg-forest-900 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
              2
            </span>
          </div>

          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-5 border border-emerald-100 dark:border-emerald-900/40 text-2xl font-bold">
              📲
            </div>
            <h3 className="text-xl font-bold text-charcoal mb-2">
              2. Share Link or QR Code
            </h3>
            <p className="text-sm text-charcoal/70 leading-relaxed">
              Every poll comes with an instant scannable QR code and a direct web link. Share it on WhatsApp, in presentations, or during live meetings.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F0EBE1] dark:border-[#2C3E30] flex items-center gap-2 text-xs font-semibold text-forest-900">
            <QrCode className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Works on any mobile or desktop</span>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EBE5DB] shadow-soft relative flex flex-col justify-between hover:shadow-card transition-all">
          <div className="absolute -top-4 -right-2">
            <span className="w-9 h-9 rounded-full bg-forest-900 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
              3
            </span>
          </div>

          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mb-5 border border-blue-100 dark:border-blue-900/40 text-2xl font-bold">
              📊
            </div>
            <h3 className="text-xl font-bold text-charcoal mb-2">
              3. Watch Results Live
            </h3>
            <p className="text-sm text-charcoal/70 leading-relaxed">
              As soon as someone casts a vote, animated percentage bars and charts update automatically on your screen with zero page refreshes!
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F0EBE1] dark:border-[#2C3E30] flex items-center gap-2 text-xs font-semibold text-forest-900">
            <BarChart3 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Instant real-time live updates</span>
          </div>
        </div>
      </div>

      {/* Optional Technical Architecture Accordion for evaluators */}
      <div className="mb-12 bg-white rounded-3xl p-6 border border-[#EBE5DB] shadow-soft">
        <button
          onClick={() => setShowTechDetails(!showTechDetails)}
          className="w-full flex items-center justify-between text-left text-charcoal font-bold text-base hover:text-forest-900 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-forest-900" />
            <span>Curious about the technology behind PulseVote? (For Developers & Judges)</span>
          </div>
          {showTechDetails ? <ChevronUp className="w-5 h-5 text-charcoal/60" /> : <ChevronDown className="w-5 h-5 text-charcoal/60" />}
        </button>

        {showTechDetails && (
          <div className="mt-5 pt-5 border-t border-[#F0EBE1] dark:border-[#2C3E30] grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs text-charcoal/80">
            <div className="p-3.5 bg-paper rounded-2xl border border-[#EAE4D8]">
              <span className="font-extrabold text-forest-900 text-sm block mb-1">⚡ Go & Gin Backend</span>
              High-throughput REST API and Gorilla WebSocket server handling thousands of simultaneous connections with low memory usage.
            </div>
            <div className="p-3.5 bg-paper rounded-2xl border border-[#EAE4D8]">
              <span className="font-extrabold text-forest-900 text-sm block mb-1">🚀 Redis ZSET & Pub/Sub</span>
              Atomic O(log N) vote incrementing in RAM that eliminates database write locks and instantly fans out live updates across all clients.
            </div>
            <div className="p-3.5 bg-paper rounded-2xl border border-[#EAE4D8]">
              <span className="font-extrabold text-forest-900 text-sm block mb-1">🍃 MongoDB Durability</span>
              Asynchronous background worker synchronizes memory tallies into persistent document storage every 10 seconds for audit history.
            </div>
          </div>
        )}
      </div>

      {/* Interactive Sticky Notes and Action Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-[#E8F2EA] dark:bg-[#1A2E20] border border-[#CFE4D3] dark:border-[#2C4533] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="text-2xl font-extrabold text-forest-900">
            Ready to start polling?
          </h4>
          <p className="text-sm text-forest-800/80 dark:text-emerald-300/80 mt-1 max-w-md">
            Create your own question and get opinions from friends or coworkers in real time.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={onStartPoll}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="shrink-0"
        >
          Create a Poll Now
        </Button>
      </div>
    </div>
  );
};
