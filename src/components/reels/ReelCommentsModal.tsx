import React, { useState } from 'react';
import { X, Send, Heart, DollarSign, Mic, Play, Pause, Sparkles } from 'lucide-react';
import { Reel } from '../../types';
import { useApp } from '../../context/AppContext';

interface ReelCommentsModalProps {
  reel: Reel;
  isOpen: boolean;
  onClose: () => void;
}

export const ReelCommentsModal: React.FC<ReelCommentsModalProps> = ({
  reel,
  isOpen,
  onClose,
}) => {
  const { addReelComment, currentUser, openDonationModal } = useApp();
  const [commentText, setCommentText] = useState('');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addReelComment(reel.id, commentText);
    setCommentText('');
  };

  const toggleVoicePlayback = (id: string, durationSeconds: number = 8) => {
    if (playingVoiceId === id) {
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(id);
      setTimeout(() => {
        setPlayingVoiceId((prev) => (prev === id ? null : prev));
      }, durationSeconds * 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fadeIn">
      <div
        className="w-full max-w-lg bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl max-h-[75vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              openDonationModal(reel);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:border-amber-400 transition"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Donate & Voice Comment</span>
          </button>
          <h3 className="text-sm font-bold text-white">Comments ({reel.commentsCount})</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 no-scrollbar">
          {reel.comments.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs">
              No comments yet. Be the first to donate and add a voice comment!
            </div>
          ) : (
            reel.comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-3 rounded-2xl transition ${
                  comment.isDonation
                    ? 'bg-gradient-to-r from-amber-500/15 via-pink-500/10 to-purple-500/15 border border-amber-500/40 shadow-lg'
                    : 'bg-zinc-800/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={comment.user.avatar}
                    alt={comment.user.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-zinc-700"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">
                          {comment.user.username}
                        </span>
                        {comment.isDonation && (
                          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-white font-extrabold text-[10px] flex items-center gap-0.5 shadow-sm">
                            ⭐ Donated ${comment.donationAmount?.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        {comment.createdAt}
                      </span>
                    </div>

                    {/* Transparent fee split badge for donated comments */}
                    {comment.isDonation && (
                      <p className="text-[10px] text-amber-300/80 font-mono mt-0.5">
                        95% (${comment.creatorShare?.toFixed(2)}) to creator • 5% (${comment.platformFee?.toFixed(2)}) fee to me
                      </p>
                    )}

                    {/* Text Message */}
                    <p className="text-xs text-zinc-200 mt-1 leading-relaxed">
                      {comment.text}
                    </p>

                    {/* Voice Comment Playback Bar */}
                    {(comment.voiceUrl || comment.voiceDuration) && (
                      <div className="mt-2.5 p-2 rounded-xl bg-black/40 border border-white/10 flex items-center gap-2.5">
                        <button
                          onClick={() => toggleVoicePlayback(comment.id, comment.voiceDuration || 8)}
                          className="w-7 h-7 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-white flex items-center justify-center shadow"
                        >
                          {playingVoiceId === comment.id ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          )}
                        </button>
                        <div className="flex-1 flex items-center gap-1">
                          {[12, 22, 10, 26, 18, 8, 28, 14, 20, 16, 24, 12].map((h, idx) => (
                            <div
                              key={idx}
                              className={`w-1 rounded-full ${
                                playingVoiceId === comment.id
                                  ? 'bg-amber-400 animate-pulse'
                                  : 'bg-zinc-600'
                              }`}
                              style={{ height: `${h}px` }}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {playingVoiceId === comment.id ? 'Playing' : `0:0${comment.voiceDuration || 8}`}
                        </span>
                      </div>
                    )}
                  </div>

                  <button className="text-zinc-500 hover:text-rose-500 transition pt-1">
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center gap-2"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment or donate..."
            className="flex-1 px-3.5 py-2 rounded-full bg-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
          />
          <button
            type="button"
            onClick={() => {
              onClose();
              openDonationModal(reel);
            }}
            className="p-2 rounded-full text-amber-400 hover:text-amber-300 transition"
            title="Donate & Voice Comment (5% fee)"
          >
            <DollarSign className="w-4 h-4" />
          </button>
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="p-2 rounded-full text-pink-500 hover:text-pink-400 disabled:opacity-30 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
