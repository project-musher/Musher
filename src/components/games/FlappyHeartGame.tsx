import React, { useState, useEffect, useRef } from 'react';
import { X, RotateCcw, Trophy, Share2, Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface FlappyHeartGameProps {
  onClose: () => void;
}

export const FlappyHeartGame: React.FC<FlappyHeartGameProps> = ({ onClose }) => {
  const { highScores, saveHighScore, chats, shareGameToChat, currentUser } = useApp();

  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [showSharePicker, setShowSharePicker] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Game physics state
  const birdYRef = useRef(180);
  const velocityRef = useRef(0);
  const pipesRef = useRef<{ x: number; top: number; bottom: number; passed: boolean }[]>([]);
  const scoreRef = useRef(0);
  const isPlayingRef = useRef(false);

  const GRAVITY = 0.28;
  const JUMP = -5.8;
  const PIPE_SPEED = 2.4;
  const PIPE_SPAWN_INTERVAL = 110;
  const frameCountRef = useRef(0);

  const currentHigh = highScores['flappy'] || 0;

  const startGame = () => {
    birdYRef.current = 180;
    velocityRef.current = 0;
    pipesRef.current = [];
    scoreRef.current = 0;
    frameCountRef.current = 0;
    setScore(0);
    setGameState('playing');
    isPlayingRef.current = true;
    sounds.playGameJump();
  };

  const jump = () => {
    if (gameState === 'playing') {
      velocityRef.current = JUMP;
      sounds.playGameJump();
    } else if (gameState === 'start' || gameState === 'gameover') {
      startGame();
    }
  };

  const handleGameOver = () => {
    isPlayingRef.current = false;
    setGameState('gameover');
    sounds.playGameOver();
    saveHighScore('flappy', scoreRef.current);

    if (scoreRef.current > currentHigh) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      animationFrameRef.current = requestAnimationFrame(loop);

      // Clear Canvas
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle background grid
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      if (isPlayingRef.current) {
        frameCountRef.current++;

        // Update bird physics
        velocityRef.current += GRAVITY;
        birdYRef.current += velocityRef.current;

        // Ground / Ceiling collision
        if (birdYRef.current < 15 || birdYRef.current > canvas.height - 20) {
          handleGameOver();
        }

        // Spawn pipes
        if (frameCountRef.current % PIPE_SPAWN_INTERVAL === 0) {
          const gap = 110;
          const minHeight = 40;
          const top = minHeight + Math.random() * (canvas.height - gap - minHeight * 2);
          const bottom = canvas.height - (top + gap);
          pipesRef.current.push({
            x: canvas.width,
            top,
            bottom,
            passed: false,
          });
        }

        // Update and draw pipes
        for (let i = pipesRef.current.length - 1; i >= 0; i--) {
          const p = pipesRef.current[i];
          p.x -= PIPE_SPEED;

          // Draw top pipe
          const topGrad = ctx.createLinearGradient(p.x, 0, p.x + 44, 0);
          topGrad.addColorStop(0, '#ec4899');
          topGrad.addColorStop(1, '#a855f7');
          ctx.fillStyle = topGrad;
          ctx.beginPath();
          ctx.roundRect(p.x, 0, 44, p.top, [0, 0, 10, 10]);
          ctx.fill();

          // Draw bottom pipe
          const botY = canvas.height - p.bottom;
          const botGrad = ctx.createLinearGradient(p.x, 0, p.x + 44, 0);
          botGrad.addColorStop(0, '#ec4899');
          botGrad.addColorStop(1, '#a855f7');
          ctx.fillStyle = botGrad;
          ctx.beginPath();
          ctx.roundRect(p.x, botY, 44, p.bottom, [10, 10, 0, 0]);
          ctx.fill();

          // Collision detection
          const birdX = 60;
          const birdRadius = 14;

          if (
            birdX + birdRadius > p.x &&
            birdX - birdRadius < p.x + 44 &&
            (birdYRef.current - birdRadius < p.top || birdYRef.current + birdRadius > botY)
          ) {
            handleGameOver();
          }

          // Score passing
          if (!p.passed && p.x + 44 < birdX) {
            p.passed = true;
            scoreRef.current += 1;
            setScore(scoreRef.current);
            sounds.playGamePoint();
          }

          // Remove offscreen
          if (p.x < -50) {
            pipesRef.current.splice(i, 1);
          }
        }
      }

      // Draw Glowing Heart Character
      const birdY = birdYRef.current;
      ctx.save();
      ctx.translate(60, birdY);
      const angle = Math.min(Math.max(velocityRef.current * 0.08, -0.5), 0.7);
      ctx.rotate(angle);

      // Heart glow
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 15;

      // Draw Heart
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      const d = 16;
      ctx.moveTo(0, d / 4);
      ctx.bezierCurveTo(-d / 2, -d / 2, -d, d / 3, 0, d);
      ctx.bezierCurveTo(d, d / 3, d / 2, -d / 2, 0, d / 4);
      ctx.fill();

      // Wing
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-6, 2, 6, 3, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    loop();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const handleShareResult = (chatId: string) => {
    shareGameToChat(chatId, 'flappy', 'Flappy Heart Dash', score);
    setShowSharePicker(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col items-center">
        {/* Top Header */}
        <div className="w-full p-4 border-b border-zinc-800 flex items-center justify-between z-10 bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">Flappy Heart Dash 💖</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
              <Trophy className="w-4 h-4" />
              <span>{Math.max(score, currentHigh)}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div
          onClick={jump}
          className="relative w-full h-[420px] cursor-pointer flex items-center justify-center"
        >
          <canvas
            ref={canvasRef}
            width={320}
            height={420}
            className="w-full h-full object-contain"
          />

          {/* Current Score Display */}
          {gameState === 'playing' && (
            <div className="absolute top-4 font-black text-4xl text-white drop-shadow-lg font-mono">
              {score}
            </div>
          )}

          {/* Start Screen Overlay */}
          {gameState === 'start' && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-pink-500/20 text-pink-500 flex items-center justify-center mb-3 animate-pulse">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
              <h2 className="text-xl font-black text-white mb-1">Flappy Heart</h2>
              <p className="text-xs text-zinc-400 mb-6">Tap or click anywhere to flap and dodge neon obstacles!</p>
              <button
                onClick={startGame}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm shadow-xl shadow-pink-500/30"
              >
                Tap to Play
              </button>
            </div>
          )}

          {/* Game Over Screen Overlay */}
          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-scaleUp">
              <h2 className="text-2xl font-black text-white mb-2">Game Over!</h2>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 w-48 mb-4">
                <div className="text-xs text-zinc-400">Score</div>
                <div className="text-3xl font-black text-white font-mono">{score}</div>
                <div className="text-[10px] text-amber-400 mt-1 font-bold">
                  High Score: {Math.max(score, currentHigh)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={startGame}
                  className="px-5 py-2.5 rounded-full bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>

                <button
                  onClick={() => setShowSharePicker(true)}
                  className="px-5 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition"
                >
                  <Share2 className="w-4 h-4 text-pink-400" />
                  <span>Challenge Friend</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Share to chat picker */}
        {showSharePicker && (
          <div className="absolute inset-x-0 bottom-0 top-16 bg-zinc-900/95 backdrop-blur-md p-4 z-20 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-3">
              <span className="text-xs font-bold text-white">Send Challenge to Friend</span>
              <button
                onClick={() => setShowSharePicker(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2">
              {chats.map((c) => {
                const peer = c.participants.find((p) => p.id !== currentUser.id);
                if (!peer) return null;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleShareResult(c.id)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={peer.avatar}
                        alt={peer.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <span className="text-xs font-bold text-white">@{peer.username}</span>
                    </div>
                    <span className="text-[11px] font-bold text-pink-400">Send</span>
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
