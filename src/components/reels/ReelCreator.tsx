import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  Music,
  Send,
  Video,
  Hash,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReelCreator: React.FC = () => {
  const {
    creatorModal,
    closeCreatorModal,
    addReel,
    openAIMusicModal,
    openVideoStudio,
  } = useApp();

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [tagInput, setTagInput] = useState('#vibes #aesthetic');
  const [selectedAudio, setSelectedAudio] = useState({
    title: 'Neon Dreams (Slowed)',
    artist: 'Original Audio',
  });

  const [isRecordingCamera, setIsRecordingCamera] = useState(false);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const trendingAudios = [
    { title: 'Neon Dreams (Slowed)', artist: 'Original Audio' },
    { title: 'Midnight City (Synth)', artist: 'M83 Vibe Edit' },
    { title: 'Espresso (Upbeat)', artist: 'Sabrina Carpenter' },
    { title: 'Lofi Coffee Beats', artist: 'Chillhop Music' },
  ];

  // Preset demo high quality video clips if user wants 1-click reel creation
  const demoVideoClips = [
    {
      label: 'Skater Sunset',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-silhouette-of-a-skater-doing-tricks-at-sunset-41484-large.mp4',
    },
    {
      label: 'Neon Lights',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-colorful-neon-lights-in-the-dark-42410-large.mp4',
    },
    {
      label: 'Synth Studio',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-playing-a-synthesizer-in-a-studio-43285-large.mp4',
    },
  ];

  useEffect(() => {
    if (creatorModal === 'reel' && !videoUrl) {
      setVideoUrl(demoVideoClips[0].url);
    }
  }, [creatorModal]);

  if (creatorModal !== 'reel') return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  };

  const handlePublish = () => {
    if (!videoUrl) return;

    const tags = tagInput
      .split(' ')
      .filter((t) => t.trim().length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    addReel({
      videoUrl,
      caption: caption || 'Check out my new reel! ✨',
      tags: tags.length > 0 ? tags : ['#vibegram', '#reels'],
      music: selectedAudio,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 select-none animate-fadeIn">
      <div className="relative w-full max-w-sm h-[90vh] rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col justify-between">
        {/* Top Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between z-20 bg-black/60 backdrop-blur-md">
          <button
            onClick={closeCreatorModal}
            className="p-1 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-sm font-bold text-white">Create New Reel</h2>
          <div className="w-6" />
        </div>

        {/* Video Preview Viewport */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {videoUrl ? (
            <video
              src={videoUrl}
              autoPlay
              loop
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-zinc-500 text-xs flex flex-col items-center gap-2">
              <Video className="w-8 h-8" />
              <span>Select or record a video</span>
            </div>
          )}

          {/* Quick Preset Selector Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center gap-2 z-10 overflow-x-auto no-scrollbar">
            {demoVideoClips.map((clip) => (
              <button
                key={clip.label}
                onClick={() => setVideoUrl(clip.url)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md transition ${
                  videoUrl === clip.url
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'bg-black/50 text-zinc-300 hover:bg-black/70'
                }`}
              >
                {clip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Media Select / Upload Controls */}
        <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-around">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
          >
            <Upload className="w-4 h-4 text-pink-400" />
            <span>Upload Video</span>
          </button>

          <button
            onClick={() => {
              closeCreatorModal();
              openVideoStudio();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/40 text-pink-300 text-xs font-semibold hover:border-pink-500 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>AI Video Ad Studio</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="video/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Caption, Tags & Music Settings */}
        <div className="p-4 bg-zinc-950 flex flex-col gap-3 z-20">
          {/* Caption */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
              Caption
            </label>
            <textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption for your reel..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 text-white text-xs border border-zinc-800 focus:outline-none focus:border-pink-500 resize-none"
            />
          </div>

          {/* Hashtags */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
              Hashtags (Used by recommendation algorithm)
            </label>
            <div className="relative">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="#fashion #music #art"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 text-white text-xs border border-zinc-800 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Audio selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-zinc-400">
                Audio Track
              </label>
              <button
                type="button"
                onClick={openAIMusicModal}
                className="text-[10px] text-pink-400 font-bold hover:underline flex items-center gap-1 transition"
              >
                <Sparkles className="w-3 h-3 text-pink-400" />
                <span>AI Music Studio</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {trendingAudios.map((aud) => (
                <button
                  key={aud.title}
                  onClick={() => setSelectedAudio(aud)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-medium shrink-0 transition ${
                    selectedAudio.title === aud.title
                      ? 'bg-pink-600 text-white font-bold'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  🎵 {aud.title}
                </button>
              ))}
            </div>
          </div>

          {/* Publish Button */}
          <button
            onClick={handlePublish}
            disabled={!videoUrl}
            className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 active:scale-95 transition disabled:opacity-40"
          >
            <span>Publish Reel</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
