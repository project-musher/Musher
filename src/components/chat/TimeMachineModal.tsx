import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Sparkles,
  X,
  Calendar,
  Image as ImageIcon,
  Mic,
  Hourglass,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChatMessage } from '../../types';
import { sounds } from '../../utils/audio';

interface TimeMachineModalProps {
  chatId: string;
  isOpen: boolean;
  onClose: () => void;
  onJumpToMessage?: (messageId: string) => void;
}

export const TimeMachineModal: React.FC<TimeMachineModalProps> = ({
  chatId,
  isOpen,
  onClose,
  onJumpToMessage,
}) => {
  const { messages, chats, currentUser } = useApp();
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'voice' | 'time_capsule'>('all');

  const chat = chats.find((c) => c.id === chatId);
  const peerUser = chat?.participants.find((p) => p.id !== currentUser.id);
  const chatMessages = messages[chatId] || [];

  const searchResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    return chatMessages.filter((m) => {
      // Type filter
      if (selectedType !== 'all') {
        if (selectedType === 'image' && m.mediaType !== 'image') return false;
        if (selectedType === 'voice' && m.mediaType !== 'voice') return false;
        if (selectedType === 'time_capsule' && m.mediaType !== 'time_capsule') return false;
      }

      if (!q) return true;

      // Match against text, time capsule title, or voice duration
      const textMatch = m.text?.toLowerCase().includes(q);
      const capsuleMatch = m.timeCapsule?.title.toLowerCase().includes(q) || m.timeCapsule?.revealedText.toLowerCase().includes(q);
      const timestampMatch = m.timestamp.toLowerCase().includes(q);
      const gameMatch = m.gameData?.gameTitle.toLowerCase().includes(q);
      const pollMatch = m.decisionPoll?.question.toLowerCase().includes(q);

      return textMatch || capsuleMatch || timestampMatch || gameMatch || pollMatch;
    });
  }, [chatMessages, query, selectedType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 text-sky-400">
              <History className="w-5 h-5 animate-spin" style={{ animationDuration: '12s' }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                Message Time Machine <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              </h2>
              <p className="text-[11px] text-zinc-400">
                Find any moment by describing what you remember with {peerUser?.name || 'friend'}
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

        {/* Search Bar & Filters */}
        <div className="p-4 border-b border-zinc-800/80 space-y-3 bg-zinc-900/30">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe what you remember (e.g. 'runway photo', 'synth beats', 'birthday surprise')..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-zinc-500 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            <button
              onClick={() => {
                sounds.playTap();
                setSelectedType('all');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                selectedType === 'all'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                setSelectedType('image');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition ${
                selectedType === 'image'
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <ImageIcon className="w-3 h-3" /> Photos
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                setSelectedType('voice');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition ${
                selectedType === 'voice'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Mic className="w-3 h-3" /> Voice Notes
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                setSelectedType('time_capsule');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition ${
                selectedType === 'time_capsule'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Hourglass className="w-3 h-3" /> Time Capsules
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {searchResults.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs">
              No matching memories found in Time Machine. Try another phrase!
            </div>
          ) : (
            searchResults.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              const sender = isMe ? currentUser : peerUser;

              return (
                <div
                  key={msg.id}
                  className="p-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 transition flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-2.5">
                    <img
                      src={sender?.avatar}
                      alt={sender?.name}
                      className="w-7 h-7 rounded-full object-cover border border-zinc-700 shrink-0 mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-white">
                          {isMe ? 'You' : sender?.name}
                        </span>
                        <span className="text-[10px] text-zinc-500">{msg.timestamp}</span>
                        {msg.isStar && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            ★ Star Node
                          </span>
                        )}
                      </div>

                      {msg.mediaType === 'image' && msg.mediaUrl && (
                        <div className="mb-1.5">
                          <img
                            src={msg.mediaUrl}
                            alt="Media"
                            className="w-24 h-24 rounded-lg object-cover border border-zinc-800"
                          />
                        </div>
                      )}

                      {msg.timeCapsule && (
                        <div className="text-[11px] text-amber-300 font-semibold mb-1 flex items-center gap-1">
                          <Hourglass className="w-3 h-3" /> {msg.timeCapsule.title}
                        </div>
                      )}

                      <p className="text-xs text-zinc-300 line-clamp-2">
                        {msg.text || 'Media transmission'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sounds.playTap();
                      onJumpToMessage?.(msg.id);
                      onClose();
                    }}
                    className="shrink-0 p-1.5 rounded-lg bg-zinc-800 hover:bg-sky-500/20 text-zinc-400 hover:text-sky-300 border border-zinc-700/60 hover:border-sky-500/40 text-[10px] flex items-center gap-1 transition"
                  >
                    <span>Jump</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
