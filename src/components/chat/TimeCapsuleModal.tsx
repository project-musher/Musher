import React, { useState } from 'react';
import { Hourglass, Lock, Calendar, Sparkles, X, Gift, Heart, Send, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';

interface TimeCapsuleModalProps {
  chatId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TimeCapsuleModal: React.FC<TimeCapsuleModalProps> = ({
  chatId,
  isOpen,
  onClose,
}) => {
  const { sendTimeCapsule } = useApp();

  const [title, setTitle] = useState('');
  const [revealedText, setRevealedText] = useState('');
  const [theme, setTheme] = useState<'birthday' | 'anniversary' | 'future_letter' | 'secret'>('birthday');
  
  // Default to 1 hour from now
  const [unlockDate, setUnlockDate] = useState(() => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    return d.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  });

  if (!isOpen) return null;

  const handleApplyPreset = (minutes: number) => {
    sounds.playTap();
    const d = new Date(Date.now() + minutes * 60 * 1000);
    setUnlockDate(d.toISOString().slice(0, 16));
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !revealedText.trim()) return;

    sendTimeCapsule({
      chatId,
      title: title.trim(),
      revealedText: revealedText.trim(),
      unlockDate: new Date(unlockDate).toISOString(),
      theme,
    });

    onClose();
  };

  const themes = [
    { id: 'birthday', label: 'Birthday Surprise 🎂', icon: Gift, color: 'from-pink-500/20 to-rose-500/10 text-pink-400 border-pink-500/40' },
    { id: 'anniversary', label: 'Anniversary 💖', icon: Heart, color: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/40' },
    { id: 'future_letter', label: 'Future Letter ✉️', icon: Hourglass, color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/40' },
    { id: 'secret', label: 'Secret Vault 🔒', icon: Lock, color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/40' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 to-pink-500/20 text-amber-400 border border-amber-500/30">
              <Hourglass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                Time Capsule Message <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h2>
              <p className="text-[11px] text-zinc-400">
                A sealed letter that stays locked until your chosen moment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSend} className="p-4 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Theme selection */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Capsule Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setTheme(t.id);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition ${
                    theme === t.id
                      ? `bg-gradient-to-r ${t.color} border-current`
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <t.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Capsule Title & Teaser
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Happy 25th Birthday John! 🎂"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-500 transition"
            />
            <span className="text-[10px] text-zinc-500 mt-1 block">
              This title will be visible while the capsule is locked in chat.
            </span>
          </div>

          {/* Unlock time & quick presets */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Unlock Date & Time
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="datetime-local"
                required
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            {/* Quick presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-zinc-500 mr-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Quick:
              </span>
              <button
                type="button"
                onClick={() => handleApplyPreset(1)}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 border border-zinc-800 hover:border-amber-500/40 text-[10px] transition"
              >
                In 1 Minute (Test)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(60)}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 border border-zinc-800 hover:border-amber-500/40 text-[10px] transition"
              >
                In 1 Hour
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(24 * 60)}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 border border-zinc-800 hover:border-amber-500/40 text-[10px] transition"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(7 * 24 * 60)}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 border border-zinc-800 hover:border-amber-500/40 text-[10px] transition"
              >
                In 1 Week
              </button>
            </div>
          </div>

          {/* Secret letter message */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Secret Encapsulated Message
            </label>
            <textarea
              required
              rows={4}
              value={revealedText}
              onChange={(e) => setRevealedText(e.target.value)}
              placeholder="Write your heart out. This message will stay completely hidden behind a holographic lock until the exact second arrives..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-500 transition resize-none"
            />
          </div>

          {/* Sealed Guarantee Badge */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-amber-200/90 text-xs">
            <Lock className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Cryptographically Sealed:</span> Neither you nor the recipient can open this early. When the countdown reaches 00:00, celebratory fanfare and confetti will unlock it automatically!
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition"
            >
              <Send className="w-4 h-4" /> Seal & Send Time Capsule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
