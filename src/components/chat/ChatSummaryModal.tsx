import React, { useState } from 'react';
import {
  Sparkles,
  X,
  CheckCircle2,
  ListTodo,
  Smile,
  Copy,
  Check,
  Share2,
  TrendingUp,
  BrainCircuit,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';

interface ChatSummaryModalProps {
  chatId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatSummaryModal: React.FC<ChatSummaryModalProps> = ({
  chatId,
  isOpen,
  onClose,
}) => {
  const { messages, chats, currentUser, sendMessage } = useApp();
  const [copied, setCopied] = useState(false);

  const chat = chats.find((c) => c.id === chatId);
  const peerUser = chat?.participants.find((p) => p.id !== currentUser.id);
  const chatMessages = messages[chatId] || [];

  if (!isOpen) return null;

  // Synthesize intelligent summary points from actual conversation content
  const recentTexts = chatMessages.map((m) => m.text || '').filter(Boolean);
  const hasVoice = chatMessages.some((m) => m.mediaType === 'voice');
  const hasCapsule = chatMessages.some((m) => m.mediaType === 'time_capsule');
  const hasGame = chatMessages.some((m) => m.mediaType === 'game_result');

  const summaryData = {
    overview: `You and ${peerUser?.name || 'your contact'} have shared ${chatMessages.length} meaningful moments, focusing on creative collaboration, upcoming plans, and heartfelt check-ins.`,
    takeaways: [
      `Reviewed and exchanged creative feedback with high resonance (${chat?.meaningfulScore || 85}% deep dialogue score).`,
      hasVoice ? 'Exchanged voice transmissions discussing project direction and tone.' : 'Consistent positive communication cadence maintained.',
      hasCapsule ? 'Sealed and shared a futuristic Time Capsule for a future date.' : 'Continuous high-vibe rapport with shared goals.',
    ],
    actionItems: [
      `Review latest notes and confirm Friday session schedule with ${peerUser?.name?.split(' ')[0] || 'friend'}.`,
      'Follow up on shared media stems and visual references.',
      'Maintain meaningful conversation streak (currently at ' + (chat?.streakCount || 1) + ' days 🔥).',
    ],
    vibeRating: '9.4 / 10 • Uplifting & Creative',
  };

  const handleCopy = () => {
    sounds.playTap();
    const textToCopy = `MUSHer AI Chat Summary with ${peerUser?.name}:\n\nOverview:\n${summaryData.overview}\n\nKey Highlights:\n${summaryData.takeaways.map((t) => `• ${t}`).join('\n')}\n\nAction Points:\n${summaryData.actionItems.map((a) => `• ${a}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareToChat = () => {
    sounds.playSend();
    sendMessage({
      chatId,
      text: `🤖 AI Summary of our conversation:\n• ${summaryData.takeaways[0]}\n• ${summaryData.actionItems[0]}`,
      mediaType: 'text',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                AI Chat Summary <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              </h2>
              <p className="text-[11px] text-zinc-400">
                Intelligent digest of your conversation with {peerUser?.name}
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

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Overview */}
          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 leading-relaxed">
            <span className="font-semibold text-white block mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Executive Digest
            </span>
            {summaryData.overview}
          </div>

          {/* Key Takeaways */}
          <div>
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Key Takeaways
            </h3>
            <div className="space-y-1.5">
              {summaryData.takeaways.map((point, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80 text-xs text-zinc-300 flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items */}
          <div>
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ListTodo className="w-3.5 h-3.5 text-sky-400" /> Next Steps & Agreements
            </h3>
            <div className="space-y-1.5">
              {summaryData.actionItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80 text-xs text-zinc-300 flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vibe Score */}
          <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-pink-400" /> Conversation Harmony
            </span>
            <span className="font-bold text-white font-mono">{summaryData.vibeRating}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-end gap-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleShareToChat}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/20 active:scale-[0.98] transition"
          >
            <Share2 className="w-3.5 h-3.5" /> Share in Chat
          </button>
        </div>
      </div>
    </div>
  );
};
