import React from 'react';
import { useApp } from '../../context/AppContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { FeedView } from '../feed/FeedView';
import { ReelsFeed } from '../reels/ReelsFeed';
import { ExplorePage } from '../explore/ExplorePage';
import { ChatView } from '../chat/ChatView';
import { GamesHub } from '../games/GamesHub';
import { ProfileView } from '../profile/ProfileView';
import { StoryViewer } from '../stories/StoryViewer';
import { StoryCreator } from '../stories/StoryCreator';
import { ReelCreator } from '../reels/ReelCreator';
import { CallOverlay } from '../calls/CallOverlay';
import { VoiceMailPromptModal } from '../chat/VoiceMailPromptModal';
import { AIMusicModal } from '../music/AIMusicModal';
import { AIVideoStudioModal } from '../videoStudio/AIVideoStudioModal';
import { DonationModal } from '../donation/DonationModal';
import { PermissionsModal } from '../common/PermissionsModal';

export const AppShell: React.FC = () => {
  const {
    activeTab,
    isAIMusicModalOpen,
    closeAIMusicModal,
    isVideoStudioOpen,
    closeVideoStudio,
    isDonationModalOpen,
    donationTargetReel,
    donationTargetUser,
    closeDonationModal,
    isPermissionsModalOpen,
    closePermissionsModal,
  } = useApp();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white">
      {/* Desktop / Tablet Sidebar */}
      <Sidebar />

      {/* Main App Stage */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Top Navbar */}
        <Navbar />

        {/* View Switcher */}
        <main className="flex-1 h-full overflow-hidden relative">
          {activeTab === 'feed' && <FeedView />}
          {activeTab === 'reels' && <ReelsFeed />}
          {activeTab === 'explore' && <ExplorePage />}
          {activeTab === 'chat' && <ChatView />}
          {activeTab === 'games' && <GamesHub />}
          {activeTab === 'profile' && <ProfileView />}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav />
      </div>

      {/* Global Overlays & Modals */}
      <StoryViewer />
      <StoryCreator />
      <ReelCreator />
      <CallOverlay />
      <VoiceMailPromptModal />
      <AIMusicModal
        isOpen={isAIMusicModalOpen}
        onClose={closeAIMusicModal}
      />
      <AIVideoStudioModal
        isOpen={isVideoStudioOpen}
        onClose={closeVideoStudio}
      />
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={closeDonationModal}
        targetReel={donationTargetReel}
        targetUser={donationTargetUser}
      />
      <PermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={closePermissionsModal}
      />
    </div>
  );
};
