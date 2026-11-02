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
    return saved ? JSON.parse(saved) : { flappy: 35, emoji_catcher: 42, trivia: 80 };
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
