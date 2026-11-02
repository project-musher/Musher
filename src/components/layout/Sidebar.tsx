import React, { useState } from 'react';
import {
  Home,
  Search,
  Film,
  MessageCircle,
  Gamepad2,
  PlusSquare,
  Sparkles,
  Music,
} from 'lucide-react';
import { useApp, ActiveTab } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    viewUserProfile,
    chats,
    openCreatorModal,
    openAIMusicModal,
    openVideoStudio,
  } = useApp();

  const [showCreateDropdown, setShowCreateDropdown] = useState(false);

  const totalUnread = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const navItems = [
    { id: 'feed' as ActiveTab, label: 'Home', icon: Home },
    { id: 'explore' as ActiveTab, label: 'Search & Explore', icon: Search },
    { id: 'reels' as ActiveTab, label: 'Reels', icon: Film },
    {
      id: 'chat' as ActiveTab,
      label: 'Messages',
      icon: MessageCircle,
      badge: totalUnread > 0 ? totalUnread : undefined,
    },
    { id: 'games' as ActiveTab, label: 'Vibe Arcade', icon: Gamepad2 },
  ];

  return (
    <aside className="hidden sm:flex flex-col justify-between w-20 xl:w-64 h-screen border-r border-zinc-800/80 bg-black p-4 select-none shrink-0 z-30">
      {/* Top Branding & Nav Links */}
      <div className="flex flex-col gap-6">
        {/* Brand */}
        <div
          onClick={() => setActiveTab('feed')}
          className="flex items-center gap-2 px-2 py-4 cursor-pointer group"
        >
          <span
            className="text-2xl xl:text-3xl font-black tracking-tight ig-gradient-text"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            VibeGram
          </span>
        </div>

        {/* Links */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-4 px-3 py-3 rounded-2xl transition group relative ${
                  isActive
                    ? 'bg-zinc-900 text-white font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                      isActive ? 'stroke-[2.5] text-pink-500' : ''
                    }`}
                  />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-pink-600 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="hidden xl:inline text-sm">{item.label}</span>
              </button>
            );
          })}

          {/* AI Music Generator Trigger */}
          <button
            onClick={openAIMusicModal}
            className="flex items-center gap-4 px-3 py-3 rounded-2xl text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition group"
            title="Generate AI Soundtracks & Jingles"
          >
            <Music className="w-6 h-6 text-purple-400 transition-transform group-hover:scale-110" />
            <span className="hidden xl:inline text-sm font-semibold">AI Music</span>
          </button>

          {/* Create Button */}
          <div className="relative mt-2">
            <button
              onClick={() => setShowCreateDropdown(!showCreateDropdown)}
              className="w-full flex items-center gap-4 px-3 py-3 rounded-2xl text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition group"
            >
              <PlusSquare className="w-6 h-6 text-pink-500 transition-transform group-hover:scale-110" />
              <span className="hidden xl:inline text-sm font-semibold">Create</span>
            </button>

            {/* Dropdown for Post Story vs Create Reel */}
            {showCreateDropdown && (
              <div className="absolute left-0 bottom-full mb-2 w-48 bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl p-1.5 z-40 animate-scaleUp">
                <button
                  onClick={() => {
                    openCreatorModal('story');
                    setShowCreateDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Post Story</span>
                </button>
                <button
                  onClick={() => {
                    openCreatorModal('reel');
                    setShowCreateDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white flex items-center gap-2"
                >
                  <Film className="w-4 h-4 text-purple-400" />
                  <span>Create Reel</span>
                </button>
                <button
                  onClick={() => {
                    openVideoStudio();
                    setShowCreateDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span>AI Video Ad / Animate</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Bottom Profile Anchor */}
      <div
        onClick={() => viewUserProfile(currentUser.id)}
        className={`flex items-center gap-3.5 p-2 rounded-2xl cursor-pointer transition hover:bg-zinc-900/60 ${
          activeTab === 'profile' ? 'bg-zinc-900 font-bold' : ''
        }`}
      >
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-10 h-10 rounded-full object-cover border border-zinc-700 shrink-0"
        />
        <div className="hidden xl:flex flex-col min-w-0">
          <span className="text-xs font-bold text-white truncate">
            {currentUser.name}
          </span>
          <span className="text-[11px] text-zinc-400 truncate">
            @{currentUser.username}
          </span>
        </div>
      </div>
    </aside>
  );
};
