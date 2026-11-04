import React, { useState } from 'react';
import { Heart, Sparkles, X, Send, Smile, CloudRain, Zap, Sun, Feather, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DigitalEmotionData } from '../../types';
import { sounds } from '../../utils/audio';

interface DigitalEmotionModalProps {
  chatId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalEmotionModal: React.FC<DigitalEmotionModalProps> = ({
  chatId,
  isOpen,
  onClose,
}) => {
  const { sendDigitalEmotion } = useApp();

  const [emotion, setEmotion] = useState<DigitalEmotionData['emotion']>('hyped');
  const [intensity, setIntensity] = useState<number>(8);
  const [prompt, setPrompt] = useState<string>('');

  if (!isOpen) return null;

  const emotionList: {
    id: DigitalEmotionData['emotion'];
    label: string;
    icon: string;
    color: string;
    suggested: string;
  }[] = [
    { id: 'hyped', label: 'Hyped & Creative', icon: '⚡', color: 'from-amber-500/20 to-yellow-500/10 text-amber-300 border-amber-500/40', suggested: 'Just unlocked an incredible milestone, feeling ecstatic!' },
    { id: 'warmth', label: 'Warmth & Love', icon: '☀️', color: 'from-orange-500/20 to-pink-500/10 text-orange-300 border-orange-500/40', suggested: 'Grateful for your friendship and support today.' },
    { id: 'grateful', label: 'Deeply Grateful', icon: '💖', color: 'from-pink-500/20 to-rose-500/10 text-pink-300 border-pink-500/40', suggested: 'Thinking of how much you helped me through this project.' },
    { id: 'anxious', label: 'Anxious / Overthinking', icon: '🌀', color: 'from-purple-500/20 to-indigo-500/10 text-purple-300 border-purple-500/40', suggested: 'Feeling nervous about my presentation tomorrow...' },
    { id: 'sad', label: 'Down / Vulnerable', icon: '🌧️', color: 'from-blue-500/20 to-slate-500/10 text-blue-300 border-blue-500/40', suggested: 'Had a rough day, just need to feel heard.' },
    { id: 'lonely', label: 'Need Connection', icon: '🕊️', color: 'from-teal-500/20 to-cyan-500/10 text-teal-300 border-teal-500/40', suggested: 'Free to talk or catch up for a few minutes?' },
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    sendDigitalEmotion({
      chatId,
      emotion,
      intensity,
      prompt: prompt.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-pink-500/20 to-amber-500/20 text-pink-400 border border-pink-500/30">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                Interactive Digital Emotion Card <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              </h2>
              <p className="text-[11px] text-zinc-400">
                Express true vulnerability or excitement instead of dry text
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

        <form onSubmit={handleSend} className="p-4 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Emotion Grid */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Select Your State of Mind
            </label>
            <div className="grid grid-cols-2 gap-2">
              {emotionList.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    setEmotion(item.id);
                    if (!prompt) setPrompt(item.suggested);
                  }}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition ${
                    emotion === item.id
                      ? `bg-gradient-to-r ${item.color} border-current shadow-lg`
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Intensity Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Emotional Intensity: {intensity}/10
              </label>
              <span className="text-xs font-mono font-bold text-pink-400">
                {intensity >= 8 ? '🔥 Deep & Urgent' : intensity >= 5 ? '✨ Moderate' : '🍃 Gentle'}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full accent-pink-500 cursor-pointer"
            />
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              What is on your heart?
            </label>
            <textarea
              required
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Share what you are feeling... The recipient will be able to send supportive hugs, voice replies, or call you."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-pink-500 transition resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 active:scale-[0.98] transition"
          >
            <Send className="w-4 h-4" /> Transmit Digital Emotion Card
          </button>
        </form>
      </div>
    </div>
  );
};
