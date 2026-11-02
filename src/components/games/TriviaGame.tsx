import React, { useState, useEffect } from 'react';
import { X, Trophy, RotateCcw, Share2, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface TriviaGameProps {
  onClose: () => void;
}

const QUESTIONS = [
  {
    q: 'Which video feature on Instagram is for vertical short-form videos?',
    options: ['IGTV', 'Reels', 'Boomerang', 'Hyperlapse'],
    correct: 1,
  },
  {
    q: 'What color gradient is prominently featured in the Instagram logo?',
    options: ['Blue & Green', 'Orange, Pink & Purple', 'Red & Black', 'Gold & Silver'],
    correct: 1,
  },
  {
    q: 'How long do standard Instagram stories stay visible before archiving?',
    options: ['12 hours', '24 hours', '48 hours', '7 days'],
    correct: 1,
  },
  {
    q: 'What was the first photo ever posted to Instagram in 2010?',
    options: ['A cup of coffee', 'A golden retriever dog', 'A sunset in Hawaii', 'A slice of pizza'],
    correct: 1,
  },
  {
    q: 'What does "DM" stand for in social messaging?',
    options: ['Direct Message', 'Digital Mail', 'Daily Mention', 'Dual Mode'],
    correct: 0,
  },
];

export const TriviaGame: React.FC<TriviaGameProps> = ({ onClose }) => {
  const { highScores, saveHighScore, chats, shareGameToChat, currentUser } = useApp();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isFinished, setIsFinished] = useState(false);
  const [showSharePicker, setShowSharePicker] = useState(false);

  const currentHigh = highScores['trivia'] || 0;
  const question = QUESTIONS[currentQuestionIndex];

  useEffect(() => {
    if (isFinished || selectedOption !== null) return;

    if (timeLeft <= 0) {
      handleAnswer(-1); // timeout
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isFinished, selectedOption]);

  const handleAnswer = (optionIdx: number) => {
    setSelectedOption(optionIdx);

    const isCorrect = optionIdx === question.correct;
    if (isCorrect) {
      sounds.playGamePoint();
      setScore((prev) => prev + 20 + timeLeft * 2);
    } else {
      sounds.playGameOver();
    }

    setTimeout(() => {
      if (currentQuestionIndex < QUESTIONS.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedOption(null);
        setTimeLeft(10);
      } else {
        setIsFinished(true);
        saveHighScore('trivia', score + (isCorrect ? 20 + timeLeft * 2 : 0));
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    }, 1400);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setTimeLeft(10);
    setIsFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden p-5 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Trivia Duel</span>
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

        {!isFinished ? (
          <div className="mt-4 flex flex-col">
            {/* Timer bar */}
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-1000"
                style={{ width: `${(timeLeft / 10) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2">
              <span>Question {currentQuestionIndex + 1} of {QUESTIONS.length}</span>
              <span className="font-mono text-pink-400 font-bold">{score} pts</span>
            </div>

            <h3 className="text-base font-bold text-white mb-5 leading-snug min-h-[50px]">
              {question.q}
            </h3>

            {/* Options */}
            <div className="flex flex-col gap-2.5">
              {question.options.map((opt, idx) => {
                const isChosen = selectedOption === idx;
                const isCorrect = idx === question.correct;
                let btnStyle = 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-zinc-700';

                if (selectedOption !== null) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300';
                  } else if (isChosen) {
                    btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={selectedOption !== null}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full p-3.5 rounded-2xl border text-left text-xs font-semibold flex items-center justify-between transition active:scale-98 ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {selectedOption !== null && isCorrect && (
                      <Check className="w-4 h-4 text-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Finished Screen */
          <div className="py-8 flex flex-col items-center text-center animate-scaleUp">
            <Trophy className="w-16 h-16 text-amber-400 mb-2" />
            <h2 className="text-2xl font-black text-white">Duel Complete!</h2>
            <p className="text-xs text-zinc-400 mt-1 mb-4">You tested your social trivia chops!</p>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 w-48 mb-6">
              <div className="text-xs text-zinc-400">Total Score</div>
              <div className="text-3xl font-black text-white font-mono">{score}</div>
              <div className="text-[10px] text-amber-400 font-bold mt-1">
                Best: {Math.max(score, currentHigh)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRestart}
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

        {/* Share to chat picker */}
        {showSharePicker && (
          <div className="absolute inset-x-0 bottom-0 top-16 bg-zinc-900/95 backdrop-blur-md p-4 z-20 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-3">
              <span className="text-xs font-bold text-white">Send Challenge to Friend</span>
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
                      shareGameToChat(c.id, 'trivia', 'Trivia Duel', score);
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
