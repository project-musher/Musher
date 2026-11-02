import React, { useState } from 'react';
import { X, Search, BadgeCheck, MessageCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose }) => {
  const { users, currentUser, openChatWithUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) => {
    if (u.id === currentUser.id) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.username.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      u.bio.toLowerCase().includes(q)
    );
  });

  const handleSelectUser = (user: User) => {
    openChatWithUser(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="w-6" />
          <h2 className="text-sm font-bold text-white">New Message</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="mt-3 relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts to message..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-800 text-white text-xs border border-zinc-700/80 focus:border-pink-500 focus:outline-none"
            autoFocus
          />
        </div>

        {/* User list */}
        <div className="mt-3 flex-1 overflow-y-auto no-scrollbar flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-zinc-500 px-2 py-1">
            Suggested
          </span>

          {filteredUsers.length === 0 ? (
            <div className="py-10 text-center text-zinc-500 text-xs">
              No accounts found matching "{searchQuery}"
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-zinc-800 cursor-pointer transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-11 h-11 rounded-full object-cover border border-zinc-700"
                    />
                    {user.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-900" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white group-hover:text-pink-400 transition">
                        {user.username}
                      </span>
                      {user.isVerified && (
                        <BadgeCheck className="w-3.5 h-3.5 text-blue-400" />
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400 line-clamp-1">
                      {user.name}
                    </span>
                  </div>
                </div>

                <button className="px-3 py-1.5 rounded-full bg-zinc-800 group-hover:bg-pink-600 text-zinc-200 group-hover:text-white text-xs font-semibold flex items-center gap-1 transition">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
