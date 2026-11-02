import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Sparkles,
  Music2,
  Check,
  Plus,
  Flame,
  Users,
  DollarSign,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StoryBar } from '../stories/StoryBar';
import { ReelCommentsModal } from '../reels/ReelCommentsModal';
import { rankReelsForFeed, buildUserEngagementProfile, FeedSortMode } from '../../utils/feedAlgorithm';
import { sounds } from '../../utils/audio';

export const FeedView: React.FC = () => {
  const {
    currentUser,
    users,
    reels,
    chats,
    toggleLikeReel,
    toggleSaveReel,
    toggleFollowUser,
    viewUserProfile,
    openChatWithUser,
    openDonationModal,
  } = useApp();

  const [sortMode, setSortMode] = useState<FeedSortMode>('for_you');
  const [activeCommentReelId, setActiveCommentReelId] = useState<string | null>(null);
  const [doubleTappedReelId, setDoubleTappedReelId] = useState<string | null>(null);

  const chatPeerIds = chats.map((c) => {
    const peer = c.participants.find((p) => p.id !== currentUser.id);
    return peer ? peer.id : '';
  }).filter(Boolean);

  const profile = buildUserEngagementProfile(currentUser, users, reels, chatPeerIds);
  const rankedFeed = rankReelsForFeed(reels, profile, sortMode);

  const activeCommentReel = reels.find((r) => r.id === activeCommentReelId);

  const handleDoubleTap = (reelId: string, isLiked?: boolean) => {
    if (!isLiked) {
      toggleLikeReel(reelId);
    } else {
      sounds.playHeart();
    }
    setDoubleTappedReelId(reelId);
    setTimeout(() => setDoubleTappedReelId(null), 800);
  };

  return (
    <div className="w-full max-w-xl mx-auto pb-24 overflow-y-auto no-scrollbar animate-fadeIn select-none">
      {/* Top Stories Bar */}
      <StoryBar />

      {/* Feed Sorting Algorithm Bar */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-zinc-900">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-zinc-900 border border-zinc-800">
          <button
            onClick={() => setSortMode('for_you')}
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
            onClick={() => setSortMode('following')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
              sortMode === 'following'
                ? 'bg-zinc-800 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Following</span>
          </button>

          <button
            onClick={() => setSortMode('trending')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
              sortMode === 'trending'
                ? 'bg-zinc-800 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Trending</span>
          </button>
        </div>

        <span className="text-[10px] text-zinc-500 font-medium hidden sm:inline">
          {sortMode === 'for_you' ? 'Engagement-ranked' : sortMode === 'following' ? 'Chronological' : 'Most Popular'}
        </span>
      </div>

      {/* Feed Cards Stream */}
      <div className="flex flex-col gap-6 py-4 px-3 sm:px-0">
        {rankedFeed.map(({ reel, reason }) => (
          <div
            key={reel.id}
            className="rounded-3xl bg-zinc-950 border border-zinc-800/80 overflow-hidden shadow-xl"
          >
            {/* Creator Header */}
            <div className="p-3.5 flex items-center justify-between">
              <div
                onClick={() => viewUserProfile(reel.user.id)}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <img
                  src={reel.user.avatar}
                  alt={reel.user.name}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-700 group-hover:scale-105 transition"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-pink-400 transition leading-tight">
                      {reel.user.username}
                    </span>
                    {reel.user.isVerified && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400">{reel.createdAt}</span>
                </div>
              </div>

              {/* Follow Button */}
              {reel.user.id !== currentUser.id && (
                <button
                  onClick={() => toggleFollowUser(reel.user.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                    reel.user.isFollowing
                      ? 'bg-zinc-800 text-zinc-300 hover:text-white'
                      : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                  }`}
                >
                  {reel.user.isFollowing ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Algorithm Recommendation Reason Pill */}
            {reason && sortMode === 'for_you' && (
              <div className="px-4 pb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-400 text-[10px] font-semibold border border-pink-500/20">
                  <Sparkles className="w-3 h-3" />
                  <span>{reason}</span>
                </span>
              </div>
            )}

            {/* Video / Post Display with Double Tap to Like */}
            <div
              onDoubleClick={() => handleDoubleTap(reel.id, reel.isLiked)}
              className="relative aspect-[4/5] bg-black overflow-hidden cursor-pointer"
            >
              <video
                src={reel.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Double tap heart burst */}
              {doubleTappedReelId === reel.id && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Heart className="w-24 h-24 text-rose-500 fill-rose-500 animate-heart-burst drop-shadow-2xl" />
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleLikeReel(reel.id)}
                  className="flex items-center gap-1.5 active:scale-90 transition text-zinc-300 hover:text-white"
                >
                  <Heart
                    className={`w-6 h-6 transition ${
                      reel.isLiked ? 'text-rose-500 fill-rose-500 scale-110' : ''
                    }`}
                  />
                  <span className="text-xs font-bold">{reel.likesCount}</span>
                </button>

                <button
                  onClick={() => setActiveCommentReelId(reel.id)}
                  className="flex items-center gap-1.5 active:scale-90 transition text-zinc-300 hover:text-white"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-xs font-bold">{reel.commentsCount}</span>
                </button>

                <button
                  onClick={() => openChatWithUser(reel.user)}
                  className="text-zinc-300 hover:text-white transition active:scale-90"
                  title="Share in Chat"
                >
                  <Share2 className="w-6 h-6" />
                </button>

                {/* Donate & Voice Comment */}
                <button
                  onClick={() => openDonationModal(reel)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-pink-500/15 border border-amber-500/30 text-amber-300 hover:text-amber-200 transition active:scale-95 text-xs font-semibold shadow-sm"
                  title="Donate & Voice Comment (95% to creator, 5% to me)"
                >
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <span>Donate</span>
                </button>
              </div>

              <button
                onClick={() => toggleSaveReel(reel.id)}
                className="text-zinc-300 hover:text-white transition active:scale-90"
                title="Save"
              >
                <Bookmark
                  className={`w-6 h-6 ${reel.isSaved ? 'text-amber-400 fill-amber-400' : ''}`}
                />
              </button>
            </div>

            {/* Caption & Tags */}
            <div className="px-3.5 pb-4">
              <p className="text-xs text-zinc-200 leading-relaxed">
                <span
                  onClick={() => viewUserProfile(reel.user.id)}
                  className="font-bold text-white cursor-pointer hover:underline mr-1.5"
                >
                  {reel.user.username}
                </span>
                {reel.caption}
              </p>

              <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                {reel.tags.map((tag) => (
                  <span key={tag} className="text-[11px] font-medium text-pink-400 hover:underline">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-zinc-400 font-medium">
                <Music2 className="w-3 h-3 text-pink-400 shrink-0" />
                <span className="truncate">
                  {reel.music.title} • {reel.music.artist}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reel Comments Drawer */}
      {activeCommentReel && (
        <ReelCommentsModal
          reel={activeCommentReel}
          isOpen={!!activeCommentReelId}
          onClose={() => setActiveCommentReelId(null)}
        />
      )}
    </div>
  );
};
