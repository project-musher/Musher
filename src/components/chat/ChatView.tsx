import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChatList } from './ChatList';
import { ChatConversation } from './ChatConversation';

export const ChatView: React.FC = () => {
  const { activeChatId } = useApp();

  return (
    <div className="w-full h-full flex bg-black overflow-hidden">
      {/* Left Chat Threads Pane */}
      <div
        className={`w-full sm:w-80 md:w-96 h-full border-r border-zinc-800/80 shrink-0 ${
          activeChatId ? 'hidden sm:flex flex-col' : 'flex flex-col'
        }`}
      >
        <ChatList />
      </div>

      {/* Right Conversation Pane */}
      <div
        className={`flex-1 h-full flex flex-col ${
          !activeChatId ? 'hidden sm:flex' : 'flex'
        }`}
      >
        <ChatConversation />
      </div>
    </div>
  );
};
