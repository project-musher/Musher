import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  Type,
  Smile,
  Palette,
  Sparkles,
  Send,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StorySticker } from '../../types';

export const StoryCreator: React.FC = () => {
  const { creatorModal, closeCreatorModal, addStory } = useApp();

  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [activeFilter, setActiveFilter] = useState<'normal' | 'warm' | 'vintage' | 'cyberpunk'>('normal');
  const [stickers, setStickers] = useState<StorySticker[]>([]);
  const [stickerType, setStickerType] = useState<'poll' | 'music' | 'question' | null>(null);
  const [pollQuestion, setPollQuestion] = useState('Hot or Not? 🔥');
  const [musicTitle, setMusicTitle] = useState('Espresso - Sabrina Carpenter');

  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Preset aesthetic background options for text stories
  const presetBackgrounds = [
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80',
  ];

  useEffect(() => {
    if (creatorModal === 'story' && !mediaUrl) {
      setMediaUrl(presetBackgrounds[0]);
    }
  }, [creatorModal]);

  // Camera preview handling
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (useCamera && creatorModal === 'story') {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((s) => {
            stream = s;
            if (videoRef.current) {
              videoRef.current.srcObject = s;
            }
          })
          .catch(() => {
            setUseCamera(false);
          });
      }
    }

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [useCamera, creatorModal]);

  if (creatorModal !== 'story') return null;

  const handleCapturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 720;
      canvas.height = video.videoHeight || 1280;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setMediaUrl(dataUrl);
        setUseCamera(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaUrl(url);
      setUseCamera(false);
    }
  };

  const handleAddSticker = () => {
    if (stickerType === 'poll') {
      const newSticker: StorySticker = {
        id: `stk_${Date.now()}`,
        type: 'poll',
        question: pollQuestion,
        options: ['YES 🔥', 'NO 🙅‍♂️'],
        votes: [1, 0],
        x: 50,
        y: 60,
      };
      setStickers((prev) => [...prev, newSticker]);
    } else if (stickerType === 'music') {
      const newSticker: StorySticker = {
        id: `stk_${Date.now()}`,
        type: 'music',
        text: musicTitle,
        x: 50,
        y: 70,
      };
      setStickers((prev) => [...prev, newSticker]);
    }
    setStickerType(null);
  };

  const handlePublishStory = () => {
    if (!mediaUrl) return;
    addStory({
      mediaUrl,
      mediaType: 'image',
      caption,
      stickers,
      filter: activeFilter === 'normal' ? undefined : activeFilter,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 select-none animate-fadeIn">
      <div className="relative w-full max-w-sm h-[90vh] rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col justify-between">
        {/* Background / Media Viewport */}
        <div className="absolute inset-0 z-0">
          {useCamera ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : mediaUrl ? (
            <img
              src={mediaUrl}
              alt="Story Preview"
              className={`w-full h-full object-cover ${
                activeFilter === 'warm'
                  ? 'sepia-[30%] saturate-125'
                  : activeFilter === 'vintage'
                  ? 'sepia-[50%] contrast-90'
                  : activeFilter === 'cyberpunk'
                  ? 'hue-rotate-90 saturate-150'
                  : ''
              }`}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-purple-900 to-pink-700" />
          )}

          {/* Vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 pointer-events-none" />
        </div>

        {/* Top Actions Bar */}
        <div className="relative z-20 p-4 flex items-center justify-between">
          <button
            onClick={closeCreatorModal}
            className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {/* Camera Switch */}
            <button
              onClick={() => setUseCamera(!useCamera)}
              className={`p-2 rounded-full backdrop-blur-md transition ${
                useCamera ? 'bg-pink-600 text-white' : 'bg-black/40 text-zinc-300'
              }`}
              title="Toggle Live Camera"
            >
              <Camera className="w-5 h-5" />
            </button>

            {/* Upload File */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full bg-black/40 text-zinc-300 hover:text-white backdrop-blur-md"
              title="Upload photo"
            >
              <Upload className="w-5 h-5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Add Sticker Trigger */}
            <button
              onClick={() => setStickerType(stickerType ? null : 'poll')}
              className={`p-2 rounded-full backdrop-blur-md transition ${
                stickerType ? 'bg-pink-600 text-white' : 'bg-black/40 text-zinc-300'
              }`}
              title="Add Interactive Sticker"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sticker creation drawer if opened */}
        {stickerType && (
          <div className="relative z-30 mx-4 p-4 rounded-2xl bg-black/85 backdrop-blur-lg border border-zinc-700 shadow-xl flex flex-col gap-3 animate-scaleUp">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
              <span>Choose Sticker:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setStickerType('poll')}
                  className={`px-2.5 py-1 rounded-full ${
                    stickerType === 'poll' ? 'bg-pink-600 text-white' : 'bg-zinc-800'
                  }`}
                >
                  Poll
                </button>
                <button
                  onClick={() => setStickerType('music')}
                  className={`px-2.5 py-1 rounded-full ${
                    stickerType === 'music' ? 'bg-pink-600 text-white' : 'bg-zinc-800'
                  }`}
                >
                  Music
                </button>
              </div>
            </div>

            {stickerType === 'poll' && (
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Ask a question..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-800 text-white text-xs border border-zinc-700"
              />
            )}

            {stickerType === 'music' && (
              <input
                type="text"
                value={musicTitle}
                onChange={(e) => setMusicTitle(e.target.value)}
                placeholder="Song title..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-800 text-white text-xs border border-zinc-700"
              />
            )}

            <button
              onClick={handleAddSticker}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs"
            >
              Add Sticker to Story
            </button>
          </div>
        )}

        {/* Sticker and Text Preview Overlay on Stage */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 gap-3 pointer-events-none">
          {caption && (
            <div className="px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md text-white text-base font-bold text-center max-w-[90%] shadow-lg">
              {caption}
            </div>
          )}

          {stickers.map((stk) => (
            <div
              key={stk.id}
              className="px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-xs shadow-lg flex items-center gap-2"
            >
              {stk.type === 'poll' ? `📊 ${stk.question}` : `🎵 ${stk.text}`}
            </div>
          ))}
        </div>

        {/* Camera snapshot button if in live camera mode */}
        {useCamera && (
          <div className="relative z-20 flex justify-center pb-4">
            <button
              onClick={handleCapturePhoto}
              className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/30 active:scale-95 transition"
            >
              <div className="w-12 h-12 rounded-full bg-white shadow" />
            </button>
          </div>
        )}

        {/* Bottom Editing & Publishing Controls */}
        <div className="relative z-20 p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-3">
          {/* Caption input */}
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            className="w-full px-4 py-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white placeholder-white/60 text-xs focus:outline-none"
          />

          {/* Filter selectors & Presets */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {(['normal', 'warm', 'vintage', 'cyberpunk'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize transition ${
                    activeFilter === f
                      ? 'bg-pink-600 text-white ring-1 ring-white'
                      : 'bg-white/10 text-zinc-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Presets carousel toggle */}
            <div className="flex items-center gap-1.5 pl-2">
              {presetBackgrounds.map((bg, idx) => (
                <img
                  key={idx}
                  src={bg}
                  alt="bg"
                  onClick={() => {
                    setMediaUrl(bg);
                    setUseCamera(false);
                  }}
                  className={`w-6 h-6 rounded-full object-cover cursor-pointer border ${
                    mediaUrl === bg ? 'border-pink-500 scale-110' : 'border-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Publish Button */}
          <button
            onClick={handlePublishStory}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-pink-500/25 active:scale-95 transition"
          >
            <span>Share to Story</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
