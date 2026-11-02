import React, { useState } from 'react';
import { Voicemail, X, Mic } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VoiceRecorderModal } from './VoiceRecorderModal';

export const VoiceMailPromptModal: React.FC = () => {
  const {
    voiceMailPromptPeer,
    closeVoiceMailPrompt,
    chats,
    sendMessage,
    openChatWithUser,
  } = useApp();

  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);

  if (!voiceMailPromptPeer) return null;

  const handleOpenRecorder = () => {
    setIsRecordingModalOpen(true);
  };

  const handleSendVoiceMail = ({
    audioUrl,
    duration,
    textSummary,
  }: {
    audioUrl?: string;
    duration: number;
    textSummary?: string;
  }) => {
    // Find or create chat
    const targetChat = chats.find((c) =>
      c.participants.some((p) => p.id === voiceMailPromptPeer.id)
    );
    const chatId = targetChat
      ? targetChat.id
      : `chat_${voiceMailPromptPeer.id}_${Date.now()}`;

    sendMessage({
      chatId,
      mediaType: 'voice',
      mediaUrl: audioUrl,
      voiceDuration: duration,
      text: textSummary || `Voice Mail (${duration}s)`,
    });

    closeVoiceMailPrompt();
    openChatWithUser(voiceMailPromptPeer);
  };

  return (
    <>
      <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-sm bg-zinc-900 border border-amber-500/40 rounded-3xl p-4 shadow-2xl flex items-center justify-between gap-3 animate-scaleUp">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Voicemail className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate">
              Leave a Voice Mail?
            </h4>
            <p className="text-[11px] text-zinc-400 truncate">
              Send an audio message to @{voiceMailPromptPeer.username}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleOpenRecorder}
            className="px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1 shadow transition"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Record</span>
          </button>
          <button
            onClick={closeVoiceMailPrompt}
            className="p-1.5 rounded-full text-zinc-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <VoiceRecorderModal
        isOpen={isRecordingModalOpen}
        recipientUser={voiceMailPromptPeer}
        isVoiceMail={true}
        onClose={() => {
          setIsRecordingModalOpen(false);
          closeVoiceMailPrompt();
        }}
        onSendVoice={handleSendVoiceMail}
      />
    </>
  );
};
