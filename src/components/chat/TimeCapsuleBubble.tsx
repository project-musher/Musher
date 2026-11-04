import React, { useState, useEffect } from 'react';
import { Hourglass, Lock, Unlock, Sparkles, Gift, Heart, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TimeCapsuleData } from '../../types';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';

interface TimeCapsuleBubbleProps {
  chatId: string;
  messageId: string;
  timeCapsule: TimeCapsuleData;
  isMe: boolean;
}

export const TimeCapsuleBubble: React.FC<TimeCapsuleBubbleProps> = ({
  chatId,
  messageId,
  timeCapsule,
  isMe,
}) => {
  const { unlockTimeCapsule } = useApp();

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    const updateTime = () => {
      const now = Date.now();
      const target = new Date(timeCapsule.unlockDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds, isPast: false });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timeCapsule.unlockDate]);

  const handleOpenCapsule = () => {
    sounds.playCapsuleUnlock();
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981'],
    });
    unlockTimeCapsule(chatId, messageId);
  };

  const isUnlocked = timeCapsule.isUnlocked || (timeLeft.isPast && timeCapsule.isUnlocked);
  const canUnlockNow = timeLeft.isPast && !timeCapsule.isUnlocked;

  return (
    <div className="rounded-2xl overflow-hidden border border-amber-500/40 bg-gradient-to-b from-amber-950/40 via-zinc-900 to-zinc-950 shadow-xl max-w-sm select-none">
      {/* Top Capsule Header */}
      <div className="p-3.5 border-b border-amber-500/20 bg-amber-500/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Hourglass className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
              Sealed Time Capsule
            </span>
            <span className="text-xs font-extrabold text-white truncate max-w-[180px] block">
              {timeCapsule.title}
            </span>
          </div>
        </div>

        <div className="p-1.5 rounded-full bg-zinc-900/80 border border-zinc-700">
          {isUnlocked ? (
            <Unlock className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-amber-400" />
          )}
        </div>
      </div>

      {/* Body State: Locked Countdown vs Ready to Open vs Revealed Letter */}
      <div className="p-4 space-y-3">
        {!isUnlocked && !canUnlockNow && (
          <div className="space-y-3">
            <div className="text-center">
              <span className="text-[11px] text-zinc-400 block mb-2">Unlocks automatically in:</span>
              <div className="grid grid-cols-4 gap-1.5 font-mono text-center">
                <div className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800">
                  <span className="text-base font-extrabold text-white block">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-zinc-500 uppercase">Days</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800">
                  <span className="text-base font-extrabold text-white block">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-zinc-500 uppercase">Hours</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800">
                  <span className="text-base font-extrabold text-white block">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-zinc-500 uppercase">Mins</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800">
                  <span className="text-base font-extrabold text-amber-400 block">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-zinc-500 uppercase">Secs</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Target Date:
              </span>
              <span className="font-mono text-zinc-300">
                {new Date(timeCapsule.unlockDate).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        )}

        {/* Ready to Open CTA */}
        {canUnlockNow && (
          <div className="text-center py-2 space-y-3">
            <span className="text-xs font-bold text-amber-300 block animate-bounce">
              🎉 The Moment Has Arrived!
            </span>
            <button
              onClick={handleOpenCapsule}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95 transition"
            >
              <Sparkles className="w-4 h-4 animate-spin" /> Break Seal & Open Capsule
            </button>
          </div>
        )}

        {/* Revealed Content */}
        {isUnlocked && (
          <div className="space-y-2 animate-fadeIn">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" /> Capsule Revealed:
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-emerald-500/30 text-xs text-zinc-100 font-serif italic leading-relaxed">
              "{timeCapsule.revealedText}"
            </div>
            <span className="text-[10px] text-zinc-500 block text-right">
              Sealed by {timeCapsule.senderName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
