import React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, Sparkles, Globe, Heart, Users, Vote as VoteIcon } from 'lucide-react';
import { StickyNote } from '../components/StickyNote';
import { LeafSprig, DeskPlant, LightbulbDoodle } from '../components/BotanicalAccents';
import { Button } from '../components/Button';
import { AmbientMotes } from '../components/AmbientMotes';

export const Home = ({ setView, onOpenLogin }) => {

  // 3D Tilt calculation values for the hero illustration card
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['9deg', '-9deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-9deg', '9deg']);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-80px)] flex flex-col justify-between">
      {/* 3D Ambient Drifting Pollen Motes from ThreeUI Sylva Atmosphere */}
      <AmbientMotes count={22} />

      {/* Subtle Botanical Accents on Left & Right Margins with gentle floating */}
      <motion.div
        animate={{ y: [0, -6, 0], rotate: [12, 14, 12] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-12 -left-8 pointer-events-none opacity-30 hidden lg:block"
      >
        <LeafSprig className="w-24 h-24 text-forest-900" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 6, 0], rotate: [-12, -10, -12] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-10 -right-8 pointer-events-none opacity-30 hidden lg:block"
      >
        <LeafSprig className="w-24 h-24 text-forest-900" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Copy & CTA with staggered entrance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-8 z-10"
          >
            {/* Main Headline with Highlighter Marker Underline */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-charcoal tracking-tight leading-[1.08]">
                Good <br />
                Questions <br />
                Bring People <br />
                <span className="highlight-marker inline-block">Together.</span>
              </h1>
              <p className="text-lg sm:text-xl text-charcoal/75 max-w-lg font-normal leading-relaxed pt-2">
                Create polls, share anywhere, and watch real opinions come to life — in real-time.
              </p>
            </div>

            {/* Action Buttons using animated Button component */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setView('create')}
                rightIcon={<span className="text-lg font-bold">→</span>}
              >
                Create a Poll
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setView('explore')}
                leftIcon={
                  <div className="w-6 h-6 rounded-full bg-forest-900/10 flex items-center justify-center">
                    <VoteIcon className="w-3.5 h-3.5 text-forest-900" />
                  </div>
                }
              >
                Explore Live Polls
              </Button>
            </div>

            {/* Social Proof: Avatar Stack */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-center gap-3 pt-4"
            >
              <div className="flex -space-x-2.5">
                <img
                  className="w-10 h-10 rounded-full border-2 border-paper object-cover shadow-xs"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                  alt="Avatar 1"
                />
                <img
                  className="w-10 h-10 rounded-full border-2 border-paper object-cover shadow-xs"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
                  alt="Avatar 2"
                />
                <img
                  className="w-10 h-10 rounded-full border-2 border-paper object-cover shadow-xs"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces"
                  alt="Avatar 3"
                />
              </div>
              <p className="text-sm font-semibold text-charcoal/80">
                Joined by <span className="font-extrabold text-forest-900">10K+</span> curious minds
              </p>
            </motion.div>

            {/* Sticky Note at Bottom Left matching mockup with gentle hover */}
            <motion.div
              whileHover={{ scale: 1.03, rotate: -1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="pt-2 max-w-xs"
            >
              <StickyNote color="yellow" rotate="-2.5deg">
                <p className="text-xl font-hand leading-snug">
                  Different minds,<br />
                  Brighter tomorrows! :)
                </p>
                <div className="text-right text-xs text-charcoal/60 mt-1 font-sans">
                  ~ PulseVote Team
                </div>
              </StickyNote>
            </motion.div>
          </motion.div>

          {/* Right Column: Hand-drawn Workspace Illustration with 3D Mouse Parallax & Floating Pinned Notes */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative w-full flex justify-center items-center py-6 perspective-1000"
            >
                  {/* Note Top-Left: Globe + Ask Share Learn Grow (3D Floating) */}
                  <div className="absolute top-2 left-4 sm:left-12 z-20 animate-float-3d">
                    <StickyNote color="mint" rotate="-3deg" className="max-w-[170px] text-base shadow-lg">
                      <div className="flex items-center gap-1.5 mb-1 text-forest-900">
                        <Globe className="w-4 h-4" />
                        <span className="font-sans font-bold text-xs">COMMUNITY</span>
                      </div>
                      Ask<br />
                      Share<br />
                      Learn<br />
                      Grow 🌱
                    </StickyNote>
                  </div>

                  {/* Note Top-Right: What's your take? (3D Floating Slow) */}
                  <div className="absolute top-0 right-4 sm:right-16 z-20 animate-float-3d-slow">
                    <StickyNote color="peach" rotate="2.5deg" className="max-w-[160px] text-base shadow-lg">
                      <span className="text-lg font-bold">What's<br />your take?</span>
                    </StickyNote>
                  </div>

                  {/* Note Middle-Left: Real People Real Opinions (3D Floating Slow) */}
                  <div className="absolute top-44 left-0 sm:left-6 z-20 animate-float-3d-slow">
                    <StickyNote color="mint" rotate="1.5deg" className="max-w-[165px] text-base shadow-lg">
                      Real People<br />
                      Real Opinions ✨
                    </StickyNote>
                  </div>

                  {/* Note Middle-Right: A more open world... Exactly matching Image 3 */}
                  <div className="absolute top-36 right-0 sm:right-6 z-20 animate-float-3d">
                    <div className="relative p-3.5 pt-4 rounded-2xl bg-white border border-[#E5E0D4] dark:border-[#3A4E3D] shadow-sticky max-w-[180px] select-none rotate-[-1deg]">
                      {/* Dark Rounded Clip at Top from Image 3 */}
                      <div className="w-10 h-4 bg-[#232723] rounded-full absolute -top-2 left-4 shadow-xs" />

                      {/* Yellow Highlighter Blocks matching Image 3 with pure dark text */}
                      <div className="flex flex-col items-start gap-1 pt-1">
                        <span className="bg-[#FFE55B] !text-[#181B18] font-hand text-xl font-bold px-2 py-0.5 rounded-xs leading-tight inline-block shadow-xs">
                          A more open world
                        </span>
                        <span className="bg-[#FFE55B] !text-[#181B18] font-hand text-xl font-bold px-2 py-0.5 rounded-xs leading-tight inline-block shadow-xs">
                          starts with a
                        </span>
                        <span className="bg-[#FFE55B] !text-[#181B18] font-hand text-xl font-bold px-2 py-0.5 rounded-xs leading-tight inline-block shadow-xs">
                          question.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3D Interactive Illustration Frame Container */}
                  <motion.div
                    style={{
                      rotateX,
                      rotateY,
                      transformStyle: 'preserve-3d',
                    }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="w-full max-w-md bg-white border-2 border-charcoal/90 rounded-3xl p-6 sm:p-8 shadow-card relative flex flex-col items-center"
                  >
                    {/* Lightbulb Doodle Top */}
                    <motion.div
                      animate={{ rotate: [-3, 3, -3], scale: [1, 1.05, 1] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute top-4 left-1/3"
                    >
                      <LightbulbDoodle className="w-7 h-7" />
                    </motion.div>

                    {/* Hand-drawn Character Illustration */}
                    <div className="my-6 relative flex flex-col items-center">
                      {/* Desk Lamp / Girl Drinking Coffee / Laptop */}
                      <div className="relative w-64 h-64 flex items-center justify-center">
                        <svg viewBox="0 0 240 240" className="w-full h-full" fill="none" stroke="#1A1D1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          {/* Girl with messy bun drinking coffee */}
                          <circle cx="120" cy="70" r="28" fill="#FFF" />
                          {/* Hair Bun */}
                          <circle cx="120" cy="38" r="16" fill="#1A1D1A" />
                          <path d="M102 65 C108 50 132 50 138 65" fill="#1A1D1A" />
                          {/* Face features: cute smiling eyes */}
                          <path d="M112 70 Q116 74 120 70" />
                          <path d="M124 70 Q128 74 132 70" />
                          <path d="M118 78 Q120 81 122 78" />
                          {/* Coffee mug in hand */}
                          <rect x="135" y="85" width="16" height="20" rx="3" fill="#FFF" stroke="#1A1D1A" />
                          <path d="M151 90 Q157 95 151 100" />
                          {/* Body / Sweater */}
                          <path d="M100 100 Q120 95 140 100 L148 145 H92 Z" fill="#FFF" />
                          {/* Laptop on desk */}
                          <rect x="80" y="145" width="80" height="42" rx="4" fill="#F8F6F0" stroke="#1A1D1A" strokeWidth="2.5" />
                          {/* Smile sticker on laptop */}
                          <circle cx="120" cy="165" r="9" fill="#FFE066" stroke="#1A1D1A" strokeWidth="1.5" />
                          <circle cx="117" cy="163" r="1" fill="#1A1D1A" />
                          <circle cx="123" cy="163" r="1" fill="#1A1D1A" />
                          <path d="M117 167 Q120 170 123 167" strokeWidth="1.5" />
                          {/* Laptop Base */}
                          <path d="M70 187 H170" strokeWidth="3" />
                        </svg>
                      </div>
                    </div>

                    {/* Bottom Desk Elements: Plant & Book Stack */}
                    <div className="w-full flex items-end justify-between border-t-2 border-charcoal/80 pt-3">
                      {/* Potted Plant */}
                      <DeskPlant className="w-16 h-20" />

                      {/* Stack of Books with Text matching screenshot: IDEAS • DISCUSS • BELONG */}
                      <div className="flex flex-col items-center">
                        <div className="w-32 py-1 px-2 border-2 border-charcoal bg-[#F0EAE1] rounded text-[11px] font-extrabold !text-[#181B18] text-center tracking-widest uppercase">
                          IDEAS
                        </div>
                        <div className="w-36 py-1 px-2 border-2 border-charcoal bg-[#E4DDD2] rounded text-[11px] font-extrabold !text-[#181B18] text-center tracking-widest uppercase -mt-0.5">
                          DISCUSS
                        </div>
                        <div className="w-40 py-1 px-2 border-2 border-charcoal bg-forest-900 text-white rounded text-[11px] font-extrabold text-center tracking-widest uppercase -mt-0.5">
                          BELONG
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Footer Strip with Quote */}
      <div className="w-full border-t border-[#EBE6DC] bg-white/60 py-4 text-center">
        <p className="text-sm text-charcoal/70 font-medium">
          ⚡ Powered by <span className="font-bold text-forest-900">Go (Gin)</span> • <span className="font-bold text-forest-900">Redis ZSET & Pub/Sub</span> • <span className="font-bold text-forest-900">MongoDB</span> • Truly Real-Time WebSockets
        </p>
      </div>
    </div>
  );
};
