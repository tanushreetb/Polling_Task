import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { PulseWaveIcon, LeafSprig } from '../components/BotanicalAccents';
import { StickyNote } from '../components/StickyNote';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';

export const Login = ({ onSwitchToRegister, onClose, onSuccess }) => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('tanushree@pulsevote.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } else {
      setError(res.error || 'Failed to login');
    }
  };

  return (
    <div className="relative max-w-md w-full mx-auto my-6 p-2 sm:p-4">
      {/* Botanical Leaf Sprigs framing the card */}
      <div className="absolute -top-6 -left-8 pointer-events-none opacity-40">
        <LeafSprig className="w-16 h-16 text-forest-900 rotate-12" />
      </div>
      <div className="absolute -bottom-6 -right-8 pointer-events-none opacity-40">
        <LeafSprig className="w-16 h-16 text-forest-900 -rotate-45" />
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EBE5DB] shadow-card relative">
        {/* Sticky Note Top Right: Welcome Back! :) */}
        <div className="absolute -top-5 -right-4 z-20">
          <StickyNote color="yellow" rotate="3deg" tape={false} className="py-2.5 px-3.5 shadow-md">
            <span className="text-xl font-bold font-hand block leading-tight">
              Welcome<br />Back!
            </span>
            <span className="text-xl font-hand block text-center mt-0.5">:)</span>
          </StickyNote>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-2">
          <PulseWaveIcon className="w-6 h-6 text-forest-900" />
          <span className="font-extrabold text-2xl tracking-tight text-forest-900">
            PulseVote
          </span>
        </div>

        <p className="text-sm text-charcoal/60 mb-6">
          Log in to continue your conversations.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-charcoal/80 mb-1.5">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal/40">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9D3C7] focus:border-forest-900 focus:ring-1 focus:ring-forest-900 outline-none text-sm text-charcoal transition-all placeholder:text-charcoal/40 bg-white"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-charcoal/80 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal/40">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D9D3C7] focus:border-forest-900 focus:ring-1 focus:ring-forest-900 outline-none text-sm text-charcoal transition-all placeholder:text-charcoal/40 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-charcoal/40 hover:text-charcoal"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-charcoal/80 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-forest-900 border-[#D9D3C7] focus:ring-forest-900"
              />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="text-charcoal/60 hover:text-forest-900 font-medium">
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading}
            loading={loading}
            className="w-full mt-2"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        {/* OR Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#EAE5DB]" />
          </div>
          <span className="relative bg-white px-3 text-[11px] font-bold text-charcoal/40 uppercase tracking-wider">
            OR
          </span>
        </div>

        {/* Social Buttons matching screenshot */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-2.5 px-4 border border-[#D9D3C7] rounded-xl flex items-center justify-center gap-3 text-sm font-semibold text-charcoal hover:bg-stone-50 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-2.5 px-4 border border-[#D9D3C7] rounded-xl flex items-center justify-center gap-3 text-sm font-semibold text-charcoal hover:bg-stone-50 transition-colors"
          >
            <svg className="w-4 h-4 fill-charcoal" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/* Footer switch */}
        <p className="text-center text-xs text-charcoal/60 mt-6">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-bold text-forest-900 hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};
