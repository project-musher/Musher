import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface VoiceNotePlayerProps {
  duration?: number;
  mediaUrl?: string;
  isCurrentUser?: boolean;
  isVoiceMail?: boolean;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
  duration = 14,
  mediaUrl,
  isCurrentUser = false,
  isVoiceMail = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  // If real audio URL exists, use real HTML5 Audio
  useEffect(() => {
    if (mediaUrl) {
      const audio = new Audio(mediaUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        setProgress(0);
      };

      audio.ontimeupdate = () => {
        if (audio.duration) {
          setProgress(audio.currentTime / audio.duration);
        }
      };

      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, [mediaUrl]);

  // Handle synthetic timer if no audio file
  useEffect(() => {
    if (!mediaUrl && isPlaying) {
      const step = 0.05;
      const totalTimeMs = (duration / playbackSpeed) * 1000;
      const intervalMs = totalTimeMs * step;

      intervalRef.current = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + step;
        });
      }, intervalMs);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, duration, playbackSpeed, mediaUrl]);

  const togglePlay = () => {
    if (mediaUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const cycleSpeed = () => {
    const nextSpeed: 1 | 1.5 | 2 = playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.min(Math.max(clickX / rect.width, 0), 1);
    setProgress(newProgress);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = newProgress * audioRef.current.duration;
    }
  };

  const currentSeconds = Math.floor(progress * duration);
  const remainingSeconds = duration - currentSeconds;
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Waveform bars heights
  const bars = [18, 28, 14, 32, 22, 10, 36, 26, 16, 30, 24, 18, 34, 28, 12, 22, 38, 20, 14, 30, 24, 16];

  return (
    <div
      className={`rounded-2xl p-3 max-w-[280px] sm:max-w-xs transition-all ${
        isCurrentUser
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-pink-500/10'
          : 'bg-zinc-800/90 text-zinc-100 border border-zinc-700/60'
      }`}
    >
      {isVoiceMail && (
        <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
          <Volume2 className="w-3.5 h-3.5" />
          <span>Voice Mail Message</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 ${
            isCurrentUser ? 'bg-white text-purple-600 shadow' : 'bg-pink-500 text-white shadow-md'
          }`}
          aria-label={isPlaying ? 'Pause voice message' : 'Play voice message'}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        {/* Waveform graphic */}
        <div className="flex-1 flex flex-col justify-center">
          <div
            className="flex items-center gap-1 h-8 cursor-pointer py-1"
            onClick={handleSeek}
            title="Click to seek"
          >
            {bars.map((h, i) => {
              const barProgress = i / bars.length;
              const isPast = barProgress <= progress;
              return (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isPast
                      ? isCurrentUser
                        ? 'bg-white'
                        : 'bg-pink-400'
                      : isCurrentUser
                      ? 'bg-white/40'
                      : 'bg-zinc-600'
                  } ${isPlaying && isPast ? 'animate-pulse' : ''}`}
                  style={{ height: `${h}px` }}
                />
              );
            })}
          </div>

          {/* Time & speed & CC */}
          <div className="flex items-center justify-between text-[11px] font-medium opacity-85 mt-0.5">
            <span>{isPlaying ? formatTime(currentSeconds) : formatTime(duration)}</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                  showTranscript ? 'bg-pink-500 text-white' : 'bg-black/20 hover:bg-black/30'
                }`}
                title="Toggle Real-Time Transcript"
              >
                CC
              </button>
              <button
                onClick={cycleSpeed}
                className="px-1.5 py-0.5 rounded bg-black/20 hover:bg-black/30 transition text-[10px] font-bold"
              >
                {playbackSpeed}x
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Live Transcript Accordion */}
      {showTranscript && (
        <div className="mt-2.5 pt-2 border-t border-white/15 text-[11px] leading-relaxed">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-300/90 mb-1">
            <span>Live Audio Transcript</span>
          </div>
          <p className="italic opacity-90">
            {isVoiceMail
              ? `"Hey Alex! Checking in about the upcoming collaboration. Give me a call back whenever you get a minute!"`
              : `"Hey! Just sent over the new audio preview for your review, let me know what you think!"`}
          </p>
        </div>
      )}
    </div>
  );
};
