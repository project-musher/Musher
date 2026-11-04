import React from 'react';
import { PlusSquare, MessageCircle, Heart, Sparkles, ShieldCheck, Crown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Navbar: React.FC = () => {
  const {
    setActiveTab,
    chats,
    openCreatorModal,
    activeTab,
    openFeedbackModal,
    openSubscriptionModal,
    userSubscription,
  } = useApp();

  const totalUnread = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  // In dedicated reels or full chat conversation view, keep navbar clean
  if (activeTab === 'chat') return null;

  return (
    <header className="sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between sm:hidden">
      {/* Brand Logo with Instagram Font style */}
      <div
        onClick={() => setActiveTab('feed')}
        className="flex items-center gap-1 cursor-pointer"
      >
        <span
          className="text-2xl font-black tracking-tight ig-gradient-text"
          style={{ fontFamily: "'Dancing Script', cursive" }}
        >
          VibeGram
        </span>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-2">
        {/* VIP / Premium Payment Trigger */}
        <button
          onClick={openSubscriptionModal}
          className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px] flex items-center gap-1 active:scale-95 transition shadow-sm"
          title="Make Payment for Premium or VIP"
        >
          <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{userSubscription.tier === 'free' ? 'Upgrade' : 'VIP'}</span>
        </button>

        {/* Community Safety & Feedbacks */}
        <button
          onClick={() => openFeedbackModal()}
          className="p-1 text-emerald-400 hover:text-emerald-300 transition"
          title="Feedback & Safety"
        >
          <ShieldCheck className="w-5 h-5" />
        </button>

        {/* Create Post / Story / Reel */}
        <button
          onClick={() => openCreatorModal('story')}
          className="p-1 text-zinc-300 hover:text-white transition"
          title="Create Story or Reel"
        >
          <PlusSquare className="w-6 h-6" />
        </button>

        {/* Notifications Heart */}
        <button
          onClick={() => setActiveTab('feed')}
          className="p-1 text-zinc-300 hover:text-white transition"
          title="Notifications"
        >
          <Heart className="w-6 h-6" />
        </button>

        {/* Direct Messages Icon with Unread Badge */}
        <button
          onClick={() => setActiveTab('chat')}
          className="relative p-1 text-zinc-300 hover:text-white transition"
          title="Direct Messages"
        >
          <MessageCircle className="w-6 h-6" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-600 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
              {totalUnread}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
