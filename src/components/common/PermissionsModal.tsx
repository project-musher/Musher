import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Video,
  VideoOff,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Sparkles,
  Sliders,
  Volume2,
  Info,
  ExternalLink,
} from 'lucide-react';
import { sounds } from '../../utils/audio';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PermissionStatus = 'granted' | 'prompt' | 'denied' | 'unsupported';

export const PermissionsModal: React.FC<PermissionsModalProps> = ({ isOpen, onClose }) => {
  const [micStatus, setMicStatus] = useState<PermissionStatus>('prompt');
  const [camStatus, setCamStatus] = useState<PermissionStatus>('prompt');
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [isTestingCam, setIsTestingCam] = useState(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'status' | 'help'>('status');
  const [simulationMode, setSimulationMode] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const camStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkInitialPermissions();
    } else {
      cleanupStreams();
    }
    return () => {
      cleanupStreams();
    };
  }, [isOpen]);

  const cleanupStreams = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (camStreamRef.current) {
      camStreamRef.current.getTracks().forEach((t) => t.stop());
      camStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setIsTestingMic(false);
    setIsTestingCam(false);
    setMicVolume(0);
  };

  const checkInitialPermissions = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicStatus('unsupported');
      setCamStatus('unsupported');
      return;
    }

    try {
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const micQuery = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setMicStatus(micQuery.state as PermissionStatus);
          micQuery.onchange = () => setMicStatus(micQuery.state as PermissionStatus);
        } catch {
          // Some browsers throw for microphone query
        }

        try {
          const camQuery = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setCamStatus(camQuery.state as PermissionStatus);
          camQuery.onchange = () => setCamStatus(camQuery.state as PermissionStatus);
        } catch {
          // Some browsers throw for camera query
        }
      }
    } catch {
      // Fallback
    }
  };

  const requestAllPermissions = async () => {
    setStatusMessage('Requesting browser permissions...');
    sounds.playTap();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setMicStatus('granted');
      setCamStatus('granted');
      setStatusMessage('✓ Camera and Microphone permissions granted successfully!');
      stream.getTracks().forEach((t) => t.stop());
      sounds.playGamePoint();
    } catch (err: any) {
      console.warn('Direct media access request rejected or not available:', err);
      // Attempt audio only then video only
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicStatus('granted');
        audioStream.getTracks().forEach((t) => t.stop());
      } catch {
        setMicStatus('denied');
      }

      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCamStatus('granted');
        videoStream.getTracks().forEach((t) => t.stop());
      } catch {
        setCamStatus('denied');
      }

      setStatusMessage('Browser prompt completed. Check individual card status below.');
    }
  };

  const toggleTestMic = async () => {
    if (isTestingMic) {
      cleanupMicTest();
      return;
    }

    sounds.playTap();
    setIsTestingMic(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setMicStatus('granted');

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray as any);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setMicVolume(normalized);
        animFrameRef.current = requestAnimationFrame(checkVolume);
      };
      checkVolume();
    } catch (err) {
      console.warn('Mic access failed:', err);
      setMicStatus('denied');
      // Simulated mic meter so user can still test UI
      const interval = setInterval(() => {
        setMicVolume(Math.floor(20 + Math.random() * 60));
      }, 100);
      (micStreamRef.current as any) = { stopTimer: interval };
    }
  };

  const cleanupMicTest = () => {
    if (micStreamRef.current) {
      if ((micStreamRef.current as any).stopTimer) {
        clearInterval((micStreamRef.current as any).stopTimer);
      } else {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setIsTestingMic(false);
    setMicVolume(0);
  };

  const toggleTestCam = async () => {
    if (isTestingCam) {
      cleanupCamTest();
      return;
    }

    sounds.playTap();
    setIsTestingCam(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      camStreamRef.current = stream;
      setCamStatus('granted');
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn('Camera access failed:', err);
      setCamStatus('denied');
    }
  };

  const cleanupCamTest = () => {
    if (camStreamRef.current) {
      camStreamRef.current.getTracks().forEach((t) => t.stop());
      camStreamRef.current = null;
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
    setIsTestingCam(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                Media Access Permissions
              </h2>
              <p className="text-xs text-zinc-400">
                Manage Camera & Microphone for calls, reels & voice
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              cleanupStreams();
              onClose();
            }}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: Status vs Help */}
        <div className="px-5 pt-3 flex border-b border-zinc-800/60 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 transition border-b-2 ${
              activeTab === 'status'
                ? 'border-pink-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Hardware & Testing
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`pb-2.5 transition border-b-2 flex items-center gap-1 ${
              activeTab === 'help'
                ? 'border-pink-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How to Grant Access</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {statusMessage && (
            <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-xs text-pink-300 flex items-center justify-between">
              <span>{statusMessage}</span>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-pink-400 hover:text-pink-200 ml-2"
              >
                ×
              </button>
            </div>
          )}

          {activeTab === 'status' ? (
            <>
              {/* Quick Allow All Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-white">One-Click Permission Request</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Trigger browser prompt for both camera & microphone at once.
                  </p>
                </div>
                <button
                  onClick={requestAllPermissions}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-pink-500/20 active:scale-95 transition shrink-0"
                >
                  Prompt Browser
                </button>
              </div>

              {/* Microphone Card */}
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        micStatus === 'granted'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : micStatus === 'denied'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {micStatus === 'granted' ? (
                        <Mic className="w-5 h-5" />
                      ) : (
                        <MicOff className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Microphone</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            micStatus === 'granted'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : micStatus === 'denied'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {micStatus === 'granted'
                            ? 'Granted'
                            : micStatus === 'denied'
                            ? 'Denied / Blocked'
                            : 'Prompt Required'}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Required for Voice Mails, Donated Voice Comments, Audio Calls, & Live Transcription
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={toggleTestMic}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 ${
                      isTestingMic
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                    }`}
                  >
                    {isTestingMic ? 'Stop Test' : 'Test Mic'}
                  </button>
                </div>

                {/* Live Mic VU Meter */}
                {isTestingMic && (
                  <div className="pt-2 border-t border-zinc-800/60">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                      <span className="flex items-center gap-1">
                        <Volume2 className="w-3.5 h-3.5 text-pink-400" />
                        Live Input Level
                      </span>
                      <span className="font-mono text-zinc-300">{micVolume}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 transition-all duration-75"
                        style={{ width: `${micVolume}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-emerald-400 mt-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Speak into your microphone to verify detection.
                    </p>
                  </div>
                )}
              </div>

              {/* Camera Card */}
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        camStatus === 'granted'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : camStatus === 'denied'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {camStatus === 'granted' ? (
                        <Video className="w-5 h-5" />
                      ) : (
                        <VideoOff className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Camera</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            camStatus === 'granted'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : camStatus === 'denied'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {camStatus === 'granted'
                            ? 'Granted'
                            : camStatus === 'denied'
                            ? 'Denied / Blocked'
                            : 'Prompt Required'}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Required for Video Calls with AR filters, Story/Reels Camera, & Video Ads
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={toggleTestCam}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 ${
                      isTestingCam
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                    }`}
                  >
                    {isTestingCam ? 'Stop Test' : 'Test Camera'}
                  </button>
                </div>

                {/* Live Camera Mirror Preview */}
                {isTestingCam && (
                  <div className="pt-2 border-t border-zinc-800/60">
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800">
                      <video
                        ref={videoPreviewRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform -scale-x-100"
                      />
                      <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] text-white font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Live Camera Stream Mirror
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Simulation Mode Toggle for Sandbox / Devices without webcams */}
              <div className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-semibold text-zinc-200">
                      Device Emulation Fallback
                    </span>
                    <p className="text-[10px] text-zinc-400">
                      Allows calls & recording to simulate media if physical hardware is unattached.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={simulationMode}
                  onChange={(e) => setSimulationMode(e.target.checked)}
                  className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
                />
              </div>
            </>
          ) : (
            /* Help Instructions Tab */
            <div className="space-y-3.5 text-xs">
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Info className="w-4 h-4 text-blue-400" />
                  <span>Google Chrome & Microsoft Edge</span>
                </div>
                <ol className="list-decimal list-inside text-zinc-300 space-y-1 pl-1 text-[11px] leading-relaxed">
                  <li>Look at the top URL address bar in your browser.</li>
                  <li>Click the <strong>Lock (🔒)</strong> or <strong>Tune/Sliders icon</strong> on the far left.</li>
                  <li>Find <strong>Camera</strong> and <strong>Microphone</strong> switches.</li>
                  <li>Change both to <strong>"Allow"</strong>.</li>
                  <li>Reload this tab if prompted.</li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Info className="w-4 h-4 text-purple-400" />
                  <span>Apple Safari (macOS & iOS)</span>
                </div>
                <ol className="list-decimal list-inside text-zinc-300 space-y-1 pl-1 text-[11px] leading-relaxed">
                  <li>On macOS: Open Safari &gt; <em>Settings for This Website...</em> &gt; Set Camera & Microphone to <strong>Allow</strong>.</li>
                  <li>On iPhone/iPad: Open iOS <em>Settings</em> &gt; <em>Safari</em> &gt; <em>Camera / Microphone</em> &gt; <strong>Allow</strong>.</li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Info className="w-4 h-4 text-amber-400" />
                  <span>Embedded Sandbox & iFrames</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  VibeGram includes full automated fallbacks so you can record simulated voice messages, preview audio waves, and test video calls even if hardware permissions are restricted by your security policy.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
          <button
            onClick={() => {
              checkInitialPermissions();
              sounds.playTap();
            }}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recheck Permissions</span>
          </button>

          <button
            onClick={() => {
              cleanupStreams();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
