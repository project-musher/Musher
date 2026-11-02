import React from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { rankStoriesForBar, buildUserEngagementProfile } from '../../utils/feedAlgorithm';

export const StoryBar: React.FC = () => {
  const {
    currentUser,
    users,
    stories,
    reels,
    chats,
    openStoryViewer,
    openCreatorModal,
  } = useApp();

  const chatPeerIds = chats.map((c) => {
    const peer = c.participants.find((p) => p.id !== currentUser.id);
    return peer ? peer.id : '';
  }).filter(Boolean);

  const profile = buildUserEngagementProfile(currentUser, users, reels, chatPeerIds);
  const rankedStories = rankStoriesForBar(stories, profile, currentUser.id);

  const userHasStory = stories.some((s) => s.userId === currentUser.id);

  return (
    <div className="w-full bg-black/60 backdrop-blur-md border-b border-zinc-800/80 py-3 px-4">
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth">
        {/* Current User Story Item */}
        <div className="flex flex-col items-center shrink-0 cursor-pointer group">
          <div className="relative">
            <div
              onClick={() => {
                if (userHasStory) {
                  openStoryViewer(currentUser.id);
                } else {
                  openCreatorModal('story');
                }
              }}
              className={`p-[2.5px] rounded-full transition-transform group-hover:scale-105 ${
                userHasStory
                  ? 'bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600'
                  : 'bg-zinc-800'
              }`}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-black"
              />
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                openCreatorModal('story');
              }}
              className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center border-2 border-black shadow"
              title="Add to story"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
          <span className="text-xs text-zinc-300 font-medium mt-1.5 truncate max-w-[70px]">
            Your story
          </span>
        </div>

        {/* Ranked Friends' Stories */}
        {rankedStories
          .filter((group) => group.userId !== currentUser.id)
          .map((group) => {
            const { user, hasUnseen } = group;
            return (
              <div
                key={user.id}
                onClick={() => openStoryViewer(user.id)}
                className="flex flex-col items-center shrink-0 cursor-pointer group"
              >
                <div
                  className={`p-[2.5px] rounded-full transition-all group-hover:scale-105 ${
                    hasUnseen
                      ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-sm'
                      : 'border-2 border-zinc-700 p-0.5'
                  }`}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-black"
                  />
                </div>
                <span className="text-xs text-zinc-300 font-medium mt-1.5 truncate max-w-[72px]">
                  {user.username}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
};
