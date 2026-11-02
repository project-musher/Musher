import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Upload,
  Play,
  Film,
  ShoppingBag,
  UserCheck,
  Send,
  Download,
  RotateCcw,
  Check,
  Palette,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { renderDynamicVideo, VideoAdConfig } from '../../utils/videoAdGenerator';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface AIVideoStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIVideoStudioModal: React.FC<AIVideoStudioModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addReel, addStory, sendMessage, chats, currentUser, openChatWithUser } = useApp();

  const [mode, setMode] = useState<'product_ad' | 'character_portrait'>('product_ad');
  const [imageUrl, setImageUrl] = useState<string>('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80');
  const [headline, setHeadline] = useState('AIR PULSE RED');
  const [subtitle, setSubtitle] = useState('Next-gen street sneaker');
  const [ctaText, setCtaText] = useState('SHOP 40% OFF →');
  const [style, setStyle] = useState<VideoAdConfig['style']>('luxury_glow');
  const [duration, setDuration] = useState(5);

  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [showChatPicker, setShowChatPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const productPresets = [
    {
      label: 'Nike Sneakers',
      url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      headline: 'AIR PULSE RED',
      sub: 'Limited Streetwear Edition',
      cta: 'SHOP NOW →',
      style: 'luxury_glow' as const,
    },
    {
      label: 'Luxury Perfume',
      url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80',
      headline: 'ÉLIXIR NOIR',
      sub: 'French Haute Perfumery',
      cta: 'DISCOVER SCENT →',
      style: 'cinematic' as const,
    },
    {
      label: 'Cyber Headphones',
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      headline: 'SONIC X WIRELESS',
      sub: 'Pure Acoustic Immersion',
      cta: 'PRE-ORDER 50% OFF →',
      style: 'cyberpunk' as const,
    },
  ];

  const characterPresets = [
    {
      label: 'Cyber Persona',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
      headline: 'CYBER VIBE 2026',
      sub: 'Digital Avatar Live',
      style: 'living_portrait' as const,
    },
    {
      label: 'Fashion Portrait',
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
      headline: 'SOFIA RUNWAY',
      sub: 'Living Fashion Lookbook',
      style: 'living_portrait' as const,
    },
    {
      label: 'Hologram Neon',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
      headline: 'HOLOGRAM DJ',
      sub: 'Virtual Concert Persona',
      style: 'hologram_aura' as const,
    },
  ];

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const handleRenderVideo = async () => {
    setIsRendering(true);
    setRenderProgress(0);
    sounds.playSend();

    try {
      const videoBlobUrl = await renderDynamicVideo({
        config: {
          mode,
          imageUrl,
          headline,
          subtitle,
          ctaText,
          style,
          durationSeconds: duration,
        },
        onProgress: (pct) => setRenderProgress(pct),
      });

      setGeneratedVideoUrl(videoBlobUrl);
      sounds.playHeart();
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('Failed to render dynamic video:', err);
    } finally {
      setIsRendering(false);
    }
  };

  const handlePublishAsReel = () => {
    if (!generatedVideoUrl) return;
    addReel({
      videoUrl: generatedVideoUrl,
      caption: `${headline} • ${subtitle} #videoad #dynamicvideo #ai`,
      tags: ['#videoad', '#motion', '#product', '#vibegram'],
      music: {
        title: 'Neon Dreams Ad Sound',
        artist: 'AI Studio Original',
      },
    });
    onClose();
  };

  const handlePublishAsStory = () => {
    if (!generatedVideoUrl) return;
    addStory({
      mediaUrl: generatedVideoUrl,
      mediaType: 'video',
      caption: `${headline} 🔥`,
    });
    onClose();
  };

  const handleSendToChat = (chatId: string) => {
    if (!generatedVideoUrl) return;
    sendMessage({
      chatId,
      mediaType: 'image', // displays video/media
      mediaUrl: imageUrl,
      text: `Check out my new video ad: ${headline} 🎥`,
    });
    setShowChatPicker(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 animate-fadeIn select-none">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center text-white">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">AI Video Motion Studio</h2>
              <p className="text-[10px] text-zinc-400">Turn photos into dynamic ads & animated portraits</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="mt-4 flex items-center gap-2 p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
          <button
            onClick={() => {
              setMode('product_ad');
              setImageUrl(productPresets[0].url);
              setHeadline(productPresets[0].headline);
              setSubtitle(productPresets[0].sub);
              setCtaText(productPresets[0].cta);
              setStyle(productPresets[0].style);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              mode === 'product_ad'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Product Video Ad</span>
          </button>

          <button
            onClick={() => {
              setMode('character_portrait');
              setImageUrl(characterPresets[0].url);
              setHeadline(characterPresets[0].headline);
              setSubtitle(characterPresets[0].sub);
              setStyle(characterPresets[0].style);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              mode === 'character_portrait'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Animate Portrait</span>
          </button>
        </div>

        {!generatedVideoUrl ? (
          /* Studio Creator Form */
          <div className="mt-4 flex flex-col gap-4">
            {/* Image Preview & Upload Row */}
            <div className="flex items-center gap-4">
              <div className="w-24 h-32 rounded-2xl overflow-hidden bg-zinc-900 border-2 border-pink-500/50 shadow-md shrink-0 relative group">
                <img src={imageUrl} alt="Source" className="w-full h-full object-cover" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition"
                >
                  Change
                </button>
              </div>

              <div className="flex-1 flex flex-col gap-2">
                <span className="text-xs font-bold text-white">Upload Your Photo</span>
                <p className="text-[11px] text-zinc-400">
                  {mode === 'product_ad'
                    ? 'Upload shoes, cosmetics, gadgets, or clothing.'
                    : 'Upload a character or portrait to animate with realistic breathing and eye blinks.'}
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-fit px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Photo</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            {/* Quick Presets Carousel */}
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 block mb-1">
                Or Try Sample Presets:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {(mode === 'product_ad' ? productPresets : characterPresets).map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setImageUrl(p.url);
                      setHeadline(p.headline);
                      setSubtitle(p.sub);
                      if ('cta' in p) setCtaText(p.cta);
                      setStyle(p.style);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-semibold shrink-0 transition ${
                      imageUrl === p.url
                        ? 'bg-pink-600/20 border-pink-500 text-pink-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <img src={p.url} alt={p.label} className="w-5 h-5 rounded-full object-cover" />
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ad Typography & Style Options */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Main Title"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Subtitle</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Subtitle or tag"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {mode === 'product_ad' && (
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Call To Action (CTA)</label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="SHOP NOW →"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            )}

            {/* Style & Duration selector */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Motion Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-pink-500"
                >
                  {mode === 'product_ad' ? (
                    <>
                      <option value="luxury_glow">Luxury Glow & Particles</option>
                      <option value="cyberpunk">Cyberpunk Speed Glitch</option>
                      <option value="cinematic">Cinematic Studio Dolly</option>
                    </>
                  ) : (
                    <>
                      <option value="living_portrait">Living Breath & Eye Blink</option>
                      <option value="hologram_aura">Hologram Cosmic Aura</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Video Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-pink-500"
                >
                  <option value={5}>5 seconds (Fast Cut)</option>
                  <option value={8}>8 seconds (Story/Reel)</option>
                </select>
              </div>
            </div>

            {/* Render Button / Progress */}
            {isRendering ? (
              <div className="flex flex-col gap-2 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>Rendering 60fps Dynamic Video...</span>
                  <span className="font-mono text-pink-400">{renderProgress}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-150"
                    style={{ width: `${renderProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={handleRenderVideo}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-pink-500/25 active:scale-95 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Render Dynamic Video ({duration}s)</span>
              </button>
            )}
          </div>
        ) : (
          /* Generated Video Result View */
          <div className="mt-4 flex flex-col items-center gap-4 animate-scaleUp">
            {/* 9:16 Video Player */}
            <div className="w-56 h-[340px] rounded-2xl overflow-hidden bg-black shadow-2xl border-2 border-pink-500 relative">
              <video
                src={generatedVideoUrl}
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-center">
              <h3 className="text-sm font-bold text-white leading-tight">{headline}</h3>
              <p className="text-xs text-pink-400">{subtitle}</p>
            </div>

            {/* One-Click Publishing Actions */}
            <div className="grid grid-cols-3 gap-2 w-full">
              <button
                onClick={handlePublishAsReel}
                className="py-3 px-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-xs flex flex-col items-center gap-1 shadow-lg active:scale-95 transition"
              >
                <Film className="w-4 h-4" />
                <span>Post as Reel</span>
              </button>

              <button
                onClick={handlePublishAsStory}
                className="py-3 px-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs flex flex-col items-center gap-1 shadow-lg active:scale-95 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Add to Story</span>
              </button>

              <button
                onClick={() => setShowChatPicker(!showChatPicker)}
                className="py-3 px-2 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex flex-col items-center gap-1 shadow transition active:scale-95"
              >
                <Send className="w-4 h-4 text-pink-400" />
                <span>Send in DM</span>
              </button>
            </div>

            <div className="flex items-center gap-3 w-full justify-between pt-2 border-t border-zinc-800">
              <button
                onClick={() => setGeneratedVideoUrl(null)}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Create Another</span>
              </button>

              <a
                href={generatedVideoUrl}
                download={`${headline.replace(/\s+/g, '_')}_video_ad.webm`}
                className="flex items-center gap-1 text-xs font-bold text-pink-400 hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Video</span>
              </a>
            </div>

            {/* Share to chat picker drawer */}
            {showChatPicker && (
              <div className="w-full p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-2">
                <span className="text-xs font-bold text-white">Send Video Ad to Contact:</span>
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
                          <span className="text-xs text-white">@{peer.username}</span>
                        </div>
                        <span className="text-[11px] text-pink-400 font-bold">Send</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
