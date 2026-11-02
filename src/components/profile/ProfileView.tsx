import React, { useState } from 'react';
import {
  Grid,
  Film,
  Bookmark,
  BadgeCheck,
  Phone,
  Video,
  MessageCircle,
  Share2,
  Settings,
  ChevronLeft,
  Sparkles,
  DollarSign,
  Wallet,
  Sliders,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EditProfileModal } from './EditProfileModal';
import { sounds } from '../../utils/audio';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    users,
    selectedUserId,
    setActiveTab,
    toggleFollowUser,
    openChatWithUser,
    startCall,
    reels,
    openStoryViewer,
    stories,
    userBalance,
    topUpBalance,
    platformRevenue,
    donationTransactions,
    openDonationModal,
    openPermissionsModal,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'reels' | 'saved'>('reels');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // If selectedUserId is provided, view that user; else view currentUser
  const user = selectedUserId
    ? users.find((u) => u.id === selectedUserId) || currentUser
    : currentUser;

  const isSelf = user.id === currentUser.id;

  // Filter reels by this user
  const userReels = reels.filter((r) => r.userId === user.id);
  const userStories = stories.filter((s) => s.userId === user.id);
  const hasStories = userStories.length > 0;

  // Preset highlights
  const highlights = [
    { title: 'Tokyo 🗼', cover: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=200&auto=format&fit=crop&q=80' },
    { title: 'Studio 🎛️', cover: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200&auto=format&fit=crop&q=80' },
    { title: 'Fits 🌸', cover: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&auto=format&fit=crop&q=80' },
    { title: 'Vibes ✨', cover: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=200&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto pb-24 overflow-y-auto no-scrollbar animate-fadeIn">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          {!isSelf && (
            <button
              onClick={() => setActiveTab('feed')}
              className="p-1 rounded-full text-zinc-400 hover:text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base text-white tracking-tight">
              {user.username}
            </span>
            {user.isVerified && (
              <BadgeCheck className="w-4 h-4 text-blue-400 fill-blue-400/20" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openPermissionsModal}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
            title="Access Permissions (Camera & Microphone)"
          >
            <Sliders className="w-5 h-5" />
          </button>
          {isSelf && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
              title="Edit Profile"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Profile Info */}
      <div className="px-5 pt-4">
        <div className="flex items-center gap-6">
          {/* Avatar with Story Ring if active */}
          <div
            onClick={() => {
              if (hasStories) openStoryViewer(user.id);
            }}
            className={`p-[3px] rounded-full shrink-0 transition-transform ${
              hasStories
                ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 cursor-pointer hover:scale-105 shadow-md'
                : 'border border-zinc-800'
            }`}
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-black"
            />
          </div>

          {/* Stats Counters */}
          <div className="flex-1 flex items-center justify-around text-center">
            <div>
              <div className="text-base sm:text-lg font-bold text-white">
                {userReels.length + 3}
              </div>
              <div className="text-xs text-zinc-400">Posts</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-white">
                {(user.followersCount > 1000 ? `${(user.followersCount / 1000).toFixed(1)}k` : user.followersCount)}
              </div>
              <div className="text-xs text-zinc-400">Followers</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-white">
                {user.followingCount}
              </div>
              <div className="text-xs text-zinc-400">Following</div>
            </div>
          </div>
        </div>

        {/* Name, Status & Bio */}
        <div className="mt-3">
          <h1 className="text-sm font-bold text-white leading-tight">{user.name}</h1>
          {user.customStatus && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full bg-zinc-800/90 text-zinc-300 text-[11px] font-medium border border-zinc-700/60">
              <Sparkles className="w-3 h-3 text-pink-400" />
              <span>{user.customStatus}</span>
            </div>
          )}
          <p className="text-xs text-zinc-200 mt-2 whitespace-pre-line leading-relaxed">
            {user.bio}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-2">
          {isSelf ? (
            <>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-semibold text-xs text-white transition active:scale-98"
              >
                Edit Profile
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  sounds.playSend();
                }}
                className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-semibold text-xs text-white transition active:scale-98 flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Profile</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => toggleFollowUser(user.id)}
                className={`flex-1 py-2 rounded-xl font-semibold text-xs transition active:scale-98 ${
                  user.isFollowing
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-white'
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-md shadow-pink-500/20'
                }`}
              >
                {user.isFollowing ? 'Following' : 'Follow'}
              </button>

              <button
                onClick={() => openChatWithUser(user)}
                className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-98"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message</span>
              </button>

              <button
                onClick={() => startCall(user, 'audio')}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white transition"
                title="Audio Call"
              >
                <Phone className="w-4 h-4" />
              </button>

              <button
                onClick={() => startCall(user, 'video')}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white transition"
                title="Video Call"
              >
                <Video className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Tip & Voice Comment Button for visiting other creators */}
        {!isSelf && (
          <button
            onClick={() => openDonationModal({ user })}
            className="w-full mt-2.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 font-bold text-xs text-white flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition group"
          >
            <DollarSign className="w-4 h-4 text-amber-200 group-hover:scale-110 transition" />
            <span>Donate & Attach Voice Comment (95% to {user.name}, 5% to me)</span>
          </button>
        )}

        {/* Creator Financials, Platform Cut (5%), & Media Access Permissions (for current user) */}
        {isSelf && (
          <div className="mt-4 space-y-2.5">
            {/* Wallet & 5% Platform Revenue */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Wallet className="w-4 h-4 text-pink-400" />
                  <span>Wallet & Financial Overview</span>
                </div>
                <button
                  onClick={() => topUpBalance(50)}
                  className="flex items-center gap-1 text-[11px] font-bold text-pink-400 hover:text-pink-300 transition bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20 active:scale-95"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>+ $50 Top-Up</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">
                    My Balance
                  </span>
                  <div className="text-base font-extrabold text-white mt-0.5">
                    ${userBalance.toFixed(2)}
                  </div>
                  <span className="text-[9px] text-zinc-500">Available to tip</span>
                </div>

                <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500/10 to-pink-500/10 border border-amber-500/30">
                  <span className="text-[10px] text-amber-300 uppercase font-semibold tracking-wider flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    5% Fee To Me
                  </span>
                  <div className="text-base font-extrabold text-amber-300 mt-0.5">
                    ${platformRevenue.toFixed(2)}
                  </div>
                  <span className="text-[9px] text-amber-400/80">Platform cut collected</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                <span>Total Tip Transactions</span>
                <span className="font-semibold text-zinc-300">{donationTransactions.length} processed</span>
              </div>
            </div>

            {/* Media Access Permissions Card */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">Media Access Permissions</span>
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    Camera & Microphone live diagnostics & browser settings
                  </p>
                </div>
              </div>

              <button
                onClick={openPermissionsModal}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs active:scale-95 transition"
              >
                Configure
              </button>
            </div>
          </div>
        )}

        {/* Highlights Row */}
        <div className="mt-6 flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
          {highlights.map((h, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group">
              <div className="p-0.5 rounded-full border border-zinc-700 group-hover:border-zinc-500 transition">
                <img
                  src={h.cover}
                  alt={h.title}
                  className="w-14 h-14 rounded-full object-cover"
                />
              </div>
              <span className="text-[11px] text-zinc-300 font-medium">{h.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-t border-zinc-800 flex items-center justify-around">
        <button
          onClick={() => setActiveSubTab('reels')}
          className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-bold transition border-b-2 ${
            activeSubTab === 'reels'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Reels ({userReels.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('posts')}
          className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-bold transition border-b-2 ${
            activeSubTab === 'posts'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Posts</span>
        </button>

        {isSelf && (
          <button
            onClick={() => setActiveSubTab('saved')}
            className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-bold transition border-b-2 ${
              activeSubTab === 'saved'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved</span>
          </button>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-1 p-1">
        {activeSubTab === 'reels' &&
          userReels.map((reel) => (
            <div
              key={reel.id}
              onClick={() => setActiveTab('reels')}
              className="relative aspect-[9/16] bg-zinc-900 overflow-hidden cursor-pointer group"
            >
              <video
                src={reel.videoUrl}
                muted
                playsInline
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                <span className="text-[11px] font-bold text-white flex items-center gap-1">
                  <Film className="w-3 h-3 text-white/80" />
                  {reel.likesCount > 1000 ? `${(reel.likesCount / 1000).toFixed(1)}k` : reel.likesCount}
                </span>
              </div>
            </div>
          ))}

        {activeSubTab === 'posts' && (
          <>
            <div className="aspect-square bg-zinc-900 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=80"
                alt="Post"
                className="w-full h-full object-cover hover:scale-105 transition"
              />
            </div>
            <div className="aspect-square bg-zinc-900 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&auto=format&fit=crop&q=80"
                alt="Post"
                className="w-full h-full object-cover hover:scale-105 transition"
              />
            </div>
            <div className="aspect-square bg-zinc-900 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500&auto=format&fit=crop&q=80"
                alt="Post"
                className="w-full h-full object-cover hover:scale-105 transition"
              />
            </div>
          </>
        )}

        {activeSubTab === 'saved' && (
          <div className="col-span-3 py-12 text-center text-zinc-500 text-xs">
            Saved reels and stories are only visible to you.
          </div>
        )}
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};
