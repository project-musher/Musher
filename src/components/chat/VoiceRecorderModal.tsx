import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Send, X, Volume2, Sparkles } from 'lucide-react';
import { User } from '../../types';
import { sounds } from '../../utils/audio';

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientUser: User;
  isVoiceMail?: boolean;
  onSendVoice: (payload: {
    audioUrl?: string;
    duration: number;
    textSummary?: string;
    isVoiceMail?: boolean;
  }) => void;
}

export const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({
  isOpen,
  onClose,
  recipientUser,
  isVoiceMail = false,
  onSendVoice,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      cleanup();
    }
  }, [isOpen]);

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (audioBlobUrl) {
      URL.revokeObjectURL(audioBlobUrl);
      setAudioBlobUrl(null);
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    setIsPreviewPlaying(false);
  };

  const startLiveVisualizer = (stream?: MediaStream) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array | null = null;

    if (stream) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioCtx();
        const source = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
      } catch {
        analyser = null;
      }
    }

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const numBars = 32;
      const barWidth = 4;
      const spacing = 4;
      const startX = (canvas.width - numBars * (barWidth + spacing)) / 2;

      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray as any);
      }

      for (let i = 0; i < numBars; i++) {
        let barHeight = 8;
        if (analyser && dataArray) {
          const val = dataArray[i % dataArray.length] || 10;
          barHeight = Math.max(6, (val / 255) * 60);
        } else {
          // Synthetic undulating pulse for simulation
          const t = Date.now() / 200;
          barHeight = 10 + Math.sin(t + i * 0.4) * 20 + Math.cos(t * 0.8 + i) * 15;
        }

        const x = startX + i * (barWidth + spacing);
        const y = (canvas.height - barHeight) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, '#f43f5e'); // rose/pink
        grad.addColorStop(1, '#a855f7'); // purple

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }
    };

    draw();
  };

  const startRecording = async () => {
    cleanup();
    setIsRecording(true);
    sounds.playSend();

    timerRef.current = window.setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        startLiveVisualizer(stream);

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          stream.getTracks().forEach((track) => track.stop());
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setAudioBlobUrl(url);
        };

        mediaRecorder.start(100);
      } else {
        // Fallback simulation
        startLiveVisualizer();
      }
    } catch {
      // Permission denied or inside restricted frame
      setMicPermissionDenied(true);
      startLiveVisualizer();
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else {
      // Create synthetic audio url placeholder
      setAudioBlobUrl('synthetic_audio');
    }
    setIsRecording(false);
  };

  const togglePreviewPlay = () => {
    if (!audioBlobUrl) return;
    if (audioBlobUrl === 'synthetic_audio') {
      setIsPreviewPlaying(!isPreviewPlaying);
      setTimeout(() => setIsPreviewPlaying(false), recordingSeconds * 1000);
      return;
    }

    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio(audioBlobUrl);
      previewAudioRef.current.onended = () => setIsPreviewPlaying(false);
    }

    if (isPreviewPlaying) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      previewAudioRef.current.play().catch(() => {});
      setIsPreviewPlaying(true);
    }
  };

  const handleSend = () => {
    const finalDuration = Math.max(recordingSeconds, 3);
    const summary = isVoiceMail
      ? `Voice mail for @${recipientUser.username} (${finalDuration}s)`
      : `Voice note (${finalDuration}s)`;

    onSendVoice({
      audioUrl: audioBlobUrl !== 'synthetic_audio' ? audioBlobUrl || undefined : undefined,
      duration: finalDuration,
      textSummary: summary,
      isVoiceMail,
    });
    onClose();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Recipient info & title */}
        <div className="relative mb-3">
          <img
            src={recipientUser.avatar}
            alt={recipientUser.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-pink-500 shadow-md"
          />
          {isVoiceMail && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center shadow">
              <Volume2 className="w-3.5 h-3.5 fill-current" />
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold text-white text-center">
          {isVoiceMail ? 'Leave a Voice Mail' : 'Record Voice Note'}
        </h3>
        <p className="text-xs text-zinc-400 text-center mb-6">
          to <span className="font-semibold text-zinc-200">@{recipientUser.username}</span>
          {isVoiceMail && ' • Missed Call Service'}
        </p>

        {/* Audio Visualizer Canvas */}
        <div className="w-full h-24 bg-black/40 rounded-2xl border border-zinc-800/80 flex items-center justify-center relative overflow-hidden mb-5">
          <canvas
            ref={canvasRef}
            width={280}
            height={80}
            className="w-full h-full object-contain"
          />

          {!isRecording && !audioBlobUrl && (
            <span className="absolute text-xs text-zinc-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              Tap mic to start recording
            </span>
          )}

          {isRecording && (
            <div className="absolute top-2 left-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-mono font-bold text-red-400">REC</span>
            </div>
          )}

          {(isRecording || audioBlobUrl) && (
            <div className="absolute top-2 right-3 font-mono text-xs font-semibold text-zinc-300">
              {formatTime(recordingSeconds)}
            </div>
          )}
        </div>

        {micPermissionDenied && (
          <p className="text-[11px] text-amber-400/90 text-center mb-3">
            Using studio simulation mode (microphone access restricted)
          </p>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-4 w-full justify-center">
          {!isRecording && !audioBlobUrl && (
            <button
              onClick={startRecording}
              className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 hover:scale-105 active:scale-95 transition"
              title="Start recording"
            >
              <Mic className="w-7 h-7" />
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 hover:scale-105 active:scale-95 transition animate-pulse"
              title="Stop recording"
            >
              <Square className="w-6 h-6 fill-current" />
            </button>
          )}

          {audioBlobUrl && !isRecording && (
            <>
              <button
                onClick={startRecording}
                className="p-3 rounded-full bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
                title="Discard and retake"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={togglePreviewPlay}
                className="w-14 h-14 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white flex items-center justify-center shadow-md transition"
                title={isPreviewPlaying ? 'Pause' : 'Play preview'}
              >
                {isPreviewPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={handleSend}
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-pink-500/20 active:scale-95 transition"
              >
                <span>{isVoiceMail ? 'Send Voice Mail' : 'Send'}</span>
                <Send className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
