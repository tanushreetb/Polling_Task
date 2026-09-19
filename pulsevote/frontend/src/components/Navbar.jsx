import React, { useState, useEffect } from 'react';
import { PulseWaveIcon } from './BotanicalAccents';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, Menu, X, User, Plus } from 'lucide-react';
import { Button } from './Button';
import { FloatingDock } from './FloatingDock';

export const Navbar = ({ currentView, setView, onOpenLogin }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('pulsevote_dark') === 'true';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('pulsevote_dark', darkMode ? 'true' : 'false');
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <header className="w-full border-b border-[#EBE6DC] bg-paper/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => setView('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-forest-900/10 flex items-center justify-center text-forest-900 group-hover:scale-105 transition-transform">
            <PulseWaveIcon className="w-5 h-5 text-forest-900" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-forest-900">
            PulseVote
          </span>
        </div>

        {/* Desktop Navigation: ThreeUI Sylva Floating Glass Dock */}
        <div className="hidden md:flex items-center">
          <FloatingDock
            currentView={currentView}
            setView={setView}
            onOpenCreate={() => setView('create')}
          />
        </div>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('dashboard')}
                className="flex items-center gap-2 text-sm font-semibold text-forest-900 dark:text-emerald-300 px-3 py-1.5 rounded-full hover:bg-forest-900/5 dark:hover:bg-white/5 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-forest-900 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {user?.name ? user.name[0].toUpperCase() : 'T'}
                </div>
                <span className="hidden sm:inline">{user?.name || 'Dashboard'}</span>
              </button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setView('create')}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Create Poll
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onOpenLogin}
                className="text-xs sm:text-sm font-bold text-forest-900 dark:text-emerald-300 hover:text-charcoal px-3 py-2 rounded-full hover:bg-forest-900/5 transition-colors"
              >
                Log In
              </button>
              <Button
                variant="primary"
                size="md"
                onClick={onOpenLogin}
                rightIcon={<span className="text-base">→</span>}
              >
                Get Started
              </Button>
            </div>
          )}

          {/* Dark Mode Moon / Sun Toggle matching screenshot */}
          <button
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle dark mode"
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
              darkMode
                ? 'bg-[#1D2B1F] border-[#3A4E3D] text-amber-400 shadow-sm'
                : 'border-[#D9D3C7] text-charcoal hover:bg-stone-200/50'
            }`}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400 animate-pulse" /> : <Moon className="w-4 h-4 text-charcoal" />}
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
              darkMode
                ? 'bg-[#1D2B1F] border-[#3A4E3D] text-amber-400'
                : 'border-[#D9D3C7] text-charcoal'
            }`}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-charcoal hover:bg-black/5 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 border-t border-[#EBE6DC] bg-paper flex flex-col gap-3">
          <button
            onClick={() => { setView('home'); setMobileMenuOpen(false); }}
            className="text-left py-2 font-medium text-charcoal hover:text-forest-900"
          >
            Home
          </button>
          <button
            onClick={() => { setView('explore'); setMobileMenuOpen(false); }}
            className="text-left py-2 font-medium text-charcoal hover:text-forest-900"
          >
            Explore All Polls
          </button>
          <button
            onClick={() => { setView('results'); setMobileMenuOpen(false); }}
            className="text-left py-2 font-medium text-charcoal hover:text-forest-900"
          >
            Live Results
          </button>
          <button
            onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }}
            className="text-left py-2 font-medium text-charcoal hover:text-forest-900"
          >
            Host Dashboard
          </button>
          <button
            onClick={() => { setView('create'); setMobileMenuOpen(false); }}
            className="text-left py-2 font-medium text-charcoal hover:text-forest-900"
          >
            Create a New Poll
          </button>
          {isAuthenticated ? (
            <div className="pt-2 flex flex-col gap-2">
              <div className="flex items-center gap-2.5 px-3 py-2 bg-forest-900/10 dark:bg-forest-900/20 rounded-xl text-forest-900 text-sm font-semibold">
                <div className="w-7 h-7 rounded-full bg-forest-900 text-white flex items-center justify-center text-xs font-bold">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span>{user?.name || 'Logged in'}</span>
              </div>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full text-center py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
              >
                Log Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => { onOpenLogin(); setMobileMenuOpen(false); }}
              className="mt-2 w-full bg-forest-900 text-white font-medium py-2.5 rounded-full flex items-center justify-center gap-2"
            >
              <span>Get Started →</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
