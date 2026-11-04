import React from 'react';
import {
  Flame,
  Sparkles,
  X,
  Heart,
  Calendar,
  Image as ImageIcon,
  Mic,
  Gamepad2,
  Award,
  Clock,
  Compass,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';

interface FriendshipTimelineModalProps {
  chatId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const FriendshipTimelineModal: React.FC<FriendshipTimelineModalProps> = ({
  chatId,
  isOpen,
  onClose,
}) => {
  const { messages, chats, currentUser } = useApp();

  const chat = chats.find((c) => c.id === chatId);
  const peerUser = chat?.participants.find((p) => p.id !== currentUser.id);
  const chatMessages = messages[chatId] || [];

  if (!isOpen || !peerUser) return null;

  const firstMessage = chatMessages[0];
  const photos = chatMessages.filter((m) => m.mediaType === 'image' && m.mediaUrl);
  const voiceNotes = chatMessages.filter((m) => m.mediaType === 'voice');
  const streak = chat?.streakCount || 1;
  const meaningfulScore = chat?.meaningfulScore || 85;

  const milestones = [
    {
      date: firstMessage?.timestamp || 'Day 1',
      title: 'First Encounter & Spark ✨',
      description: `First message exchanged: "${firstMessage?.text?.slice(0, 50) || 'Hello!'}"`,
      icon: Sparkles,
      color: 'from-purple-500 to-indigo-500 text-purple-400 border-purple-500/40',
    },
    {
      date: 'Streak Milestone',
      title: `${streak}-Day Conversation Streak 🔥`,
      description: 'Rewarding consistent, meaningful dialogues rather than random spam.',
      icon: Flame,
      color: 'from-amber-500 to-orange-500 text-amber-400 border-amber-500/40',
    },
    {
      date: `${voiceNotes.length} Audio Notes Exchanged`,
      title: 'Spoken Transmissions 🎙️',
      description: 'Shared authentic laughter, acoustic stems, and deep late-night thoughts.',
      icon: Mic,
      color: 'from-sky-500 to-blue-500 text-sky-400 border-sky-500/40',
    },
    {
      date: 'Cosmic Bond Level',
      title: 'Cosmic Duo 💫 (Tier: Inner Circle)',
      description: `${meaningfulScore}% dialogue resonance index based on mutual topic depth.`,
      icon: Award,
      color: 'from-pink-500 to-rose-500 text-pink-400 border-pink-500/40',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header with duo avatars */}
        <div className="p-4 border-b border-zinc-800 bg-gradient-to-r from-purple-950/30 to-pink-950/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-black"
              />
              <img
                src={peerUser.avatar}
                alt={peerUser.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-black"
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                Friendship Journey <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
              </h2>
              <p className="text-[11px] text-zinc-400">
                You and {peerUser.name} • {chatMessages.length} memories recorded
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

        {/* Timeline Body */}
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Status highlight ribbon */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-sky-500/10 border border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400/30" />
              <div>
                <span className="text-xs font-bold text-white block">Active Streak</span>
                <span className="text-[10px] text-amber-300 font-mono">{streak} days uninterrupted</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-white block">Meaningful Score</span>
              <span className="text-[10px] text-purple-300 font-mono">{meaningfulScore}/100</span>
            </div>
          </div>

          {/* Vertical Timeline */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
            {milestones.map((m, idx) => (
              <div key={idx} className="relative">
                {/* Node dot */}
                <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border bg-zinc-950 flex items-center justify-center ${m.color}`}>
                  <m.icon className="w-2.5 h-2.5" />
                </div>
                {/* Card */}
                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span className="uppercase tracking-wider font-semibold">{m.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{m.title}</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{m.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Shared Photos Gallery */}
          {photos.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-pink-400" /> Shared Photo Memories
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {photos.slice(0, 6).map((p, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden border border-zinc-800">
                    <img src={p.mediaUrl} alt="Memory" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
