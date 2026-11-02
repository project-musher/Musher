import React from 'react';
import { Home, Search, Film, Gamepad2, User } from 'lucide-react';
import { useApp, ActiveTab } from '../../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, viewUserProfile } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-t border-zinc-800/80 px-4 py-2 flex items-center justify-around sm:hidden">
      <button
        onClick={() => setActiveTab('feed')}
        className={`p-2 flex flex-col items-center gap-0.5 transition ${
          activeTab === 'feed' ? 'text-white scale-110' : 'text-zinc-500 hover:text-zinc-300'
        }`}
        title="Home"
      >
        <Home className={`w-6 h-6 ${activeTab === 'feed' ? 'stroke-[2.5]' : ''}`} />
      </button>

      <button
        onClick={() => setActiveTab('explore')}
        className={`p-2 flex flex-col items-center gap-0.5 transition ${
          activeTab === 'explore' ? 'text-white scale-110' : 'text-zinc-500 hover:text-zinc-300'
        }`}
        title="Search & Explore"
      >
        <Search className={`w-6 h-6 ${activeTab === 'explore' ? 'stroke-[2.5]' : ''}`} />
      </button>

      <button
        onClick={() => setActiveTab('reels')}
        className={`p-2 flex flex-col items-center gap-0.5 transition ${
          activeTab === 'reels' ? 'text-white scale-110' : 'text-zinc-500 hover:text-zinc-300'
        }`}
        title="Reels"
      >
        <Film className={`w-6 h-6 ${activeTab === 'reels' ? 'stroke-[2.5]' : ''}`} />
      </button>

      <button
        onClick={() => setActiveTab('games')}
        className={`p-2 flex flex-col items-center gap-0.5 transition ${
          activeTab === 'games' ? 'text-amber-400 scale-110' : 'text-zinc-500 hover:text-zinc-300'
        }`}
        title="Vibe Arcade"
      >
        <Gamepad2 className={`w-6 h-6 ${activeTab === 'games' ? 'stroke-[2.5]' : ''}`} />
      </button>

      <button
        onClick={() => viewUserProfile(currentUser.id)}
        className="p-1 flex flex-col items-center"
        title="Profile"
      >
        <div
          className={`p-[1.5px] rounded-full transition ${
            activeTab === 'profile' ? 'ring-2 ring-white scale-105' : 'opacity-70'
          }`}
        >
          <img
            src={currentUser.avatar}
            alt="Profile"
            className="w-6 h-6 rounded-full object-cover"
          />
        </div>
      </button>
    </nav>
  );
};
