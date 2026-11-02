import React, { useState } from 'react';
import {
  Search,
  BadgeCheck,
  MessageCircle,
  Film,
  Users,
  Sparkles,
  Phone,
  Video,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';

export const ExplorePage: React.FC = () => {
  const {
    users,
    currentUser,
    reels,
    toggleFollowUser,
    openChatWithUser,
    viewUserProfile,
    setActiveTab,
    startCall,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const tags = ['All', 'Streetwear', 'Beats', '3D Art', 'Skate', 'Golden Hour', 'Studio'];

  // Filter accounts
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

  // Filter reels for explore grid
  const filteredReels = reels.filter((r) => {
    if (!selectedTag || selectedTag === 'All') return true;
    const searchTag = `#${selectedTag.toLowerCase().replace(/\s+/g, '')}`;
    return r.tags.some((t) => t.toLowerCase().includes(searchTag));
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-4 pb-24 overflow-y-auto no-scrollbar animate-fadeIn select-none">
      {/* Search Header */}
      <div className="sticky top-0 z-20 bg-black/85 backdrop-blur-md pb-3 pt-1">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts, names, or bios..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-900 text-white placeholder-zinc-500 text-xs border border-zinc-800 focus:outline-none focus:border-pink-500 transition"
          />
        </div>

        {/* Categories / Tags Filter */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar py-1">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === 'All' ? null : tag)}
              className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition ${
                (tag === 'All' && !selectedTag) || selectedTag === tag
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Account Search Results (Always shown or if searching) */}
      <div className="mt-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-400 px-1">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-pink-400" />
            <span>{searchQuery ? 'Matching Accounts' : 'Suggested Accounts'}</span>
          </span>
          <span className="text-[11px] font-normal text-zinc-500">
            {filteredUsers.length} found
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 flex items-center justify-between gap-3 hover:border-zinc-700 transition"
            >
              <div
                onClick={() => viewUserProfile(user.id)}
                className="flex items-center gap-3 cursor-pointer min-w-0 flex-1 group"
              >
                <div className="relative shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border border-zinc-700 group-hover:scale-105 transition"
                  />
                  {user.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-pink-400 transition truncate">
                      {user.username}
                    </span>
                    {user.isVerified && (
                      <BadgeCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-400 line-clamp-1">
                    {user.name}
                  </span>
                  <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                    {user.bio}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => toggleFollowUser(user.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition active:scale-95 ${
                    user.isFollowing
                      ? 'bg-zinc-800 text-zinc-300 hover:text-white'
                      : 'bg-pink-600 hover:bg-pink-500 text-white shadow-md'
                  }`}
                >
                  {user.isFollowing ? 'Following' : 'Follow'}
                </button>

                <button
                  onClick={() => openChatWithUser(user)}
                  className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                  title="Message"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>

                <button
                  onClick={() => startCall(user, 'video')}
                  className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                  title="Video Call"
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explore Reels & Posts Grid */}
      <div className="mt-6">
        <h3 className="text-xs font-bold text-zinc-400 px-1 mb-3 flex items-center gap-1">
          <Film className="w-3.5 h-3.5 text-purple-400" />
          <span>Explore Trending Reels</span>
        </h3>

        <div className="grid grid-cols-3 gap-1.5">
          {filteredReels.map((reel) => (
            <div
              key={reel.id}
              onClick={() => setActiveTab('reels')}
              className="relative aspect-[9/16] rounded-xl overflow-hidden bg-zinc-900 cursor-pointer group shadow-md"
            >
              <video
                src={reel.videoUrl}
                muted
                playsInline
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2">
                <span className="text-[11px] font-bold text-white flex items-center gap-1">
                  <Film className="w-3 h-3 text-white/80" />
                  {reel.likesCount > 1000
                    ? `${(reel.likesCount / 1000).toFixed(1)}k`
                    : reel.likesCount}
                </span>
                <span className="text-[10px] text-zinc-300 truncate">
                  @{reel.user.username}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
