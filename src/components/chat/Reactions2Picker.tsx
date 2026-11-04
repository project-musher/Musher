import React, { useState } from 'react';
import { Video, Mic, Sparkles, Smile, X, Play, Volume2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';

interface Reactions2PickerProps {
  chatId: string;
  messageId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Reactions2Picker: React.FC<Reactions2PickerProps> = ({
  chatId,
  messageId,
  isOpen,
  onClose,
}) => {
  const { reactToMessage, addVideoReaction, addVoiceReaction } = useApp();
  const [activeTab, setActiveTab] = useState<'emoji' | 'video' | 'voice'>('emoji');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  if (!isOpen) return null;

  const quickEmojis = ['❤️', '😂', '🔥', '👏', '😮', '🚀', '✨', '⚡'];

  const videoReactionPresets = [
    {
      id: 'vr_cheer',
      title: 'Hype Cheer 🎉',
      url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'vr_laugh',
      title: 'Pure Laugh 😂',
      url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'vr_mindblown',
      title: 'Mind Blown 🤯',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    },
  ];

  const handleSelectEmoji = (emoji: string) => {
    sounds.playHeart();
    reactToMessage(chatId, messageId, emoji);
    onClose();
  };

  const handleSelectVideoReaction = (videoUrl: string) => {
    sounds.playGamePoint();
    addVideoReaction(chatId, messageId, videoUrl);
    onClose();
  };

  const handleVoiceRecordToggle = () => {
    if (!isRecordingVoice) {
      sounds.playTap();
      setIsRecordingVoice(true);
      setRecordSeconds(0);
      const interval = setInterval(() => {
        setRecordSeconds((s) => {
          if (s >= 3) {
            clearInterval(interval);
            setIsRecordingVoice(false);
            addVoiceReaction(chatId, messageId, 3);
            onClose();
            return 3;
          }
          return s + 1;
        });
      }, 1000);
    }
  };

  return (
    <div className="absolute bottom-full mb-2 left-0 z-40 bg-zinc-950/95 backdrop-blur-xl border border-zinc-700/80 rounded-2xl shadow-2xl p-2.5 w-72 animate-scaleUp select-none">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('emoji')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${
              activeTab === 'emoji' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Emoji
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              activeTab === 'video' ? 'bg-pink-500/20 text-pink-300' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Video className="w-3 h-3" /> 2s Video
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              activeTab === 'voice' ? 'bg-sky-500/20 text-sky-300' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Mic className="w-3 h-3" /> Voice
          </button>
        </div>
        <button onClick={onClose} className="p-1 rounded text-zinc-500 hover:text-white">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tab 1: Emojis */}
      {activeTab === 'emoji' && (
        <div className="flex items-center justify-between gap-1">
          {quickEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleSelectEmoji(emoji)}
              className="w-8 h-8 rounded-xl hover:bg-zinc-800 hover:scale-125 text-lg flex items-center justify-center transition active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Tab 2: 2-second Video reactions */}
      {activeTab === 'video' && (
        <div className="space-y-1.5">
          <span className="text-[10px] text-zinc-400 block mb-1">Select 2-second video loop reaction:</span>
          <div className="grid grid-cols-3 gap-2">
            {videoReactionPresets.map((vp) => (
              <button
                key={vp.id}
                onClick={() => handleSelectVideoReaction(vp.url)}
                className="group relative rounded-xl overflow-hidden aspect-square border border-zinc-700/80 hover:border-pink-500 transition"
              >
                <img src={vp.url} alt={vp.title} className="w-full h-full object-cover group-hover:scale-110 transition" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white py-0.5 truncate px-1">
                  {vp.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Voice Reaction */}
      {activeTab === 'voice' && (
        <div className="py-2 text-center space-y-2">
          <span className="text-[11px] text-zinc-300 block">Record a 3-second quick voice reaction:</span>
          <button
            onClick={handleVoiceRecordToggle}
            className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center transition shadow-lg ${
              isRecordingVoice
                ? 'bg-red-500 animate-ping text-white'
                : 'bg-sky-500 hover:bg-sky-400 text-black'
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>
          <span className="text-[10px] text-zinc-400 block font-mono">
            {isRecordingVoice ? `Recording... 0:0${recordSeconds}` : 'Tap to start voice snippet'}
          </span>
        </div>
      )}
    </div>
  );
};
