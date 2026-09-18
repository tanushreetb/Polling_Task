import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { PulseWaveIcon, LeafSprig } from '../components/BotanicalAccents';
import { StickyNote } from '../components/StickyNote';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';

export const Register = ({ onSwitchToLogin, onClose, onSuccess }) => {
  const { register, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await register(name, email, password);
    if (res.success) {
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } else {
      setError(res.error || 'Failed to create account');
    }
  };

  return (
    <div className="relative max-w-md w-full mx-auto my-6 p-2 sm:p-4">
      <div className="absolute -top-6 -left-8 pointer-events-none opacity-40">
        <LeafSprig className="w-16 h-16 text-forest-900 rotate-12" />
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EBE5DB] shadow-card relative">
        <div className="absolute -top-5 -right-4 z-20">
          <StickyNote color="mint" rotate="-2deg" tape={false} className="py-2 px-3 shadow-md">
            <span className="text-lg font-bold font-hand block leading-tight">
              Join Us! ✨
            </span>
          </StickyNote>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <PulseWaveIcon className="w-6 h-6 text-forest-900" />
          <span className="font-extrabold text-2xl tracking-tight text-forest-900">
            PulseVote
          </span>
        </div>

        <p className="text-sm text-charcoal/60 mb-6">
          Create an account to host real-time polls.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal/80 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal/40">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tanushree"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9D3C7] focus:border-forest-900 focus:ring-1 focus:ring-forest-900 outline-none text-sm text-charcoal bg-white"
              />
            </div>
          </div>

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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9D3C7] focus:border-forest-900 focus:ring-1 focus:ring-forest-900 outline-none text-sm text-charcoal bg-white"
              />
            </div>
          </div>

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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password (min 6 chars)"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D9D3C7] focus:border-forest-900 focus:ring-1 focus:ring-forest-900 outline-none text-sm text-charcoal bg-white"
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

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading}
            loading={loading}
            className="w-full mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account →'}
          </Button>
        </form>

        <p className="text-center text-xs text-charcoal/60 mt-6">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-forest-900 hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};
