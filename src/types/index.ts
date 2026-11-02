export interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  isVerified?: boolean;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
  isOnline?: boolean;
  lastSeen?: string;
  customStatus?: string; // e.g. "Listening to Drake 🎵"
}

export interface StorySticker {
  id: string;
  type: 'poll' | 'question' | 'music' | 'mention' | 'location';
  question?: string;
  options?: string[];
  votes?: number[];
  userVotedIndex?: number;
  text?: string;
  x: number; // percentage
  y: number; // percentage
}

export interface Story {
  id: string;
  userId: string;
  user: User;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  stickers?: StorySticker[];
  filter?: string;
  createdAt: string;
  expiresAt: string;
  seen: boolean;
  likes: number;
  isLiked?: boolean;
}

export interface ReelComment {
  id: string;
  user: User;
  text: string;
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
  isDonation?: boolean;
  donationAmount?: number;
  voiceUrl?: string;
  voiceDuration?: number;
  platformFee?: number; // 5% cut to platform / me
  creatorShare?: number; // 95% to creator
}

export interface DonationTransaction {
  id: string;
  reelId?: string;
  donorUser: User;
  creatorUser: User;
  totalAmount: number;
  creatorShare: number; // 95%
  platformFee: number; // 5%
  voiceUrl?: string;
  voiceDuration?: number;
  message?: string;
  createdAt: string;
}

export interface Reel {
  id: string;
  userId: string;
  user: User;
  videoUrl: string;
  caption: string;
  tags: string[];
  music: {
    title: string;
    artist: string;
  };
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  comments: ReelComment[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'text' | 'image' | 'voice' | 'game_result' | 'call_event';
  voiceDuration?: number;
  gameData?: {
    gameId: string;
    gameTitle: string;
    score: number;
    highScore?: number;
    challengeAccepted?: boolean;
  };
  callData?: {
    type: 'audio' | 'video';
    duration: number; // seconds
    status: 'completed' | 'missed';
  };
  reactions: { [emoji: string]: string[] }; // emoji -> array of userIds
  timestamp: string;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: User[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isTyping?: boolean;
  typingUser?: string;
}

export interface CallSession {
  isActive: boolean;
  peerUser: User | null;
  type: 'audio' | 'video';
  status: 'calling' | 'ringing' | 'connected' | 'ended';
  startedAt?: number;
  duration: number; // seconds
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  filter: 'none' | 'sepia' | 'cyberpunk' | 'warm' | 'vintage' | 'mono';
  isMinimized: boolean;
}
