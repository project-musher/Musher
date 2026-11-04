import React from 'react';
import { Heart, Activity, Sparkles, MessageCircle, Phone } from 'lucide-react';
import { DigitalEmotionData } from '../../types';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';

interface DigitalEmotionBubbleProps {
  chatId: string;
  messageId: string;
  emotionData: DigitalEmotionData;
  isMe: boolean;
}

export const DigitalEmotionBubble: React.FC<DigitalEmotionBubbleProps> = ({
  chatId,
  messageId,
  emotionData,
  isMe,
}) => {
  const { respondToEmotion, startCall, chats, currentUser } = useApp();

  const chat = chats.find((c) => c.id === chatId);
  const peerUser = chat?.participants.find((p) => p.id !== currentUser.id);

  const emotionMeta: Record<string, { icon: string; title: string; color: string }> = {
    hyped: { icon: '⚡', title: 'Hyped & Creative Energy', color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/40 text-amber-300' },
    warmth: { icon: '☀️', title: 'Warmth & Affection', color: 'from-orange-500/20 to-pink-500/10 border-orange-500/40 text-orange-300' },
    grateful: { icon: '💖', title: 'Deep Gratitude', color: 'from-pink-500/20 to-rose-500/10 border-pink-500/40 text-pink-300' },
    anxious: { icon: '🌀', title: 'Overwhelmed & Anxious', color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/40 text-purple-300' },
    sad: { icon: '🌧️', title: 'Down & Vulnerable', color: 'from-blue-500/20 to-slate-500/10 border-blue-500/40 text-blue-300' },
    lonely: { icon: '🕊️', title: 'Seeking Connection', color: 'from-teal-500/20 to-cyan-500/10 border-teal-500/40 text-teal-300' },
  };

  const meta = emotionMeta[emotionData.emotion] || emotionMeta.hyped;

  const handleSupport = (text: string, emoji: string) => {
    sounds.playHeart();
    respondToEmotion(chatId, messageId, text, emoji);
  };

  return (
    <div className={`rounded-2xl overflow-hidden border bg-gradient-to-b ${meta.color} bg-zinc-950 shadow-xl max-w-sm select-none`}>
      {/* Header */}
      <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{meta.icon}</span>
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
              Digital Emotion Card
            </span>
            <span className="text-xs font-bold text-white block">{meta.title}</span>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 border border-white/20">
          Intensity {emotionData.intensity}/10
        </span>
      </div>

      {/* Body: Prompt */}
      <div className="p-4 space-y-3">
        <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-100 italic leading-relaxed">
          "{emotionData.prompt}"
        </div>

        {/* Existing Responses */}
        {emotionData.supportResponses && emotionData.supportResponses.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Support Received:
            </span>
            {emotionData.supportResponses.map((r, i) => (
              <div
                key={i}
                className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
              >
                <span className="text-zinc-200">
                  <strong className="text-white">{r.userName}:</strong> {r.text}
                </span>
                <span className="text-base">{r.emoji}</span>
              </div>
            ))}
          </div>
        )}

        {/* Quick Supportive Actions */}
        {!isMe && (
          <div className="pt-2 border-t border-white/10 space-y-2">
            <span className="text-[10px] font-semibold text-zinc-400 block">
              Send supportive response:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleSupport('Sending you the warmest hug 🤗', '🤗')}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-zinc-200 font-medium transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>Warm Hug</span> 🤗
              </button>
              <button
                type="button"
                onClick={() => handleSupport('You got this, stay strong! 💪', '💪')}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-zinc-200 font-medium transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>Strength</span> 💪
              </button>
              <button
                type="button"
                onClick={() => handleSupport('LET’S GO! Absolute fire! 🔥', '🔥')}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-zinc-200 font-medium transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>Hype Up</span> 🔥
              </button>
              <button
                type="button"
                onClick={() => {
                  if (peerUser) startCall(peerUser, 'audio');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold transition active:scale-95 flex items-center justify-center gap-1.5 border border-emerald-500/30"
              >
                <Phone className="w-3.5 h-3.5" /> Call Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
