import React, { useState } from 'react';
import { BookOpen, Send, Trash2, X, Sparkles, Feather, Calendar, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/audio';

interface UnsentBoxModalProps {
  chatId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const UnsentBoxModal: React.FC<UnsentBoxModalProps> = ({
  chatId,
  isOpen,
  onClose,
}) => {
  const {
    unsentDrafts,
    saveUnsentDraft,
    deleteUnsentDraft,
    toggleDraftJournal,
    sendMessage,
  } = useApp();

  const [newText, setNewText] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'journal'>('all');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    saveUnsentDraft(chatId, newText.trim());
    setNewText('');
  };

  const handleSendDraft = (draftId: string, text: string) => {
    sounds.playSend();
    sendMessage({
      chatId,
      text,
      mediaType: 'text',
    });
    deleteUnsentDraft(draftId);
    onClose();
  };

  const displayedDrafts = unsentDrafts.filter((d) => {
    if (filterMode === 'journal') return d.isJournalEntry;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                The Unsent Messages Box <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h2>
              <p className="text-[11px] text-zinc-400">
                Privately keep unsent words, turn them into journal entries, or send when ready
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab filters */}
        <div className="px-4 py-2 border-b border-zinc-800/80 bg-zinc-900/30 flex items-center gap-2">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filterMode === 'all'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Unsent Notes ({unsentDrafts.length})
          </button>
          <button
            onClick={() => setFilterMode('journal')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              filterMode === 'journal'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Private Journal Only
          </button>
        </div>

        {/* Body list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {displayedDrafts.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              No unsent drafts here. Write private thoughts below that you aren't ready to send yet!
            </div>
          ) : (
            displayedDrafts.map((d) => (
              <div
                key={d.id}
                className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2.5 transition"
              >
                <div className="flex items-center justify-between text-[10px] text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {d.createdAt}
                  </span>
                  {d.isJournalEntry && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                      Journal Reflection
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-200 leading-relaxed font-serif italic">
                  "{d.text}"
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleDraftJournal(d.id)}
                      className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 flex items-center gap-1 transition"
                    >
                      <BookOpen className="w-3 h-3" />
                      {d.isJournalEntry ? 'Remove from Journal' : 'Convert to Journal'}
                    </button>
                    <button
                      onClick={() => deleteUnsentDraft(d.id)}
                      className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 transition"
                      title="Delete Draft"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleSendDraft(d.id, d.text)}
                    className="px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold flex items-center gap-1 transition shadow-md active:scale-95"
                  >
                    <Send className="w-3 h-3" /> Send to Chat
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input box */}
        <form onSubmit={handleSave} className="p-3 border-t border-zinc-800 bg-zinc-900/60 space-y-2">
          <textarea
            rows={2}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Write words you want to keep privately or reflect on..."
            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Save to Unsent Box
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
