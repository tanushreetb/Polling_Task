import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import {
  X,
  Copy,
  Check,
  Download,
  Share2,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Twitter,
  Linkedin,
  Send
} from 'lucide-react';
import { Button } from './Button';
import { LeafSprig } from './BotanicalAccents';

export const SharePollModal = ({ poll, isOpen, onClose }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (poll && isOpen) {
      const shareUrl = `${window.location.origin}/#poll=${poll.id}`;
      QRCode.toDataURL(shareUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#133522',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code:', err));
    }
  }, [poll, isOpen]);

  if (!isOpen || !poll) return null;

  const shareUrl = `${window.location.origin}/#poll=${poll.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownloadQR = () => {
    if (!qrCodeDataUrl) return;
    const link = document.createElement('a');
    link.download = `pulsevote-poll-${poll.id}.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: poll.title,
          text: `Vote on this poll: "${poll.title}" on PulseVote`,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      handleCopy();
    }
  };

  const encodedTitle = encodeURIComponent(`Vote on "${poll.title}" on PulseVote: `);
  const encodedUrl = encodeURIComponent(shareUrl);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        {/* Backdrop click to close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#18221B] rounded-3xl p-6 sm:p-8 border border-[#EBE5DB] dark:border-[#2C3E30] shadow-xl z-10 text-charcoal overflow-hidden"
        >
          {/* Subtle botanical accent */}
          <div className="absolute -top-4 -right-4 pointer-events-none opacity-20 dark:opacity-10">
            <LeafSprig className="w-16 h-16 text-forest-900 rotate-45" />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors text-charcoal"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Share & QR Code</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-charcoal leading-snug pr-6 mb-2">
            {poll.title}
          </h3>

          <p className="text-xs sm:text-sm text-charcoal/70 mb-5">
            Share this link or scan the QR code to vote live from any device.
          </p>

          {/* QR Code Presentation Box */}
          <div className="p-4 rounded-2xl bg-paper dark:bg-black/20 border border-[#EAE4D8] dark:border-[#2C3E30] flex flex-col items-center justify-center mb-5">
            {qrCodeDataUrl ? (
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-stone-200">
                <img
                  src={qrCodeDataUrl}
                  alt="Poll Scannable QR Code"
                  className="w-40 h-40 sm:w-48 sm:h-48 object-contain"
                />
              </div>
            ) : (
              <div className="w-40 h-40 flex items-center justify-center text-xs text-charcoal/50">
                Generating QR code...
              </div>
            )}

            <div className="flex items-center gap-3 mt-4 w-full justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadQR}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Download QR (PNG)
              </Button>

              {typeof navigator !== 'undefined' && navigator.share && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleNativeShare}
                  leftIcon={<Share2 className="w-3.5 h-3.5" />}
                >
                  Share
                </Button>
              )}
            </div>
          </div>

          {/* Link Copy Box */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-charcoal/70 uppercase tracking-wider mb-1.5">
              Direct Poll Link
            </label>
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-paper dark:bg-black/30 border border-[#E8E1D5] dark:border-[#2C3E30]">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="bg-transparent text-xs sm:text-sm text-charcoal font-mono px-3 flex-1 outline-none truncate select-all"
              />
              <Button
                size="sm"
                variant={copied ? 'secondary' : 'primary'}
                onClick={handleCopy}
                leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Social Quick Share Buttons */}
          <div>
            <span className="block text-xs font-bold text-charcoal/60 uppercase tracking-wider mb-2">
              Quick Share To
            </span>
            <div className="grid grid-cols-4 gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodedTitle}${encodedUrl}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:scale-105 transition-transform text-[11px] font-semibold"
              >
                <MessageCircle className="w-4 h-4 mb-1" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-sky-200 dark:border-sky-900/40 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 hover:scale-105 transition-transform text-[11px] font-semibold"
              >
                <Twitter className="w-4 h-4 mb-1" />
                <span>X / Twitter</span>
              </a>

              <a
                href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-cyan-200 dark:border-cyan-900/40 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400 hover:scale-105 transition-transform text-[11px] font-semibold"
              >
                <Send className="w-4 h-4 mb-1" />
                <span>Telegram</span>
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:scale-105 transition-transform text-[11px] font-semibold"
              >
                <Linkedin className="w-4 h-4 mb-1" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
