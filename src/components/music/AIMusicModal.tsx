import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Music,
  Sparkles,
  Play,
  Pause,
  Download,
  Share2,
  Film,
  Send,
  Sliders,
  Volume2,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateAIMusic, GeneratedTrack } from '../../utils/aiMusicGenerator';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface AIMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrackForReel?: (track: { title: string; artist: string; audioUrl?: string }) => void;
}

export const AIMusicModal: React.FC<AIMusicModalProps> = ({
  isOpen,
  onClose,
  onSelectTrackForReel,
}) => {
  const { openCreatorModal, chats, sendMessage, currentUser, openChatWithUser } = useApp();

  const [prompt, setPrompt] = useState('Upbeat 80s neon synthwave soundtrack with punchy drums');
  const [vibe, setVibe] = useState('Synthwave');
  const [duration, setDuration] = useState(15);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTrack, setGeneratedTrack] = useState<GeneratedTrack | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showShareInChat, setShowShareInChat] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const presets = [
    { label: 'Neon Synthwave ⚡', prompt: '80s retro synthwave soundtrack with driving arpeggios and punchy drums', vibe: 'Synthwave' },
    { label: 'Chill Lofi Sunset ☕', prompt: 'Mellow lofi hip hop beat with warm chords and vinyl crackle', vibe: 'Lofi' },
    { label: 'Viral Brand Jingle ☀️', prompt: 'Catchy 10-second acoustic pop commercial jingle', vibe: 'Jingle' },
    { label: 'Heavy 808 Trap Beat 🔥', prompt: 'Dark modern trap beat with rolling hi-hats and deep 808 bass', vibe: 'Trap' },
  ];

  // Stop audio on close
  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    }
  }, [isOpen]);

  // Audio element listener
  useEffect(() => {
    if (generatedTrack) {
      const audio = new Audio(generatedTrack.audioUrl);
      audioRef.current = audio;

      audio.ontimeupdate = () => {
        if (audio.duration) {
          setProgress(audio.currentTime / audio.duration);
        }
      };

      audio.onended = () => {
        setIsPlaying(false);
        setProgress(0);
      };

      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, [generatedTrack]);

  // Visualizer canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const numBars = 36;
      const barWidth = 4;
      const spacing = 4;
      const startX = (canvas.width - numBars * (barWidth + spacing)) / 2;

      for (let i = 0; i < numBars; i++) {
        let barHeight = 8;
        if (isPlaying || isGenerating) {
          const t = Date.now() / 150;
          barHeight = 10 + Math.sin(t + i * 0.4) * 22 + Math.cos(t * 0.7 + i) * 16;
        }

        const x = startX + i * (barWidth + spacing);
        const y = (canvas.height - barHeight) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, '#f43f5e');
        grad.addColorStop(1, '#a855f7');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2.5);
        ctx.fill();
      }
    };

    draw();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, isGenerating]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    sounds.playSend();

    try {
      const track = await generateAIMusic({
        prompt: prompt.trim(),
        vibe,
        duration,
      });

      setGeneratedTrack(track);
      sounds.playHeart();
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('Failed to generate AI music:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleUseInReel = () => {
    if (!generatedTrack) return;
    if (onSelectTrackForReel) {
      onSelectTrackForReel({
        title: generatedTrack.title,
        artist: 'AI Studio Original',
        audioUrl: generatedTrack.audioUrl,
      });
    }
    onClose();
    openCreatorModal('reel');
  };

  const handleUseInStory = () => {
    onClose();
    openCreatorModal('story');
  };

  const handleSendToChat = (chatId: string) => {
    if (!generatedTrack) return;
    sendMessage({
      chatId,
      text: `🎵 Generated AI Soundtrack: "${generatedTrack.title}" (${generatedTrack.vibe})`,
      mediaType: 'voice',
      mediaUrl: generatedTrack.audioUrl,
      voiceDuration: generatedTrack.duration,
    });
    setShowShareInChat(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">AI Music Generator</h2>
              <p className="text-[10px] text-zinc-400">Custom soundtracks, jingles & beats</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prompt Input */}
        <div className="mt-4 flex flex-col gap-2">
          <label className="text-xs font-semibold text-zinc-300">Prompt / Soundtrack Description</label>
          <textarea
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Chill sunset lofi chords with acoustic drums..."
            className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-pink-500 resize-none"
          />

          {/* Preset Inspo Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setPrompt(p.prompt);
                  setVibe(p.vibe);
                }}
                className="px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-medium border border-zinc-800 shrink-0 transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vibe & Duration Selectors */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Style / Vibe</label>
            <select
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-pink-500"
            >
              <option value="Synthwave">Synthwave Neon</option>
              <option value="Lofi">Lofi Chillhop</option>
              <option value="Jingle">Catchy Jingle</option>
              <option value="Trap">Modern 808 Trap</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-pink-500"
            >
              <option value={10}>10s (Short Jingle)</option>
              <option value={15}>15s (Story / Reel)</option>
              <option value={30}>30s (Full Soundtrack)</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 active:scale-95 transition disabled:opacity-40"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGenerating ? 'Synthesizing Audio Soundtrack...' : 'Generate AI Soundtrack'}</span>
        </button>

        {/* Visualizer & Generated Track Player */}
        <div className="mt-5 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex flex-col items-center">
          <canvas ref={canvasRef} width={280} height={60} className="w-full h-16 object-contain mb-3" />

          {generatedTrack ? (
            <div className="w-full flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{generatedTrack.title}</h4>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    {generatedTrack.vibe} • {generatedTrack.bpm} BPM • {generatedTrack.duration}s
                  </p>
                </div>

                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-pink-600 hover:bg-pink-500 text-white flex items-center justify-center shadow-md active:scale-95 transition"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>
              </div>

              {/* Progress Slider */}
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-100"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>

              {/* Action Buttons to attach music */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                <button
                  onClick={handleUseInReel}
                  className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-semibold flex flex-col items-center gap-1 transition"
                  title="Use in Reel"
                >
                  <Film className="w-4 h-4 text-purple-400" />
                  <span>Use in Reel</span>
                </button>

                <button
                  onClick={handleUseInStory}
                  className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-semibold flex flex-col items-center gap-1 transition"
                  title="Add to Story"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Add to Story</span>
                </button>

                <button
                  onClick={() => setShowShareInChat(!showShareInChat)}
                  className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-semibold flex flex-col items-center gap-1 transition"
                  title="Send in Chat"
                >
                  <Send className="w-4 h-4 text-pink-400" />
                  <span>Send in DM</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic">
              {isGenerating ? 'Composing tracks and audio waves...' : 'Tap generate to create custom audio track'}
            </p>
          )}
        </div>

        {/* Share in chat drawer */}
        {showShareInChat && (
          <div className="mt-3 p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-2 animate-scaleUp">
            <span className="text-xs font-bold text-white">Send AI Track to Friend:</span>
            <div className="flex flex-col gap-1 max-h-36 overflow-y-auto no-scrollbar">
              {chats.map((c) => {
                const peer = c.participants.find((p) => p.id !== currentUser.id);
                if (!peer) return null;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSendToChat(c.id)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-800 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <img src={peer.avatar} alt={peer.name} className="w-7 h-7 rounded-full object-cover" />
                      <span className="text-xs text-white font-medium">@{peer.username}</span>
                    </div>
                    <span className="text-[11px] text-pink-400 font-bold">Send</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
