import React, { useState, useEffect, useRef } from 'react';
import { X, RotateCcw, Trophy, Share2, Play, Flame } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface EmojiCatchGameProps {
  onClose: () => void;
}

export const EmojiCatchGame: React.FC<EmojiCatchGameProps> = ({ onClose }) => {
  const { highScores, saveHighScore, chats, shareGameToChat, currentUser } = useApp();

  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showSharePicker, setShowSharePicker] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Basket position
  const basketXRef = useRef(140);
  const itemsRef = useRef<{ x: number; y: number; speed: number; type: 'heart' | 'star' | 'fire' | 'bomb' }[]>([]);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const isPlayingRef = useRef(false);
  const frameRef = useRef(0);

  const currentHigh = highScores['emoji_catcher'] || 0;

  const startGame = () => {
    basketXRef.current = 140;
    itemsRef.current = [];
    scoreRef.current = 0;
    livesRef.current = 3;
    frameRef.current = 0;
    setScore(0);
    setLives(3);
    setGameState('playing');
    isPlayingRef.current = true;
    sounds.playGameJump();
  };

  const handleGameOver = () => {
    isPlayingRef.current = false;
    setGameState('gameover');
    sounds.playGameOver();
    saveHighScore('emoji_catcher', scoreRef.current);

    if (scoreRef.current > currentHigh) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = ((clientX - rect.left) / rect.width) * canvasRef.current.width;
    basketXRef.current = Math.min(Math.max(x, 30), canvasRef.current.width - 30);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      animationFrameRef.current = requestAnimationFrame(loop);

      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (isPlayingRef.current) {
        frameRef.current++;

        // Spawn items
        if (frameRef.current % 45 === 0) {
          const isBomb = Math.random() < 0.25;
          const types: ('heart' | 'star' | 'fire')[] = ['heart', 'star', 'fire'];
          const type = isBomb ? 'bomb' : types[Math.floor(Math.random() * types.length)];
          itemsRef.current.push({
            x: 20 + Math.random() * (canvas.width - 40),
            y: -10,
            speed: 2.8 + Math.random() * 2,
            type,
          });
        }

        // Update items
        for (let i = itemsRef.current.length - 1; i >= 0; i--) {
          const item = itemsRef.current[i];
          item.y += item.speed;

          // Render item emoji
          ctx.font = '22px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const emoji =
            item.type === 'heart'
              ? '💖'
              : item.type === 'star'
              ? '⭐'
              : item.type === 'fire'
              ? '🔥'
              : '💣';

          ctx.fillText(emoji, item.x, item.y);

          // Catch collision with basket
          const basketY = canvas.height - 35;
          const dist = Math.hypot(item.x - basketXRef.current, item.y - basketY);

          if (dist < 32) {
            if (item.type === 'bomb') {
              sounds.playGameOver();
              livesRef.current -= 1;
              setLives(livesRef.current);
              if (livesRef.current <= 0) {
                handleGameOver();
              }
            } else {
              sounds.playGamePoint();
              scoreRef.current += item.type === 'fire' ? 3 : item.type === 'star' ? 2 : 1;
              setScore(scoreRef.current);
            }
            itemsRef.current.splice(i, 1);
            continue;
          }

          // Missed item
          if (item.y > canvas.height) {
            if (item.type !== 'bomb') {
              livesRef.current -= 1;
              setLives(livesRef.current);
              if (livesRef.current <= 0) {
                handleGameOver();
              }
            }
            itemsRef.current.splice(i, 1);
          }
        }
      }

      // Draw Player Basket (Instagram Glow Pod)
      const bx = basketXRef.current;
      const by = canvas.height - 35;

      ctx.save();
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 12;

      const basketGrad = ctx.createLinearGradient(bx - 30, by, bx + 30, by);
      basketGrad.addColorStop(0, '#f43f5e');
      basketGrad.addColorStop(1, '#a855f7');
      ctx.fillStyle = basketGrad;
      ctx.beginPath();
      ctx.roundRect(bx - 32, by - 8, 64, 16, 8);
      ctx.fill();

      // Basket rim
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(bx - 26, by - 6, 52, 4, 2);
      ctx.fill();

      ctx.restore();
    };

    loop();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col items-center">
        {/* Header */}
        <div className="w-full p-4 border-b border-zinc-800 flex items-center justify-between z-10 bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">Emoji Catch Blitz ⭐</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
              <Trophy className="w-4 h-4" />
              <span>{Math.max(score, currentHigh)}</span>
            </div>
            <button onClick={onClose} className="p-1 rounded-full text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live game area */}
        <div
          onMouseMove={handleMouseMove}
          onTouchMove={handleMouseMove}
          className="relative w-full h-[420px] cursor-none flex items-center justify-center"
        >
          <canvas ref={canvasRef} width={320} height={420} className="w-full h-full object-contain" />

          {/* Score & Lives bar */}
          {gameState === 'playing' && (
            <div className="absolute top-3 left-4 right-4 flex items-center justify-between font-mono">
              <span className="text-xl font-black text-white">{score} pts</span>
              <div className="flex items-center gap-1 text-base">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className={i < lives ? 'opacity-100' : 'opacity-20'}>
                    ❤️
                  </span>
                ))}
              </div>
            </div>
          )}

          {gameState === 'start' && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-xl font-black text-white mb-1">Emoji Catch</h2>
              <p className="text-xs text-zinc-400 mb-6">
                Drag the slider to catch falling emojis! Avoid bombs 💣!
              </p>
              <button
                onClick={startGame}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm shadow-xl shadow-pink-500/30 active:scale-95 transition"
              >
                Start Game
              </button>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center animate-scaleUp">
              <h2 className="text-2xl font-black text-white mb-2">Game Over!</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 w-48 mb-4">
                <div className="text-xs text-zinc-400">Score</div>
                <div className="text-3xl font-black text-white font-mono">{score}</div>
                <div className="text-[10px] text-amber-400 mt-1 font-bold">
                  Best: {Math.max(score, currentHigh)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={startGame}
                  className="px-5 py-2.5 rounded-full bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>

                <button
                  onClick={() => setShowSharePicker(true)}
                  className="px-5 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition"
                >
                  <Share2 className="w-4 h-4 text-pink-400" />
                  <span>Challenge</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Share to chat picker */}
        {showSharePicker && (
          <div className="absolute inset-x-0 bottom-0 top-16 bg-zinc-900/95 backdrop-blur-md p-4 z-20 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-3">
              <span className="text-xs font-bold text-white">Challenge a Friend in Chat</span>
              <button onClick={() => setShowSharePicker(false)} className="text-zinc-400 hover:text-white">
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
                    onClick={() => {
                      shareGameToChat(c.id, 'emoji_catcher', 'Emoji Catch Blitz', score);
                      setShowSharePicker(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={peer.avatar} alt={peer.name} className="w-9 h-9 rounded-full object-cover" />
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
