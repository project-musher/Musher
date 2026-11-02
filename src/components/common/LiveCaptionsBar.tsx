import React, { useState, useEffect } from 'react';
import { Subtitles, Sparkles, X, Volume2 } from 'lucide-react';
import { realtimeTranscription, LiveTranscriptEntry } from '../../utils/transcription';

interface LiveCaptionsBarProps {
  isActive: boolean;
  speakerName?: string;
  contextFeed?: 'call' | 'reel' | 'voicemail';
  onClose?: () => void;
  className?: string;
}

export const LiveCaptionsBar: React.FC<LiveCaptionsBarProps> = ({
  isActive,
  speakerName = 'Live Audio',
  contextFeed = 'call',
  onClose,
  className = '',
}) => {
  const [currentEntry, setCurrentEntry] = useState<LiveTranscriptEntry | null>(null);
  const [history, setHistory] = useState<LiveTranscriptEntry[]>([]);

  useEffect(() => {
    if (isActive) {
      realtimeTranscription.start(speakerName, contextFeed);
      const unsubscribe = realtimeTranscription.subscribe((entry) => {
        setCurrentEntry(entry);
        if (entry.isFinal) {
          setHistory((prev) => [...prev.slice(-4), entry]);
        }
      });

      return () => {
        unsubscribe();
        realtimeTranscription.stop();
      };
    } else {
      realtimeTranscription.stop();
      setCurrentEntry(null);
    }
  }, [isActive, speakerName, contextFeed]);

  if (!isActive) return null;

  return (
    <div
      className={`rounded-2xl bg-black/80 backdrop-blur-md border border-white/20 p-3 shadow-2xl flex flex-col gap-1.5 animate-fadeIn select-text ${className}`}
    >
      <div className="flex items-center justify-between text-zinc-400 pb-1 border-b border-white/10 text-[10px] uppercase font-bold tracking-wider">
        <div className="flex items-center gap-1.5 text-pink-400">
          <Subtitles className="w-3.5 h-3.5" />
          <span>Real-time Live Audio Transcription</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-0.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Live spoken phrase */}
      <div className="min-h-[36px] flex items-center">
        {currentEntry ? (
          <p className="text-xs sm:text-sm font-semibold text-white leading-snug">
            <span className="text-pink-400 font-bold mr-1.5">
              [{currentEntry.speaker}]:
            </span>
            <span>{currentEntry.text}</span>
            {!currentEntry.isFinal && (
              <span className="inline-block w-1.5 h-3.5 bg-pink-500 animate-pulse ml-1 align-middle" />
            )}
          </p>
        ) : (
          <p className="text-xs text-zinc-400 italic flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 animate-pulse text-zinc-500" />
            Listening to live audio feed...
          </p>
        )}
      </div>
    </div>
  );
};
