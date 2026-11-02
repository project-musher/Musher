import React from 'react';
import { Gamepad2, Trophy, Play, Sparkles, Heart, Star, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FlappyHeartGame } from './FlappyHeartGame';
import { EmojiCatchGame } from './EmojiCatchGame';
import { TriviaGame } from './TriviaGame';

export const GamesHub: React.FC = () => {
  const { activeGameId, openGame, closeGame, highScores } = useApp();

  const games = [
    {
      id: 'flappy',
      title: 'Flappy Heart Dash',
      icon: '💖',
      badge: 'Popular',
      description: 'Tap to flap through neon columns and set the highest vibe score!',
      highScore: highScores['flappy'] || 0,
      gradient: 'from-pink-500/20 via-rose-500/20 to-purple-500/20 border-pink-500/30',
      btnGradient: 'from-pink-500 to-rose-600',
    },
    {
      id: 'emoji_catcher',
      title: 'Emoji Catch Blitz',
      icon: '⭐',
      badge: 'Fast Paced',
      description: 'Slide your pod to catch falling stars and hearts while dodging bombs 💣!',
      highScore: highScores['emoji_catcher'] || 0,
      gradient: 'from-amber-500/20 via-orange-500/20 to-yellow-500/20 border-amber-500/30',
      btnGradient: 'from-amber-500 to-orange-600',
    },
    {
      id: 'trivia',
      title: 'Trivia Duel',
      icon: '🧠',
      badge: 'Quiz',
      description: 'Test your knowledge on social trends, music, and pop culture with friends!',
      highScore: highScores['trivia'] || 0,
      gradient: 'from-purple-500/20 via-indigo-500/20 to-blue-500/20 border-purple-500/30',
      btnGradient: 'from-purple-500 to-indigo-600',
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 pb-24 overflow-y-auto no-scrollbar animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white">Vibe Arcade 🕹️</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Play mini games & challenge your friends directly in chat!
          </p>
        </div>
      </div>

      {/* Featured Games Grid */}
      <div className="mt-5 flex flex-col gap-4">
        {games.map((game) => (
          <div
            key={game.id}
            className={`p-5 rounded-3xl bg-gradient-to-br ${game.gradient} border backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:border-white/30`}
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-center text-3xl shadow-inner shrink-0">
                {game.icon}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{game.title}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-zinc-300">
                    {game.badge}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-1 max-w-md leading-relaxed">
                  {game.description}
                </p>

                <div className="flex items-center gap-2 mt-3 text-xs text-amber-400 font-bold">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>High Score: {game.highScore}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => openGame(game.id)}
              className={`w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r ${game.btnGradient} text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition shrink-0`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Now</span>
            </button>
          </div>
        ))}
      </div>

      {/* Active Game Overlay */}
      {activeGameId === 'flappy' && <FlappyHeartGame onClose={closeGame} />}
      {activeGameId === 'emoji_catcher' && <EmojiCatchGame onClose={closeGame} />}
      {activeGameId === 'trivia' && <TriviaGame onClose={closeGame} />}
    </div>
  );
};
