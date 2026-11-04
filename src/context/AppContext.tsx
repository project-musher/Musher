import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Story,
  Reel,
  Chat,
  ChatMessage,
  CallSession,
  StorySticker,
  DonationTransaction,
  ReelComment,
  UserFeedback,
  ContentReport,
  SubscriptionTier,
  UserSubscription,
  TimeCapsuleData,
  DigitalEmotionData,
  DecisionPollData,
  UnsentMessageDraft,
} from '../types';
import {
  CURRENT_USER,
  MOCK_USERS,
  INITIAL_STORIES,
  INITIAL_REELS,
  INITIAL_CHATS,
  INITIAL_MESSAGES,
} from '../data/mockData';
import { sounds } from '../utils/audio';
import { isReservedUsername, checkContentModeration } from '../utils/moderation';

export type ActiveTab = 'feed' | 'reels' | 'explore' | 'chat' | 'games' | 'profile';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  updateUserProfile: (data: {
    username: string;
    name: string;
    avatar: string;
    bio: string;
    customStatus?: string;
  }) => { success: boolean; error?: string };
  isUsernameAvailable: (username: string, excludeUserId?: string) => { available: boolean; reason?: string };
  users: User[];
  toggleFollowUser: (userId: string) => void;
  
  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedUserId: string | null;
  viewUserProfile: (userId: string) => void;
  
  // Stories
  stories: Story[];
  activeStoryUserIndex: number | null;
  openStoryViewer: (userId: string) => void;
  closeStoryViewer: () => void;
  addStory: (storyData: {
    mediaUrl: string;
    mediaType: 'image' | 'video';
    caption?: string;
    stickers?: StorySticker[];
    filter?: string;
  }) => void;
  markStorySeen: (storyId: string) => void;
  likeStory: (storyId: string) => void;
  votePoll: (storyId: string, stickerId: string, optionIndex: number) => void;

  // Reels
  reels: Reel[];
  toggleLikeReel: (reelId: string) => void;
  toggleSaveReel: (reelId: string) => void;
  addReelComment: (reelId: string, text: string) => void;
  addReel: (newReel: {
    videoUrl: string;
    caption: string;
    tags: string[];
    music: { title: string; artist: string };
  }) => void;

  // Chat
  chats: Chat[];
  messages: { [chatId: string]: ChatMessage[] };
  activeChatId: string | null;
  openChatWithUser: (user: User) => void;
  closeChat: () => void;
  sendMessage: (payload: {
    chatId: string;
    text?: string;
    mediaUrl?: string;
    mediaType?: 'text' | 'image' | 'voice' | 'game_result' | 'call_event';
    voiceDuration?: number;
    gameData?: ChatMessage['gameData'];
    callData?: ChatMessage['callData'];
  }) => void;
  reactToMessage: (chatId: string, messageId: string, emoji: string) => void;

  // Calling
  callSession: CallSession;
  startCall: (user: User, type: 'audio' | 'video') => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => void;
  setCallFilter: (filter: CallSession['filter']) => void;
  toggleMinimizeCall: () => void;

  // Games
  activeGameId: string | null;
  openGame: (gameId: string) => void;
  closeGame: () => void;
  shareGameToChat: (chatId: string, gameId: string, gameTitle: string, score: number) => void;
  highScores: { [gameId: string]: number };
  saveHighScore: (gameId: string, score: number) => void;

  // Modals
  creatorModal: 'story' | 'reel' | null;
  openCreatorModal: (type: 'story' | 'reel') => void;
  closeCreatorModal: () => void;
  isAIMusicModalOpen: boolean;
  openAIMusicModal: () => void;
  closeAIMusicModal: () => void;
  isVideoStudioOpen: boolean;
  openVideoStudio: () => void;
  closeVideoStudio: () => void;

  // Voice mail prompt state
  voiceMailPromptPeer: User | null;
  openVoiceMailPrompt: (peer: User) => void;
  closeVoiceMailPrompt: () => void;

  // Creator Donations & Voice Comments (with 5% platform fee)
  userBalance: number;
  topUpBalance: (amount: number) => void;
  platformRevenue: number; // 5% fee to me
  donationTransactions: DonationTransaction[];
  donateWithVoiceComment: (payload: {
    reelId?: string;
    creatorId: string;
    amount: number;
    message?: string;
    voiceUrl?: string;
    voiceDuration?: number;
  }) => { success: boolean; error?: string };
  isDonationModalOpen: boolean;
  donationTargetReel: Reel | null;
  donationTargetUser: User | null;
  openDonationModal: (target?: Reel | { reel?: Reel; user?: User }) => void;
  closeDonationModal: () => void;

  // Access Permissions (Camera & Microphone)
  isPermissionsModalOpen: boolean;
  openPermissionsModal: () => void;
  closePermissionsModal: () => void;

  // Community Safety, Moderation & Feedbacks
  isFeedbackModalOpen: boolean;
  feedbackInitialTab: 'feedback' | 'report' | 'guidelines' | 'history';
  feedbackReportContext?: {
    targetType: 'comment' | 'reel' | 'chat_message' | 'user';
    targetId: string;
    targetAuthor?: string;
    targetContentPreview?: string;
  };
  openFeedbackModal: (
    initialTab?: 'feedback' | 'report' | 'guidelines' | 'history',
    reportContext?: {
      targetType: 'comment' | 'reel' | 'chat_message' | 'user';
      targetId: string;
      targetAuthor?: string;
      targetContentPreview?: string;
    }
  ) => void;
  closeFeedbackModal: () => void;
  userFeedbacks: UserFeedback[];
  userReports: ContentReport[];
  submitFeedback: (payload: {
    type: 'general' | 'bug' | 'suggestion' | 'moderation_concern';
    rating: number;
    subject: string;
    message: string;
  }) => void;
  submitReport: (payload: {
    targetType: 'comment' | 'reel' | 'chat_message' | 'user';
    targetId: string;
    targetAuthor?: string;
    targetContentPreview?: string;
    reason: 'vulgar_language' | 'insults_harassment' | 'hate_speech' | 'prohibited_terms' | 'spam' | 'other';
    notes?: string;
  }) => void;

  // Premium & VIP Subscriptions
  userSubscription: UserSubscription;
  isSubscriptionModalOpen: boolean;
  openSubscriptionModal: () => void;
  closeSubscriptionModal: () => void;
  subscribeToTier: (tier: SubscriptionTier, customPrice?: number) => { success: boolean; error?: string };
  cancelSubscription: () => void;
  boostProfilePageViewsAndLikes: () => { viewsAdded: number; likesAdded: number };

  // Chat Innovations & Flagship Features
  sendTimeCapsule: (payload: {
    chatId: string;
    title: string;
    revealedText: string;
    unlockDate: string;
    theme: 'birthday' | 'anniversary' | 'future_letter' | 'secret';
  }) => void;
  unlockTimeCapsule: (chatId: string, messageId: string) => void;
  toggleStarMessage: (chatId: string, messageId: string) => void;

  // Disappearing Ghost Presence
  isGhostPresence: boolean;
  toggleGhostPresence: () => void;

  // Secret Second Inbox
  isSecretVaultUnlocked: boolean;
  secretVaultPin: string;
  unlockSecretVault: (pin: string) => boolean;
  lockSecretVault: () => void;
  setSecretVaultPin: (newPin: string) => void;
  toggleChatSecretStatus: (chatId: string) => void;

  // Unsent Messages Box & Journal
  unsentDrafts: UnsentMessageDraft[];
  saveUnsentDraft: (chatId: string, text: string) => void;
  deleteUnsentDraft: (draftId: string) => void;
  toggleDraftJournal: (draftId: string) => void;

  // Reactions 2.0 (Video & Voice)
  addVideoReaction: (chatId: string, messageId: string, videoUrl: string) => void;
  addVoiceReaction: (chatId: string, messageId: string, duration: number) => void;

  // Digital Emotion Cards
  sendDigitalEmotion: (payload: {
    chatId: string;
    emotion: DigitalEmotionData['emotion'];
    intensity: number;
    prompt: string;
  }) => void;
  respondToEmotion: (chatId: string, messageId: string, text: string, emoji: string) => void;

  // Group / Friendship Decision Maker
  voteDecisionPoll: (chatId: string, messageId: string, optionId: string) => void;
  closeDecisionPoll: (chatId: string, messageId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user & accounts
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('vibegram_current_user');
    return saved ? JSON.parse(saved) : CURRENT_USER;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('vibegram_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Stories
  const [stories, setStories] = useState<Story[]>(() => {
    const saved = localStorage.getItem('vibegram_stories');
    return saved ? JSON.parse(saved) : INITIAL_STORIES;
  });
  const [activeStoryUserIndex, setActiveStoryUserIndex] = useState<number | null>(null);

  // Reels
  const [reels, setReels] = useState<Reel[]>(() => {
    const saved = localStorage.getItem('vibegram_reels');
    return saved ? JSON.parse(saved) : INITIAL_REELS;
  });

  // Chats & Messages
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem('vibegram_chats');
    return saved ? JSON.parse(saved) : INITIAL_CHATS;
  });

  const [messages, setMessages] = useState<{ [chatId: string]: ChatMessage[] }>(() => {
    const saved = localStorage.getItem('vibegram_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Calling
  const [callSession, setCallSession] = useState<CallSession>({
    isActive: false,
    peerUser: null,
    type: 'video',
    status: 'calling',
    duration: 0,
    isMuted: false,
    isCameraOff: false,
    isScreenSharing: false,
    filter: 'none',
    isMinimized: false,
  });

  // Games
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [highScores, setHighScores] = useState<{ [gameId: string]: number }>(() => {
    const saved = localStorage.getItem('vibegram_highscores');
    return saved ? JSON.parse(saved) : { flappy: 35, emoji_catcher: 42, trivia: 80, cyber_rush: 140 };
  });

  // Creator Modal ('story' | 'reel' | null)
  const [creatorModal, setCreatorModal] = useState<'story' | 'reel' | null>(null);
  const [isAIMusicModalOpen, setIsAIMusicModalOpen] = useState(false);
  const [isVideoStudioOpen, setIsVideoStudioOpen] = useState(false);

  // Voice mail prompt after missed or ended call
  const [voiceMailPromptPeer, setVoiceMailPromptPeer] = useState<User | null>(null);

  // Donations & Voice Comments (with 5% fee to me)
  const [userBalance, setUserBalance] = useState<number>(() => {
    const saved = localStorage.getItem('vibegram_user_balance');
    return saved ? Number(saved) : 150.0;
  });

  const [platformRevenue, setPlatformRevenue] = useState<number>(() => {
    const saved = localStorage.getItem('vibegram_platform_revenue');
    return saved ? Number(saved) : 12.5; // accumulated 5% cuts
  });

  const [donationTransactions, setDonationTransactions] = useState<DonationTransaction[]>(() => {
    const saved = localStorage.getItem('vibegram_donations');
    return saved ? JSON.parse(saved) : [];
  });

  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [donationTargetReel, setDonationTargetReel] = useState<Reel | null>(null);
  const [donationTargetUser, setDonationTargetUser] = useState<User | null>(null);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

  // Community Safety, Moderation & Feedbacks
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackInitialTab, setFeedbackInitialTab] = useState<'feedback' | 'report' | 'guidelines' | 'history'>('feedback');
  const [feedbackReportContext, setFeedbackReportContext] = useState<any>(undefined);

  const [userFeedbacks, setUserFeedbacks] = useState<UserFeedback[]>(() => {
    const saved = localStorage.getItem('vibegram_feedbacks');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'fb-sample-1',
            userId: 'user_1',
            userName: 'Alex Rivers',
            userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
            type: 'suggestion',
            rating: 5,
            subject: 'Real-time Audio Visualizer and Anti-Abuse warnings are amazing!',
            message: 'The new moderation warnings make discussions so much friendlier and civilized.',
            status: 'resolved',
            adminResponse: 'Thank you Alex! Keeping Vibegram safe and positive is our top priority.',
            createdAt: '1 day ago',
          },
        ];
  });

  const [userReports, setUserReports] = useState<ContentReport[]>(() => {
    const saved = localStorage.getItem('vibegram_reports');
    return saved ? JSON.parse(saved) : [];
  });

  // Premium & VIP Subscriptions ($27/mo Premium, $50-$55/mo VIP)
  const [userSubscription, setUserSubscription] = useState<UserSubscription>(() => {
    const saved = localStorage.getItem('vibegram_user_subscription');
    if (saved) return JSON.parse(saved);
    const tier: SubscriptionTier = currentUser.subscriptionTier || 'free';
    return {
      tier,
      status: tier !== 'free' ? 'active' : 'none',
      price: tier === 'vip' ? 52 : tier === 'premium' ? 27 : 0,
      billingPeriod: 'monthly',
      startDate: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      autoRenew: true,
      viewsMultiplier: tier === 'vip' ? 100 : tier === 'premium' ? 25 : 1,
      profileViewsBoost: tier === 'vip' ? 50 : tier === 'premium' ? 10 : 1,
      likesBoostMultiplier: tier === 'vip' ? 15 : tier === 'premium' ? 5 : 1,
    };
  });
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('vibegram_user_subscription', JSON.stringify(userSubscription));
  }, [userSubscription]);

  const openSubscriptionModal = () => setIsSubscriptionModalOpen(true);
  const closeSubscriptionModal = () => setIsSubscriptionModalOpen(false);

  useEffect(() => {
    localStorage.setItem('vibegram_feedbacks', JSON.stringify(userFeedbacks));
  }, [userFeedbacks]);

  useEffect(() => {
    localStorage.setItem('vibegram_reports', JSON.stringify(userReports));
  }, [userReports]);

  const openFeedbackModal = (
    initialTab?: 'feedback' | 'report' | 'guidelines' | 'history',
    reportContext?: any
  ) => {
    if (initialTab) setFeedbackInitialTab(initialTab);
    if (reportContext) setFeedbackReportContext(reportContext);
    setIsFeedbackModalOpen(true);
  };

  const closeFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setFeedbackReportContext(undefined);
  };

  const submitFeedback = (payload: {
    type: 'general' | 'bug' | 'suggestion' | 'moderation_concern';
    rating: number;
    subject: string;
    message: string;
  }) => {
    const newFb: UserFeedback = {
      id: `fb-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      type: payload.type,
      rating: payload.rating,
      subject: payload.subject,
      message: payload.message,
      status: 'received',
      adminResponse: 'Received by Vibegram Team. Under active review.',
      createdAt: 'Just now',
    };
    setUserFeedbacks((prev) => [newFb, ...prev]);
  };

  const submitReport = (payload: {
    targetType: 'comment' | 'reel' | 'chat_message' | 'user';
    targetId: string;
    targetAuthor?: string;
    targetContentPreview?: string;
    reason: 'vulgar_language' | 'insults_harassment' | 'hate_speech' | 'prohibited_terms' | 'spam' | 'other';
    notes?: string;
  }) => {
    const newReport: ContentReport = {
      id: `rep-${Date.now()}`,
      reporterId: currentUser.id,
      reporterUsername: currentUser.username,
      targetType: payload.targetType,
      targetId: payload.targetId,
      targetAuthor: payload.targetAuthor,
      targetContentPreview: payload.targetContentPreview,
      reason: payload.reason,
      notes: payload.notes,
      status: 'action_taken',
      actionTakenNote: 'Quarantined by automated moderation system.',
      createdAt: 'Just now',
    };
    setUserReports((prev) => [newReport, ...prev]);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('vibegram_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('vibegram_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('vibegram_stories', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem('vibegram_reels', JSON.stringify(reels));
  }, [reels]);

  useEffect(() => {
    localStorage.setItem('vibegram_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('vibegram_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('vibegram_highscores', JSON.stringify(highScores));
  }, [highScores]);

  useEffect(() => {
    localStorage.setItem('vibegram_user_balance', userBalance.toString());
  }, [userBalance]);

  useEffect(() => {
    localStorage.setItem('vibegram_platform_revenue', platformRevenue.toString());
  }, [platformRevenue]);

  useEffect(() => {
    localStorage.setItem('vibegram_donations', JSON.stringify(donationTransactions));
  }, [donationTransactions]);

  // Call duration timer & ringing connection
  useEffect(() => {
    let timer: number | null = null;
    let connectTimeout: number | null = null;

    if (callSession.isActive) {
      if (callSession.status === 'calling' || callSession.status === 'ringing') {
        sounds.startRinging();
        // Simulate peer answering after 3.5 seconds
        connectTimeout = window.setTimeout(() => {
          sounds.playCallConnected();
          setCallSession((prev) => ({
            ...prev,
            status: 'connected',
            startedAt: Date.now(),
          }));
        }, 3500);
      } else if (callSession.status === 'connected') {
        timer = window.setInterval(() => {
          setCallSession((prev) => ({
            ...prev,
            duration: prev.duration + 1,
          }));
        }, 1000);
      }
    } else {
      sounds.stopRinging();
    }

    return () => {
      if (timer) clearInterval(timer);
      if (connectTimeout) clearTimeout(connectTimeout);
      sounds.stopRinging();
    };
  }, [callSession.isActive, callSession.status]);

  // Username uniqueness and validation (case-insensitive)
  const isUsernameAvailable = (rawUsername: string, excludeUserId?: string): { available: boolean; reason?: string } => {
    const username = rawUsername.trim().toLowerCase();
    
    if (username.length < 3 || username.length > 30) {
      return { available: false, reason: 'Username must be between 3 and 30 characters.' };
    }
    
    // Alphanumeric, underscores, periods
    const validPattern = /^[a-z0-9._]+$/;
    if (!validPattern.test(username)) {
      return { available: false, reason: 'Only letters, numbers, periods, and underscores allowed.' };
    }

    // Check reserved system handles and prohibited vulgar/insulting terms
    const reservedCheck = isReservedUsername(username);
    if (reservedCheck.isReserved) {
      return { available: false, reason: reservedCheck.reason || 'This username is reserved or prohibited.' };
    }

    // Check against all users case-insensitively
    const takenInUsers = users.some(
      (u) => u.id !== excludeUserId && u.username.toLowerCase() === username
    );
    const takenInCurrent = currentUser.id !== excludeUserId && currentUser.username.toLowerCase() === username;

    if (takenInUsers || takenInCurrent) {
      return { available: false, reason: 'This username is already taken.' };
    }

    return { available: true };
  };

  const updateUserProfile = (data: {
    username: string;
    name: string;
    avatar: string;
    bio: string;
    customStatus?: string;
  }): { success: boolean; error?: string } => {
    const cleanUsername = data.username.trim().toLowerCase();
    const check = isUsernameAvailable(cleanUsername, currentUser.id);
    if (!check.available) {
      return { success: false, error: check.reason };
    }

    const updatedUser: User = {
      ...currentUser,
      username: cleanUsername,
      name: data.name.trim(),
      avatar: data.avatar.trim() || currentUser.avatar,
      bio: data.bio.trim(),
      customStatus: data.customStatus?.trim(),
    };

    setCurrentUser(updatedUser);

    // Sync user profile across reels, stories, and chats
    setStories((prev) =>
      prev.map((s) => (s.userId === currentUser.id ? { ...s, user: updatedUser } : s))
    );
    setReels((prev) =>
      prev.map((r) => (r.userId === currentUser.id ? { ...r, user: updatedUser } : r))
    );
    setChats((prev) =>
      prev.map((c) => ({
        ...c,
        participants: c.participants.map((p) => (p.id === currentUser.id ? updatedUser : p)),
      }))
    );

    return { success: true };
  };

  // User Actions
  const toggleFollowUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newFollowing = !u.isFollowing;
          return {
            ...u,
            isFollowing: newFollowing,
            followersCount: newFollowing ? u.followersCount + 1 : u.followersCount - 1,
          };
        }
        return u;
      })
    );
  };

  const viewUserProfile = (userId: string) => {
    setSelectedUserId(userId);
    setActiveTab('profile');
  };

  // Stories
  const openStoryViewer = (userId: string) => {
    // Unique users with stories
    const uniqueUserIds = Array.from(new Set(stories.map((s) => s.userId)));
    const index = uniqueUserIds.indexOf(userId);
    if (index !== -1) {
      setActiveStoryUserIndex(index);
    }
  };

  const closeStoryViewer = () => {
    setActiveStoryUserIndex(null);
  };

  const markStorySeen = (storyId: string) => {
    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, seen: true } : s))
    );
  };

  const likeStory = (storyId: string) => {
    sounds.playHeart();
    setStories((prev) =>
      prev.map((s) => {
        if (s.id === storyId) {
          const isLiked = !s.isLiked;
          return {
            ...s,
            isLiked,
            likes: isLiked ? s.likes + 1 : s.likes - 1,
          };
        }
        return s;
      })
    );
  };

  const votePoll = (storyId: string, stickerId: string, optionIndex: number) => {
    sounds.playSend();
    setStories((prev) =>
      prev.map((s) => {
        if (s.id !== storyId || !s.stickers) return s;
        return {
          ...s,
          stickers: s.stickers.map((stk) => {
            if (stk.id !== stickerId || stk.type !== 'poll') return stk;
            if (stk.userVotedIndex !== undefined) return stk; // already voted
            const newVotes = [...(stk.votes || [0, 0])];
            newVotes[optionIndex] = (newVotes[optionIndex] || 0) + 1;
            return {
              ...stk,
              votes: newVotes,
              userVotedIndex: optionIndex,
            };
          }),
        };
      })
    );
  };

  const addStory = (storyData: {
    mediaUrl: string;
    mediaType: 'image' | 'video';
    caption?: string;
    stickers?: StorySticker[];
    filter?: string;
  }) => {
    const newStory: Story = {
      id: `story_me_${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      mediaUrl: storyData.mediaUrl,
      mediaType: storyData.mediaType,
      caption: storyData.caption,
      stickers: storyData.stickers,
      filter: storyData.filter,
      createdAt: 'Just now',
      expiresAt: '24h left',
      seen: false,
      likes: 0,
    };
    setStories((prev) => [newStory, ...prev]);
    closeCreatorModal();
  };

  // Reels Actions
  const toggleLikeReel = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          const isLiked = !r.isLiked;
          if (isLiked) {
            sounds.playHeart();
          }
          return {
            ...r,
            isLiked,
            likesCount: isLiked ? r.likesCount + 1 : r.likesCount - 1,
          };
        }
        return r;
      })
    );
  };

  const toggleSaveReel = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) =>
        r.id === reelId ? { ...r, isSaved: !r.isSaved } : r
      )
    );
  };

  const addReelComment = (reelId: string, text: string) => {
    if (!text.trim()) return;
    const newComment = {
      id: `rc_${Date.now()}`,
      user: currentUser,
      text: text.trim(),
      createdAt: 'Just now',
      likesCount: 0,
    };
    sounds.playSend();
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          return {
            ...r,
            commentsCount: r.commentsCount + 1,
            comments: [newComment, ...r.comments],
          };
        }
        return r;
      })
    );
  };

  const addReel = (newReelData: {
    videoUrl: string;
    caption: string;
    tags: string[];
    music: { title: string; artist: string };
  }) => {
    const newReel: Reel = {
      id: `reel_${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      videoUrl: newReelData.videoUrl,
      caption: newReelData.caption,
      tags: newReelData.tags,
      music: newReelData.music,
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: true,
      isSaved: false,
      comments: [],
      createdAt: 'Just now',
    };
    setReels((prev) => [newReel, ...prev]);
    closeCreatorModal();
    setActiveTab('reels');
  };

  // Chat Actions
  const openChatWithUser = (user: User) => {
    let chat = chats.find((c) =>
      c.participants.some((p) => p.id === user.id)
    );
    if (!chat) {
      const newChatId = `chat_${user.id}_${Date.now()}`;
      const newChat: Chat = {
        id: newChatId,
        participants: [currentUser, user],
        unreadCount: 0,
      };
      setChats((prev) => [newChat, ...prev]);
      setMessages((prev) => ({ ...prev, [newChatId]: [] }));
      setActiveChatId(newChatId);
    } else {
      setActiveChatId(chat.id);
      // mark as read
      setChats((prev) =>
        prev.map((c) => (c.id === chat?.id ? { ...c, unreadCount: 0 } : c))
      );
    }
    setActiveTab('chat');
  };

  const closeChat = () => {
    setActiveChatId(null);
  };

  const sendMessage = ({
    chatId,
    text,
    mediaUrl,
    mediaType = 'text',
    voiceDuration,
    gameData,
    callData,
  }: {
    chatId: string;
    text?: string;
    mediaUrl?: string;
    mediaType?: 'text' | 'image' | 'voice' | 'game_result' | 'call_event';
    voiceDuration?: number;
    gameData?: ChatMessage['gameData'];
    callData?: ChatMessage['callData'];
  }) => {
    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      chatId,
      senderId: currentUser.id,
      text,
      mediaUrl,
      mediaType,
      voiceDuration,
      gameData,
      callData,
      reactions: {},
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };

    sounds.playSend();

    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMsg],
    }));

    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId ? { ...c, lastMessage: newMsg, unreadCount: 0 } : c
      )
    );

    // Realistic auto-reply trigger if messaging another mock contact
    const targetChat = chats.find((c) => c.id === chatId);
    const peerUser = targetChat?.participants.find((p) => p.id !== currentUser.id);

    if (peerUser && mediaType !== 'call_event') {
      // Show typing indicator
      setTimeout(() => {
        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId ? { ...c, isTyping: true, typingUser: peerUser.name } : c
          )
        );
      }, 1000);

      setTimeout(() => {
        setChats((prev) =>
          prev.map((c) => (c.id === chatId ? { ...c, isTyping: false } : c))
        );

        let replyText = 'Love this vibe! ✨';
        let replyMediaType: ChatMessage['mediaType'] = 'text';
        let replyVoiceDuration: number | undefined;

        if (mediaType === 'voice') {
          replyText = 'Listening to your voice mail right now! Sounds super cool 🎙️';
        } else if (mediaType === 'game_result') {
          replyText = `Challenge accepted! ${gameData?.score} is a solid score, let me try to beat it! 🔥`;
        } else if (text?.toLowerCase().includes('call') || text?.toLowerCase().includes('video')) {
          replyText = 'Ready when you are! Hit the video call button above 🎥';
        } else if (text?.toLowerCase().includes('reels') || text?.toLowerCase().includes('story')) {
          replyText = 'Just saw your new post, the aesthetic is amazing!';
        } else if (text?.toLowerCase().includes('hello') || text?.toLowerCase().includes('hey')) {
          replyText = `Hey ${currentUser.name}! How are you doing today?`;
        } else {
          const replies = [
            'That is so cool! Thanks for sharing 🙌',
            'Haha totally agree with you on that! 😂',
            'Let’s catch up soon, or jump on a quick call later!',
            'Sending you good vibes! ✨',
          ];
          replyText = replies[Math.floor(Math.random() * replies.length)];
        }

        const replyMsg: ChatMessage = {
          id: `m_reply_${Date.now()}`,
          chatId,
          senderId: peerUser.id,
          text: replyText,
          mediaType: replyMediaType,
          voiceDuration: replyVoiceDuration,
          reactions: {},
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
        };

        sounds.playNotification();

        setMessages((prev) => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), replyMsg],
        }));

        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  lastMessage: replyMsg,
                  unreadCount: activeChatId === chatId ? 0 : c.unreadCount + 1,
                }
              : c
          )
        );
      }, 3000);
    }
  };

  const reactToMessage = (chatId: string, messageId: string, emoji: string) => {
    sounds.playHeart();
    setMessages((prev) => {
      const chatMsgs = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: chatMsgs.map((m) => {
          if (m.id !== messageId) return m;
          const currentReactions = { ...m.reactions };
          const userList = currentReactions[emoji] || [];
          if (userList.includes(currentUser.id)) {
            // remove
            currentReactions[emoji] = userList.filter((id) => id !== currentUser.id);
            if (currentReactions[emoji].length === 0) {
              delete currentReactions[emoji];
            }
          } else {
            // add
            currentReactions[emoji] = [...userList, currentUser.id];
          }
          return { ...m, reactions: currentReactions };
        }),
      };
    });
  };

  // Calling
  const startCall = (user: User, type: 'audio' | 'video') => {
    setCallSession({
      isActive: true,
      peerUser: user,
      type,
      status: 'calling',
      duration: 0,
      isMuted: false,
      isCameraOff: false,
      isScreenSharing: false,
      filter: 'none',
      isMinimized: false,
    });
  };

  const endCall = () => {
    const peer = callSession.peerUser;
    const duration = callSession.duration;
    const type = callSession.type;

    sounds.playCallEnded();

    if (peer) {
      // Find chat to log call event
      const targetChat = chats.find((c) =>
        c.participants.some((p) => p.id === peer.id)
      );
      if (targetChat) {
        const durationText =
          duration > 0
            ? `${Math.floor(duration / 60)}m ${duration % 60}s`
            : 'Missed';
        sendMessage({
          chatId: targetChat.id,
          mediaType: 'call_event',
          callData: {
            type,
            duration,
            status: duration > 0 ? 'completed' : 'missed',
          },
          text: `${type === 'video' ? 'Video' : 'Audio'} call ended • ${durationText}`,
        });
      }

      // If call was short or missed, offer to leave voice mail!
      if (duration < 5) {
        setVoiceMailPromptPeer(peer);
      }
    }

    setCallSession({
      isActive: false,
      peerUser: null,
      type: 'video',
      status: 'ended',
      duration: 0,
      isMuted: false,
      isCameraOff: false,
      isScreenSharing: false,
      filter: 'none',
      isMinimized: false,
    });
  };

  const toggleMute = () => {
    setCallSession((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const toggleCamera = () => {
    setCallSession((prev) => ({ ...prev, isCameraOff: !prev.isCameraOff }));
  };

  const toggleScreenShare = () => {
    setCallSession((prev) => ({ ...prev, isScreenSharing: !prev.isScreenSharing }));
  };

  const setCallFilter = (filter: CallSession['filter']) => {
    setCallSession((prev) => ({ ...prev, filter }));
  };

  const toggleMinimizeCall = () => {
    setCallSession((prev) => ({ ...prev, isMinimized: !prev.isMinimized }));
  };

  // Games
  const openGame = (gameId: string) => {
    setActiveGameId(gameId);
  };

  const closeGame = () => {
    setActiveGameId(null);
  };

  const saveHighScore = (gameId: string, score: number) => {
    setHighScores((prev) => {
      const current = prev[gameId] || 0;
      if (score > current) {
        return { ...prev, [gameId]: score };
      }
      return prev;
    });
  };

  const shareGameToChat = (chatId: string, gameId: string, gameTitle: string, score: number) => {
    sendMessage({
      chatId,
      mediaType: 'game_result',
      gameData: {
        gameId,
        gameTitle,
        score,
        highScore: highScores[gameId] || score,
      },
      text: `I just scored ${score} in ${gameTitle}! Beat my score! 🕹️`,
    });
  };

  // Modals
  const openCreatorModal = (type: 'story' | 'reel') => {
    setCreatorModal(type);
  };

  const closeCreatorModal = () => {
    setCreatorModal(null);
  };

  const openAIMusicModal = () => {
    setIsAIMusicModalOpen(true);
  };

  const closeAIMusicModal = () => {
    setIsAIMusicModalOpen(false);
  };

  const openVideoStudio = () => {
    setIsVideoStudioOpen(true);
  };

  const closeVideoStudio = () => {
    setIsVideoStudioOpen(false);
  };

  const openVoiceMailPrompt = (peer: User) => {
    setVoiceMailPromptPeer(peer);
  };

  const closeVoiceMailPrompt = () => {
    setVoiceMailPromptPeer(null);
  };

  // Donations & Voice Comments
  const topUpBalance = (amount: number) => {
    setUserBalance((prev) => Number((prev + amount).toFixed(2)));
    sounds.playGamePoint();
  };

  const openDonationModal = (target?: Reel | { reel?: Reel; user?: User }) => {
    if (target && 'videoUrl' in target) {
      setDonationTargetReel(target as Reel);
      setDonationTargetUser((target as Reel).user || null);
    } else if (target && typeof target === 'object') {
      setDonationTargetReel(target.reel || null);
      setDonationTargetUser(target.user || target.reel?.user || null);
    } else {
      setDonationTargetReel(null);
      setDonationTargetUser(null);
    }
    setIsDonationModalOpen(true);
  };

  const closeDonationModal = () => {
    setIsDonationModalOpen(false);
    setDonationTargetReel(null);
    setDonationTargetUser(null);
  };

  const openPermissionsModal = () => {
    setIsPermissionsModalOpen(true);
  };

  const closePermissionsModal = () => {
    setIsPermissionsModalOpen(false);
  };

  const donateWithVoiceComment = (payload: {
    reelId?: string;
    creatorId: string;
    amount: number;
    message?: string;
    voiceUrl?: string;
    voiceDuration?: number;
  }): { success: boolean; error?: string } => {
    if (payload.amount <= 0) {
      return { success: false, error: 'Donation amount must be greater than $0' };
    }

    if (userBalance < payload.amount) {
      return { success: false, error: 'Insufficient wallet balance. Please top up your wallet!' };
    }

    const creator = users.find((u) => u.id === payload.creatorId) || currentUser;

    // Platform fee calculation: exactly 5% goes to me / platform
    const platformFee = Number((payload.amount * 0.05).toFixed(2));
    const creatorShare = Number((payload.amount - platformFee).toFixed(2));

    // Deduct user balance and credit platform revenue
    setUserBalance((prev) => Number((prev - payload.amount).toFixed(2)));
    setPlatformRevenue((prev) => Number((prev + platformFee).toFixed(2)));

    // Create transaction log
    const transaction: DonationTransaction = {
      id: `tx_${Date.now()}`,
      reelId: payload.reelId,
      donorUser: currentUser,
      creatorUser: creator,
      totalAmount: payload.amount,
      creatorShare,
      platformFee,
      voiceUrl: payload.voiceUrl,
      voiceDuration: payload.voiceDuration,
      message: payload.message,
      createdAt: 'Just now',
    };

    setDonationTransactions((prev) => [transaction, ...prev]);

    // If attached to a reel, add highlighted donation comment
    if (payload.reelId) {
      const donationComment: ReelComment = {
        id: `rc_donation_${Date.now()}`,
        user: currentUser,
        text: payload.message || `⭐ Donated $${payload.amount.toFixed(2)} with a Voice Comment!`,
        createdAt: 'Just now',
        likesCount: 1,
        isDonation: true,
        donationAmount: payload.amount,
        creatorShare,
        platformFee,
        voiceUrl: payload.voiceUrl,
        voiceDuration: payload.voiceDuration,
      };

      setReels((prev) =>
        prev.map((r) =>
          r.id === payload.reelId
            ? {
                ...r,
                commentsCount: r.commentsCount + 1,
                comments: [donationComment, ...r.comments],
              }
            : r
        )
      );
    }

    // Play celebration audio and sounds
    sounds.playGamePoint();
    closeDonationModal();

    return { success: true };
  };

  // Subscription methods ($27/mo Premium, $50-$55/mo VIP)
  const subscribeToTier = (tier: SubscriptionTier, customPrice?: number): { success: boolean; error?: string } => {
    const price = customPrice !== undefined ? customPrice : tier === 'vip' ? 52 : tier === 'premium' ? 27 : 0;
    const viewsMultiplier = tier === 'vip' ? 100 : tier === 'premium' ? 25 : 1;
    const profileViewsBoost = tier === 'vip' ? 50 : tier === 'premium' ? 10 : 1;
    const likesBoostMultiplier = tier === 'vip' ? 15 : tier === 'premium' ? 5 : 1;

    const newSub: UserSubscription = {
      tier,
      status: tier !== 'free' ? 'active' : 'none',
      price,
      billingPeriod: 'monthly',
      startDate: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      autoRenew: true,
      viewsMultiplier,
      profileViewsBoost,
      likesBoostMultiplier,
    };

    setUserSubscription(newSub);
    setCurrentUser((prev) => ({
      ...prev,
      subscriptionTier: tier,
      isVipSpotlight: tier === 'vip',
      isVerified: tier !== 'free' ? true : prev.isVerified,
    }));

    if (tier !== 'free') {
      sounds.playBoostSurge();
    }
    return { success: true };
  };

  const cancelSubscription = () => {
    setUserSubscription((prev) => ({ ...prev, status: 'canceled', autoRenew: false }));
  };

  const boostProfilePageViewsAndLikes = (): { viewsAdded: number; likesAdded: number } => {
    const isVip = userSubscription.tier === 'vip';
    const isPremium = userSubscription.tier === 'premium';
    const multiplier = isVip ? 50 : isPremium ? 15 : 2;

    const viewsAdded = Math.floor(Math.random() * 800 * multiplier) + multiplier * 250;
    const likesAdded = Math.floor(Math.random() * 200 * (multiplier / 2)) + multiplier * 40;

    setCurrentUser((prev) => ({
      ...prev,
      profileViewsCount: (prev.profileViewsCount || 1000) + viewsAdded,
      totalLikesReceived: (prev.totalLikesReceived || 500) + likesAdded,
    }));

    setReels((prev) =>
      prev.map((r) =>
        r.userId === currentUser.id
          ? {
              ...r,
              viewsCount: (r.viewsCount || 500) + Math.floor(viewsAdded / 3),
              likesCount: r.likesCount + Math.floor(likesAdded / 3),
              isVipBoosted: isVip,
              isPremiumBoosted: isPremium,
            }
          : r
      )
    );

    sounds.playBoostSurge();
    return { viewsAdded, likesAdded };
  };

  // Disappearing Ghost Presence
  const [isGhostPresence, setIsGhostPresence] = useState<boolean>(() => {
    return localStorage.getItem('musher_ghost_presence') === 'true';
  });

  const toggleGhostPresence = () => {
    setIsGhostPresence((prev) => {
      const next = !prev;
      localStorage.setItem('musher_ghost_presence', String(next));
      sounds.playTap();
      return next;
    });
  };

  // Secret Vault
  const [secretVaultPin, setSecretVaultPinState] = useState<string>(() => {
    return localStorage.getItem('musher_secret_pin') || '1234';
  });
  const [isSecretVaultUnlocked, setIsSecretVaultUnlocked] = useState<boolean>(false);

  const unlockSecretVault = (pin: string): boolean => {
    if (pin === secretVaultPin) {
      setIsSecretVaultUnlocked(true);
      sounds.playCapsuleUnlock();
      return true;
    }
    sounds.playWarningBeep();
    return false;
  };

  const lockSecretVault = () => {
    setIsSecretVaultUnlocked(false);
    sounds.playTap();
  };

  const setSecretVaultPin = (newPin: string) => {
    setSecretVaultPinState(newPin);
    localStorage.setItem('musher_secret_pin', newPin);
  };

  const toggleChatSecretStatus = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          return { ...c, isSecretInbox: !c.isSecretInbox };
        }
        return c;
      })
    );
    sounds.playTap();
  };

  // Time Capsule
  const sendTimeCapsule = (payload: {
    chatId: string;
    title: string;
    revealedText: string;
    unlockDate: string;
    theme: 'birthday' | 'anniversary' | 'future_letter' | 'secret';
  }) => {
    const newMsg: ChatMessage = {
      id: `m_capsule_${Date.now()}`,
      chatId: payload.chatId,
      senderId: currentUser.id,
      text: `Sent a Time Capsule: "${payload.title}" ⏳`,
      mediaType: 'time_capsule',
      timeCapsule: {
        title: payload.title,
        revealedText: payload.revealedText,
        unlockDate: payload.unlockDate,
        theme: payload.theme,
        senderName: currentUser.name,
        isUnlocked: false,
      },
      reactions: {},
      isStar: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };

    sounds.playSend();

    setMessages((prev) => ({
      ...prev,
      [payload.chatId]: [...(prev[payload.chatId] || []), newMsg],
    }));

    setChats((prev) =>
      prev.map((c) =>
        c.id === payload.chatId
          ? {
              ...c,
              lastMessage: newMsg,
              streakCount: (c.streakCount || 0) + 1,
              meaningfulScore: Math.min(100, (c.meaningfulScore || 70) + 5),
            }
          : c
      )
    );
  };

  const unlockTimeCapsule = (chatId: string, messageId: string) => {
    setMessages((prev) => {
      const chatMsgs = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: chatMsgs.map((m) => {
          if (m.id === messageId && m.timeCapsule) {
            return {
              ...m,
              timeCapsule: {
                ...m.timeCapsule,
                isUnlocked: true,
              },
            };
          }
          return m;
        }),
      };
    });
    sounds.playCapsuleUnlock();
  };

  // Star message in Message Universe
  const toggleStarMessage = (chatId: string, messageId: string) => {
    setMessages((prev) => {
      const list = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: list.map((m) => (m.id === messageId ? { ...m, isStar: !m.isStar } : m)),
      };
    });
    sounds.playTap();
  };

  // Unsent Drafts & Journal
  const [unsentDrafts, setUnsentDrafts] = useState<UnsentMessageDraft[]>(() => {
    const saved = localStorage.getItem('musher_unsent_drafts');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'draft_1',
            chatId: 'chat_sofia',
            text: 'I was thinking of telling you how much your creative advice helped my confidence this year...',
            createdAt: 'Yesterday',
            isJournalEntry: true,
          },
        ];
  });

  useEffect(() => {
    localStorage.setItem('musher_unsent_drafts', JSON.stringify(unsentDrafts));
  }, [unsentDrafts]);

  const saveUnsentDraft = (chatId: string, text: string) => {
    if (!text.trim()) return;
    const newDraft: UnsentMessageDraft = {
      id: `draft_${Date.now()}`,
      chatId,
      text: text.trim(),
      createdAt: 'Just now',
      isJournalEntry: false,
    };
    setUnsentDrafts((prev) => [newDraft, ...prev]);
    sounds.playTap();
  };

  const deleteUnsentDraft = (draftId: string) => {
    setUnsentDrafts((prev) => prev.filter((d) => d.id !== draftId));
  };

  const toggleDraftJournal = (draftId: string) => {
    setUnsentDrafts((prev) =>
      prev.map((d) => (d.id === draftId ? { ...d, isJournalEntry: !d.isJournalEntry } : d))
    );
    sounds.playTap();
  };

  // Reactions 2.0 (Video & Voice reactions)
  const addVideoReaction = (chatId: string, messageId: string, videoUrl: string) => {
    setMessages((prev) => {
      const list = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: list.map((m) => {
          if (m.id === messageId) {
            const current = m.videoReactions || [];
            return {
              ...m,
              videoReactions: [...current, { id: `vr_${Date.now()}`, userId: currentUser.id, videoUrl }],
            };
          }
          return m;
        }),
      };
    });
    sounds.playGamePoint();
  };

  const addVoiceReaction = (chatId: string, messageId: string, duration: number) => {
    setMessages((prev) => {
      const list = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: list.map((m) => {
          if (m.id === messageId) {
            const current = m.voiceReactions || [];
            return {
              ...m,
              voiceReactions: [
                ...current,
                { id: `ar_${Date.now()}`, userId: currentUser.id, userName: currentUser.name, duration },
              ],
            };
          }
          return m;
        }),
      };
    });
    sounds.playSend();
  };

  // Digital Emotion Cards
  const sendDigitalEmotion = (payload: {
    chatId: string;
    emotion: DigitalEmotionData['emotion'];
    intensity: number;
    prompt: string;
  }) => {
    const newMsg: ChatMessage = {
      id: `m_emo_${Date.now()}`,
      chatId: payload.chatId,
      senderId: currentUser.id,
      text: `Sent a Digital Emotion Card: ${payload.emotion.toUpperCase()}`,
      mediaType: 'digital_emotion',
      digitalEmotion: {
        emotion: payload.emotion,
        intensity: payload.intensity,
        prompt: payload.prompt,
        supportResponses: [],
      },
      reactions: {},
      isStar: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };
    sounds.playSend();
    setMessages((prev) => ({ ...prev, [payload.chatId]: [...(prev[payload.chatId] || []), newMsg] }));
    setChats((prev) =>
      prev.map((c) =>
        c.id === payload.chatId
          ? {
              ...c,
              lastMessage: newMsg,
              streakCount: (c.streakCount || 0) + 1,
              meaningfulScore: Math.min(100, (c.meaningfulScore || 70) + 4),
            }
          : c
      )
    );
  };

  const respondToEmotion = (chatId: string, messageId: string, text: string, emoji: string) => {
    setMessages((prev) => {
      const list = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: list.map((m) => {
          if (m.id === messageId && m.digitalEmotion) {
            const responses = m.digitalEmotion.supportResponses || [];
            return {
              ...m,
              digitalEmotion: {
                ...m.digitalEmotion,
                supportResponses: [
                  ...responses,
                  { userId: currentUser.id, userName: currentUser.name, text, emoji },
                ],
              },
            };
          }
          return m;
        }),
      };
    });
    sounds.playHeart();
  };

  // Decision Poll
  const voteDecisionPoll = (chatId: string, messageId: string, optionId: string) => {
    setMessages((prev) => {
      const list = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: list.map((m) => {
          if (m.id === messageId && m.decisionPoll) {
            const newOptions = m.decisionPoll.options.map((opt) => {
              if (opt.id === optionId) {
                const hasVoted = opt.votes.includes(currentUser.id);
                return {
                  ...opt,
                  votes: hasVoted
                    ? opt.votes.filter((id) => id !== currentUser.id)
                    : [...opt.votes, currentUser.id],
                };
              }
              return opt;
            });
            return {
              ...m,
              decisionPoll: { ...m.decisionPoll, options: newOptions },
            };
          }
          return m;
        }),
      };
    });
    sounds.playTap();
  };

  const closeDecisionPoll = (chatId: string, messageId: string) => {
    setMessages((prev) => {
      const list = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: list.map((m) => {
          if (m.id === messageId && m.decisionPoll) {
            let topOption = m.decisionPoll.options[0]?.text || '';
            let maxVotes = -1;
            m.decisionPoll.options.forEach((opt) => {
              if (opt.votes.length > maxVotes) {
                maxVotes = opt.votes.length;
                topOption = opt.text;
              }
            });
            return {
              ...m,
              decisionPoll: {
                ...m.decisionPoll,
                closed: true,
                winnerOption: topOption,
              },
            };
          }
          return m;
        }),
      };
    });
    sounds.playGamePoint();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        updateUserProfile,
        isUsernameAvailable,
        users,
        toggleFollowUser,
        activeTab,
        setActiveTab,
        selectedUserId,
        viewUserProfile,
        stories,
        activeStoryUserIndex,
        openStoryViewer,
        closeStoryViewer,
        addStory,
        markStorySeen,
        likeStory,
        votePoll,
        reels,
        toggleLikeReel,
        toggleSaveReel,
        addReelComment,
        addReel,
        chats,
        messages,
        activeChatId,
        openChatWithUser,
        closeChat,
        sendMessage,
        reactToMessage,
        callSession,
        startCall,
        endCall,
        toggleMute,
        toggleCamera,
        toggleScreenShare,
        setCallFilter,
        toggleMinimizeCall,
        activeGameId,
        openGame,
        closeGame,
        shareGameToChat,
        highScores,
        saveHighScore,
        creatorModal,
        openCreatorModal,
        closeCreatorModal,
        isAIMusicModalOpen,
        openAIMusicModal,
        closeAIMusicModal,
        isVideoStudioOpen,
        openVideoStudio,
        closeVideoStudio,
        voiceMailPromptPeer,
        openVoiceMailPrompt,
        closeVoiceMailPrompt,
        userBalance,
        topUpBalance,
        platformRevenue,
        donationTransactions,
        donateWithVoiceComment,
        isDonationModalOpen,
        donationTargetReel,
        donationTargetUser,
        openDonationModal,
        closeDonationModal,
        isPermissionsModalOpen,
        openPermissionsModal,
        closePermissionsModal,
        isFeedbackModalOpen,
        feedbackInitialTab,
        feedbackReportContext,
        openFeedbackModal,
        closeFeedbackModal,
        userFeedbacks,
        userReports,
        submitFeedback,
        submitReport,
        userSubscription,
        isSubscriptionModalOpen,
        openSubscriptionModal,
        closeSubscriptionModal,
        subscribeToTier,
        cancelSubscription,
        boostProfilePageViewsAndLikes,
        sendTimeCapsule,
        unlockTimeCapsule,
        toggleStarMessage,
        isGhostPresence,
        toggleGhostPresence,
        isSecretVaultUnlocked,
        secretVaultPin,
        unlockSecretVault,
        lockSecretVault,
        setSecretVaultPin,
        toggleChatSecretStatus,
        unsentDrafts,
        saveUnsentDraft,
        deleteUnsentDraft,
        toggleDraftJournal,
        addVideoReaction,
        addVoiceReaction,
        sendDigitalEmotion,
        respondToEmotion,
        voteDecisionPoll,
        closeDecisionPoll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
