import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Users, Flame, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReelItem } from './ReelItem';
import { rankReelsForFeed, buildUserEngagementProfile, FeedSortMode } from '../../utils/feedAlgorithm';

export const ReelsFeed: React.FC = () => {
  const {
    reels,
    currentUser,
    users,
    chats,
    openCreatorModal,
  } = useApp();

  const [sortMode, setSortMode] = useState<FeedSortMode>('for_you');
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const chatPeerIds = chats.map((c) => {
    const peer = c.participants.find((p) => p.id !== currentUser.id);
    return peer ? peer.id : '';
  }).filter(Boolean);

  const profile = buildUserEngagementProfile(currentUser, users, reels, chatPeerIds);
  const rankedItems = rankReelsForFeed(reels, profile, sortMode);

  // Track scroll position to determine active index
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const itemHeight = el.clientHeight;
    const index = Math.round(el.scrollTop / itemHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden select-none">
      {/* Top Filter Bar (Algorithm selector) */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-1.5 p-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 shadow-lg">
        <button
          onClick={() => {
            setSortMode('for_you');
            setActiveIndex(0);
            containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
            sortMode === 'for_you'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>For You</span>
        </button>

        <button
          onClick={() => {
            setSortMode('following');
            setActiveIndex(0);
            containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
            sortMode === 'following'
              ? 'bg-white/20 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Following</span>
        </button>

        <button
          onClick={() => {
            setSortMode('trending');
            setActiveIndex(0);
            containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
            sortMode === 'trending'
              ? 'bg-white/20 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Trending</span>
        </button>
      </div>

      {/* Quick Add Reel Button Top Right */}
      <button
        onClick={() => openCreatorModal('reel')}
        className="absolute top-4 right-16 z-30 flex items-center gap-1 px-3 py-1.5 rounded-full bg-pink-600/90 hover:bg-pink-500 text-white text-xs font-bold shadow-lg transition active:scale-95 backdrop-blur-md"
        title="Create New Reel"
      >
        <Plus className="w-4 h-4 stroke-[3]" />
        <span className="hidden sm:inline">Create</span>
      </button>

      {/* Snap Scrolling Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full max-w-md h-full reels-container no-scrollbar"
      >
        {rankedItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-zinc-400">
            <p className="text-sm">No reels found for this filter.</p>
            <button
              onClick={() => setSortMode('for_you')}
              className="mt-3 px-4 py-2 rounded-full bg-zinc-800 text-white text-xs font-bold"
            >
              Back to For You
            </button>
          </div>
        ) : (
          rankedItems.map(({ reel, reason }, idx) => (
            <div key={reel.id} className="w-full h-full reel-item relative">
              <ReelItem
                reel={reel}
                isActive={idx === activeIndex}
                recommendationReason={sortMode === 'for_you' ? reason : undefined}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
