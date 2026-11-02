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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VoiceNotePlayer } from './VoiceNotePlayer';
import { VoiceRecorderModal } from './VoiceRecorderModal';
import { User, ChatMessage } from '../../types';
import { sounds } from '../../utils/audio';

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
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [activeReactionMsgId, setActiveReactionMsgId] = useState<string | null>(null);

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

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

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
      <div className="px-4 py-3 border-b border-zinc-800/80 bg-black/90 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={closeChat}
            className="p-1 rounded-full text-zinc-400 hover:text-white transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div
            onClick={() => viewUserProfile(peerUser.id)}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="relative">
              <img
                src={peerUser.avatar}
                alt={peerUser.name}
                className="w-10 h-10 rounded-full object-cover border border-zinc-700 group-hover:scale-105 transition"
              />
              {peerUser.isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-white group-hover:text-pink-400 transition leading-tight">
                  {peerUser.name}
                </span>
                {peerUser.isVerified && (
                  <BadgeCheck className="w-3.5 h-3.5 text-blue-400" />
                )}
              </div>
              <span className="text-[11px] text-zinc-400">
                {currentChat?.isTyping ? (
                  <span className="text-pink-400 font-semibold animate-pulse">typing...</span>
                ) : peerUser.isOnline ? (
                  'Active now'
                ) : (
                  peerUser.lastSeen || 'Offline'
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Call Buttons & Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Audio Call */}
          <button
            onClick={() => startCall(peerUser, 'audio')}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
            title="Audio Call"
          >
            <Phone className="w-5 h-5" />
          </button>

          {/* Video Call */}
          <button
            onClick={() => startCall(peerUser, 'video')}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
            title="Video Call"
          >
            <Video className="w-5 h-5" />
          </button>

          {/* Profile Details */}
          <button
            onClick={() => viewUserProfile(peerUser.id)}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
            title="View Profile"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-3">
        {/* User Mini Header in Chat */}
        <div className="flex flex-col items-center py-6 text-center border-b border-zinc-900 mb-2">
          <img
            src={peerUser.avatar}
            alt={peerUser.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-zinc-700 mb-2"
          />
          <h4 className="text-sm font-bold text-white">{peerUser.name}</h4>
          <p className="text-xs text-zinc-400 mb-3">@{peerUser.username} • Instagram</p>
          <button
            onClick={() => viewUserProfile(peerUser.id)}
            className="px-3.5 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition"
          >
            View Profile
          </button>
        </div>

        {chatMessages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const hasReactions = Object.keys(msg.reactions).length > 0;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative`}
            >
              {/* Message Bubble */}
              <div
                onDoubleClick={() => reactToMessage(activeChatId, msg.id, '❤️')}
                className="relative max-w-[80%] sm:max-w-md"
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

                {/* 3. VOICE MESSAGE / VOICE MAIL */}
                {msg.mediaType === 'voice' && (
                  <VoiceNotePlayer
                    duration={msg.voiceDuration || 14}
                    mediaUrl={msg.mediaUrl}
                    isCurrentUser={isMe}
                    isVoiceMail={msg.text?.toLowerCase().includes('voice mail')}
                  />
                )}

                {/* 4. GAME CHALLENGE RESULT */}
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

                {/* 5. CALL EVENT */}
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

                {/* Quick Emoji Reaction Trigger on Hover/Long-press */}
                <button
                  onClick={() =>
                    setActiveReactionMsgId(activeReactionMsgId === msg.id ? null : msg.id)
                  }
                  className="absolute -top-3 right-0 opacity-0 group-hover:opacity-100 p-1 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition shadow"
                  title="React"
                >
                  <Smile className="w-3.5 h-3.5" />
                </button>

                {/* Reaction Picker Popup */}
                {activeReactionMsgId === msg.id && (
                  <div className="absolute -top-10 left-0 bg-zinc-900 border border-zinc-700 rounded-full px-2 py-1 shadow-2xl flex items-center gap-1.5 z-20 animate-scaleUp">
                    {['❤️', '🔥', '😂', '👏', '😮', '😢'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          reactToMessage(activeChatId, msg.id, emoji);
                          setActiveReactionMsgId(null);
                        }}
                        className="text-base hover:scale-130 active:scale-95 transition"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Reaction Badges Below Bubble */}
              {hasReactions && (
                <div className="flex items-center gap-1 mt-1 px-1">
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
        className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2 z-10"
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
          <ImageIcon className="w-5 h-5" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Mini Game Launcher */}
        <button
          type="button"
          onClick={() => openGame('flappy')}
          className="p-2 rounded-full text-zinc-400 hover:text-amber-400 transition"
          title="Play Mini Game & Challenge Friend"
        >
          <Gamepad2 className="w-5 h-5" />
        </button>

        {/* Voice Note / Voice Mail Trigger */}
        <button
          type="button"
          onClick={() => setIsVoiceModalOpen(true)}
          className="p-2 rounded-full text-zinc-400 hover:text-purple-400 transition"
          title="Record Voice Note / Voice Mail"
        >
          <Mic className="w-5 h-5" />
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message ${peerUser.username}...`}
          className="flex-1 px-4 py-2.5 rounded-full bg-zinc-900 text-white placeholder-zinc-500 text-xs sm:text-sm border border-zinc-800 focus:outline-none focus:border-pink-500 transition"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white transition disabled:opacity-30 active:scale-95"
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

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
