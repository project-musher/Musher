import React, { useState } from 'react';
import { X, MessageSquare, AlertTriangle, ShieldCheck, Clock, CheckCircle2, Star, Send, Flag, ThumbsUp, Sparkles, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { COMMUNITY_GUIDELINES } from '../../utils/moderation';
import { sounds } from '../../utils/audio';

export type FeedbackTab = 'feedback' | 'report' | 'guidelines' | 'history';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: FeedbackTab;
  reportContext?: {
    targetType: 'comment' | 'reel' | 'chat_message' | 'user';
    targetId: string;
    targetAuthor?: string;
    targetContentPreview?: string;
  };
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'feedback',
  reportContext,
}) => {
  const { currentUser, userFeedbacks, submitFeedback, userReports, submitReport } = useApp();

  const [activeTab, setActiveTab] = useState<FeedbackTab>(reportContext ? 'report' : initialTab);

  // Feedback form state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackType, setFeedbackType] = useState<'general' | 'bug' | 'suggestion' | 'moderation_concern'>('suggestion');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Report form state
  const [reportReason, setReportReason] = useState<'vulgar_language' | 'insults_harassment' | 'hate_speech' | 'prohibited_terms' | 'spam' | 'other'>(
    'insults_harassment'
  );
  const [reportTargetAuthor, setReportTargetAuthor] = useState(reportContext?.targetAuthor || '');
  const [reportPreview, setReportPreview] = useState(reportContext?.targetContentPreview || '');
  const [reportNotes, setReportNotes] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackSubject.trim() || !feedbackMessage.trim()) return;

    submitFeedback({
      type: feedbackType,
      rating: feedbackRating,
      subject: feedbackSubject.trim(),
      message: feedbackMessage.trim(),
    });

    sounds.playSend();
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setFeedbackSubject('');
      setFeedbackMessage('');
    }, 2800);
  };

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportNotes.trim() && !reportPreview.trim()) return;

    submitReport({
      targetType: reportContext?.targetType || 'comment',
      targetId: reportContext?.targetId || `target-${Date.now()}`,
      targetAuthor: reportTargetAuthor.trim() || 'Reported User',
      targetContentPreview: reportPreview.trim(),
      reason: reportReason,
      notes: reportNotes.trim(),
    });

    sounds.playSend();
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setReportNotes('');
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div
        className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Trust, Safety & Feedbacks</h2>
              <p className="text-xs text-zinc-400">Community standards, anti-vulgarity moderation & feedback</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center px-4 sm:px-5 pt-3 border-b border-zinc-800 gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('feedback')}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 shrink-0 ${
              activeTab === 'feedback'
                ? 'text-pink-400 border-pink-500'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send Feedback</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 shrink-0 ${
              activeTab === 'report'
                ? 'text-rose-400 border-rose-500'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <Flag className="w-4 h-4" />
            <span>Report Content</span>
          </button>

          <button
            onClick={() => setActiveTab('guidelines')}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 shrink-0 ${
              activeTab === 'guidelines'
                ? 'text-cyan-400 border-cyan-500'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Safety Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 shrink-0 ${
              activeTab === 'history'
                ? 'text-purple-400 border-purple-500'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>My Submissions ({userFeedbacks.length + userReports.length})</span>
          </button>
        </div>

        {/* Tab Content Stage */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar">
          {/* TAB 1: SEND FEEDBACK */}
          {activeTab === 'feedback' && (
            <div>
              {feedbackSubmitted ? (
                <div className="py-12 flex flex-col items-center text-center animate-fadeIn">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-white">Feedback Submitted!</h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                    Thank you! Your feedback has been logged directly with our core engineering team to help improve Vibegram.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendFeedback} className="flex flex-col gap-4">
                  {/* Rating selection */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      How would you rate your app experience?
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className="p-1 hover:scale-110 transition text-amber-400"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= feedbackRating ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs text-zinc-400 font-mono ml-2">
                        {feedbackRating === 5
                          ? '🌟 Excellent'
                          : feedbackRating === 4
                          ? '👍 Very Good'
                          : feedbackRating === 3
                          ? '👌 Good'
                          : feedbackRating === 2
                          ? '⚠️ Needs Work'
                          : '🛑 Poor'}
                      </span>
                    </div>
                  </div>

                  {/* Feedback Category */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Category</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'suggestion', label: 'Suggestion', emoji: '💡' },
                        { id: 'bug', label: 'Bug Report', emoji: '🐛' },
                        { id: 'general', label: 'General', emoji: '💬' },
                        { id: 'moderation_concern', label: 'Moderation', emoji: '🛡️' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setFeedbackType(cat.id as any)}
                          className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                            feedbackType === cat.id
                              ? 'bg-pink-500/20 border-pink-500 text-pink-300 font-bold'
                              : 'bg-zinc-800/60 border-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <span>{cat.emoji}</span>
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Subject</label>
                    <input
                      type="text"
                      value={feedbackSubject}
                      onChange={(e) => setFeedbackSubject(e.target.value)}
                      placeholder="e.g. Love the new audio features or mini games suggestion..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700/80 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Feedback Details</label>
                    <textarea
                      rows={4}
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Share your thoughts, suggestions, or issues in detail..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700/80 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!feedbackSubject.trim() || !feedbackMessage.trim()}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 transition"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send App Feedback</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: REPORT CONTENT (Insulting / Vulgar / Harassment) */}
          {activeTab === 'report' && (
            <div>
              {reportSubmitted ? (
                <div className="py-12 flex flex-col items-center text-center animate-fadeIn">
                  <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-white">Report Logged for Automated Action</h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                    Thank you for keeping our community safe. Our real-time moderation filter is reviewing the reported content and abusive patterns.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendReport} className="flex flex-col gap-4">
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                    <div>
                      <p className="font-bold">Zero Tolerance Policy</p>
                      <p className="text-[11px] text-rose-200/80 mt-0.5">
                        Insulting remarks, vulgar language ("valgus"), hate speech, and harassment are strictly forbidden. Reported content will be quarantined.
                      </p>
                    </div>
                  </div>

                  {/* Violation Category */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Violation Reason</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { id: 'vulgar_language', label: 'Vulgar / Inappropriate Language', desc: 'Profanity, explicit or obscene words' },
                        { id: 'insults_harassment', label: 'Insulting / Harassment', desc: 'Bullying, personal attacks, insults' },
                        { id: 'hate_speech', label: 'Hate Speech', desc: 'Attacks on identity, slurs, discrimination' },
                        { id: 'prohibited_terms', label: 'Prohibited / Reserved Terms', desc: 'Impersonating official admin or system' },
                        { id: 'spam', label: 'Spam or Fraud', desc: 'Repeated unwanted links, promotional botting' },
                        { id: 'other', label: 'Other Guidelines Breach', desc: 'Other community guideline issues' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setReportReason(item.id as any)}
                          className={`p-2.5 rounded-xl border text-left transition flex flex-col ${
                            reportReason === item.id
                              ? 'bg-rose-500/20 border-rose-500 text-white'
                              : 'bg-zinc-800/60 border-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <span className="text-xs font-bold text-white">{item.label}</span>
                          <span className="text-[10px] text-zinc-400 mt-0.5">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target Author / Handle */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Author / Account Handle</label>
                    <input
                      type="text"
                      value={reportTargetAuthor}
                      onChange={(e) => setReportTargetAuthor(e.target.value)}
                      placeholder="@username or author name..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700/80 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* Quoted Text Preview */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Offending Text or Excerpt</label>
                    <input
                      type="text"
                      value={reportPreview}
                      onChange={(e) => setReportPreview(e.target.value)}
                      placeholder="Paste offending comment, message or bio excerpt..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700/80 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* Extra Details */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Additional Context</label>
                    <textarea
                      rows={3}
                      value={reportNotes}
                      onChange={(e) => setReportNotes(e.target.value)}
                      placeholder="Why does this violate community standards? Provide any context..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700/80 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                  >
                    <Flag className="w-4 h-4" />
                    <span>Submit Report for Automated Moderation</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: COMMUNITY SAFETY RULES */}
          {activeTab === 'guidelines' && (
            <div className="flex flex-col gap-4">
              <div className="text-center py-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Code of Conduct</span>
                <h3 className="text-lg font-black text-white mt-0.5">Vibegram Safety Standards</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
                  We enforce automated real-time moderation to keep interactions healthy, friendly, and respectful.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {COMMUNITY_GUIDELINES.map((rule, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-800 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{rule.icon}</span>
                      <h4 className="text-xs font-bold text-white">{rule.title}</h4>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed mt-1">{rule.description}</p>
                  </div>
                ))}
              </div>

              {/* Warning explanation box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Real-Time Filter & Warning Banners</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  When typing in comments, direct chats, or donations, our real-time analyzer scans against prohibited terms. If offensive words are detected, an inline warning banner appears immediately and submission is blocked until cleaned up.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: MY SUBMISSIONS HISTORY */}
          {activeTab === 'history' && (
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Submitted Feedbacks & Reports</h3>

              {userFeedbacks.length === 0 && userReports.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  No submissions yet. You can submit app feedback or report inappropriate content anytime.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Reports */}
                  {userReports.map((report) => (
                    <div key={report.id} className="p-3.5 rounded-2xl bg-zinc-800/50 border border-zinc-800 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/40">
                          🛡️ Report: {report.reason.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">{report.createdAt}</span>
                      </div>
                      <p className="text-xs font-semibold text-white mt-1">Author: {report.targetAuthor || 'User'}</p>
                      {report.targetContentPreview && (
                        <p className="text-xs text-zinc-400 italic bg-black/40 p-2 rounded-lg border border-zinc-800">
                          "{report.targetContentPreview}"
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Status: {report.actionTakenNote || 'Automated filter applied · Content quarantined'}</span>
                      </div>
                    </div>
                  ))}

                  {/* Feedbacks */}
                  {userFeedbacks.map((fb) => (
                    <div key={fb.id} className="p-3.5 rounded-2xl bg-zinc-800/50 border border-zinc-800 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-bold border border-pink-500/40">
                          💬 Feedback: {fb.type}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">{fb.createdAt}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400 text-xs mt-0.5">
                        {Array.from({ length: fb.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs font-bold text-white mt-1">{fb.subject}</p>
                      <p className="text-xs text-zinc-400">{fb.message}</p>
                      {fb.adminResponse && (
                        <div className="mt-1 p-2 rounded-xl bg-purple-900/30 border border-purple-700/50 text-[11px] text-purple-200">
                          <span className="font-bold">Team Response: </span>
                          {fb.adminResponse}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
