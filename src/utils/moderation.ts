/**
 * Content Moderation & Safety Utility for Vibegram
 * Prevents insulting, abusive, harassing, and vulgar ("valgus") language.
 * Checks reserved system usernames and provides real-time warnings.
 */

// Reserved system usernames that regular users cannot claim or impersonate
export const RESERVED_USERNAMES = [
  'admin',
  'administrator',
  'moderator',
  'mod',
  'official',
  'support',
  'help',
  'root',
  'system',
  'vibegram',
  'vibe_official',
  'security',
  'staff',
  'safety',
  'compliance',
  'billing',
  'api',
  'verified',
  'null',
  'undefined',
  'anonymous',
];

// Vulgar terms, explicit profanities, and slurs
export const VULGAR_TERMS = [
  'fuck',
  'fucking',
  'fucker',
  'shit',
  'shitty',
  'bitch',
  'bitches',
  'asshole',
  'bastard',
  'cunt',
  'dick',
  'cock',
  'pussy',
  'slut',
  'whore',
  'motherfucker',
  'valgus', // common user typo / variant for vulgar
  'porn',
  'porno',
  'nude',
  'nudes',
  'sex',
  'boobs',
  'tits',
  'penis',
  'vagina',
];

// Insulting, abusive, bullying, and harassing terms
export const INSULTING_TERMS = [
  'idiot',
  'moron',
  'loser',
  'stupid',
  'ugly',
  'trash',
  'dumb',
  'dumbass',
  'retard',
  'retarded',
  'fatso',
  'worthless',
  'disgusting',
  'pathetic',
  'kill yourself',
  'kys',
  'stfu',
  'shut up',
  'hate you',
  'hate u',
  'die',
  'clown',
  'scum',
  'jerk',
  'creep',
  'pig',
  'freak',
];

export interface ModerationResult {
  isClean: boolean;
  hasVulgarity: boolean;
  hasInsult: boolean;
  hasProhibited: boolean;
  flaggedWords: string[];
  severity: 'none' | 'warning' | 'blocked';
  warningTitle: string;
  warningMessage: string;
}

/**
 * Normalizes text to catch obfuscated / leetspeak profanity
 * (e.g. "b!tch" -> "bitch", "f*ck" -> "fuck", "a$$hole" -> "asshole", "sh1t" -> "shit")
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[@]/g, 'a')
    .replace(/[$]/g, 's')
    .replace(/[!|1]/g, 'i')
    .replace(/[0]/g, 'o')
    .replace(/[3]/g, 'e')
    .replace(/[*#^]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks text against community safety guidelines.
 * Returns detailed moderation status and user-facing warning messages.
 */
export function checkContentModeration(rawText: string): ModerationResult {
  if (!rawText || !rawText.trim()) {
    return {
      isClean: true,
      hasVulgarity: false,
      hasInsult: false,
      hasProhibited: false,
      flaggedWords: [],
      severity: 'none',
      warningTitle: '',
      warningMessage: '',
    };
  }

  const normalized = normalizeText(rawText);
  // Also check individual word tokens
  const words = normalized.split(/[\s,.;:!?_/\-\(\)\[\]{}]+/);

  const detectedVulgar: string[] = [];
  const detectedInsult: string[] = [];

  // Check vulgar terms
  VULGAR_TERMS.forEach((term) => {
    const termRegex = new RegExp(`\\b${term}\\b`, 'i');
    if (termRegex.test(normalized) || words.includes(term)) {
      if (!detectedVulgar.includes(term)) detectedVulgar.push(term);
    }
  });

  // Check insulting terms
  INSULTING_TERMS.forEach((term) => {
    if (term.includes(' ')) {
      // multi-word phrase like "kill yourself", "shut up", "hate you"
      if (normalized.includes(term)) {
        if (!detectedInsult.includes(term)) detectedInsult.push(term);
      }
    } else {
      const termRegex = new RegExp(`\\b${term}\\b`, 'i');
      if (termRegex.test(normalized) || words.includes(term)) {
        if (!detectedInsult.includes(term)) detectedInsult.push(term);
      }
    }
  });

  const allFlagged = Array.from(new Set([...detectedVulgar, ...detectedInsult]));
  const isClean = allFlagged.length === 0;

  if (isClean) {
    return {
      isClean: true,
      hasVulgarity: false,
      hasInsult: false,
      hasProhibited: false,
      flaggedWords: [],
      severity: 'none',
      warningTitle: '',
      warningMessage: '',
    };
  }

  let warningTitle = '⚠️ Community Safety Warning';
  let warningMessage = 'Please ensure your message follows our respectful community guidelines.';

  if (detectedVulgar.length > 0 && detectedInsult.length > 0) {
    warningTitle = '🚫 Vulgar & Insulting Language Detected';
    warningMessage = 'Vulgarity and personal insults are strictly prohibited. Please rephrase respectfully.';
  } else if (detectedVulgar.length > 0) {
    warningTitle = '🚫 Vulgar Language Prohibited';
    warningMessage = 'Vulgar or explicit terms are not allowed on Vibegram. Please remove vulgar language.';
  } else if (detectedInsult.length > 0) {
    warningTitle = '⚠️ Insulting Language Prohibited';
    warningMessage = 'Insulting or abusive remarks violate our Anti-Bullying policy. Please keep comments kind.';
  }

  return {
    isClean: false,
    hasVulgarity: detectedVulgar.length > 0,
    hasInsult: detectedInsult.length > 0,
    hasProhibited: true,
    flaggedWords: allFlagged,
    severity: 'blocked',
    warningTitle,
    warningMessage,
  };
}

/**
 * Automatically sanitizes offensive or vulgar words with asterisks or polite words
 */
export function sanitizeModeratedText(rawText: string): string {
  let cleaned = rawText;
  const allTerms = [...VULGAR_TERMS, ...INSULTING_TERMS];

  allTerms.forEach((term) => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    cleaned = cleaned.replace(regex, (match) => {
      return match[0] + '*'.repeat(Math.max(match.length - 1, 1));
    });
  });

  return cleaned;
}

/**
 * Checks whether a requested username is reserved by the platform
 */
export function isReservedUsername(rawUsername: string): { isReserved: boolean; reason?: string } {
  const clean = rawUsername.trim().toLowerCase();

  // Exact match on reserved terms
  if (RESERVED_USERNAMES.includes(clean)) {
    return {
      isReserved: true,
      reason: `"${clean}" is a reserved system handle. Please choose another username.`,
    };
  }

  // Substring match for official/admin impersonation
  if (
    clean.startsWith('admin_') ||
    clean.endsWith('_admin') ||
    clean.startsWith('official_') ||
    clean.endsWith('_official') ||
    clean.startsWith('vibegram_') ||
    clean.endsWith('_vibegram')
  ) {
    return {
      isReserved: true,
      reason: 'Official badge prefixes & suffixes are reserved for platform administration.',
    };
  }

  // Check vulgarity/insult in username
  const modCheck = checkContentModeration(clean);
  if (!modCheck.isClean) {
    return {
      isReserved: true,
      reason: 'Usernames cannot contain vulgar or offensive language.',
    };
  }

  return { isReserved: false };
}

/**
 * Community Guidelines rules description for user view
 */
export const COMMUNITY_GUIDELINES = [
  {
    title: 'Zero Tolerance for Insults & Harassment',
    description:
      'Personal insults, bullying, name-calling, hate speech, or derogatory remarks aimed at other users or creators are strictly prohibited.',
    icon: '🛡️',
  },
  {
    title: 'No Vulgar or Explicit Content',
    description:
      'Vulgar language, explicit obscenities, sexually explicit comments, and graphic profanity are blocked by our automated filters.',
    icon: '🚫',
  },
  {
    title: 'Reserved System Usernames',
    description:
      'Usernames impersonating administrators, official channels, moderators, or system staff are reserved and forbidden.',
    icon: '🔒',
  },
  {
    title: 'Kind & Constructive Feedback',
    description:
      'We welcome critique and creative opinions, provided they remain civil, constructive, and respectful of everyone.',
    icon: '✨',
  },
];
