import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, RotateCcw, Trophy, Volume2, VolumeX, Pause, Share2, Shield, Zap, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface CyberRushGameProps {
  onClose: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

type HazardType = 'barrier' | 'ground_spike' | 'laser_beam';

interface Hazard {
  id: number;
  lane: number; // 0: Left, 1: Middle, 2: Right
  y: number;
  type: HazardType;
  passed: boolean;
  warningTimer: number; // For laser telegraph
  isWarning: boolean;
  isActive: boolean;
}

interface Collectible {
  id: number;
  lane: number;
  y: number;
  type: 'note' | 'shield' | 'multiplier';
  collected: boolean;
}

export const CyberRushGame: React.FC<CyberRushGameProps> = ({ onClose }) => {
  const { highScores, saveHighScore, chats, shareGameToChat, currentUser } = useApp();

  const [gameState, setGameState] = useState<'title' | 'playing' | 'paused' | 'gameover'>('title');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => highScores['cyber_rush'] || 120);
  const [combo, setCombo] = useState(1);
  const [lives, setLives] = useState(3);
  const [isMuted, setIsMuted] = useState(() => sounds.isMuted);
  const [showShareModal, setShowShareModal] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Decoupled Game Loop Simulation Refs (for deterministic 60fps & zero re-render lag)
  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const lastTimeRef = useRef<number>(0);
  const hitstopFramesRef = useRef<number>(0);
  const screenShakeRef = useRef<number>(0);

  // Player state
  const playerLaneRef = useRef<number>(1); // 0: left, 1: center, 2: right
  const targetLaneXRef = useRef<number>(0);
  const currentLaneXRef = useRef<number>(0);
  const playerYRef = useRef<number>(0);
  const playerJumpOffsetRef = useRef<number>(0);
  const playerJumpVelocityRef = useRef<number>(0);
  const isSlidingRef = useRef<boolean>(false);
  const slideTimerRef = useRef<number>(0);
  const squashXRef = useRef<number>(1);
  const squashYRef = useRef<number>(1);

  // Hazards & Collectibles
  const hazardsRef = useRef<Hazard[]>([]);
  const collectiblesRef = useRef<Collectible[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const nextSpawnYRef = useRef<number>(0);
  const hazardIdCounterRef = useRef<number>(1);

  // Game stats
  const scoreRef = useRef<number>(0);
  const livesRef = useRef<number>(3);
  const comboRef = useRef<number>(1);
  const comboStreakRef = useRef<number>(0);
  const gameSpeedRef = useRef<number>(420); // pixels per sec
  const invulnerableTimerRef = useRef<number>(0);

  // Key state map (cleared on blur to avoid stuck keys)
  const keysDownRef = useRef<{ [key: string]: boolean }>({});

  const laneWidth = 100;
  const numLanes = 3;

  // Toggle Mute
  const handleToggleMute = useCallback(() => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  }, []);

  // Jump Action
  const triggerJump = useCallback(() => {
    if (!isRunningRef.current || isPausedRef.current) return;
    if (playerJumpOffsetRef.current === 0 && !isSlidingRef.current) {
      playerJumpVelocityRef.current = -520;
      squashXRef.current = 0.75;
      squashYRef.current = 1.35;
      sounds.playGameJump();
    }
  }, []);

  // Slide Action
  const triggerSlide = useCallback(() => {
    if (!isRunningRef.current || isPausedRef.current) return;
    if (playerJumpOffsetRef.current === 0) {
      isSlidingRef.current = true;
      slideTimerRef.current = 0.55;
      squashXRef.current = 1.45;
      squashYRef.current = 0.6;
      sounds.playGameSlide();
    }
  }, []);

  // Move Lane Left
  const moveLeft = useCallback(() => {
    if (!isRunningRef.current || isPausedRef.current) return;
    if (playerLaneRef.current > 0) {
      playerLaneRef.current -= 1;
      squashXRef.current = 0.85;
      sounds.playGameDash();
    }
  }, []);

  // Move Lane Right
  const moveRight = useCallback(() => {
    if (!isRunningRef.current || isPausedRef.current) return;
    if (playerLaneRef.current < numLanes - 1) {
      playerLaneRef.current += 1;
      squashXRef.current = 0.85;
      sounds.playGameDash();
    }
  }, []);

  // Start / Restart Game
  const startGame = useCallback(() => {
    playerLaneRef.current = 1;
    playerJumpOffsetRef.current = 0;
    playerJumpVelocityRef.current = 0;
    isSlidingRef.current = false;
    slideTimerRef.current = 0;
    squashXRef.current = 1;
    squashYRef.current = 1;

    scoreRef.current = 0;
    livesRef.current = 3;
    comboRef.current = 1;
    comboStreakRef.current = 0;
    gameSpeedRef.current = 420;
    invulnerableTimerRef.current = 0;
    hitstopFramesRef.current = 0;
    screenShakeRef.current = 0;

    hazardsRef.current = [];
    collectiblesRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    nextSpawnYRef.current = 0;

    setScore(0);
    setLives(3);
    setCombo(1);
    setGameState('playing');

    isRunningRef.current = true;
    isPausedRef.current = false;
    lastTimeRef.current = performance.now();

    sounds.playGameCombo();
  }, []);

  // Pause / Resume
  const togglePause = useCallback(() => {
    if (!isRunningRef.current) return;
    isPausedRef.current = !isPausedRef.current;
    setGameState(isPausedRef.current ? 'paused' : 'playing');
    sounds.playTap();
  }, []);

  // Game Over handling
  const handleGameOver = useCallback(() => {
    isRunningRef.current = false;
    isPausedRef.current = false;
    setGameState('gameover');
    sounds.playGameOver();

    const finalScore = scoreRef.current;
    if (finalScore > (highScores['cyber_rush'] || 0)) {
      saveHighScore('cyber_rush', finalScore);
      setHighScore(finalScore);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#ec4899', '#8b5cf6', '#fbbf24'],
      });
    }
  }, [highScores, saveHighScore]);

  // Burst Particles helper
  const addParticles = (x: number, y: number, color: string, count: number = 14) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 220;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color,
        alpha: 1,
        decay: 1.5 + Math.random() * 2,
      });
    }
  };

  // Floating text helper
  const addFloatingText = (x: number, y: number, text: string, color: string) => {
    floatingTextsRef.current.push({
      x,
      y,
      text,
      color,
      alpha: 1,
      vy: -70,
    });
  };

  // Keyboard Event Handlers (with blur reset)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      keysDownRef.current[e.code] = true;

      if (e.code === 'KeyM') {
        handleToggleMute();
        return;
      }

      if (e.code === 'Escape') {
        if (gameState === 'playing' || gameState === 'paused') {
          togglePause();
        } else if (gameState === 'title' || gameState === 'gameover') {
          onClose();
        }
        return;
      }

      if (gameState === 'title' || gameState === 'gameover') {
        if (e.code === 'Enter' || e.code === 'Space') {
          startGame();
        }
        return;
      }

      if (gameState === 'playing') {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
          moveLeft();
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
          moveRight();
        } else if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
          triggerJump();
        } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
          triggerSlide();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDownRef.current[e.code] = false;
    };

    const handleBlur = () => {
      keysDownRef.current = {};
      if (isRunningRef.current && !isPausedRef.current) {
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [gameState, handleToggleMute, togglePause, onClose, startGame, moveLeft, moveRight, triggerJump, triggerSlide]);

  // Main Canvas 60fps Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let roadOffset = 0;

    const render = (time: number) => {
      animFrameRef.current = requestAnimationFrame(render);

      if (!lastTimeRef.current) lastTimeRef.current = time;
      const rawDt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      // Clamped delta to avoid teleporting/tunneling
      const dt = Math.min(rawDt, 0.05);

      // Hitstop logic (freeze frames on heavy collision impact)
      if (hitstopFramesRef.current > 0) {
        hitstopFramesRef.current--;
        return;
      }

      // Handle screen shake decay
      if (screenShakeRef.current > 0) {
        screenShakeRef.current = Math.max(0, screenShakeRef.current - dt * 25);
      }

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;

      // Target X for player lanes
      const lanePositions = [centerX - laneWidth, centerX, centerX + laneWidth];
      targetLaneXRef.current = lanePositions[playerLaneRef.current];

      // Smooth lane transition interpolation
      currentLaneXRef.current += (targetLaneXRef.current - currentLaneXRef.current) * Math.min(1, dt * 18);
      playerYRef.current = height - 120;

      // Update simulation if active and not paused
      if (isRunningRef.current && !isPausedRef.current) {
        // Ramp speed gradually
        gameSpeedRef.current = Math.min(720, 420 + scoreRef.current * 0.4);

        // Advance road offset for 3D retro perspective
        roadOffset = (roadOffset + gameSpeedRef.current * dt) % 60;

        // Player Jump Physics
        if (playerJumpOffsetRef.current < 0 || playerJumpVelocityRef.current !== 0) {
          playerJumpOffsetRef.current += playerJumpVelocityRef.current * dt;
          playerJumpVelocityRef.current += 1350 * dt; // Gravity

          if (playerJumpOffsetRef.current >= 0) {
            playerJumpOffsetRef.current = 0;
            playerJumpVelocityRef.current = 0;
            // Squash on landing
            squashXRef.current = 1.35;
            squashYRef.current = 0.7;
          }
        }

        // Player Slide Timer
        if (isSlidingRef.current) {
          slideTimerRef.current -= dt;
          if (slideTimerRef.current <= 0) {
            isSlidingRef.current = false;
            squashXRef.current = 1;
            squashYRef.current = 1;
          }
        }

        // Squash & Stretch recovery spring
        squashXRef.current += (1 - squashXRef.current) * dt * 10;
        squashYRef.current += (1 - squashYRef.current) * dt * 10;

        // Invulnerability timer decay
        if (invulnerableTimerRef.current > 0) {
          invulnerableTimerRef.current -= dt;
        }

        // Spawning Hazards & Collectibles
        nextSpawnYRef.current -= gameSpeedRef.current * dt;
        if (nextSpawnYRef.current <= 0) {
          nextSpawnYRef.current = 180 + Math.random() * 80;

          // Pick hazard lane
          const hazardLane = Math.floor(Math.random() * numLanes);
          const hazardTypes: HazardType[] = ['barrier', 'ground_spike', 'laser_beam'];
          const pickedType = hazardTypes[Math.floor(Math.random() * hazardTypes.length)];

          const newHazard: Hazard = {
            id: hazardIdCounterRef.current++,
            lane: hazardLane,
            y: -60,
            type: pickedType,
            passed: false,
            warningTimer: pickedType === 'laser_beam' ? 0.8 : 0,
            isWarning: pickedType === 'laser_beam',
            isActive: pickedType !== 'laser_beam',
          };
          hazardsRef.current.push(newHazard);

          if (pickedType === 'laser_beam') {
            sounds.playGameLaserWarning();
          }

          // Spawn collectible in non-hazard lane
          if (Math.random() < 0.65) {
            const freeLanes = [0, 1, 2].filter((l) => l !== hazardLane);
            const collectLane = freeLanes[Math.floor(Math.random() * freeLanes.length)];
            const collType = Math.random() < 0.15 ? 'shield' : Math.random() < 0.25 ? 'multiplier' : 'note';

            collectiblesRef.current.push({
              id: hazardIdCounterRef.current++,
              lane: collectLane,
              y: -50,
              type: collType,
              collected: false,
            });
          }
        }

        // Update Hazards
        hazardsRef.current.forEach((hazard) => {
          hazard.y += gameSpeedRef.current * dt;

          // Telegraph timer for Laser Beam
          if (hazard.type === 'laser_beam' && hazard.isWarning) {
            hazard.warningTimer -= dt;
            if (hazard.warningTimer <= 0) {
              hazard.isWarning = false;
              hazard.isActive = true;
            }
          }

          // Check if passed player
          if (!hazard.passed && hazard.y > playerYRef.current + 30) {
            hazard.passed = true;
            scoreRef.current += 10 * comboRef.current;
            comboStreakRef.current += 1;

            if (comboStreakRef.current % 5 === 0 && comboRef.current < 8) {
              comboRef.current *= 2;
              setCombo(comboRef.current);
              sounds.playGameCombo();
              addFloatingText(currentLaneXRef.current, playerYRef.current - 40, `${comboRef.current}x COMBO RUSH!`, '#ec4899');
            }
            setScore(scoreRef.current);
          }

          // Collision Detection with Player
          if (hazard.isActive && !hazard.passed && invulnerableTimerRef.current <= 0) {
            const laneMatch = hazard.lane === playerLaneRef.current;
            const yDist = Math.abs(hazard.y - playerYRef.current);

            let hit = false;
            if (laneMatch && yDist < 35) {
              if (hazard.type === 'ground_spike') {
                // Must jump over spike
                if (playerJumpOffsetRef.current > -30) hit = true;
              } else if (hazard.type === 'barrier') {
                // Must slide under high barrier
                if (!isSlidingRef.current) hit = true;
              } else if (hazard.type === 'laser_beam') {
                // Lethal if touching active laser
                hit = true;
              }
            }

            if (hit) {
              // Impact hitstop & screen shake
              hitstopFramesRef.current = 6;
              screenShakeRef.current = 14;
              invulnerableTimerRef.current = 1.4;
              livesRef.current -= 1;
              comboRef.current = 1;
              comboStreakRef.current = 0;
              setLives(livesRef.current);
              setCombo(1);
              sounds.playGameHit();
              addParticles(currentLaneXRef.current, playerYRef.current, '#ef4444', 24);
              addFloatingText(currentLaneXRef.current, playerYRef.current - 50, '-1 SHIELD!', '#ef4444');

              if (livesRef.current <= 0) {
                handleGameOver();
              }
            }
          }
        });

        // Filter offscreen hazards
        hazardsRef.current = hazardsRef.current.filter((h) => h.y < height + 80);

        // Update Collectibles
        collectiblesRef.current.forEach((item) => {
          item.y += gameSpeedRef.current * dt;

          if (!item.collected) {
            const laneMatch = item.lane === playerLaneRef.current;
            const yDist = Math.abs(item.y - playerYRef.current);

            if (laneMatch && yDist < 35) {
              item.collected = true;
              if (item.type === 'note') {
                scoreRef.current += 25 * comboRef.current;
                sounds.playGamePoint();
                addParticles(currentLaneXRef.current, playerYRef.current, '#06b6d4', 12);
                addFloatingText(currentLaneXRef.current, playerYRef.current - 35, `+${25 * comboRef.current}`, '#06b6d4');
              } else if (item.type === 'shield') {
                if (livesRef.current < 3) {
                  livesRef.current += 1;
                  setLives(livesRef.current);
                }
                sounds.playGameCombo();
                addParticles(currentLaneXRef.current, playerYRef.current, '#10b981', 18);
                addFloatingText(currentLaneXRef.current, playerYRef.current - 35, '+1 SHIELD!', '#10b981');
              } else if (item.type === 'multiplier') {
                comboRef.current = Math.min(8, comboRef.current * 2);
                setCombo(comboRef.current);
                sounds.playGameCombo();
                addParticles(currentLaneXRef.current, playerYRef.current, '#fbbf24', 20);
                addFloatingText(currentLaneXRef.current, playerYRef.current - 35, `${comboRef.current}x MULTIPLIER!`, '#fbbf24');
              }
              setScore(scoreRef.current);
            }
          }
        });

        collectiblesRef.current = collectiblesRef.current.filter((c) => c.y < height + 60 && !c.collected);

        // Update Particles
        particlesRef.current.forEach((p) => {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.alpha -= p.decay * dt;
        });
        particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0);

        // Update Floating Texts
        floatingTextsRef.current.forEach((ft) => {
          ft.y += ft.vy * dt;
          ft.alpha -= dt * 1.3;
        });
        floatingTextsRef.current = floatingTextsRef.current.filter((ft) => ft.alpha > 0);
      }

      // --- RENDERING CANVAS PASS ---
      ctx.save();

      // Screen Shake translation
      if (screenShakeRef.current > 0) {
        const shakeX = (Math.random() - 0.5) * screenShakeRef.current;
        const shakeY = (Math.random() - 0.5) * screenShakeRef.current;
        ctx.translate(shakeX, shakeY);
      }

      // Clear with dark cyberpunk background
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // Background Cyber Highway Track
      const trackLeft = centerX - (laneWidth * 1.5);
      const trackRight = centerX + (laneWidth * 1.5);

      // Highway floor gradient
      const roadGrad = ctx.createLinearGradient(centerX, 0, centerX, height);
      roadGrad.addColorStop(0, '#0f172a');
      roadGrad.addColorStop(0.7, '#1e1b4b');
      roadGrad.addColorStop(1, '#09090b');
      ctx.fillStyle = roadGrad;
      ctx.fillRect(trackLeft, 0, laneWidth * 3, height);

      // Neon Highway Boundary Rails
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(trackLeft, 0);
      ctx.lineTo(trackLeft, height);
      ctx.moveTo(trackRight, 0);
      ctx.lineTo(trackRight, height);
      ctx.stroke();

      // Lane dividers (dashed animated neon)
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 25]);
      ctx.lineDashOffset = -roadOffset;

      [centerX - (laneWidth * 0.5), centerX + (laneWidth * 0.5)].forEach((divX) => {
        ctx.beginPath();
        ctx.moveTo(divX, 0);
        ctx.lineTo(divX, height);
        ctx.stroke();
      });
      ctx.setLineDash([]); // Reset dash

      // Retro horizon speed lines
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.15)';
      ctx.lineWidth = 1;
      for (let y = roadOffset; y < height; y += 45) {
        ctx.beginPath();
        ctx.moveTo(trackLeft, y);
        ctx.lineTo(trackRight, y);
        ctx.stroke();
      }

      // Render Collectibles
      collectiblesRef.current.forEach((item) => {
        const itemX = lanePositions[item.lane];
        const itemY = item.y;

        ctx.save();
        ctx.translate(itemX, itemY);

        if (item.type === 'note') {
          // Glowing Neon Beat Orb
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 12;
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath();
          ctx.arc(0, 0, 12, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, 5, 0, Math.PI * 2);
          ctx.fill();
        } else if (item.type === 'shield') {
          // Shield Energy Core
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 14;
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (item.type === 'multiplier') {
          // Multiplier Gem
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 15;
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.moveTo(0, -14);
          ctx.lineTo(14, 0);
          ctx.lineTo(0, 14);
          ctx.lineTo(-14, 0);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      });

      // Render Hazards
      hazardsRef.current.forEach((hazard) => {
        const hX = lanePositions[hazard.lane];
        const hY = hazard.y;

        ctx.save();
        if (hazard.type === 'barrier') {
          // High Laser Barricade (Slide Underneath)
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 8;
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(hX - 38, hY - 14, 76, 26);

          // Hazard stripes
          ctx.fillStyle = '#000000';
          for (let s = -30; s < 35; s += 16) {
            ctx.fillRect(hX + s, hY - 14, 6, 26);
          }

          // Floating Hint: SLIDE!
          ctx.fillStyle = '#fef08a';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('▼ SLIDE ▼', hX, hY + 4);
        } else if (hazard.type === 'ground_spike') {
          // Cyber Ground Spikes (Jump Over)
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#ef4444';

          for (let k = -24; k <= 24; k += 16) {
            ctx.beginPath();
            ctx.moveTo(hX + k - 8, hY + 12);
            ctx.lineTo(hX + k, hY - 16);
            ctx.lineTo(hX + k + 8, hY + 12);
            ctx.closePath();
            ctx.fill();
          }

          // Floating Hint: JUMP!
          ctx.fillStyle = '#fca5a5';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('▲ JUMP ▲', hX, hY + 24);
        } else if (hazard.type === 'laser_beam') {
          // Laser Warning Telegraph (flashing warning line)
          if (hazard.isWarning) {
            const alpha = Math.sin(Date.now() / 60) * 0.4 + 0.5;
            ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`;
            ctx.lineWidth = 4;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.moveTo(hX, 0);
            ctx.lineTo(hX, height);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('⚠️ LASER LOCK', hX, hY);
          } else if (hazard.isActive) {
            // Full Lethal Laser Beam
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(hX - 16, 0, 32, height);

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(hX - 5, 0, 10, height);
          }
        }
        ctx.restore();
      });

      // Render Player Avatar (Runner Hover-Car / Vibe Capsule)
      const pX = currentLaneXRef.current;
      const pY = playerYRef.current + playerJumpOffsetRef.current;

      ctx.save();
      ctx.translate(pX, pY);
      ctx.scale(squashXRef.current, squashYRef.current);

      // Invulnerable flicker
      if (invulnerableTimerRef.current > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
        ctx.globalAlpha = 0.4;
      }

      // Thruster Jet Glow
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.moveTo(-12, 22);
      ctx.lineTo(0, 38 + Math.random() * 8);
      ctx.lineTo(12, 22);
      ctx.closePath();
      ctx.fill();

      // Main Runner Body (Aerodynamic Cyber Pod)
      const podGrad = ctx.createLinearGradient(0, -25, 0, 25);
      podGrad.addColorStop(0, '#ec4899');
      podGrad.addColorStop(0.5, '#8b5cf6');
      podGrad.addColorStop(1, '#06b6d4');
      ctx.fillStyle = podGrad;

      if (isSlidingRef.current) {
        // Flattened slide capsule
        ctx.beginPath();
        ctx.roundRect(-28, -8, 56, 18, 8);
        ctx.fill();
      } else {
        // Sleek runner triangle-oval
        ctx.beginPath();
        ctx.moveTo(0, -26);
        ctx.lineTo(24, 18);
        ctx.lineTo(14, 24);
        ctx.lineTo(-14, 24);
        ctx.lineTo(-24, 18);
        ctx.closePath();
        ctx.fill();
      }

      // Windshield / Core Eye
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffffff';
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, isSlidingRef.current ? 0 : -6, 7, 0, Math.PI * 2);
      ctx.fill();

      // Shield Aura
      if (livesRef.current >= 2) {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      // Render Particle System
      particlesRef.current.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render Floating Text
      floatingTextsRef.current.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 6;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      ctx.restore();
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [handleGameOver]);

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center overflow-hidden select-none animate-fadeIn">
      {/* Canvas Viewport (No backdrop-filter on viewport to maintain crisp 60fps) */}
      <canvas
        ref={canvasRef}
        width={380}
        height={640}
        className="w-full h-full max-w-md max-h-screen object-cover shadow-2xl relative block touch-none"
        onClick={() => {
          if (gameState === 'title' || gameState === 'gameover') {
            startGame();
          }
        }}
      />

      {/* --- LOW-OCCLUSION HUD OVERLAY (>=85% unobstructed, pointer-events-none) --- */}
      <div className="absolute inset-0 max-w-md mx-auto pointer-events-none flex flex-col justify-between p-4 sm:p-5">
        {/* Top Margin HUD: Tabular-nums stats cluster */}
        <div className="flex items-center justify-between w-full">
          {/* Left Cluster: Score & Streak Combo */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">SCORE</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono tabular-nums text-white tracking-tight drop-shadow-md">
                {score.toLocaleString()}
              </span>
              {combo > 1 && (
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-[10px] animate-pulse">
                  {combo}x COMBO
                </span>
              )}
            </div>
          </div>

          {/* Right Cluster: Lives, Mute, Pause */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Shield / Lives indicators */}
            <div className="flex items-center gap-1 mr-2">
              {Array.from({ length: 3 }).map((_, idx) => (
                <span
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                    idx < lives
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/50 scale-100'
                      : 'bg-zinc-800 scale-75 opacity-40'
                  }`}
                />
              ))}
            </div>

            {/* Mute button */}
            <button
              onClick={handleToggleMute}
              className="p-2 rounded-full bg-zinc-900/80 border border-zinc-700/80 text-zinc-300 hover:text-white transition active:scale-90"
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Pause button */}
            {gameState === 'playing' && (
              <button
                onClick={togglePause}
                className="p-2 rounded-full bg-zinc-900/80 border border-zinc-700/80 text-zinc-300 hover:text-white transition active:scale-90"
                title="Pause (Esc)"
              >
                <Pause className="w-4 h-4" />
              </button>
            )}

            {/* Exit button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-zinc-900/80 border border-zinc-700/80 text-zinc-400 hover:text-white transition active:scale-90"
              title="Exit Game"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile On-Screen Touch Controls (shown on touch devices) */}
        {gameState === 'playing' && (
          <div className="w-full flex items-center justify-between pb-4 px-2 pointer-events-auto sm:hidden">
            {/* Left / Right Steering */}
            <div className="flex items-center gap-2">
              <button
                onTouchStart={moveLeft}
                className="w-14 h-14 rounded-2xl bg-zinc-900/85 border border-cyan-500/40 text-cyan-400 flex items-center justify-center active:bg-cyan-500 active:text-black transition shadow-lg"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                onTouchStart={moveRight}
                className="w-14 h-14 rounded-2xl bg-zinc-900/85 border border-cyan-500/40 text-cyan-400 flex items-center justify-center active:bg-cyan-500 active:text-black transition shadow-lg"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </div>

            {/* Jump & Slide Action */}
            <div className="flex items-center gap-2">
              <button
                onTouchStart={triggerSlide}
                className="w-14 h-14 rounded-2xl bg-zinc-900/85 border border-amber-500/40 text-amber-400 flex items-center justify-center active:bg-amber-500 active:text-black transition shadow-lg flex-col text-[10px] font-bold"
              >
                <ArrowDown className="w-5 h-5" />
                <span>SLIDE</span>
              </button>
              <button
                onTouchStart={triggerJump}
                className="w-14 h-14 rounded-2xl bg-zinc-900/85 border border-pink-500/40 text-pink-400 flex items-center justify-center active:bg-pink-500 active:text-black transition shadow-lg flex-col text-[10px] font-bold"
              >
                <ArrowUp className="w-5 h-5" />
                <span>JUMP</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- TITLE SCREEN MODAL (30-40% negative space, inline SVG title lockup) --- */}
      {gameState === 'title' && (
        <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-20 animate-fadeIn">
          {/* Top Exit */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Inline SVG Title Lockup */}
          <div className="mb-6">
            <svg viewBox="0 0 320 80" className="w-72 sm:w-80 h-auto">
              <defs>
                <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <text
                x="50%"
                y="35"
                textAnchor="middle"
                fontSize="24"
                fontWeight="900"
                fontFamily="system-ui, sans-serif"
                letterSpacing="4"
                fill="url(#neonGlow)"
                filter="url(#glow)"
              >
                CYBER RUSH
              </text>
              <text
                x="50%"
                y="65"
                textAnchor="middle"
                fontSize="13"
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
                letterSpacing="8"
                fill="#38bdf8"
              >
                NEON VELOCITY
              </text>
            </svg>
          </div>

          {/* High Score Trophy */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-amber-400 text-xs font-bold font-mono tabular-nums mb-8">
            <Trophy className="w-4 h-4" />
            <span>BEST RECORD: {highScore.toLocaleString()} PTS</span>
          </div>

          {/* Primary CTA with keyboard shortcut */}
          <button
            onClick={startGame}
            className="w-full max-w-xs py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-sm tracking-wide shadow-xl shadow-pink-500/25 transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>START GAME</span>
          </button>

          {/* Flat Control Hint Line */}
          <div className="mt-5 text-center">
            <p className="text-[11px] font-mono text-zinc-400 tracking-wide">
              A / D or ← / → Steer · W / ↑ Jump · S / ↓ Slide · Space Action · Esc Pause
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">Press [ Space ] or [ Enter ] to launch</p>
          </div>
        </div>
      )}

      {/* --- PAUSE MODAL --- */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center z-20 animate-fadeIn">
          <h2 className="text-2xl font-black text-white tracking-widest font-mono mb-2">GAME PAUSED</h2>
          <p className="text-xs text-zinc-400 mb-6 font-mono">Current Score: {score.toLocaleString()}</p>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={togglePause}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Game (Esc)</span>
            </button>
            <button
              onClick={startGame}
              className="py-3 px-6 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-zinc-800"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart</span>
            </button>
            <button
              onClick={onClose}
              className="py-3 px-6 rounded-xl bg-zinc-900 border border-zinc-800 text-red-400 font-bold text-xs hover:bg-zinc-800"
            >
              Exit to App
            </button>
          </div>
        </div>
      )}

      {/* --- GAME OVER MODAL --- */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-20 animate-fadeIn">
          <div className="w-16 h-16 rounded-3xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center text-3xl mb-4 shadow-xl">
            💥
          </div>

          <h2 className="text-2xl font-black text-white font-mono tracking-tight">RUN TERMINATED</h2>
          <p className="text-xs text-zinc-400 mt-1">Hazard collision detected on the neon grid</p>

          {/* Stats summary */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs my-6">
            <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col">
              <span className="text-[10px] font-mono text-zinc-400">FINAL SCORE</span>
              <span className="text-xl font-bold font-mono tabular-nums text-white mt-0.5">
                {score.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col">
              <span className="text-[10px] font-mono text-zinc-400">HIGH RECORD</span>
              <span className="text-xl font-bold font-mono tabular-nums text-amber-400 mt-0.5">
                {highScore.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={startGame}
              className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN (Space / Enter)</span>
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="py-3 px-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-zinc-800 transition"
            >
              <Share2 className="w-4 h-4" />
              <span>Challenge Friends in Chat</span>
            </button>

            <button
              onClick={onClose}
              className="py-2.5 text-xs text-zinc-400 hover:text-white transition"
            >
              Back to Arcade
            </button>
          </div>
        </div>
      )}

      {/* --- SHARE SCORE TO CHAT PICKER --- */}
      {showShareModal && (
        <div className="absolute inset-0 bg-black/85 flex items-center justify-center p-4 z-30 animate-fadeIn">
          <div className="w-full max-w-xs bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white">Share Score in Chat</h3>
              <button onClick={() => setShowShareModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-400">Send your score of {score.toLocaleString()} pts to a friend:</p>
            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto no-scrollbar">
              {chats.map((chat) => {
                const peer = chat.participants.find((p) => p.id !== currentUser.id) || chat.participants[0];
                return (
                  <button
                    key={chat.id}
                    onClick={() => {
                      shareGameToChat(chat.id, 'cyber_rush', 'Cyber Rush: Neon Velocity', score);
                      setShowShareModal(false);
                      sounds.playSend();
                    }}
                    className="flex items-center gap-3 p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 transition text-left"
                  >
                    <img src={peer.avatar} alt={peer.name} className="w-8 h-8 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{peer.name}</p>
                      <p className="text-[10px] text-zinc-400 truncate">@{peer.username}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
