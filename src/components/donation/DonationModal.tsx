import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Heart,
  DollarSign,
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Send,
  Wallet,
  PlusCircle,
  HelpCircle,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Reel, User } from '../../types';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetReel?: Reel | null;
  targetUser?: User | null;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  targetReel,
  targetUser,
}) => {
  const {
    currentUser,
    userBalance,
    topUpBalance,
    donateWithVoiceComment,
  } = useApp();

  const [amount, setAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceBlobUrl, setVoiceBlobUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const recipient: User = targetReel?.user || targetUser || currentUser;
  const currentTotal = customAmount ? parseFloat(customAmount) || 0 : amount;

  // 5% goes to me / platform, 95% goes to the creator
  const platformFee = Number((currentTotal * 0.05).toFixed(2));
  const creatorShare = Number((currentTotal - platformFee).toFixed(2));

  useEffect(() => {
    if (!isOpen) {
      cleanup();
    }
  }, [isOpen]);

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    setIsPlayingPreview(false);
    setErrorMsg(null);
  };

  // Live audio waveform drawing
  const startVisualizer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const numBars = 28;
      const barWidth = 4;
      const spacing = 4;
      const startX = (canvas.width - numBars * (barWidth + spacing)) / 2;

      for (let i = 0; i < numBars; i++) {
        let barHeight = 6;
        if (isRecording) {
          const t = Date.now() / 150;
          barHeight = 10 + Math.sin(t + i * 0.5) * 20 + Math.cos(t * 0.8 + i) * 14;
        }

        const x = startX + i * (barWidth + spacing);
        const y = (canvas.height - barHeight) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, '#f59e0b'); // amber gold
        grad.addColorStop(1, '#ec4899'); // pink

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
    };

    draw();
  };

  const startVoiceRecording = async () => {
    cleanup();
    setIsRecording(true);
    startVisualizer();
    sounds.playSend();

    timerRef.current = window.setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          stream.getTracks().forEach((track) => track.stop());
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setVoiceBlobUrl(url);
        };

        mediaRecorder.start(100);
      } else {
        // Fallback simulation
        setVoiceBlobUrl('simulated_voice_note');
      }
    } catch {
      // Permission blocked: fallback simulation
      setVoiceBlobUrl('simulated_voice_note');
    }
  };

  const stopVoiceRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else {
      setVoiceBlobUrl('simulated_voice_note');
    }
    setIsRecording(false);
  };

  const togglePreviewAudio = () => {
    if (!voiceBlobUrl) return;
    if (voiceBlobUrl === 'simulated_voice_note') {
      setIsPlayingPreview(!isPlayingPreview);
      setTimeout(() => setIsPlayingPreview(false), recordingSeconds * 1000);
      return;
    }

    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio(voiceBlobUrl);
      previewAudioRef.current.onended = () => setIsPlayingPreview(false);
    }

    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current.play().catch(() => {});
      setIsPlayingPreview(true);
    }
  };

  const handleSubmitDonation = () => {
    if (currentTotal <= 0) {
      setErrorMsg('Please choose a donation amount.');
      return;
    }

    if (userBalance < currentTotal) {
      setErrorMsg(`Insufficient balance ($${userBalance.toFixed(2)}). Top up below!`);
      return;
    }

    const duration = Math.max(recordingSeconds, voiceBlobUrl ? 8 : 0);

    const result = donateWithVoiceComment({
      reelId: targetReel?.id,
      creatorId: recipient.id,
      amount: currentTotal,
      message: message.trim() || undefined,
      voiceUrl: voiceBlobUrl !== 'simulated_voice_note' ? voiceBlobUrl || undefined : undefined,
      voiceDuration: duration > 0 ? duration : undefined,
    });

    if (!result.success) {
      setErrorMsg(result.error || 'Donation failed.');
      return;
    }

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 animate-fadeIn select-none">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <DollarSign className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Donate & Voice Comment</h2>
              <p className="text-[10px] text-zinc-400">Support @{recipient.username} with audio tip</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Balance Bar */}
        <div className="mt-4 p-3 rounded-2xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-zinc-300">Your Wallet:</span>
            <span className="text-xs font-bold text-white font-mono">${userBalance.toFixed(2)}</span>
          </div>
          <button
            onClick={() => topUpBalance(50)}
            className="px-2.5 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[11px] font-bold flex items-center gap-1 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+$50 Top Up</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Amount Chips */}
        <div className="mt-4 flex flex-col gap-2">
          <label className="text-xs font-semibold text-zinc-300">Select Donation Amount</label>
          <div className="grid grid-cols-4 gap-2">
            {[2, 5, 10, 25].map((amt) => (
              <button
                key={amt}
                onClick={() => {
                  setAmount(amt);
                  setCustomAmount('');
                }}
                className={`py-2 rounded-xl text-xs font-bold border transition ${
                  amount === amt && !customAmount
                    ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white border-transparent shadow-md'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>

          <div className="relative mt-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-bold">$</span>
            <input
              type="number"
              min="1"
              step="1"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setAmount(0);
              }}
              placeholder="Or enter custom amount..."
              className="w-full pl-8 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
            />
          </div>
        </div>

        {/* Transparent 5% Split Fee Breakdown Badge */}
        <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-purple-500/10 border border-amber-500/30 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Earnings & Fee Split (5% to Me)</span>
            </span>
            <span className="text-white font-mono">${currentTotal.toFixed(2)} Total</span>
          </div>

          <div className="flex flex-col gap-1 text-[11px] text-zinc-300">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Creator Receives (95%):</span>
              <span className="font-bold text-emerald-400 font-mono">+${creatorShare.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Platform Share (5% to Me):</span>
              <span className="font-bold text-pink-400 font-mono">${platformFee.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Record Voice Comment Section */}
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-pink-400" />
              <span>Attach Voice Comment</span>
            </label>
            {voiceBlobUrl && (
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> Voice Attached ({Math.max(recordingSeconds, 6)}s)
              </span>
            )}
          </div>

          {/* Visualizer Canvas box */}
          <div className="w-full h-20 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-center relative overflow-hidden">
            <canvas ref={canvasRef} width={280} height={60} className="w-full h-full object-contain" />

            {!isRecording && !voiceBlobUrl && (
              <span className="absolute text-xs text-zinc-500 flex items-center gap-1">
                Tap microphone to record voice comment
              </span>
            )}

            {isRecording && (
              <div className="absolute top-2 left-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-[10px] font-mono font-bold text-red-400">
                  REC 0:0{recordingSeconds}
                </span>
              </div>
            )}
          </div>

          {/* Voice Controls */}
          <div className="flex items-center justify-center gap-3 mt-1">
            {!isRecording && !voiceBlobUrl && (
              <button
                type="button"
                onClick={startVoiceRecording}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow active:scale-95 transition"
              >
                <Mic className="w-4 h-4" />
                <span>Record Voice Comment</span>
              </button>
            )}

            {isRecording && (
              <button
                type="button"
                onClick={stopVoiceRecording}
                className="px-4 py-2 rounded-full bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 shadow active:scale-95 transition animate-pulse"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop Recording</span>
              </button>
            )}

            {voiceBlobUrl && !isRecording && (
              <>
                <button
                  type="button"
                  onClick={startVoiceRecording}
                  className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
                  title="Retake Voice Comment"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={togglePreviewAudio}
                  className="px-4 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  {isPlayingPreview ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlayingPreview ? 'Pause' : 'Play Voice'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Text Message (Optional) */}
        <div className="mt-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add text message (optional)..."
            className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmitDonation}
          disabled={currentTotal <= 0}
          className="mt-5 w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-pink-500/25 active:scale-95 transition disabled:opacity-40"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            Donate ${currentTotal.toFixed(2)} with Voice Comment
          </span>
        </button>
      </div>
    </div>
  );
};
