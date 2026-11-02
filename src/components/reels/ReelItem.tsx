import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Music2,
  Volume2,
  VolumeX,
  Play,
  Check,
  Plus,
  Sparkles,
  Subtitles,
  DollarSign,
} from 'lucide-react';
import { Reel } from '../../types';
import { useApp } from '../../context/AppContext';
import { ReelCommentsModal } from './ReelCommentsModal';
import { LiveCaptionsBar } from '../common/LiveCaptionsBar';
import { sounds } from '../../utils/audio';

interface ReelItemProps {
  reel: Reel;
  isActive: boolean;
  recommendationReason?: string;
}

export const ReelItem: React.FC<ReelItemProps> = ({
  reel,
  isActive,
  recommendationReason,
}) => {
  const {
    toggleLikeReel,
    toggleSaveReel,
    toggleFollowUser,
    viewUserProfile,
    openChatWithUser,
    openDonationModal,
  } = useApp();

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isExpandedCaption, setIsExpandedCaption] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastTapRef = useRef<number>(0);

  // Play/pause based on isActive prop
  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {
          // Autoplay policy: start muted if unmuted fails
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch(() => {});
          }
        });
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isActive]);

  const handleVideoTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected: like!
      if (!reel.isLiked) {
        toggleLikeReel(reel.id);
      } else {
        sounds.playHeart();
      }
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
      lastTapRef.current = 0;
    } else {
      // Single tap: toggle play/pause
      lastTapRef.current = now;
      setTimeout(() => {
        if (lastTapRef.current !== 0) {
          if (videoRef.current) {
            if (videoRef.current.paused) {
              videoRef.current.play();
              setIsPlaying(true);
            } else {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          }
          lastTapRef.current = 0;
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: `Reel by ${reel.user.username}`,
        text: reel.caption,
        url: window.location.href,
      }).catch(() => {});
    } else {
      openChatWithUser(reel.user);
    }
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center select-none overflow-hidden reel-item">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        loop
        playsInline
        muted={isMuted}
        onClick={handleVideoTap}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Heart Burst Animation */}
      {showHeartBurst && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <Heart className="w-28 h-28 text-rose-500 fill-rose-500 animate-heart-burst drop-shadow-2xl" />
        </div>
      )}

      {/* Paused indicator */}
      {!isPlaying && (
        <div
          onClick={handleVideoTap}
          className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-auto cursor-pointer z-20"
        >
          <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white">
            <Play className="w-8 h-8 fill-current ml-1" />
          </div>
        </div>
      )}

      {/* Sound Mute Toggle Icon Top Right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsMuted(!isMuted);
        }}
        className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white/90 hover:text-white hover:bg-black/60 transition"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      {/* Right Actions Bar (Instagram Style) */}
      <div className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-5">
        {/* Like */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLikeReel(reel.id);
          }}
          className="flex flex-col items-center gap-1 group active:scale-90 transition"
        >
          <div
            className={`p-2.5 rounded-full backdrop-blur-md transition ${
              reel.isLiked
                ? 'bg-rose-600/30 text-rose-500'
                : 'bg-black/30 text-white group-hover:bg-black/50'
            }`}
          >
            <Heart
              className={`w-7 h-7 transition-all ${
                reel.isLiked ? 'fill-rose-500 scale-110' : ''
              }`}
            />
          </div>
          <span className="text-xs font-bold text-white drop-shadow">
            {reel.likesCount > 1000
              ? `${(reel.likesCount / 1000).toFixed(1)}k`
              : reel.likesCount}
          </span>
        </button>

        {/* Comment */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowComments(true);
          }}
          className="flex flex-col items-center gap-1 group active:scale-90 transition"
        >
          <div className="p-2.5 rounded-full bg-black/30 backdrop-blur-md text-white group-hover:bg-black/50">
            <MessageCircle className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold text-white drop-shadow">
            {reel.commentsCount}
          </span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1 group active:scale-90 transition"
        >
          <div className="p-2.5 rounded-full bg-black/30 backdrop-blur-md text-white group-hover:bg-black/50">
            <Share2 className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold text-white drop-shadow">
            {reel.sharesCount > 1000
              ? `${(reel.sharesCount / 1000).toFixed(1)}k`
              : reel.sharesCount}
          </span>
        </button>

        {/* Tip / Donate with Voice Comment */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            openDonationModal(reel);
          }}
          className="flex flex-col items-center gap-1 group active:scale-90 transition"
          title="Donate & Voice Comment (95% to creator, 5% to me)"
        >
          <div className="p-2.5 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500 text-white shadow-lg shadow-amber-500/30 group-hover:scale-110 transition border border-amber-300/40">
            <DollarSign className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-bold text-amber-300 drop-shadow uppercase tracking-wider">
            Tip
          </span>
        </button>

        {/* Save */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSaveReel(reel.id);
          }}
          className="flex flex-col items-center gap-1 group active:scale-90 transition"
        >
          <div
            className={`p-2.5 rounded-full backdrop-blur-md transition ${
              reel.isSaved
                ? 'bg-amber-500/30 text-amber-400'
                : 'bg-black/30 text-white group-hover:bg-black/50'
            }`}
          >
            <Bookmark
              className={`w-7 h-7 ${reel.isSaved ? 'fill-amber-400' : ''}`}
            />
          </div>
        </button>

        {/* Spinning Audio Album Cover */}
        <div className="w-10 h-10 rounded-full border-2 border-white/60 p-0.5 overflow-hidden animate-[spin_6s_linear_infinite] shadow-lg">
          <img
            src={reel.user.avatar}
            alt="Audio Cover"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      </div>

      {/* Bottom Info & Caption Overlay */}
      <div className="absolute left-0 right-16 bottom-4 z-20 p-4 pb-2 flex flex-col gap-2.5 pointer-events-none">
        {/* Recommendation Reason Pill (Feed Algorithm) */}
        {recommendationReason && (
          <div className="pointer-events-auto self-start inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-zinc-300 text-[11px] font-medium border border-white/10">
            <Sparkles className="w-3 h-3 text-pink-400" />
            <span className="truncate max-w-[240px]">{recommendationReason}</span>
          </div>
        )}

        {/* User Handle & Follow */}
        <div className="pointer-events-auto flex items-center gap-2.5">
          <div
            onClick={() => viewUserProfile(reel.user.id)}
            className="cursor-pointer flex items-center gap-2 group"
          >
            <img
              src={reel.user.avatar}
              alt={reel.user.name}
              className="w-9 h-9 rounded-full object-cover border border-white/50 group-hover:scale-105 transition"
            />
            <span className="font-bold text-white text-sm drop-shadow group-hover:underline">
              {reel.user.username}
            </span>
          </div>

          <button
            onClick={() => toggleFollowUser(reel.user.id)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 ${
              reel.user.isFollowing
                ? 'bg-white/20 text-white backdrop-blur-md'
                : 'bg-pink-600 hover:bg-pink-500 text-white shadow-md'
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
        </div>

        {/* Caption */}
        <div className="pointer-events-auto text-xs text-white drop-shadow leading-relaxed">
          <span className={isExpandedCaption ? '' : 'line-clamp-2'}>
            {reel.caption}
          </span>
          {reel.caption.length > 70 && (
            <button
              onClick={() => setIsExpandedCaption(!isExpandedCaption)}
              className="text-white/70 font-semibold ml-1 hover:text-white"
            >
              {isExpandedCaption ? 'less' : 'more'}
            </button>
          )}
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {reel.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-medium text-pink-300 drop-shadow hover:underline cursor-pointer"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Audio Ticker */}
        <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
          <Music2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {reel.music.title} • {reel.music.artist}
          </span>
        </div>
      </div>

      {/* Comments Drawer Modal */}
      <ReelCommentsModal
        reel={reel}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </div>
  );
};
