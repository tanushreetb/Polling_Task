import React, { useState } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  PenSquare,
  GripVertical,
  Trash2,
  Plus,
  ArrowRight,
  Check,
  Copy,
  Download,
  Share2,
  CheckCircle2,
  Vote,
  Sparkles,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { StickyNote } from '../components/StickyNote';
import { LeafSprig } from '../components/BotanicalAccents';
import { pollAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';

export const CreatePoll = ({ onPollCreated, onCancel }) => {
  const { isAuthenticated, user, isDemoUser } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState([
    { text: 'Option 1' },
    { text: 'Option 2' },
    { text: 'Option 3' },
    { text: '' },
  ]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [createdPoll, setCreatedPoll] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleAddOption = () => {
    if (options.length < 8) {
      setOptions([...options, { text: '' }]);
    }
  };

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index].text = value;
    setOptions(updated);
  };

  const handleClearOption = (index) => {
    const updated = [...options];
    updated[index].text = '';
    setOptions(updated);
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const savePollLocally = (poll) => {
    try {
      // 1. Global list for Explore Polls page
      const globalExisting = JSON.parse(localStorage.getItem('pulsevote_local_polls') || '[]');
      const globalUpdated = [poll, ...globalExisting.filter((p) => p.id !== poll.id)];
      localStorage.setItem('pulsevote_local_polls', JSON.stringify(globalUpdated));

      // 2. User-specific list for Host Dashboard
      if (!isDemoUser && user) {
        const userStorageKey = `pulsevote_user_polls_${user.id || user.email || 'new_user'}`;
        const userExisting = JSON.parse(localStorage.getItem(userStorageKey) || '[]');
        const userUpdated = [poll, ...userExisting.filter((p) => p.id !== poll.id)];
        localStorage.setItem(userStorageKey, JSON.stringify(userUpdated));
      }
    } catch (e) {
      console.error('Error saving poll locally:', e);
    }
  };

  const handleShareSetup = async (poll) => {
    savePollLocally(poll);
    setCreatedPoll(poll);

    const shareUrl = `${window.location.origin}/#poll=${poll.id}`;
    try {
      const qr = await QRCode.toDataURL(shareUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#133522',
          light: '#FFFFFF',
        },
      });
      setQrCodeDataUrl(qr);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }

    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#133522', '#FFE066', '#3B8B52', '#22C55E'],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validOptions = options
      .map((opt) => ({ text: opt.text.trim() }))
      .filter((opt) => opt.text.length > 0);

    if (!title.trim()) {
      setError('Please provide a poll title');
      return;
    }

    if (validOptions.length < 2) {
      setError('Please provide at least 2 non-empty options');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        options: validOptions,
        allow_multiple: allowMultiple,
        allow_anonymous: allowAnonymous,
      };

      const res = await pollAPI.create(payload);
      if (res.data) {
        await handleShareSetup(res.data);
      }
    } catch (err) {
      // Local fallback poll when backend is in simulation/offline mode
      const fallbackPoll = {
        id: "poll-" + Date.now(),
        title: title.trim(),
        description: description.trim(),
        options: validOptions.map((opt, i) => ({
          id: `opt-${i + 1}`,
          text: opt.text,
          votes: 0,
        })),
        allow_multiple: allowMultiple,
        allow_anonymous: allowAnonymous,
        is_active: true,
        total_votes: 0,
        created_at: new Date().toISOString(),
        created_at_text: "Just now",
      };
      await handleShareSetup(fallbackPoll);
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = () => {
    if (!createdPoll) return;
    const shareUrl = `${window.location.origin}/#poll=${createdPoll.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;
    const link = document.createElement('a');
    link.download = `poll-${createdPoll?.id || 'qr'}.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  const handleNativeShare = () => {
    if (!createdPoll) return;
    const shareUrl = `${window.location.origin}/#poll=${createdPoll.id}`;
    if (navigator.share) {
      navigator.share({
        title: createdPoll.title,
        text: `Vote in my poll: "${createdPoll.title}" on PulseVote`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      copyShareLink();
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setOptions([
      { text: 'Option 1' },
      { text: 'Option 2' },
      { text: 'Option 3' },
      { text: '' },
    ]);
    setCreatedPoll(null);
    setQrCodeDataUrl('');
  };

  // If poll has been created, display the QR & Share Screen
  if (createdPoll) {
    const shareUrl = `${window.location.origin}/#poll=${createdPoll.id}`;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 relative">
        <div className="absolute -top-6 -left-10 pointer-events-none opacity-40 hidden md:block">
          <LeafSprig className="w-16 h-16 text-forest-900 rotate-45" />
        </div>

        <div className="bg-white dark:bg-[#18221B] rounded-3xl p-6 sm:p-10 border border-[#EBE5DB] dark:border-[#2C3E30] shadow-soft relative text-center">
          {/* Top badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-4 border border-emerald-200 dark:border-emerald-800/40">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Poll Published & Live</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal mb-2">
            Your Poll is Ready to Share!
          </h2>
          <p className="text-sm text-charcoal/70 max-w-md mx-auto mb-6">
            Share this link or let people scan the QR code to gather responses instantly.
          </p>

          {/* Poll Summary Box */}
          <div className="p-4 rounded-2xl bg-paper dark:bg-black/20 border border-[#EAE4D8] dark:border-[#2C3E30] text-left mb-8">
            <span className="text-xs font-bold text-forest-900 uppercase tracking-wider block mb-1">
              Active Question
            </span>
            <h3 className="font-extrabold text-lg text-charcoal leading-snug">
              {createdPoll.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-charcoal/60 mt-2">
              <span>{createdPoll.options?.length || 0} options</span>
              <span>•</span>
              <span>{createdPoll.allow_anonymous ? 'Anonymous voting' : 'Public voting'}</span>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-[#FAF8F3] dark:bg-black/30 border border-[#E8E1D5] dark:border-[#2C3E30] mb-8">
            <span className="text-xs font-bold text-charcoal/70 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Scan QR Code to Vote</span>
            </span>

            {qrCodeDataUrl ? (
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-stone-200">
                <img
                  src={qrCodeDataUrl}
                  alt="Poll Scannable QR Code"
                  className="w-44 h-44 rounded-xl object-contain mx-auto"
                />
              </div>
            ) : (
              <div className="w-44 h-44 bg-stone-100 rounded-2xl flex items-center justify-center text-xs text-charcoal/40">
                Generating QR...
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={downloadQRCode}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="mt-4"
            >
              Download QR Code (.png)
            </Button>
          </div>

          {/* Share Link Input with Copy Button */}
          <div className="mb-8">
            <label className="block text-xs font-bold text-charcoal/70 mb-2 uppercase tracking-wide text-left">
              Shareable Direct Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-4 py-3 rounded-xl border border-[#D9D3C7] dark:border-[#2C3E30] bg-paper dark:bg-black/20 text-xs sm:text-sm text-charcoal font-mono outline-none select-all"
              />
              <Button
                size="md"
                variant={copied ? 'secondary' : 'primary'}
                onClick={copyShareLink}
                leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                className="shrink-0"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </div>

          {/* Social Quick Shares */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8 pt-4 border-t border-[#F0EBE1] dark:border-[#2C3E30]">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Vote in this poll: "${createdPoll.title}"\n${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </a>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Vote in my poll: "${createdPoll.title}" on PulseVote:`)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40 text-xs font-bold hover:bg-sky-100 transition-colors"
            >
              <span>Share on X</span>
            </a>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNativeShare}
              leftIcon={<Share2 className="w-3.5 h-3.5" />}
            >
              More Options
            </Button>
          </div>

          {/* Navigation Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onPollCreated && onPollCreated(createdPoll)}
              leftIcon={<Vote className="w-4 h-4" />}
              className="w-full"
            >
              Open Vote Screen Now →
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={resetForm}
              leftIcon={<Plus className="w-4 h-4" />}
              className="w-full"
            >
              Create Another Poll
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Poll Creation Form
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 relative">
      {/* Leaf sprigs accents */}
      <div className="absolute -top-6 -left-10 pointer-events-none opacity-40 hidden md:block">
        <LeafSprig className="w-16 h-16 text-forest-900 rotate-45" />
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-[#18221B] rounded-3xl p-6 sm:p-10 border border-[#EBE5DB] dark:border-[#2C3E30] shadow-soft relative">
        {/* Sticky Note Top Right */}
        <div className="absolute -top-6 -right-4 sm:-right-8 z-20">
          <StickyNote color="peach" rotate="3deg" tape={true} className="py-3 px-4 shadow-md max-w-[170px]">
            <span className="text-xl font-bold font-hand block leading-tight">
              Ask.<br />
              Share.<br />
              See the world<br />
              think.
            </span>
          </StickyNote>
        </div>

        {/* Header with Pen Icon */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-forest-900/10 dark:bg-forest-900/20 flex items-center justify-center text-forest-900">
            <PenSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal">
              Create a New Poll
            </h2>
          </div>
        </div>

        <p className="text-sm text-charcoal/60 mb-8 ml-13">
          Turn your question into a real conversation with instant QR code and link sharing.
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-semibold border border-red-200 dark:border-red-800/40">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Poll Title */}
          <div>
            <label className="block text-xs font-bold text-charcoal/80 mb-2 uppercase tracking-wide">
              Poll Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Which framework do you prefer?"
              className="w-full px-4 py-3 rounded-xl border border-[#D9D3C7] dark:border-[#2C3E30] focus:border-forest-900 focus:ring-1 focus:ring-forest-900 outline-none text-sm text-charcoal bg-white dark:bg-[#1F2B21] transition-all placeholder:text-charcoal/40"
            />
          </div>

          {/* Description (optional) */}
          <div>
            <label className="block text-xs font-bold text-charcoal/80 mb-2 uppercase tracking-wide">
              Description (optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more context to your poll..."
              className="w-full px-4 py-3 rounded-xl border border-[#D9D3C7] dark:border-[#2C3E30] focus:border-forest-900 focus:ring-1 focus:ring-forest-900 outline-none text-sm text-charcoal bg-white dark:bg-[#1F2B21] transition-all placeholder:text-charcoal/40 resize-none"
            />
          </div>

          {/* Options Section */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-charcoal/80 uppercase tracking-wide">
              Options
            </label>

            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="text-charcoal/30 cursor-grab px-1">
                  <GripVertical className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}${idx === 3 ? ' (optional)' : ''}`}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#D9D3C7] dark:border-[#2C3E30] focus:border-forest-900 focus:ring-1 focus:ring-forest-900 outline-none text-sm text-charcoal bg-white dark:bg-[#1F2B21]"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="p-2 text-charcoal/30 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {options.length < 10 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="mt-2"
              >
                Add Option
              </Button>
            )}
          </div>

          {/* Toggles */}
          <div className="space-y-4 pt-4 border-t border-[#F0EBE1] dark:border-[#2C3E30]">
            {/* Allow Multiple Votes */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-semibold text-charcoal">
                  Allow multiple votes
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAllowMultiple(!allowMultiple)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  allowMultiple ? 'bg-forest-900' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    allowMultiple ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Allow Anonymous Voting */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-semibold text-charcoal">
                  Allow anonymous voting
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAllowAnonymous(!allowAnonymous)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  allowAnonymous ? 'bg-forest-900' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    allowAnonymous ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            loading={loading}
            className="w-full mt-6"
            rightIcon={<span>→</span>}
          >
            {loading ? 'Publishing Poll...' : 'Create Poll & Get QR Code'}
          </Button>
        </form>
      </div>
    </div>
  );
};
