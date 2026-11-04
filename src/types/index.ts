export type SubscriptionTier = 'free' | 'premium' | 'vip';

export interface UserSubscription {
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'none';
  price: number; // 27 for premium, 50-55 for VIP
  billingPeriod: 'monthly';
  startDate: string;
  expiresAt: string;
  autoRenew: boolean;
  viewsMultiplier: number; // 1x free, 25x premium, 100x VIP
  profileViewsBoost: number; // 1x free, 10x premium, 50x VIP
  likesBoostMultiplier: number; // 1x free, 5x premium, 15x VIP
}

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
  subscriptionTier?: SubscriptionTier;
  subscription?: UserSubscription;
  profileViewsCount?: number;
  totalLikesReceived?: number;
  isVipSpotlight?: boolean;
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
  viewsCount?: number;
  isVipBoosted?: boolean;
  isPremiumBoosted?: boolean;
  isLiked?: boolean;
  isSaved?: boolean;
  comments: ReelComment[];
  createdAt: string;
}

export interface TimeCapsuleData {
  unlockDate: string; // ISO date string
  title: string;
  revealedText: string;
  theme: 'birthday' | 'anniversary' | 'future_letter' | 'secret';
  isUnlocked?: boolean;
  senderName: string;
}

export interface DigitalEmotionData {
  emotion: 'sad' | 'anxious' | 'hyped' | 'grateful' | 'lonely' | 'warmth';
  intensity: number; // 1-10
  prompt: string;
  supportResponses?: { userId: string; userName: string; text: string; emoji: string }[];
}

export interface VoiceChapter {
  timeSeconds: number;
  label: string;
}

export interface DecisionPollData {
  question: string;
  options: { id: string; text: string; votes: string[] }[];
  closed?: boolean;
  winnerOption?: string;
}

export interface UnsentMessageDraft {
  id: string;
  chatId: string;
  text: string;
  createdAt: string;
  isJournalEntry?: boolean;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'text' | 'image' | 'voice' | 'game_result' | 'call_event' | 'time_capsule' | 'digital_emotion' | 'decision_poll';
  voiceDuration?: number;
  voiceChapters?: VoiceChapter[];
  timeCapsule?: TimeCapsuleData;
  digitalEmotion?: DigitalEmotionData;
  decisionPoll?: DecisionPollData;
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
  voiceReactions?: { id: string; userId: string; userName: string; duration: number }[];
  videoReactions?: { id: string; userId: string; videoUrl: string }[];
  isStar?: boolean; // Featured celestial star in Message Universe
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
  isSecretInbox?: boolean;
  streakCount?: number;
  meaningfulScore?: number; // 0-100 score based on deep dialogues
  lastMeaningfulDate?: string;
  disappearingPresence?: boolean;
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

export interface UserFeedback {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'general' | 'bug' | 'suggestion' | 'moderation_concern';
  rating: number; // 1-5
  subject: string;
  message: string;
  status: 'received' | 'under_review' | 'resolved';
  adminResponse?: string;
  createdAt: string;
}

export interface ContentReport {
  id: string;
  reporterId: string;
  reporterUsername: string;
  targetType: 'comment' | 'reel' | 'chat_message' | 'user';
  targetId: string;
  targetAuthor?: string;
  targetContentPreview?: string;
  reason: 'vulgar_language' | 'insults_harassment' | 'hate_speech' | 'prohibited_terms' | 'spam' | 'other';
  notes?: string;
  status: 'pending' | 'action_taken' | 'dismissed';
  actionTakenNote?: string;
  createdAt: string;
}

