import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  Phone,
  Video,
  Info,
  BadgeCheck,
  Image as ImageIcon,
  Mic,
  Smile,
  Send,
  Gamepad2,
  Voicemail,
  RotateCcw,
  Sparkles,
  Flag,
  AlertTriangle,
  Hourglass,
  Star,
  BrainCircuit,
  Heart,
  History,
  Ghost,
  Feather,
  Flame,
  Plus,
  Play,
  Volume2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VoiceNotePlayer } from './VoiceNotePlayer';
import { VoiceRecorderModal } from './VoiceRecorderModal';
import { TimeCapsuleModal } from './TimeCapsuleModal';
import { MessageUniverseModal } from './MessageUniverseModal';
import { TimeMachineModal } from './TimeMachineModal';
import { ChatSummaryModal } from './ChatSummaryModal';
import { FriendshipTimelineModal } from './FriendshipTimelineModal';
import { Reactions2Picker } from './Reactions2Picker';
import { DigitalEmotionModal } from './DigitalEmotionModal';
import { UnsentBoxModal } from './UnsentBoxModal';
import { TimeCapsuleBubble } from './TimeCapsuleBubble';
import { DecisionPollBubble } from './DecisionPollBubble';
import { DigitalEmotionBubble } from './DigitalEmotionBubble';
import { User, ChatMessage } from '../../types';
import { sounds } from '../../utils/audio';
import { checkContentModeration, sanitizeModeratedText } from '../../utils/moderation';

export const ChatConversation: React.FC = () => {
  const {
    activeChatId,
    closeChat,
    chats,
    messages,
    sendMessage,
    reactToMessage,
    currentUser,
    startCall,
    viewUserProfile,
    openGame,
    openVoiceMailPrompt,
    openFeedbackModal,
    toggleStarMessage,
    isGhostPresence,
    toggleGhostPresence,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [activeReactionMsgId, setActiveReactionMsgId] = useState<string | null>(null);

  // Innovation Modals
  const [isTimeCapsuleOpen, setIsTimeCapsuleOpen] = useState(false);
  const [isUniverseOpen, setIsUniverseOpen] = useState(false);
  const [isTimeMachineOpen, setIsTimeMachineOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isEmotionOpen, setIsEmotionOpen] = useState(false);
  const [isUnsentBoxOpen, setIsUnsentBoxOpen] = useState(false);
  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentChat = chats.find((c) => c.id === activeChatId);
  const peerUser = currentChat?.participants.find((p) => p.id !== currentUser.id);
  const chatMessages = activeChatId ? messages[activeChatId] || [] : [];

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length, currentChat?.isTyping]);

  if (!activeChatId || !peerUser) {
    return (
      <div className="hidden sm:flex flex-1 items-center justify-center bg-black text-zinc-500 text-sm">
        Select a conversation to start chatting
      </div>
    );
  }

  const chatModeration = checkContentModeration(inputText);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (!chatModeration.isClean) {
      sounds.playWarningBeep();
      return;
    }

    sendMessage({
      chatId: activeChatId,
      text: inputText.trim(),
      mediaType: 'text',
    });
    setInputText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      sendMessage({
        chatId: activeChatId,
        mediaUrl: url,
        mediaType: 'image',
        text: 'Sent a photo 📷',
      });
      setShowPhotoPicker(false);
    }
  };

  const handlePresetPhotoSend = (photoUrl: string) => {
    sendMessage({
      chatId: activeChatId,
      mediaUrl: photoUrl,
      mediaType: 'image',
      text: 'Shared photo ✨',
    });
    setShowPhotoPicker(false);
  };

  const presetPhotos = [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?w=600&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="flex-1 h-full flex flex-col bg-black text-white relative select-none">
      {/* Top Header */}
      <div className="px-3 sm:px-4 py-2.5 border-b border-zinc-800/80 bg-black/90 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={closeChat}
            className="p-1 rounded-full text-zinc-400 hover:text-white transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div
            onClick={() => viewUserProfile(peerUser.id)}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group min-w-0"
          >
            <div className="relative shrink-0">
              <img
                src={peerUser.avatar}
                alt={peerUser.name}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-zinc-700 group-hover:scale-105 transition"
              />
              {peerUser.isOnline && !isGhostPresence && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-white group-hover:text-pink-400 transition leading-tight truncate max-w-[120px] sm:max-w-[180px]">
                  {peerUser.name}
                </span>
                {peerUser.isVerified && (
                  <BadgeCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                )}
                {/* Streak flame badge */}
                {currentChat?.streakCount && currentChat.streakCount > 0 && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playTap();
                      setIsTimelineOpen(true);
                    }}
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30 hover:scale-105 transition"
                    title={`Conversation Streak: ${currentChat.streakCount} days of meaningful dialogue`}
                  >
                    <Flame className="w-3 h-3 fill-amber-400" />
                    <span>{currentChat.streakCount}d</span>
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] text-zinc-400 truncate block">
                {currentChat?.isTyping ? (
                  <span className="text-pink-400 font-semibold animate-pulse">typing...</span>
                ) : isGhostPresence ? (
                  <span className="text-purple-400 flex items-center gap-1">
                    <Ghost className="w-3 h-3 inline" /> Ghost Presence Active
                  </span>
                ) : peerUser.isOnline ? (
                  'Active now'
                ) : (
                  peerUser.lastSeen || 'Offline'
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Feature Triggers & Call Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Disappearing Ghost Presence Toggle */}
          <button
            onClick={() => {
              toggleGhostPresence();
            }}
            className={`p-2 rounded-xl transition ${
              isGhostPresence
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            title={isGhostPresence ? 'Disappearing Presence: ON (Invisible)' : 'Turn On Disappearing Ghost Presence'}
          >
            <Ghost className="w-4 h-4" />
          </button>

          {/* 3D Message Universe 🌌 */}
          <button
            onClick={() => {
              sounds.playCosmicChime();
              setIsUniverseOpen(true);
            }}
            className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition hover:scale-105"
            title="Open 3D Message Universe"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Message Time Machine 🔍 */}
          <button
            onClick={() => {
              sounds.playTap();
              setIsTimeMachineOpen(true);
            }}
            className="p-2 rounded-xl text-zinc-400 hover:text-sky-300 hover:bg-sky-500/10 transition"
            title="Message Time Machine Search"
          >
            <History className="w-4 h-4" />
          </button>

          {/* AI Chat Summary 🧠 */}
          <button
            onClick={() => {
              sounds.playTap();
              setIsSummaryOpen(true);
            }}
            className="p-2 rounded-xl text-zinc-400 hover:text-purple-300 hover:bg-purple-500/10 transition"
            title="AI Chat Summary"
          >
            <BrainCircuit className="w-4 h-4" />
          </button>

          {/* Friendship Timeline 💖 */}
          <button
            onClick={() => {
              sounds.playTap();
              setIsTimelineOpen(true);
            }}
            className="p-2 rounded-xl text-zinc-400 hover:text-pink-300 hover:bg-pink-500/10 transition"
            title="Friendship Journey Timeline"
          >
            <Heart className="w-4 h-4" />
          </button>

          {/* Audio Call */}
          <button
            onClick={() => startCall(peerUser, 'audio')}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
            title="Audio Call"
          >
            <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Video Call */}
          <button
            onClick={() => startCall(peerUser, 'video')}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
            title="Video Call"
          >
            <Video className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Report User for Insulting / Vulgar Language */}
          <button
            onClick={() =>
              openFeedbackModal('report', {
                targetType: 'user',
                targetId: peerUser.id,
                targetAuthor: peerUser.username,
                targetContentPreview: `Direct Chat with @${peerUser.username}`,
              })
            }
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition"
            title="Report User for Vulgar / Insulting Language"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-3">
        {/* User Mini Header in Chat */}
        <div className="flex flex-col items-center py-5 text-center border-b border-zinc-900 mb-2">
          <img
            src={peerUser.avatar}
            alt={peerUser.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-zinc-700 mb-2"
          />
          <h4 className="text-sm font-bold text-white">{peerUser.name}</h4>
          <p className="text-xs text-zinc-400 mb-2.5">@{peerUser.username} • MUSHer Social</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTimelineOpen(true)}
              className="px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-pink-300 transition flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5" /> Friendship Timeline
            </button>
            <button
              onClick={() => setIsUniverseOpen(true)}
              className="px-3 py-1 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-xs font-semibold text-purple-300 border border-purple-500/30 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> 3D Universe
            </button>
          </div>
        </div>

        {chatMessages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const hasReactions = Object.keys(msg.reactions).length > 0;
          const hasVideoReactions = msg.videoReactions && msg.videoReactions.length > 0;
          const hasVoiceReactions = msg.voiceReactions && msg.voiceReactions.length > 0;
          const isHighlighted = highlightedMsgId === msg.id;

          return (
            <div
              key={msg.id}
              id={`msg-${msg.id}`}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative transition-all duration-300 ${
                isHighlighted ? 'ring-2 ring-sky-400 rounded-2xl p-1 bg-sky-500/10' : ''
              }`}
            >
              {/* Message Bubble Container */}
              <div
                onDoubleClick={() => reactToMessage(activeChatId, msg.id, '❤️')}
                className="relative max-w-[85%] sm:max-w-md"
              >
                {/* 1. TEXT MESSAGE */}
                {(!msg.mediaType || msg.mediaType === 'text') && (
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed transition ${
                      isMe
                        ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white rounded-br-sm shadow-md'
                        : 'bg-zinc-800/90 text-zinc-100 rounded-bl-sm border border-zinc-700/60'
                    }`}
                  >
                    {msg.text}
                  </div>
                )}

                {/* 2. PHOTO MESSAGE */}
                {msg.mediaType === 'image' && (
                  <div className="rounded-2xl overflow-hidden border border-zinc-700/60 shadow-lg bg-zinc-900">
                    <img
                      src={msg.mediaUrl}
                      alt="Shared photo"
                      className="max-h-72 w-auto object-cover rounded-2xl hover:scale-[1.02] transition cursor-pointer"
                    />
                    {msg.text && (
                      <p className="p-2 text-xs text-zinc-300">{msg.text}</p>
                    )}
                  </div>
                )}

                {/* 3. VOICE MESSAGE WITH CHAPTERS */}
                {msg.mediaType === 'voice' && (
                  <div className="space-y-1.5">
                    <VoiceNotePlayer
                      duration={msg.voiceDuration || 14}
                      mediaUrl={msg.mediaUrl}
                      isCurrentUser={isMe}
                      isVoiceMail={msg.text?.toLowerCase().includes('voice mail')}
                    />

                    {/* Voice Chapters (Feature #15) */}
                    {msg.voiceChapters && msg.voiceChapters.length > 0 && (
                      <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                          Audio Chapters:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {msg.voiceChapters.map((ch, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => sounds.playTap()}
                              className="px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-sky-500/20 text-[10px] text-zinc-300 hover:text-sky-300 border border-zinc-700 transition"
                            >
                              <span className="font-mono text-zinc-500 mr-1">
                                0:{String(ch.timeSeconds).padStart(2, '0')}
                              </span>
                              {ch.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. TIME CAPSULE MESSAGE (Feature #6) */}
                {msg.mediaType === 'time_capsule' && msg.timeCapsule && (
                  <TimeCapsuleBubble
                    chatId={activeChatId}
                    messageId={msg.id}
                    timeCapsule={msg.timeCapsule}
                    isMe={isMe}
                  />
                )}

                {/* 5. DIGITAL EMOTION CARD (Feature #16) */}
                {msg.mediaType === 'digital_emotion' && msg.digitalEmotion && (
                  <DigitalEmotionBubble
                    chatId={activeChatId}
                    messageId={msg.id}
                    emotionData={msg.digitalEmotion}
                    isMe={isMe}
                  />
                )}

                {/* 6. GROUP DECISION POLL (Feature #13) */}
                {msg.mediaType === 'decision_poll' && msg.decisionPoll && (
                  <DecisionPollBubble
                    chatId={activeChatId}
                    messageId={msg.id}
                    poll={msg.decisionPoll}
                    isMe={isMe}
                  />
                )}

                {/* 7. GAME CHALLENGE RESULT */}
                {msg.mediaType === 'game_result' && msg.gameData && (
                  <div className="rounded-2xl bg-zinc-900 border border-amber-500/40 p-4 shadow-xl flex flex-col gap-2.5 max-w-xs">
                    <div className="flex items-center justify-between text-amber-400">
                      <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
                        <Gamepad2 className="w-4 h-4" />
                        <span>Game Challenge</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 font-bold">
                        {msg.gameData.gameTitle}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-y border-zinc-800">
                      <span className="text-xs text-zinc-400">Score to beat</span>
                      <span className="text-xl font-extrabold text-white">
                        {msg.gameData.score} <span className="text-xs text-amber-400">pts</span>
                      </span>
                    </div>

                    <button
                      onClick={() => openGame(msg.gameData!.gameId)}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Accept Challenge & Play</span>
                    </button>
                  </div>
                )}

                {/* 8. CALL EVENT */}
                {msg.mediaType === 'call_event' && (
                  <div className="px-3.5 py-2 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs flex items-center gap-2 text-zinc-300">
                    {msg.callData?.type === 'video' ? (
                      <Video className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Phone className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>{msg.text}</span>
                    {msg.callData?.status === 'missed' && (
                      <button
                        onClick={() => openVoiceMailPrompt(peerUser)}
                        className="ml-2 text-pink-400 hover:underline font-semibold text-[11px]"
                      >
                        Leave Voice Mail
                      </button>
                    )}
                  </div>
                )}

                {/* Star toggle button (Message Universe Node) */}
                <button
                  type="button"
                  onClick={() => toggleStarMessage(activeChatId, msg.id)}
                  className={`absolute -top-3 left-0 opacity-0 group-hover:opacity-100 p-1 rounded-full transition shadow text-xs ${
                    msg.isStar
                      ? 'opacity-100 bg-amber-500 text-black shadow-amber-500/50'
                      : 'bg-zinc-800 text-zinc-400 hover:text-amber-400'
                  }`}
                  title={msg.isStar ? 'Starred Memory (Celestial Node in Universe)' : 'Star in Message Universe'}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </button>

                {/* Reactions 2.0 Trigger */}
                <button
                  onClick={() =>
                    setActiveReactionMsgId(activeReactionMsgId === msg.id ? null : msg.id)
                  }
                  className="absolute -top-3 right-0 opacity-0 group-hover:opacity-100 p-1 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition shadow"
                  title="Reactions 2.0 (Emoji, 2s Video, Voice)"
                >
                  <Smile className="w-3.5 h-3.5" />
                </button>

                {/* Reactions 2.0 Picker Drawer */}
                {activeReactionMsgId === msg.id && (
                  <Reactions2Picker
                    chatId={activeChatId}
                    messageId={msg.id}
                    isOpen={true}
                    onClose={() => setActiveReactionMsgId(null)}
                  />
                )}
              </div>

              {/* Reaction Badges Below Bubble */}
              {(hasReactions || hasVideoReactions || hasVoiceReactions) && (
                <div className="flex flex-wrap items-center gap-1 mt-1 px-1">
                  {Object.entries(msg.reactions).map(([emoji, userIds]) => (
                    <button
                      key={emoji}
                      onClick={() => reactToMessage(activeChatId, msg.id, emoji)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-300 shadow-sm"
                    >
                      <span>{emoji}</span>
                      {userIds.length > 1 && <span>{userIds.length}</span>}
                    </button>
                  ))}

                  {/* 2-second Video Reaction previews */}
                  {msg.videoReactions?.map((vr) => (
                    <div
                      key={vr.id}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-950/60 border border-pink-700/60 text-[11px] text-pink-300"
                    >
                      <Play className="w-2.5 h-2.5 fill-pink-400" />
                      <span>2s Video Reaction</span>
                    </div>
                  ))}

                  {/* Voice Reaction chips */}
                  {msg.voiceReactions?.map((ar) => (
                    <div
                      key={ar.id}
                      onClick={() => sounds.playSend()}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-950/60 border border-sky-700/60 text-[11px] text-sky-300 cursor-pointer"
                    >
                      <Volume2 className="w-2.5 h-2.5" />
                      <span>{ar.userName}: {ar.duration}s Voice</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <span className="text-[10px] text-zinc-500 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* Typing indicator bubble */}
        {currentChat?.isTyping && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-800/80 rounded-bl-sm w-fit border border-zinc-700/50">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" />
            <span
              className="w-2 h-2 rounded-full bg-pink-400 animate-bounce"
              style={{ animationDelay: '0.2s' }}
            />
            <span
              className="w-2 h-2 rounded-full bg-pink-400 animate-bounce"
              style={{ animationDelay: '0.4s' }}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Photo Picker Drawer */}
      {showPhotoPicker && (
        <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-950 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Send a Photo</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-pink-400 font-semibold hover:underline"
            >
              Upload from files
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {presetPhotos.map((url, i) => (
              <img
                key={i}
                src={url}
                alt="Preset"
                onClick={() => handlePresetPhotoSend(url)}
                className="w-full h-16 rounded-xl object-cover cursor-pointer hover:opacity-80 transition border border-zinc-700"
              />
            ))}
          </div>
        </div>
      )}

      {/* Bottom Message Input Bar */}
      <form
        onSubmit={handleSendText}
        className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-1.5 sm:gap-2 z-10"
      >
        {/* Photo Upload Icon */}
        <button
          type="button"
          onClick={() => setShowPhotoPicker(!showPhotoPicker)}
          className={`p-2 rounded-full transition ${
            showPhotoPicker ? 'bg-pink-600 text-white' : 'text-zinc-400 hover:text-white'
          }`}
          title="Send Photo"
        >
          <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Time Capsule Trigger ⏳ */}
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            setIsTimeCapsuleOpen(true);
          }}
          className="p-2 rounded-full text-zinc-400 hover:text-amber-400 transition"
          title="Send Time Capsule Message"
        >
          <Hourglass className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Digital Emotion Card Trigger ⚡ */}
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            setIsEmotionOpen(true);
          }}
          className="p-2 rounded-full text-zinc-400 hover:text-pink-400 transition"
          title="Send Digital Emotion Card"
        >
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Unsent Messages Box 🪶 */}
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            setIsUnsentBoxOpen(true);
          }}
          className="p-2 rounded-full text-zinc-400 hover:text-amber-300 transition"
          title="Unsent Messages Box & Journal"
        >
          <Feather className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Voice Note Trigger 🎙️ */}
        <button
          type="button"
          onClick={() => setIsVoiceModalOpen(true)}
          className="p-2 rounded-full text-zinc-400 hover:text-purple-400 transition"
          title="Record Voice Note / Voice Mail"
        >
          <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message ${peerUser.username}...`}
          className={`flex-1 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-zinc-900 text-white placeholder-zinc-500 text-xs sm:text-sm border transition ${
            !chatModeration.isClean
              ? 'border-rose-500 ring-1 ring-rose-500'
              : 'border-zinc-800 focus:outline-none focus:border-pink-500'
          }`}
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() || !chatModeration.isClean}
          className="p-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white transition disabled:opacity-30 active:scale-95 shrink-0"
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Real-time Moderation Warning Banner */}
      {!chatModeration.isClean && (
        <div className="px-4 py-2 bg-gradient-to-r from-rose-950 via-red-950 to-zinc-950 border-t border-rose-500/50 flex items-center justify-between gap-3 z-10 animate-fadeIn">
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-[11px] font-semibold text-rose-300 truncate">
              {chatModeration.warningTitle}: {chatModeration.warningMessage}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setInputText(sanitizeModeratedText(inputText))}
            className="px-2.5 py-0.5 rounded-full bg-rose-500/30 hover:bg-rose-500/50 text-white font-bold text-[10px] border border-rose-400/40 shrink-0 transition"
          >
            Sanitize
          </button>
        </div>
      )}

      {/* Modals */}
      <TimeCapsuleModal
        chatId={activeChatId}
        isOpen={isTimeCapsuleOpen}
        onClose={() => setIsTimeCapsuleOpen(false)}
      />

      <MessageUniverseModal
        chatId={activeChatId}
        isOpen={isUniverseOpen}
        onClose={() => setIsUniverseOpen(false)}
      />

      <TimeMachineModal
        chatId={activeChatId}
        isOpen={isTimeMachineOpen}
        onClose={() => setIsTimeMachineOpen(false)}
        onJumpToMessage={(msgId) => {
          setHighlightedMsgId(msgId);
          const el = document.getElementById(`msg-${msgId}`);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => setHighlightedMsgId(null), 3000);
        }}
      />

      <ChatSummaryModal
        chatId={activeChatId}
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
      />

      <FriendshipTimelineModal
        chatId={activeChatId}
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
      />

      <DigitalEmotionModal
        chatId={activeChatId}
        isOpen={isEmotionOpen}
        onClose={() => setIsEmotionOpen(false)}
      />

      <UnsentBoxModal
        chatId={activeChatId}
        isOpen={isUnsentBoxOpen}
        onClose={() => setIsUnsentBoxOpen(false)}
      />

      {/* Voice Recorder Modal */}
      <VoiceRecorderModal
        isOpen={isVoiceModalOpen}
        recipientUser={peerUser}
        onClose={() => setIsVoiceModalOpen(false)}
        onSendVoice={({ audioUrl, duration, textSummary, isVoiceMail }) => {
          sendMessage({
            chatId: activeChatId,
            mediaType: 'voice',
            mediaUrl: audioUrl,
            voiceDuration: duration,
            text: textSummary,
          });
        }}
      />
    </div>
  );
};
