import React, { useState } from 'react';
import {
  Search,
  SquarePen,
  BadgeCheck,
  Camera,
  Image,
  Mic,
  Gamepad2,
  Phone,
  Video,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NewChatModal } from './NewChatModal';
import { User } from '../../types';

export const ChatList: React.FC = () => {
  const {
    currentUser,
    users,
    chats,
    openChatWithUser,
    activeChatId,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  // Filter chats by search query
  const filteredChats = chats.filter((c) => {
    const peer = c.participants.find((p) => p.id !== currentUser.id);
    if (!peer) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      peer.username.toLowerCase().includes(q) ||
      peer.name.toLowerCase().includes(q)
    );
  });

  // Online contacts for quick story-like tray
  const onlineUsers = users.filter((u) => u.isOnline && u.id !== currentUser.id);

  return (
    <div className="w-full h-full flex flex-col bg-black text-white select-none">
      {/* Top Header */}
      <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-lg tracking-tight">
            {currentUser.username}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>

        <button
          onClick={() => setIsNewChatOpen(true)}
          className="p-2 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
          title="New Message"
        >
          <SquarePen className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-2.5">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Direct Messages..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 text-white placeholder-zinc-500 text-xs border border-zinc-800 focus:outline-none focus:border-pink-500 transition"
          />
        </div>
      </div>

      {/* Online Users Tray */}
      {onlineUsers.length > 0 && (
        <div className="px-4 py-2 border-b border-zinc-800/40">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            {onlineUsers.map((u) => (
              <div
                key={u.id}
                onClick={() => openChatWithUser(u)}
                className="flex flex-col items-center shrink-0 cursor-pointer group"
              >
                <div className="relative">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-12 h-12 rounded-full object-cover border border-zinc-700 group-hover:scale-105 transition"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black" />
                </div>
                <span className="text-[10px] text-zinc-400 font-medium mt-1 truncate max-w-[55px]">
                  {u.username}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chats Threads List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-2 flex flex-col gap-1">
        {filteredChats.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
            <span>No conversations yet.</span>
            <button
              onClick={() => setIsNewChatOpen(true)}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-xs mt-1"
            >
              Start a Conversation
            </button>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const peer = chat.participants.find((p) => p.id !== currentUser.id) || users[0];
            const isSelected = activeChatId === chat.id;
            const lastMsg = chat.lastMessage;

            return (
              <div
                key={chat.id}
                onClick={() => openChatWithUser(peer)}
                className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition ${
                  isSelected
                    ? 'bg-zinc-800/90'
                    : 'hover:bg-zinc-900 active:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={peer.avatar}
                      alt={peer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {peer.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-900" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-xs font-bold text-white truncate">
                          {peer.name}
                        </span>
                        {peer.isVerified && (
                          <BadgeCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        )}
                      </div>
                      {lastMsg && (
                        <span className="text-[10px] text-zinc-500 shrink-0">
                          {lastMsg.timestamp}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      {chat.isTyping ? (
                        <span className="text-xs text-pink-400 font-semibold animate-pulse flex items-center gap-1">
                          typing...
                        </span>
                      ) : (
                        <p className="text-xs text-zinc-400 truncate flex items-center gap-1">
                          {lastMsg?.mediaType === 'image' && (
                            <>
                              <Image className="w-3 h-3 text-pink-400 shrink-0" />
                              <span>Photo</span>
                            </>
                          )}
                          {lastMsg?.mediaType === 'voice' && (
                            <>
                              <Mic className="w-3 h-3 text-purple-400 shrink-0" />
                              <span>Voice message ({lastMsg.voiceDuration}s)</span>
                            </>
                          )}
                          {lastMsg?.mediaType === 'game_result' && (
                            <>
                              <Gamepad2 className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>Game challenge: {lastMsg.gameData?.score} pts</span>
                            </>
                          )}
                          {lastMsg?.mediaType === 'call_event' && (
                            <>
                              {lastMsg.callData?.type === 'video' ? (
                                <Video className="w-3 h-3 text-blue-400 shrink-0" />
                              ) : (
                                <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                              )}
                              <span>{lastMsg.text}</span>
                            </>
                          )}
                          {!lastMsg?.mediaType || lastMsg.mediaType === 'text' ? (
                            <span>{lastMsg?.text || 'Sent a message'}</span>
                          ) : null}
                        </p>
                      )}

                      {chat.unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-pink-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
      />
    </div>
  );
};
