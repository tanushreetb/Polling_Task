import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  PlusCircle,
  Vote,
  BarChart2,
  User,
  Settings,
  LogOut,
  Heart,
  Users,
  Eye,
  Plus,
  ArrowRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  Mail,
  Shield,
  Bell,
  Zap,
  Check,
  Copy,
  Share2,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { PulseWaveIcon, LeafSprig } from '../components/BotanicalAccents';
import { StickyNote } from '../components/StickyNote';
import { useAuth } from '../context/AuthContext';
import { pollAPI } from '../utils/api';
import { Button } from '../components/Button';
import { SharePollModal } from '../components/SharePollModal';

export const HostDashboard = ({ setView, onSelectPoll, onPollResults }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'my-polls' | 'analytics' | 'profile' | 'settings'
  const [toastMessage, setToastMessage] = useState('');
  const [activeSharePoll, setActiveSharePoll] = useState(null);

  // Sidebar Collapsed State with LocalStorage persistence
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('pulsevote_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('pulsevote_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || 'Tanushree');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'tanushree@pulsevote.com');
  const [profileBio, setProfileBio] = useState('Full-stack engineer passionate about real-time interactive experiences.');
  const [profileRole, setProfileRole] = useState('Lead Poll Host & Creator');

  // Settings State
  const [wsAutoReconnect, setWsAutoReconnect] = useState(true);
  const [voteSoundChime, setVoteSoundChime] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [durabilitySyncInterval, setDurabilitySyncInterval] = useState('10 seconds');

  const [metrics, setMetrics] = useState({
    total_polls: 12,
    active_polls: 8,
    total_votes: 1800,
    unique_voters: 256,
  });

  const [polls, setPolls] = useState([
    {
      id: "65f1a0b1c2d3e4f5a6b7c8d1",
      title: "Which programming language do you love the most?",
      total_votes: 245,
      created_at_text: "Created 2 days ago",
      is_active: true,
      thumbnail: "💻",
    },
    {
      id: "65f1a0b1c2d3e4f5a6b7c8d2",
      title: "Best tech trend in 2026?",
      total_votes: 189,
      created_at_text: "Created 4 days ago",
      is_active: true,
      thumbnail: "🚀",
    },
    {
      id: "65f1a0b1c2d3e4f5a6b7c8d3",
      title: "Which is better for learning?",
      total_votes: 320,
      created_at_text: "Created 1 week ago",
      is_active: false,
      thumbnail: "📚",
    },
  ]);

  useEffect(() => {
    let localPolls = [];
    try {
      localPolls = JSON.parse(localStorage.getItem('pulsevote_local_polls') || '[]');
    } catch (e) {}

    pollAPI.getUserPolls()
      .then((res) => {
        if (res.data?.metrics) {
          setMetrics(prev => ({
            ...res.data.metrics,
            total_polls: res.data.metrics.total_polls + localPolls.length,
          }));
        }
        if (res.data?.polls && res.data.polls.length > 0) {
          const combined = [...localPolls, ...res.data.polls.filter(p => !localPolls.some(lp => lp.id === p.id))];
          setPolls(combined);
        } else if (localPolls.length > 0) {
          setPolls(prev => [...localPolls, ...prev.filter(p => !localPolls.some(lp => lp.id === p.id))]);
        }
      })
      .catch(() => {
        if (localPolls.length > 0) {
          setPolls(prev => [...localPolls, ...prev.filter(p => !localPolls.some(lp => lp.id === p.id))]);
        }
      });
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...(user || {}),
      name: profileName,
      email: profileEmail,
    };
    localStorage.setItem('pulsevote_user', JSON.stringify(updatedUser));
    showToast('Profile updated successfully!');
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    showToast('Preferences saved successfully!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative">
      {/* Share & QR Code Modal */}
      <SharePollModal
        poll={activeSharePoll}
        isOpen={Boolean(activeSharePoll)}
        onClose={() => setActiveSharePoll(null)}
      />

      {/* Success Notification Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 bg-forest-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm font-semibold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Re-open Sidebar Button when hidden */}
      {sidebarCollapsed && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 flex items-center gap-3"
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleSidebar}
            leftIcon={<PanelLeftOpen className="w-4 h-4 text-forest-900" />}
          >
            Show Sidebar
          </Button>
          <span className="text-xs text-charcoal/60 font-medium">
            Sidebar hidden for wider dashboard view
          </span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar matching Screen 4 with Collapsible Toggle */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.aside
              initial={{ opacity: 0, width: 0, scale: 0.95 }}
              animate={{ opacity: 1, width: 'auto', scale: 1 }}
              exit={{ opacity: 0, width: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="lg:col-span-3 lg:sticky lg:top-24 h-fit max-h-[calc(100vh-7.5rem)] overflow-y-auto flex flex-col justify-between bg-white dark:bg-[#18221B] rounded-3xl p-5 border border-[#EBE5DB] dark:border-[#2A3B2D] shadow-soft z-10"
            >
              <div>
                {/* Sidebar Logo & Hide Toggle */}
                <div className="flex items-center justify-between mb-6 px-2">
                  <div className="flex items-center gap-2.5">
                    <PulseWaveIcon className="w-5 h-5 text-forest-900" />
                    <span className="font-extrabold text-xl tracking-tight text-forest-900">
                      PulseVote
                    </span>
                  </div>

                  {/* Hide Sidebar Button */}
                  <button
                    onClick={toggleSidebar}
                    title="Hide sidebar"
                    aria-label="Hide sidebar"
                    className="w-8 h-8 rounded-xl hover:bg-stone-100 dark:hover:bg-white/10 flex items-center justify-center text-charcoal/60 hover:text-charcoal transition-colors"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                </div>

                {/* Navigation List */}
                <nav className="space-y-1 text-sm font-semibold">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all ${
                      activeTab === 'dashboard'
                        ? 'bg-[#E3F2E6] dark:bg-emerald-950/60 text-forest-900 dark:text-emerald-300 font-bold shadow-xs border border-emerald-200/50 dark:border-emerald-800/40'
                        : 'text-charcoal/70 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/5 hover:text-charcoal dark:hover:text-white'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={() => setView('create')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-charcoal/70 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/5 hover:text-charcoal dark:hover:text-white transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Poll</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('my-polls')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all ${
                      activeTab === 'my-polls'
                        ? 'bg-[#E3F2E6] dark:bg-emerald-950/60 text-forest-900 dark:text-emerald-300 font-bold shadow-xs border border-emerald-200/50 dark:border-emerald-800/40'
                        : 'text-charcoal/70 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/5 hover:text-charcoal dark:hover:text-white'
                    }`}
                  >
                    <Vote className="w-4 h-4" />
                    <span>My Polls</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all ${
                      activeTab === 'analytics'
                        ? 'bg-[#E3F2E6] dark:bg-emerald-950/60 text-forest-900 dark:text-emerald-300 font-bold shadow-xs border border-emerald-200/50 dark:border-emerald-800/40'
                        : 'text-charcoal/70 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/5 hover:text-charcoal dark:hover:text-white'
                    }`}
                  >
                    <BarChart2 className="w-4 h-4" />
                    <span>Analytics</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all ${
                      activeTab === 'profile'
                        ? 'bg-[#E3F2E6] dark:bg-emerald-950/60 text-forest-900 dark:text-emerald-300 font-bold shadow-xs border border-emerald-200/50 dark:border-emerald-800/40'
                        : 'text-charcoal/70 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/5 hover:text-charcoal dark:hover:text-white'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all ${
                      activeTab === 'settings'
                        ? 'bg-[#E3F2E6] dark:bg-emerald-950/60 text-forest-900 dark:text-emerald-300 font-bold shadow-xs border border-emerald-200/50 dark:border-emerald-800/40'
                        : 'text-charcoal/70 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/5 hover:text-charcoal dark:hover:text-white'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 transition-all pt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </nav>
              </div>

              {/* Sticky Note at Bottom of Sidebar matching screenshot */}
              <div className="relative mt-6 shrink-0">
                <StickyNote color="mint" rotate="-2deg" tape={false} className="p-3 shadow-xs">
                  <p className="font-hand text-base leading-snug">
                    Curiosity<br />
                    builds better<br />
                    conversations. 🌿
                  </p>
                </StickyNote>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area: dynamically expands to col-span-12 when sidebar is collapsed */}
        <div className={`${sidebarCollapsed ? 'lg:col-span-12' : 'lg:col-span-9'} space-y-8 transition-all duration-300`}>
          {/* TAB 1: DASHBOARD (Exact Match to Screenshot Screen 4) */}
          {activeTab === 'dashboard' && (
            <>
              {/* Header Row: Welcome back & New Poll CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal flex items-center gap-2">
                    <span>Welcome back, {profileName}!</span>
                    <span>👋</span>
                  </h2>
                  <p className="text-sm text-charcoal/60 mt-1">
                    Here's what's happening with your polls.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setView('create')}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    New Poll
                  </Button>
                </div>
              </div>

              {/* 4 Metric Cards with hover lift */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-white dark:bg-[#18221B] rounded-2xl p-5 border border-[#EBE5DB] dark:border-[#2C3E30] shadow-xs hover:border-[#D9D3C7] transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                    <Vote className="w-4 h-4" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-charcoal">
                    {metrics.total_polls}
                  </p>
                  <p className="text-xs font-semibold text-charcoal/60 mt-1">
                    Total Polls
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-white dark:bg-[#18221B] rounded-2xl p-5 border border-[#EBE5DB] dark:border-[#2C3E30] shadow-xs hover:border-[#D9D3C7] transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-charcoal">
                    {metrics.active_polls}
                  </p>
                  <p className="text-xs font-semibold text-charcoal/60 mt-1">
                    Active Polls
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-white dark:bg-[#18221B] rounded-2xl p-5 border border-[#EBE5DB] dark:border-[#2C3E30] shadow-xs hover:border-[#D9D3C7] transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                    <Users className="w-4 h-4" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-charcoal">
                    {metrics.total_votes >= 1000 ? `${(metrics.total_votes / 1000).toFixed(1)}K` : metrics.total_votes}
                  </p>
                  <p className="text-xs font-semibold text-charcoal/60 mt-1">
                    Total Votes
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-white dark:bg-[#18221B] rounded-2xl p-5 border border-[#EBE5DB] dark:border-[#2C3E30] shadow-xs hover:border-[#D9D3C7] transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-3">
                    <Eye className="w-4 h-4" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-charcoal">
                    {metrics.unique_voters}
                  </p>
                  <p className="text-xs font-semibold text-charcoal/60 mt-1">
                    Unique Voters
                  </p>
                </motion.div>
              </div>

              {/* Recent Polls List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-lg text-charcoal">Recent Polls</h3>
                  <button
                    onClick={() => setActiveTab('my-polls')}
                    className="text-xs font-bold text-forest-900 hover:underline flex items-center gap-1"
                  >
                    <span>View All</span>
                    <span>→</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {polls.map((poll) => {
                    const isActive = poll.is_active !== false;
                    return (
                      <motion.div
                        key={poll.id}
                        whileHover={{ y: -1 }}
                        className="bg-white dark:bg-[#18221B] rounded-2xl p-4 border border-[#EBE5DB] dark:border-[#2C3E30] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-card hover:border-forest-900/30 transition-all cursor-pointer group"
                      >
                        <div
                          onClick={() => onSelectPoll && onSelectPoll(poll)}
                          className="flex items-center gap-3.5 min-w-0 flex-1"
                        >
                          <div className="w-12 h-12 rounded-xl bg-[#F4EFE6] dark:bg-white/5 border border-[#E8E1D5] dark:border-white/10 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                            {poll.thumbnail || '📊'}
                          </div>
                          <div className="min-w-0">
                            <h4
                              className="font-bold text-sm sm:text-base text-charcoal truncate group-hover:text-forest-900 transition-colors"
                            >
                              {poll.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-charcoal/60 mt-1">
                              <span>{poll.total_votes || 0} votes</span>
                              <span>•</span>
                              <span>{poll.created_at_text || 'Created recently'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              isActive
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span>{isActive ? 'Active' : 'Closed'}</span>
                          </span>

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectPoll && onSelectPoll(poll);
                            }}
                            rightIcon={<span>→</span>}
                          >
                            Vote
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPollResults && onPollResults(poll.id);
                            }}
                          >
                            Results
                          </Button>

                          {/* Share & QR Code Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSharePoll(poll);
                            }}
                            className="p-2 rounded-xl border border-[#D9D3C7] dark:border-[#2C3E30] text-charcoal/70 hover:text-forest-900 hover:bg-forest-900/5 transition-colors"
                            title="Share link & QR code"
                            aria-label="Share link & QR code"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Handwritten Quote Strip */}
              <div className="py-4 text-center">
                <p className="font-hand text-xl text-charcoal/80">
                  “Small questions. Big perspectives.” — PulseVote
                </p>
              </div>
            </>
          )}

          {/* TAB 2: PROFILE VIEW */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-[#18221B] rounded-3xl p-6 sm:p-10 border border-[#EBE5DB] dark:border-[#2C3E30] shadow-soft space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0EBE1] dark:border-[#2C3E30]">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal">
                    Host Profile
                  </h2>
                  <p className="text-sm text-charcoal/60 mt-1">
                    Manage your public host identity and poll creator credentials.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-forest-50 border border-forest-200 text-forest-900 text-xs font-bold self-start">
                  <Shield className="w-3.5 h-3.5 text-forest-700" />
                  <span>Verified Host</span>
                </span>
              </div>

              {/* Avatar Profile Card */}
              <div className="flex items-center gap-5 p-5 rounded-2xl bg-paper/70 dark:bg-black/20 border border-[#EAE5DC] dark:border-[#2C3E30]">
                <div className="w-16 h-16 rounded-2xl bg-forest-900 text-white flex items-center justify-center font-extrabold text-2xl shadow-sm">
                  {profileName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-charcoal">{profileName}</h3>
                  <p className="text-xs text-charcoal/60">{profileEmail}</p>
                  <p className="text-xs text-forest-900 font-semibold mt-1">
                    {profileRole} • Active since 2026
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-charcoal/80 mb-2 uppercase tracking-wide">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D9D3C7] dark:border-[#2C3E30] bg-transparent text-charcoal text-sm outline-none focus:border-forest-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/80 mb-2 uppercase tracking-wide">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D9D3C7] dark:border-[#2C3E30] bg-transparent text-charcoal text-sm outline-none focus:border-forest-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal/80 mb-2 uppercase tracking-wide">
                    Host Bio
                  </label>
                  <textarea
                    rows={3}
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D9D3C7] dark:border-[#2C3E30] bg-transparent text-charcoal text-sm outline-none focus:border-forest-900 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-[#F0EBE1] dark:border-[#2C3E30]">
                  <Button type="submit" variant="primary" size="md">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: SETTINGS VIEW */}
          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-[#18221B] rounded-3xl p-6 sm:p-10 border border-[#EBE5DB] dark:border-[#2C3E30] shadow-soft space-y-8">
              <div className="pb-6 border-b border-[#F0EBE1] dark:border-[#2C3E30]">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal">
                  Application Settings
                </h2>
                <p className="text-sm text-charcoal/60 mt-1">
                  Configure real-time engine preferences and dashboard alerts.
                </p>
              </div>

              {/* Real-Time Engine Info */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-base text-charcoal flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Real-Time Engine Configuration</span>
                </h3>

                <div className="p-4 rounded-2xl bg-paper/80 dark:bg-black/20 border border-[#EAE5DC] dark:border-[#2C3E30] space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-charcoal">Redis ZSET Vote Tallying</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold">
                      ACTIVE (O(log N))
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-charcoal">MongoDB Durability Worker</span>
                    <span className="font-mono text-xs text-charcoal/70 bg-white dark:bg-black/40 px-2 py-0.5 rounded border border-[#E0DACF] dark:border-[#2C3E30]">
                      Sync Every {durabilitySyncInterval}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-charcoal">Gorilla WebSocket Hub</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-bold">
                      STREAMING READY
                    </span>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <form onSubmit={handleSaveSettings} className="space-y-5 pt-2">
                <div className="space-y-4">
                  {/* WebSocket Auto Reconnect */}
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-charcoal">WebSocket Auto-Reconnect</p>
                      <p className="text-xs text-charcoal/60">Automatically reconnect browser streams if network drops.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWsAutoReconnect(!wsAutoReconnect)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                        wsAutoReconnect ? 'bg-forest-900' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        wsAutoReconnect ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Email Notifications */}
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-charcoal">Vote Milestones</p>
                      <p className="text-xs text-charcoal/60">Receive alerts when a poll hits 100, 500, and 1,000 votes.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailAlerts(!emailAlerts)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                        emailAlerts ? 'bg-forest-900' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        emailAlerts ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-[#F0EBE1] dark:border-[#2C3E30]">
                  <Button type="submit" variant="primary" size="md">
                    Save Preferences
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: MY POLLS VIEW */}
          {activeTab === 'my-polls' && (
            <div className="bg-white dark:bg-[#18221B] rounded-3xl p-6 sm:p-10 border border-[#EBE5DB] dark:border-[#2C3E30] shadow-soft space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#F0EBE1] dark:border-[#2C3E30]">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal">
                    All My Polls
                  </h2>
                  <p className="text-sm text-charcoal/60 mt-1">
                    Manage and inspect every poll you have hosted.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setView('create')}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Create Poll
                </Button>
              </div>

              <div className="space-y-3">
                {polls.map((poll) => (
                  <motion.div
                    key={poll.id}
                    whileHover={{ y: -1 }}
                    className="p-4 rounded-2xl border border-[#EBE5DB] dark:border-[#2C3E30] hover:border-forest-900/40 dark:hover:border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all cursor-pointer group hover:shadow-card bg-white dark:bg-[#18221B]"
                  >
                    <div
                      onClick={() => onSelectPoll && onSelectPoll(poll)}
                      className="flex items-center gap-3.5 min-w-0 flex-1"
                    >
                      <span className="text-2xl shrink-0 group-hover:scale-105 transition-transform">{poll.thumbnail || '📊'}</span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-base text-charcoal group-hover:text-forest-900 transition-colors truncate">{poll.title}</h4>
                        <p className="text-xs text-charcoal/60 mt-0.5">{poll.total_votes || 0} votes recorded</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPoll && onSelectPoll(poll);
                        }}
                        rightIcon={<span>→</span>}
                      >
                        Vote
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPollResults && onPollResults(poll.id);
                        }}
                      >
                        Results
                      </Button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSharePoll(poll);
                        }}
                        className="p-2 rounded-xl border border-[#D9D3C7] dark:border-[#2C3E30] text-charcoal/70 hover:text-forest-900 hover:bg-forest-900/5 transition-colors"
                        title="Share link & QR code"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ANALYTICS VIEW */}
          {activeTab === 'analytics' && (
            <div className="bg-white dark:bg-[#18221B] rounded-3xl p-6 sm:p-10 border border-[#EBE5DB] dark:border-[#2C3E30] shadow-soft space-y-6">
              <div className="pb-4 border-b border-[#F0EBE1] dark:border-[#2C3E30]">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal">
                  Live Analytics & Telemetry
                </h2>
                <p className="text-sm text-charcoal/60 mt-1">
                  Real-time Redis ZSET and WebSocket throughput metrics.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40">
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Redis Increment Speed</p>
                  <p className="text-3xl font-extrabold text-emerald-950 dark:text-emerald-100 mt-1">0.8 ms</p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">ZINCRBY in-memory execution</p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40">
                  <p className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Pub/Sub Fan-out</p>
                  <p className="text-3xl font-extrabold text-blue-950 dark:text-blue-100 mt-1">&lt; 2 ms</p>
                  <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-1">To all connected WebSockets</p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40">
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Durability Batches</p>
                  <p className="text-3xl font-extrabold text-amber-950 dark:text-amber-100 mt-1">100%</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">Periodic MongoDB flush active</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#FAF8F3] dark:bg-black/20 border border-[#EAE5DC] dark:border-[#2C3E30]">
                <h4 className="font-bold text-charcoal mb-3 text-sm">Active Polling Rooms</h4>
                <p className="text-xs text-charcoal/70 leading-relaxed">
                  Every active poll is isolated into its own Redis channel (<code className="font-mono text-xs bg-white dark:bg-black/40 px-1.5 py-0.5 rounded border border-[#EAE5DC] dark:border-[#2C3E30]">poll:{'{id}'}:events</code>). High vote volume on one poll will never block or starve broadcasts in another room.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
