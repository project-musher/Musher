import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  Minimize2,
  Maximize2,
  Sparkles,
  PhoneCall,
  Voicemail,
  ShieldCheck,
  Subtitles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LiveCaptionsBar } from '../common/LiveCaptionsBar';

export const CallOverlay: React.FC = () => {
  const {
    callSession,
    endCall,
    toggleMute,
    toggleCamera,
    setCallFilter,
    toggleMinimizeCall,
    openVoiceMailPrompt,
  } = useApp();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'none' | 'warm' | 'cyberpunk' | 'vintage' | 'mono'>('none');
  const [showLiveCaptions, setShowLiveCaptions] = useState(true);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const peer = callSession.peerUser;

  // Request camera stream if video call
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (callSession.isActive && callSession.type === 'video' && !callSession.isCameraOff) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: !callSession.isMuted })
          .then((s) => {
            stream = s;
            setLocalStream(s);
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = s;
            }
          })
          .catch(() => {
            // Camera not granted; fallback to avatar simulation
            setLocalStream(null);
          });
      }
    } else {
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
        setLocalStream(null);
      }
    }

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [callSession.isActive, callSession.type, callSession.isCameraOff]);

  // Keep tracks in sync with mute state
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => {
        t.enabled = !callSession.isMuted;
      });
      localStream.getVideoTracks().forEach((t) => {
        t.enabled = !callSession.isCameraOff;
      });
    }
  }, [callSession.isMuted, callSession.isCameraOff, localStream]);

  if (!callSession.isActive || !peer) return null;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const filterStyle =
    selectedFilter === 'warm'
      ? 'sepia(35%) saturate(140%)'
      : selectedFilter === 'cyberpunk'
      ? 'hue-rotate(180deg) contrast(120%)'
      : selectedFilter === 'vintage'
      ? 'sepia(50%) contrast(90%) brightness(105%)'
      : selectedFilter === 'mono'
      ? 'grayscale(100%)'
      : 'none';

  // Floating Minimized Window
  if (callSession.isMinimized) {
    return (
      <div className="fixed bottom-20 right-4 z-50 w-44 rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-2xl p-3 flex flex-col items-center gap-2 cursor-pointer hover:border-pink-500 transition-all animate-bounce-short">
        <div className="relative">
          <img
            src={peer.avatar}
            alt={peer.name}
            className="w-12 h-12 rounded-full object-cover border border-pink-500"
          />
          {callSession.status === 'connected' && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-black" />
          )}
        </div>
        <div className="text-center w-full truncate">
          <p className="text-xs font-semibold text-white truncate">@{peer.username}</p>
          <p className="text-[10px] text-pink-400 font-mono">
            {callSession.status === 'connected' ? formatDuration(callSession.duration) : 'Calling...'}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={toggleMinimizeCall}
            className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
            title="Expand call"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={endCall}
            className="p-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white"
            title="End call"
          >
            <PhoneOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Full Screen Calling Modal
  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-6 select-none animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between text-white z-10">
        <button
          onClick={toggleMinimizeCall}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition backdrop-blur-md"
          title="Minimize call"
        >
          <Minimize2 className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-zinc-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>End-to-End Encrypted</span>
        </div>

        <button
          onClick={() => {
            endCall();
            openVoiceMailPrompt(peer);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold transition"
          title="Leave voice mail"
        >
          <Voicemail className="w-4 h-4" />
          <span>Voice Mail</span>
        </button>
      </div>

      {/* Main Video or Audio Stage */}
      <div className="flex-1 flex flex-col items-center justify-center relative my-4">
        {callSession.type === 'video' ? (
          <div className="relative w-full max-w-2xl h-[480px] sm:h-[540px] rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl flex items-center justify-center">
            {/* Remote Peer Video / Simulated Stream */}
            <div
              className="w-full h-full relative overflow-hidden flex items-center justify-center"
              style={{ filter: filterStyle }}
            >
              <img
                src={peer.avatar}
                alt={peer.name}
                className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-40"
              />
              <div className="relative flex flex-col items-center z-10">
                <div className="relative">
                  <img
                    src={peer.avatar}
                    alt={peer.name}
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-pink-500 shadow-2xl ring-8 ring-pink-500/20 animate-pulse"
                  />
                  <div className="absolute -bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-pink-600 text-[10px] font-bold text-white tracking-wider">
                    {callSession.status === 'connected' ? 'LIVE' : 'RINGING'}
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mt-4">{peer.name}</h2>
                <p className="text-sm text-zinc-300">@{peer.username}</p>
                <p className="text-xs text-pink-400 mt-1 font-mono">
                  {callSession.status === 'connected' ? formatDuration(callSession.duration) : 'Calling...'}
                </p>
              </div>
            </div>

            {/* Local Video Picture-in-Picture */}
            <div className="absolute top-4 right-4 w-28 sm:w-36 h-40 sm:h-48 rounded-2xl overflow-hidden bg-zinc-900 border-2 border-white/20 shadow-xl z-20">
              {localStream && !callSession.isCameraOff ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror scale-x-[-1]"
                  style={{ filter: filterStyle }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 text-zinc-400 p-2 text-center">
                  <VideoOff className="w-6 h-6 mb-1 text-zinc-500" />
                  <span className="text-[10px]">Camera off</span>
                </div>
              )}
            </div>

            {/* Video Filters Bar */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 z-20 overflow-x-auto no-scrollbar py-1">
              {(['none', 'warm', 'cyberpunk', 'vintage', 'mono'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setSelectedFilter(f);
                    setCallFilter(f);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize backdrop-blur-md transition ${
                    selectedFilter === f
                      ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/40 ring-2 ring-white/50'
                      : 'bg-black/50 text-zinc-300 hover:bg-black/70'
                  }`}
                >
                  {f === 'none' ? 'Normal' : f}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Audio Call View */
          <div className="flex flex-col items-center justify-center text-center">
            {/* Pulsating avatar rings */}
            <div className="relative mb-6">
              <div className="absolute -inset-6 rounded-full bg-pink-500/10 animate-ping" />
              <div className="absolute -inset-3 rounded-full bg-purple-500/20 animate-pulse" />
              <img
                src={peer.avatar}
                alt={peer.name}
                className="relative w-36 h-36 rounded-full object-cover border-4 border-pink-500 shadow-2xl"
              />
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">{peer.name}</h2>
            <p className="text-sm text-zinc-400 mb-2">@{peer.username}</p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-zinc-200">
              <Volume2 className="w-4 h-4 text-pink-400" />
              <span>
                {callSession.status === 'connected'
                  ? `Connected • ${formatDuration(callSession.duration)}`
                  : 'Calling via Instagram Audio...'}
              </span>
            </div>

            {/* Sound Wave Animation if connected */}
            {callSession.status === 'connected' && (
              <div className="flex items-center gap-1.5 mt-8 h-10">
                {[12, 24, 38, 16, 42, 28, 14, 36, 20, 30].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-gradient-to-t from-pink-500 to-purple-500 animate-pulse"
                    style={{
                      height: `${h}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Live Audio Feed Transcription Subtitles */}
      <div className="w-full max-w-xl mx-auto px-4 z-20 mb-3">
        <LiveCaptionsBar
          isActive={showLiveCaptions && callSession.status === 'connected'}
          speakerName={peer.username}
          contextFeed="call"
          onClose={() => setShowLiveCaptions(false)}
        />
      </div>

      {/* Bottom Controls Dock */}
      <div className="flex items-center justify-center gap-3 sm:gap-5 z-10 pb-4">
        {/* Live Subtitles / Transcription (CC) Toggle */}
        <button
          onClick={() => setShowLiveCaptions(!showLiveCaptions)}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition shadow-lg ${
            showLiveCaptions
              ? 'bg-pink-600 text-white shadow-pink-600/40 ring-2 ring-pink-400'
              : 'bg-white/15 hover:bg-white/25 text-zinc-300 backdrop-blur-md'
          }`}
          title={showLiveCaptions ? 'Hide Live Captions' : 'Show Live Captions'}
        >
          <Subtitles className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Mute Button */}
        <button
          onClick={toggleMute}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition shadow-lg ${
            callSession.isMuted
              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
              : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md'
          }`}
          title={callSession.isMuted ? 'Unmute' : 'Mute'}
        >
          {callSession.isMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
        </button>

        {/* Video Toggle Button (if in video call) */}
        {callSession.type === 'video' && (
          <button
            onClick={toggleCamera}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition shadow-lg ${
              callSession.isCameraOff
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md'
            }`}
            title={callSession.isCameraOff ? 'Turn camera on' : 'Turn camera off'}
          >
            {callSession.isCameraOff ? <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Video className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        )}

        {/* End Call Button */}
        <button
          onClick={endCall}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-2xl shadow-red-600/50 hover:scale-105 active:scale-95 transition"
          title="End Call"
        >
          <PhoneOff className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        {/* Leave Voice Mail shortcut */}
        <button
          onClick={() => {
            endCall();
            openVoiceMailPrompt(peer);
          }}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 flex items-center justify-center border border-amber-500/40 shadow-lg transition backdrop-blur-md"
          title="Leave a Voice Mail"
        >
          <Voicemail className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
};
