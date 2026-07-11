export type CircleAvatarId =
  | 'hyped'
  | 'amazed'
  | 'in-love'
  | 'curious'
  | 'inspired'
  | 'happy'
  | 'ready'
  | 'impressed'
  | 'intrigued'
  | 'thoughtful'
  | 'thrilled'
  | 'believer';

export type CircleAvatar = {
  id: CircleAvatarId;
  emoji: string;
  /** How they feel after exploring Hopiin */
  label: string;
  /** Short expression subtitle */
  hint: string;
  gradient: string;
  glow: string;
};

/** Avatars = expressions / feelings after exploring the Hopiin idea — not random personas */
export const CIRCLE_AVATARS: CircleAvatar[] = [
  {
    id: 'hyped',
    emoji: '🔥',
    label: 'Hyped',
    hint: 'This is exactly what I needed',
    gradient: 'linear-gradient(135deg, #4a1a1a, #ff5a5f)',
    glow: '#ff5a5f',
  },
  {
    id: 'amazed',
    emoji: '🤩',
    label: 'Amazed',
    hint: 'Did not expect it to feel this good',
    gradient: 'linear-gradient(135deg, #3a2a1a, #ffb020)',
    glow: '#ffb020',
  },
  {
    id: 'in-love',
    emoji: '😍',
    label: 'In love',
    hint: 'The vibe is perfect',
    gradient: 'linear-gradient(135deg, #3a1a3a, #ff6b8a)',
    glow: '#ff6b8a',
  },
  {
    id: 'curious',
    emoji: '🤔',
    label: 'Curious',
    hint: 'I want to explore more',
    gradient: 'linear-gradient(135deg, #1a2a4a, #4db5ff)',
    glow: '#4db5ff',
  },
  {
    id: 'inspired',
    emoji: '💡',
    label: 'Inspired',
    hint: 'Already thinking of plans to host',
    gradient: 'linear-gradient(135deg, #1a3a2a, #8cff4f)',
    glow: '#8cff4f',
  },
  {
    id: 'happy',
    emoji: '😊',
    label: 'Happy',
    hint: 'This put a smile on my face',
    gradient: 'linear-gradient(135deg, #2a3a1a, #a3e635)',
    glow: '#a3e635',
  },
  {
    id: 'ready',
    emoji: '🙌',
    label: 'Ready',
    hint: 'Take my Hop In — launch day please',
    gradient: 'linear-gradient(135deg, #1a3a4a, #6ee0ff)',
    glow: '#6ee0ff',
  },
  {
    id: 'impressed',
    emoji: '✨',
    label: 'Impressed',
    hint: 'Premium feel, real idea',
    gradient: 'linear-gradient(135deg, #2a1a4a, #a855f7)',
    glow: '#a855f7',
  },
  {
    id: 'intrigued',
    emoji: '👀',
    label: 'Intrigued',
    hint: 'Hooked from the first scroll',
    gradient: 'linear-gradient(135deg, #1a2a3a, #4db5ff)',
    glow: '#4db5ff',
  },
  {
    id: 'thoughtful',
    emoji: '💭',
    label: 'Thoughtful',
    hint: 'Lots of ideas — need to sit with this',
    gradient: 'linear-gradient(135deg, #1a2a4a, #6b7cff)',
    glow: '#6b7cff',
  },
  {
    id: 'thrilled',
    emoji: '🎉',
    label: 'Thrilled',
    hint: 'Day-one download energy',
    gradient: 'linear-gradient(135deg, #3a2a0a, #ffd700)',
    glow: '#ffd700',
  },
  {
    id: 'believer',
    emoji: '💚',
    label: 'Believer',
    hint: 'This is what nights out needed',
    gradient: 'linear-gradient(135deg, #0a2818, #8cff4f)',
    glow: '#8cff4f',
  },
];

export const AVATAR_MAP = Object.fromEntries(
  CIRCLE_AVATARS.map(a => [a.id, a]),
) as Record<CircleAvatarId, CircleAvatar>;

/** Fallback when stored data uses a removed avatar id */
export const DEFAULT_AVATAR = CIRCLE_AVATARS[0];

export function resolveAvatar(id: string): CircleAvatar {
  return AVATAR_MAP[id as CircleAvatarId] ?? DEFAULT_AVATAR;
}

export const FEEDBACK_CATEGORIES = [
  { id: 'concept', label: 'Love the concept', icon: '💚' },
  { id: 'suggestion', label: 'Suggestion', icon: '💡' },
  { id: 'feature', label: 'Feature request', icon: '⚡' },
  { id: 'feedback', label: 'General feedback', icon: '💬' },
  { id: 'hype', label: 'Launch hype', icon: '🚀' },
  { id: 'other', label: 'Other', icon: '✦' },
] as const;

export type FeedbackCategoryId = (typeof FEEDBACK_CATEGORIES)[number]['id'];
