import type { Activity } from '../types/auth';

export const VIBE_PRESETS: Record<string, string> = {
  trending: '🔥 Trending',
  chill: '😌 Chill',
  new_friends: '🤝 New Friends',
  high_energy: '⚡ High Energy',
  casual: '☕ Casual',
};

const CUSTOM_EMOJI_RULES: [RegExp, string][] = [
  [/coffee|chai|tea|breakfast|brunch/i, '☕'],
  [/new people|welcome|friends|meet|network/i, '🤝'],
  [/quiet|focus|study|calm|silent/i, '😌'],
  [/competitive|sport|energy|cycling|cricket|outdoor|loop/i, '⚡'],
  [/full|filling|spots/i, '🔥'],
  [/founder|builder|casual/i, '☕'],
];

function hasLeadingEmoji(text: string): boolean {
  return /^[\p{Extended_Pictographic}]/u.test(text.trim());
}

export function formatVibeTag(tag: string): string {
  const key = tag.trim().toLowerCase().replace(/\s+/g, '_');
  if (VIBE_PRESETS[key]) {
    return VIBE_PRESETS[key];
  }
  if (VIBE_PRESETS[tag.trim()]) {
    return VIBE_PRESETS[tag.trim()];
  }

  const label = tag.trim();
  if (!label) {
    return '';
  }
  if (hasLeadingEmoji(label)) {
    return label;
  }

  for (const [pattern, emoji] of CUSTOM_EMOJI_RULES) {
    if (pattern.test(label)) {
      return `${emoji} ${label}`;
    }
  }

  return `✨ ${label}`;
}

export function getActivityVibeTags(activity: Activity): string[] {
  if (activity.vibeTags?.length) {
    return activity.vibeTags.map(formatVibeTag).filter(Boolean);
  }

  const vibes: string[] = [];
  if (activity.featured) {
    vibes.push(formatVibeTag('trending'));
  }

  const categorySlug = activity.category?.slug;
  if (categorySlug === 'fitness' || categorySlug === 'outdoor') {
    vibes.push(formatVibeTag('chill'));
  } else if (categorySlug === 'sports') {
    vibes.push(formatVibeTag('high_energy'));
  } else if (categorySlug === 'social') {
    vibes.push(formatVibeTag('casual'));
  }

  if (activity.groupType === 'open_join') {
    vibes.push(formatVibeTag('new_friends'));
  }

  return vibes.slice(0, 4);
}
