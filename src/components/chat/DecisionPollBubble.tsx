import React from 'react';
import { Vote, Check, Award, CheckCircle2, Lock } from 'lucide-react';
import { DecisionPollData } from '../../types';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';

interface DecisionPollBubbleProps {
  chatId: string;
  messageId: string;
  poll: DecisionPollData;
  isMe: boolean;
}

export const DecisionPollBubble: React.FC<DecisionPollBubbleProps> = ({
  chatId,
  messageId,
  poll,
  isMe,
}) => {
  const { voteDecisionPoll, closeDecisionPoll, currentUser } = useApp();

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);

  const handleVote = (optionId: string) => {
    if (poll.closed) return;
    sounds.playTap();
    voteDecisionPoll(chatId, messageId, optionId);
  };

  const handleClose = () => {
    sounds.playGamePoint();
    closeDecisionPoll(chatId, messageId);
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-indigo-500/40 bg-zinc-950 shadow-xl max-w-sm select-none">
      <div className="p-3.5 border-b border-indigo-500/20 bg-indigo-500/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Vote className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">
              Group Decision Maker
            </span>
            <span className="text-xs font-bold text-white block">{poll.question}</span>
          </div>
        </div>

        {poll.closed ? (
          <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] text-zinc-400 border border-zinc-700 flex items-center gap-1 font-mono">
            <Lock className="w-3 h-3" /> Closed
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[10px] text-emerald-400 border border-emerald-500/30 font-mono">
            {totalVotes} votes
          </span>
        )}
      </div>

      <div className="p-4 space-y-2">
        {poll.options.map((opt) => {
          const hasVoted = opt.votes.includes(currentUser.id);
          const percent = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
          const isWinner = poll.closed && poll.winnerOption === opt.text;

          return (
            <button
              key={opt.id}
              type="button"
              disabled={poll.closed}
              onClick={() => handleVote(opt.id)}
              className={`w-full relative overflow-hidden p-3 rounded-xl border text-left transition ${
                isWinner
                  ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                  : hasVoted
                  ? 'bg-indigo-950/60 border-indigo-500 text-white'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
              }`}
            >
              {/* Vote progress fill bar */}
              <div
                className={`absolute left-0 top-0 bottom-0 opacity-20 pointer-events-none transition-all duration-500 ${
                  isWinner ? 'bg-amber-400' : 'bg-indigo-500'
                }`}
                style={{ width: `${percent}%` }}
              />

              <div className="relative z-10 flex items-center justify-between text-xs font-medium">
                <span className="flex items-center gap-2">
                  {isWinner ? (
                    <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : hasVoted ? (
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
                  )}
                  <span className="font-semibold">{opt.text}</span>
                </span>
                <span className="font-mono text-[11px] text-zinc-400">
                  {opt.votes.length} ({percent}%)
                </span>
              </div>
            </button>
          );
        })}

        {/* Close Poll button if active */}
        {!poll.closed && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="text-[11px] text-zinc-400 hover:text-white transition underline"
            >
              Close voting & declare winner
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
