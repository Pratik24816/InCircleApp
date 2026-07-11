import type { CircleAvatarId } from './circleAvatars';

/** Premium one-liner on the future-user pass — tied to how they feel */
export const MEMBER_PASS_LINES: Record<CircleAvatarId, string> = {
  hyped: 'Day-zero energy unlocked. You felt it first.',
  amazed: 'You saw the vision before the crowd arrives.',
  'in-love': 'The vibe hit different. Officially smitten.',
  curious: 'Questions today. Plans tomorrow. Explorer mode on.',
  inspired: 'Ideas brewing. Your first host era starts here.',
  happy: 'That smile? The whole circle feels it.',
  ready: 'Launch-day energy. Hop In is calling your name.',
  impressed: 'Premium taste detected. You belong here before launch.',
  intrigued: 'Hooked from scroll one. We see you.',
  thoughtful: 'Big-brain feedback. The circle needs minds like yours.',
  thrilled: 'Confetti-worthy hype. Day-one downloader vibes.',
  believer: 'You get it. Real plans. Real people. Real nights.',
};

/** Badges for pre-launch users — future users, not members yet */
export function getFutureUserBadge(userNumber: number): {
  label: string;
  accent: string;
} {
  if (userNumber <= 50) {
    return { label: 'Future User', accent: '#ffd700' };
  }
  if (userNumber <= 200) {
    return { label: 'Early Believer', accent: '#8cff4f' };
  }
  return { label: 'Circle Insider', accent: '#4db5ff' };
}

/** Display as #06 — position in the live circle count */
export function formatUserNumber(n: number): string {
  return `#${String(n).padStart(2, '0')}`;
}

export function formatMemberDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
}

/** Number = join order among everyone in the circle (1st user → #01, 6th → #06) */
export function resolveUserNumber(
  member: { id: string; createdAt: number },
  allMembers: { id: string; createdAt: number }[],
): number {
  const sorted = [...allMembers].sort((a, b) => a.createdAt - b.createdAt);
  const idx = sorted.findIndex(m => m.id === member.id);
  return idx >= 0 ? idx + 1 : sorted.length || 1;
}
