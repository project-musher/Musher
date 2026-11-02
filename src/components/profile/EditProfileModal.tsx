import React, { useState } from 'react';
import { X, Check, AlertCircle, Camera, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile, isUsernameAvailable } = useApp();

  const [username, setUsername] = useState(currentUser.username);
  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [bio, setBio] = useState(currentUser.bio);
  const [customStatus, setCustomStatus] = useState(currentUser.customStatus || '');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time username check
  const usernameCheck = isUsernameAvailable(username, currentUser.id);
  const isUsernameValid = usernameCheck.available;

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Display name cannot be empty.');
      return;
    }

    if (bio.length > 150) {
      setError('Bio cannot exceed 150 characters.');
      return;
    }

    const res = updateUserProfile({
      username,
      name,
      avatar,
      bio,
      customStatus,
    });

    if (!res.success) {
      setError(res.error || 'Failed to update profile.');
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[92vh] no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-base font-bold text-white">Edit Profile</h2>
          <button
            onClick={handleSave}
            disabled={!isUsernameValid}
            className="text-sm font-bold text-pink-500 hover:text-pink-400 disabled:opacity-40 transition"
          >
            Done
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-5 flex flex-col gap-5">
          {/* Avatar selector */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group cursor-pointer">
              <img
                src={avatar}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-pink-500 shadow-lg"
              />
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {presetAvatars.map((p, i) => (
                <img
                  key={i}
                  src={p}
                  alt={`Preset ${i}`}
                  onClick={() => setAvatar(p)}
                  className={`w-8 h-8 rounded-full object-cover cursor-pointer border-2 transition ${
                    avatar === p ? 'border-pink-500 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Username Input with unique check */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-400">Username (Unique, Case-insensitive)</label>
              <div className="flex items-center gap-1 text-[11px]">
                {isUsernameValid ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    <Check className="w-3.5 h-3.5" /> Available
                  </span>
                ) : (
                  <span className="text-rose-400 font-medium">
                    {usernameCheck.reason}
                  </span>
                )}
              </div>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-zinc-500 text-sm font-semibold">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className={`w-full pl-8 pr-4 py-2.5 rounded-xl bg-zinc-800 text-white text-sm border focus:outline-none transition ${
                  isUsernameValid
                    ? 'border-zinc-700 focus:border-pink-500'
                    : 'border-rose-500/80 focus:border-rose-500'
                }`}
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Unique handle for mentions, search, and your profile link.
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 text-white text-sm border border-zinc-700 focus:border-pink-500 focus:outline-none"
            />
          </div>

          {/* Custom Status */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">Status / Mood</label>
            <div className="relative">
              <input
                type="text"
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                placeholder="e.g. Listening to Drake 🎵"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 text-white text-sm border border-zinc-700 focus:border-pink-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-400">Bio</label>
              <span className={`text-[11px] ${bio.length > 150 ? 'text-rose-400 font-bold' : 'text-zinc-500'}`}>
                {bio.length} / 150
              </span>
            </div>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a short bio about yourself..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 text-white text-sm border border-zinc-700 focus:border-pink-500 focus:outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!isUsernameValid}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-pink-500/20 active:scale-95 disabled:opacity-40 transition"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};
