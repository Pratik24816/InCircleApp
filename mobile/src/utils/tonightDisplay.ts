import type { Activity } from '../types/auth';

const TONIGHT_STORY_EMOJIS: Record<string, string> = {
  'dddddddd-dddd-4ddd-8ddd-dddddddddd01': '🔥',
  'dddddddd-dddd-4ddd-8ddd-dddddddddd02': '🎵',
  'dddddddd-dddd-4ddd-8ddd-dddddddddd03': '☕',
  'dddddddd-dddd-4ddd-8ddd-dddddddddd04': '🎲',
};

export function formatTonightTime(iso: string): string {
  const date = new Date(iso);
  const mins = date.getMinutes();
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: mins === 0 ? undefined : '2-digit',
  });
}

export function getTonightStoryEmoji(activity: Activity): string {
  if (TONIGHT_STORY_EMOJIS[activity.id]) {
    return TONIGHT_STORY_EMOJIS[activity.id];
  }
  return activity.category?.icon ?? '✨';
}

export function getTonightStoryTitle(activity: Activity): string {
  const title = activity.title.trim();
  if (title === 'Football Pickup') {
    return 'Football';
  }
  if (title === 'Open Mic Night') {
    return 'Open Mic';
  }
  if (title === 'Coffee Meetup') {
    return 'Coffee Meetup';
  }
  if (title === 'Board Games') {
    return 'Board Games';
  }
  return title;
}

export function isTonightActivity(iso: string): boolean {
  const start = new Date(iso);
  const now = new Date();
  const eveningStart = new Date(now);
  eveningStart.setHours(17, 0, 0, 0);
  const tonightEnd = new Date(now);
  tonightEnd.setHours(23, 59, 59, 999);

  const sameDay =
    start.getFullYear() === now.getFullYear() &&
    start.getMonth() === now.getMonth() &&
    start.getDate() === now.getDate();

  return sameDay && start >= eveningStart && start <= tonightEnd;
}
