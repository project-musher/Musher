import { Reel, Story, User } from '../types';

export interface UserEngagementProfile {
  followedUserIds: string[];
  interactedUserIds: string[]; // chats, profile visits, reactions
  likedReelIds: string[];
  savedReelIds: string[];
  commentedReelIds: string[];
  favoriteTags: { [tag: string]: number }; // tag -> engagement score weight
}

export type FeedSortMode = 'for_you' | 'following' | 'trending';

/**
 * Calculates user tag preferences based on previously liked/saved/commented reels
 */
export function buildUserEngagementProfile(
  currentUser: User,
  allUsers: User[],
  reels: Reel[],
  chatPeerIds: string[]
): UserEngagementProfile {
  const followedUserIds = allUsers.filter((u) => u.isFollowing).map((u) => u.id);
  
  const likedReelIds = reels.filter((r) => r.isLiked).map((r) => r.id);
  const savedReelIds = reels.filter((r) => r.isSaved).map((r) => r.id);
  const commentedReelIds = reels
    .filter((r) => r.comments.some((c) => c.user.id === currentUser.id))
    .map((r) => r.id);

  // Compute tag affinity weights
  const favoriteTags: { [tag: string]: number } = {};

  reels.forEach((r) => {
    let weight = 0;
    if (r.isLiked) weight += 3;
    if (r.isSaved) weight += 4;
    if (r.comments.some((c) => c.user.id === currentUser.id)) weight += 5;

    if (weight > 0) {
      r.tags.forEach((tag) => {
        const cleanTag = tag.toLowerCase();
        favoriteTags[cleanTag] = (favoriteTags[cleanTag] || 0) + weight;
      });
    }
  });

  return {
    followedUserIds,
    interactedUserIds: Array.from(new Set([...followedUserIds, ...chatPeerIds])),
    likedReelIds,
    savedReelIds,
    commentedReelIds,
    favoriteTags,
  };
}

/**
 * Score and sort reels using an engagement & relationship-based algorithm
 */
export function rankReelsForFeed(
  reels: Reel[],
  profile: UserEngagementProfile,
  sortMode: FeedSortMode = 'for_you'
): { reel: Reel; score: number; reason: string }[] {
  if (sortMode === 'trending') {
    return [...reels]
      .sort((a, b) => b.likesCount + b.commentsCount * 2 - (a.likesCount + a.commentsCount * 2))
      .map((reel) => ({
        reel,
        score: reel.likesCount,
        reason: 'Trending now based on overall community likes and comments',
      }));
  }

  if (sortMode === 'following') {
    return [...reels]
      .filter((r) => profile.followedUserIds.includes(r.userId))
      .map((reel) => ({
        reel,
        score: 100,
        reason: 'From an account you follow',
      }));
  }

  // 'for_you' algorithm:
  // 1. Prioritize followed accounts (+50 pts)
  // 2. Prioritize accounts engaged with in DMs / comments (+30 pts)
  // 3. Match content tags with user's favorite tags (+15 pts per match)
  // 4. Overall popularity signal (likes / 1000 + comments / 100)
  // 5. Freshness bonus
  const scored = reels.map((reel) => {
    let score = 0;
    const reasons: string[] = [];

    // Followed account
    if (profile.followedUserIds.includes(reel.userId)) {
      score += 60;
      reasons.push(`Followed creator @${reel.user.username}`);
    } else if (profile.interactedUserIds.includes(reel.userId)) {
      score += 35;
      reasons.push(`Frequent interactions with @${reel.user.username}`);
    }

    // Tag and topic affinity
    let tagMatches = 0;
    reel.tags.forEach((tag) => {
      const cleanTag = tag.toLowerCase();
      if (profile.favoriteTags[cleanTag]) {
        score += profile.favoriteTags[cleanTag] * 4;
        tagMatches++;
      }
    });

    if (tagMatches > 0) {
      reasons.push(`Matches your interest in ${reel.tags.slice(0, 2).join(' ')}`);
    }

    // Engagement volume
    score += (reel.likesCount / 500) + (reel.commentsCount / 50);

    // If already liked, slight ranking penalty to promote discovery
    if (reel.isLiked) {
      score += 5; // still high but allow fresh content
    } else {
      score += 15; // unseen discovery boost
    }

    return {
      reel,
      score,
      reason: reasons[0] || 'Recommended for your feed based on engagement',
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}

/**
 * Score and sort stories in top bar
 * - Unseen stories from followed users come first
 * - Ranked by direct message & mutual engagement
 * - Then seen stories
 */
export function rankStoriesForBar(
  stories: Story[],
  profile: UserEngagementProfile,
  currentUserId: string
): { userId: string; user: User; stories: Story[]; hasUnseen: boolean; score: number }[] {
  // Group stories by user
  const groupedByUser: { [userId: string]: { user: User; stories: Story[] } } = {};

  stories.forEach((s) => {
    if (!groupedByUser[s.userId]) {
      groupedByUser[s.userId] = {
        user: s.user,
        stories: [],
      };
    }
    groupedByUser[s.userId].stories.push(s);
  });

  const list = Object.entries(groupedByUser).map(([userId, group]) => {
    const hasUnseen = group.stories.some((st) => !st.seen);
    let score = 0;

    if (userId === currentUserId) {
      score = 9999; // Your story is always first
    } else {
      // Prioritize followed accounts
      if (profile.followedUserIds.includes(userId)) score += 100;
      // Prioritize active DM contacts
      if (profile.interactedUserIds.includes(userId)) score += 50;
      // Unseen stories rank higher
      if (hasUnseen) score += 200;
      // Aggregate likes
      const totalLikes = group.stories.reduce((acc, st) => acc + (st.likes || 0), 0);
      score += totalLikes * 0.1;
    }

    return {
      userId,
      user: group.user,
      stories: group.stories,
      hasUnseen,
      score,
    };
  });

  // Sort descending
  return list.sort((a, b) => b.score - a.score);
}
