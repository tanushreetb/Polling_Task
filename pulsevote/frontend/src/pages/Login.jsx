import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { PulseWaveIcon, LeafSprig } from '../components/BotanicalAccents';
import { StickyNote } from '../components/StickyNote';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';

export const Login = ({
  initialMode = 'login', // 'login' | 'register'
  onSwitchToRegister,
  onSwitchToLogin,
  onClose,
  onSuccess,
  isFullPage = false
}) => {
  const { login, loginDemo, register, loading } = useAuth();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('tanushree@pulsevote.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Compute password strength for registration
  const getPasswordStrength = () => {
    if (!password) return { score: 0, text: '', color: 'bg-stone-200' };
    if (password.length < 6) return { score: 1, text: 'Too short', color: 'bg-rose-500' };
    const hasNum = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    if (password.length >= 8 && hasNum && hasSpecial) return { score: 3, text: 'Strong', color: 'bg-emerald-500' };
    if (password.length >= 6) return { score: 2, text: 'Medium', color: 'bg-amber-500' };
    return { score: 1, text: 'Weak', color: 'bg-rose-500' };
  };
  const strength = getPasswordStrength();

  // Handle Demo One-Click Sign In
  const handleQuickDemo = async () => {
    setError('');
    const res = loginDemo();
    if (res.success) {
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    }
  };

  // Prefill demo credentials without auto-submitting
  const handlePrefillDemo = () => {
    setMode('login');
    setEmail('tanushree@pulsevote.com');
    setPassword('password123');
    setError('');
  };

  // Prefill clean new user template
  const handleSwitchToNewUser = () => {
    setMode('register');
    setName('');
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      const res = await login(email, password);
      if (res.success) {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        setError(res.error || 'Failed to login. Please check your credentials.');
      }
    } else {
      if (!name.trim()) {
        setError('Please provide your full name');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
      const res = await register(name, email, password);
      if (res.success) {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        setError(res.error || 'Failed to create account. Please try again.');
      }
    }
  };

  const content = (
    <div className="relative max-w-md w-full mx-auto p-2 sm:p-4">
      {/* Botanical Leaf Sprigs framing the card with micro-swaying animations */}
      <motion.div
        animate={{ rotate: [10, 15, 10], y: [0, -3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-8 -left-8 pointer-events-none opacity-40 select-none"
      >
        <LeafSprig className="w-18 h-18 text-forest-900" />
      </motion.div>
      <motion.div
        animate={{ rotate: [-42, -47, -42], y: [0, 3, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-8 -right-8 pointer-events-none opacity-40 select-none"
      >
        <LeafSprig className="w-18 h-18 text-forest-900" />
      </motion.div>

      {/* Main Glass Card */}
      <div className="bg-white/95 dark:bg-[#18231C]/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-[#EBE5DB] dark:border-[#2C3E30] shadow-card relative overflow-visible">
        
        {/* Sticky Note Top Right: Changes greeting based on mode */}
        <div className="absolute -top-5 -right-4 z-20 pointer-events-none">
          <StickyNote
            color={mode === 'login' ? 'yellow' : 'mint'}
            rotate={mode === 'login' ? '4deg' : '-3deg'}
            tape={false}
            className="py-2.5 px-3.5 shadow-md transform hover:scale-105 transition-transform"
          >
            {mode === 'login' ? (
              <>
                <span className="text-xl font-bold font-hand block leading-tight">
                  Welcome<br />Back!
                </span>
                <span className="text-xl font-hand block text-center mt-0.5">:)</span>
              </>
            ) : (
              <>
                <span className="text-xl font-bold font-hand block leading-tight">
                  Join Us!
                </span>
                <span className="text-lg font-hand block text-center mt-0.5">🌱 ✨</span>
              </>
            )}
          </StickyNote>
        </div>

        {/* Brand Header */}
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-9 h-9 rounded-xl bg-forest-900/10 dark:bg-emerald-950/50 flex items-center justify-center text-forest-900 dark:text-emerald-400">
            <PulseWaveIcon className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-forest-900 dark:text-emerald-300">
            PulseVote
          </span>
        </div>

        <p className="text-xs text-charcoal/60 dark:text-stone-300 mb-5">
          {mode === 'login'
            ? 'Sign in to access your polls and live voter responses.'
            : 'Create a clean host workspace without mock data.'}
        </p>

        {/* Interactive Mode Switcher Tabs */}
        <div className="flex items-center bg-[#F3EFE8] dark:bg-white/5 p-1 rounded-2xl mb-5 relative border border-[#E5DFD3] dark:border-white/10">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors relative z-10 ${
              mode === 'login'
                ? 'text-forest-900 dark:text-white'
                : 'text-charcoal/60 dark:text-stone-400 hover:text-charcoal'
            }`}
          >
            {mode === 'login' && (
              <motion.div
                layoutId="activeAuthTab"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                className="absolute inset-0 bg-white dark:bg-[#223327] rounded-xl shadow-xs -z-10 border border-[#E2DBD0] dark:border-white/10"
              />
            )}
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors relative z-10 ${
              mode === 'register'
                ? 'text-forest-900 dark:text-white'
                : 'text-charcoal/60 dark:text-stone-400 hover:text-charcoal'
            }`}
          >
            {mode === 'register' && (
              <motion.div
                layoutId="activeAuthTab"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                className="absolute inset-0 bg-white dark:bg-[#223327] rounded-xl shadow-xs -z-10 border border-[#E2DBD0] dark:border-white/10"
              />
            )}
            New Account
          </button>
        </div>

        {/* Interactive Quick Demo Banner */}
        <div className="mb-5 p-3.5 rounded-2xl bg-forest-50/70 dark:bg-emerald-950/30 border border-forest-200/70 dark:border-emerald-800/40 relative group overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-forest-900 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Zap className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-forest-900 dark:text-emerald-300">
                    Demo Account
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 uppercase tracking-wider">
                    Mock Data
                  </span>
                </div>
                <p className="text-[11px] text-charcoal/70 dark:text-stone-300 mt-0.5 leading-snug">
                  Experience pre-seeded polls, 500+ votes & live telemetry without registration.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-forest-200/50 dark:border-emerald-800/30 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-1.5 px-3 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>1-Click Demo Login (Tanushree)</span>
            </button>
          </div>
        </div>

        {/* Shake-animated Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.95 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                x: [-10, 10, -8, 8, -4, 4, 0]
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900/50 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span className="flex-1">{error}</span>
              <button
                type="button"
                onClick={() => setError('')}
                className="text-rose-500 hover:text-rose-700 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name field (Register only) */}
          <AnimatePresence>
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <label className="block text-xs font-semibold text-charcoal/80 dark:text-stone-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal/40 dark:text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required={mode === 'register'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9D3C7] dark:border-[#2C3E30] focus:border-forest-900 dark:focus:border-emerald-500 focus:ring-1 focus:ring-forest-900 outline-none text-sm text-charcoal dark:text-white bg-white dark:bg-[#141C16] transition-all placeholder:text-charcoal/40"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-charcoal/80 dark:text-stone-300">
                Email Address
              </label>
              {mode === 'login' && email !== 'tanushree@pulsevote.com' && (
                <button
                  type="button"
                  onClick={handlePrefillDemo}
                  className="text-[11px] font-bold text-forest-900 dark:text-emerald-400 hover:underline"
                >
                  Use Demo Email
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal/40 dark:text-stone-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9D3C7] dark:border-[#2C3E30] focus:border-forest-900 dark:focus:border-emerald-500 focus:ring-1 focus:ring-forest-900 outline-none text-sm text-charcoal dark:text-white bg-white dark:bg-[#141C16] transition-all placeholder:text-charcoal/40"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-semibold text-charcoal/80 dark:text-stone-300 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal/40 dark:text-stone-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'login' ? 'Enter password' : 'At least 6 characters'}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D9D3C7] dark:border-[#2C3E30] focus:border-forest-900 dark:focus:border-emerald-500 focus:ring-1 focus:ring-forest-900 outline-none text-sm text-charcoal dark:text-white bg-white dark:bg-[#141C16] transition-all placeholder:text-charcoal/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-charcoal/40 hover:text-charcoal dark:hover:text-white transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Indicator for Registration */}
            {mode === 'register' && password.length > 0 && (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-1 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden flex gap-1">
                  <div className={`h-full flex-1 rounded-full ${strength.score >= 1 ? strength.color : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 rounded-full ${strength.score >= 2 ? strength.color : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 rounded-full ${strength.score >= 3 ? strength.color : 'bg-transparent'}`} />
                </div>
                <span className="text-[10px] font-bold text-charcoal/60 dark:text-stone-400">
                  {strength.text}
                </span>
              </div>
            )}
          </div>

          {/* Remember me & Forgot Password */}
          {mode === 'login' && (
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-charcoal/80 dark:text-stone-300 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-forest-900 border-[#D9D3C7] focus:ring-forest-900"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-charcoal/60 dark:text-stone-400 hover:text-forest-900 dark:hover:text-emerald-400 font-medium"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit Action Button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading}
            loading={loading}
            className="w-full mt-2 group"
          >
            <span>{mode === 'login' ? 'Log In to PulseVote' : 'Create Host Account'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#EAE5DB] dark:border-white/10" />
          </div>
          <span className="relative bg-white dark:bg-[#18231C] px-3 text-[10px] font-extrabold text-charcoal/40 dark:text-stone-400 uppercase tracking-widest">
            or continue with
          </span>
        </div>

        {/* Social Authentication */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleSubmit}
            className="py-2 px-3 border border-[#D9D3C7] dark:border-[#2C3E30] rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-charcoal dark:text-white hover:bg-stone-50 dark:hover:bg-white/5 transition-all active:scale-95 shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="py-2 px-3 border border-[#D9D3C7] dark:border-[#2C3E30] rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-charcoal dark:text-white hover:bg-stone-50 dark:hover:bg-white/5 transition-all active:scale-95 shadow-2xs"
          >
            <svg className="w-4 h-4 fill-charcoal dark:fill-white" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>GitHub</span>
          </button>
        </div>

        {/* Footer switch prompt */}
        <p className="text-center text-xs text-charcoal/60 dark:text-stone-400 mt-5">
          {mode === 'login' ? (
            <>
              Want a clean workspace without mock data?{' '}
              <button
                type="button"
                onClick={handleSwitchToNewUser}
                className="font-bold text-forest-900 dark:text-emerald-400 hover:underline"
              >
                Sign up as New User
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className="font-bold text-forest-900 dark:text-emerald-400 hover:underline"
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>

      {/* Forgot Password Friendly Dialog */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#18231C] rounded-3xl p-6 max-w-sm w-full border border-[#EBE5DB] dark:border-[#2C3E30] shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => { setShowForgotModal(false); setForgotSent(false); }}
                className="absolute top-4 right-4 text-charcoal/50 hover:text-charcoal dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mb-3">
                <HelpCircle className="w-5 h-5" />
              </div>

              <h4 className="text-base font-extrabold text-charcoal dark:text-white mb-1">
                Password Recovery
              </h4>

              {forgotSent ? (
                <div className="text-xs text-charcoal/70 dark:text-stone-300 space-y-3 py-2">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                    A password recovery link has been simulated for <strong>{email}</strong>!
                  </div>
                  <p className="text-[11px] text-charcoal/50">
                    For the demo account, you can always sign in with password: <code className="font-mono bg-stone-100 px-1 py-0.5 rounded">password123</code>
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => { setShowForgotModal(false); setForgotSent(false); }}
                  >
                    Got it
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <p className="text-xs text-charcoal/60 dark:text-stone-300">
                    Enter your email to receive recovery instructions.
                  </p>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-[#D9D3C7] dark:border-[#2C3E30] text-xs outline-none bg-white dark:bg-[#141C16]"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => setForgotSent(true)}
                  >
                    Send Reset Link
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  if (isFullPage) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex flex-col justify-center items-center py-12 px-4 relative">
        {/* Subtle glowing ambient backdrop orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-forest-900/5 dark:bg-emerald-500/5 blur-3xl pointer-events-none" />
        {content}
      </div>
    );
  }

  return content;
};
