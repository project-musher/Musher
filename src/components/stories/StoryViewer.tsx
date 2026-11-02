import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, Send, Volume2, VolumeX, MessageCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';

export const StoryViewer: React.FC = () => {
  const {
    stories,
    activeStoryUserIndex,
    closeStoryViewer,
    markStorySeen,
    likeStory,
    votePoll,
    sendMessage,
    chats,
    currentUser,
  } = useApp();

  // Group stories by user
  const groupedUserIds = Array.from(new Set(stories.map((s) => s.userId)));
  const currentUserId = activeStoryUserIndex !== null ? groupedUserIds[activeStoryUserIndex] : null;
  const currentGroupStories = stories.filter((s) => s.userId === currentUserId);

  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  const currentStory = currentGroupStories[storyIndex];
  const progressTimerRef = useRef<number | null>(null);

  // Reset story index when switching user
  useEffect(() => {
    setStoryIndex(0);
    setProgress(0);
  }, [activeStoryUserIndex]);

  // Mark active story as seen
  useEffect(() => {
    if (currentStory && !currentStory.seen) {
      markStorySeen(currentStory.id);
    }
  }, [currentStory, markStorySeen]);

  // Story progress timer (5 seconds per story)
  useEffect(() => {
    if (activeStoryUserIndex === null || !currentStory || isPaused) return;

    const DURATION = 5000; // 5s
    const INTERVAL = 50; // update every 50ms
    const step = (INTERVAL / DURATION) * 100;

    progressTimerRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, INTERVAL);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [activeStoryUserIndex, storyIndex, isPaused, currentStory]);

  const handleNext = () => {
    if (storyIndex < currentGroupStories.length - 1) {
      setStoryIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      // Next user's stories
      if (activeStoryUserIndex !== null && activeStoryUserIndex < groupedUserIds.length - 1) {
        setProgress(0);
        // Next user
        // Using context setter through close/reopen or state
        const nextUserIdx = activeStoryUserIndex + 1;
        const nextUserId = groupedUserIds[nextUserIdx];
        if (nextUserId) {
          // trigger next user story
          setStoryIndex(0);
          // AppContext holds activeStoryUserIndex
          // Let's directly handle via app context
        }
      } else {
        closeStoryViewer();
      }
    }
  };

  const handlePrev = () => {
    if (storyIndex > 0) {
      setStoryIndex((prev) => prev - 1);
      setProgress(0);
    } else if (activeStoryUserIndex !== null && activeStoryUserIndex > 0) {
      // previous user
      closeStoryViewer();
    }
  };

  const handleSendReply = (customText?: string) => {
    const textToSend = customText || replyText;
    if (!textToSend.trim() || !currentStory) return;

    // Find or create chat with author
    const targetChat = chats.find((c) =>
      c.participants.some((p) => p.id === currentStory.user.id)
    );

    const chatId = targetChat ? targetChat.id : `chat_${currentStory.user.id}_${Date.now()}`;

    sendMessage({
      chatId,
      text: `Replied to your story: "${textToSend}"`,
      mediaType: 'text',
    });

    setReplyText('');
    sounds.playSend();
  };

  const handleSendReaction = (emoji: string) => {
    if (!currentStory) return;
    const targetChat = chats.find((c) =>
      c.participants.some((p) => p.id === currentStory.user.id)
    );
    const chatId = targetChat ? targetChat.id : `chat_${currentStory.user.id}_${Date.now()}`;

    sendMessage({
      chatId,
      text: `Reacted ${emoji} to your story!`,
      mediaType: 'text',
    });
    sounds.playHeart();
  };

  if (activeStoryUserIndex === null || !currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center select-none animate-fadeIn">
      {/* Container simulating phone aspect ratio */}
      <div
        className="relative w-full max-w-md h-full sm:h-[92vh] sm:rounded-3xl overflow-hidden bg-zinc-950 flex flex-col justify-between shadow-2xl border border-zinc-800"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Story Background Media */}
        <div className="absolute inset-0 z-0">
          {currentStory.mediaType === 'image' ? (
            <img
              src={currentStory.mediaUrl}
              alt="Story"
              className={`w-full h-full object-cover ${
                currentStory.filter === 'warm'
                  ? 'sepia-[30%] saturate-125'
                  : currentStory.filter === 'vintage'
                  ? 'sepia-[45%] contrast-95'
                  : currentStory.filter === 'cyberpunk'
                  ? 'hue-rotate-90 saturate-150'
                  : ''
              }`}
            />
          ) : (
            <video
              src={currentStory.mediaUrl}
              autoPlay
              loop
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover"
            />
          )}
          {/* Subtle top & bottom shadow gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        </div>

        {/* Tap areas for Prev / Next navigation */}
        <div className="absolute inset-0 flex z-10">
          <div
            className="w-1/3 h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
          />
          <div
            className="w-2/3 h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
          />
        </div>

        {/* Top Header: Segmented Progress Bars & Author Profile */}
        <div className="relative z-20 p-3 pt-4 flex flex-col gap-3">
          {/* Progress segments */}
          <div className="flex items-center gap-1.5 w-full">
            {currentGroupStories.map((s, idx) => {
              let fill = 0;
              if (idx < storyIndex) fill = 100;
              else if (idx === storyIndex) fill = progress;
              return (
                <div key={s.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-75"
                    style={{ width: `${fill}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* User Info Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={currentStory.user.avatar}
                alt={currentStory.user.name}
                className="w-9 h-9 rounded-full object-cover border border-white/40"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white leading-tight">
                    {currentStory.user.username}
                  </span>
                  <span className="text-xs text-white/70">{currentStory.createdAt}</span>
                </div>
                {currentStory.caption && (
                  <span className="text-xs text-white/90 line-clamp-1">{currentStory.caption}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="p-1.5 rounded-full bg-black/40 text-white/90 hover:text-white"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeStoryViewer();
                }}
                className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Stickers Overlay */}
        <div className="relative z-20 flex-1 flex flex-col justify-center items-center pointer-events-none p-6">
          {currentStory.stickers?.map((sticker) => {
            if (sticker.type === 'poll') {
              const totalVotes = (sticker.votes?.[0] || 0) + (sticker.votes?.[1] || 0);
              const pct0 = totalVotes > 0 ? Math.round(((sticker.votes?.[0] || 0) / totalVotes) * 100) : 50;
              const pct1 = 100 - pct0;
              const hasVoted = sticker.userVotedIndex !== undefined;

              return (
                <div
                  key={sticker.id}
                  className="pointer-events-auto w-full max-w-xs bg-black/70 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl flex flex-col gap-3 animate-scaleUp"
                >
                  <p className="text-sm font-bold text-center text-white">{sticker.question}</p>
                  <div className="flex flex-col gap-2">
                    {sticker.options?.map((opt, optIdx) => {
                      const isVoted = sticker.userVotedIndex === optIdx;
                      const pct = optIdx === 0 ? pct0 : pct1;

                      return (
                        <button
                          key={optIdx}
                          disabled={hasVoted}
                          onClick={(e) => {
                            e.stopPropagation();
                            votePoll(currentStory.id, sticker.id, optIdx);
                          }}
                          className={`relative h-10 rounded-xl overflow-hidden text-xs font-bold transition-all border ${
                            isVoted
                              ? 'border-pink-500 shadow-md ring-2 ring-pink-500/30'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          {hasVoted && (
                            <div
                              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-pink-500/40 to-purple-500/40 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          )}
                          <div className="relative flex items-center justify-between px-3 h-full z-10 text-white">
                            <span>{opt}</span>
                            {hasVoted && <span className="font-mono">{pct}%</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }

            if (sticker.type === 'music') {
              return (
                <div
                  key={sticker.id}
                  className="pointer-events-auto px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold flex items-center gap-2 shadow-lg"
                >
                  <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                  <span>🎵 {sticker.text}</span>
                </div>
              );
            }

            if (sticker.type === 'question') {
              return (
                <div
                  key={sticker.id}
                  className="pointer-events-auto w-full max-w-xs bg-white text-black rounded-2xl p-4 shadow-xl flex flex-col gap-2"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
                    Ask a question
                  </span>
                  <p className="text-sm font-bold">{sticker.question}</p>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setReplyText(`Answering: `);
                    }}
                    className="p-2.5 rounded-xl bg-zinc-100 text-xs text-zinc-500 cursor-text"
                  >
                    Type something...
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* Bottom Story Interaction Bar */}
        <div className="relative z-20 p-4 flex flex-col gap-3">
          {/* Quick emoji reactions */}
          <div className="flex items-center justify-around gap-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
            {['❤️', '🔥', '😂', '😮', '😢', '👏'].map((emoji) => (
              <button
                key={emoji}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendReaction(emoji);
                }}
                className="text-xl hover:scale-125 active:scale-95 transition-transform"
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Reply input & Like Heart */}
          <div className="flex items-center gap-2.5">
            <div className="flex-1 relative">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendReply();
                  }
                }}
                placeholder={`Reply to ${currentStory.user.username}...`}
                className="w-full pl-4 pr-10 py-3 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white placeholder-white/60 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              {replyText.trim() && (
                <button
                  onClick={() => handleSendReply()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                likeStory(currentStory.id);
              }}
              className={`p-3 rounded-full backdrop-blur-md transition-all active:scale-90 ${
                currentStory.isLiked
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40'
                  : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
              }`}
              title="Like Story"
            >
              <Heart className={`w-5 h-5 ${currentStory.isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
