import type { Activity } from '../types/auth';

export type CountdownDisplay = {
  emoji: string;
  text: string;
  mode: 'live' | 'soon' | 'friendly';
};

const MS_HOUR = 60 * 60 * 1000;
const MS_DAY = 24 * MS_HOUR;

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function formatLiveCountdown(diffMs: number): string {
  const totalSec = Math.max(0, Math.floor(diffMs / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

function getDayPeriod(hour: number): string {
  if (hour >= 5 && hour < 12) {
    return 'Morning';
  }
  if (hour >= 12 && hour < 17) {
    return 'Afternoon';
  }
  if (hour >= 17 && hour < 21) {
    return 'Evening';
  }
  return 'Night';
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isTomorrow(start: Date, now: Date): boolean {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(start, tomorrow);
}

export function getCountdownDisplay(iso: string, at = Date.now()): CountdownDisplay {
  const start = new Date(iso);
  const diff = start.getTime() - at;

  if (diff <= 0) {
    return { emoji: '⏳', text: 'Starting now', mode: 'soon' };
  }

  if (diff < MS_DAY) {
    return {
      emoji: '⏳',
      text: `Starts in ${formatLiveCountdown(diff)}`,
      mode: 'live',
    };
  }

  const now = new Date(at);
  if (isTomorrow(start, now)) {
    return {
      emoji: '⏰',
      text: `Tomorrow ${getDayPeriod(start.getHours())}`,
      mode: 'friendly',
    };
  }

  const days = Math.floor(diff / MS_DAY);
  if (days < 7) {
    const weekday = start.toLocaleDateString([], { weekday: 'long' });
    return {
      emoji: '⏰',
      text: `${weekday} ${getDayPeriod(start.getHours())}`,
      mode: 'friendly',
    };
  }

  return {
    emoji: '⏰',
    text: `Starts in ${days} days`,
    mode: 'friendly',
  };
}

/** @deprecated Use getCountdownDisplay — kept for any legacy callers */
export function formatCountdown(iso: string): string {
  const { emoji, text } = getCountdownDisplay(iso);
  return `${emoji} ${text}`;
}

export function getHostFirstName(fullName?: string | null): string {
  if (!fullName?.trim()) {
    return 'Someone';
  }
  return fullName.trim().split(/\s+/)[0];
}

export function getSpotsLeft(activity: Activity): number | null {
  if (activity.groupSize == null || activity.groupSize <= 0) {
    return null;
  }
  return Math.max(0, activity.groupSize - activity.joinedCount);
}

export function getPeopleGoingLine(activity: Activity): string {
  const count = activity.joinedCount;
  const spots = getSpotsLeft(activity);

  if (spots != null && activity.groupSize != null) {
    if (activity.status === 'full' || spots === 0) {
      return `👥 ${count} people going • Full`;
    }
    return `👥 ${count} people going • ${spots} spot${spots === 1 ? '' : 's'} left`;
  }

  const label = count === 1 ? '1 person going' : `${count} people going`;
  return `👥 ${label}`;
}

/** Demo vibe line until weather API — consistent per activity time of day */
export function getWeatherVibeLine(startIso: string, activityId: string): string {
  const hour = new Date(startIso).getHours();
  const seed = activityId.charCodeAt(0) % 4;

  if (hour >= 5 && hour < 10) {
    const temps = [22, 24, 26, 23];
    return `☀️ Perfect morning • ${temps[seed]}°C`;
  }
  if (hour >= 10 && hour < 17) {
    const temps = [30, 32, 28, 31];
    return `☀️ Sunny & active • ${temps[seed]}°C`;
  }
  if (hour >= 17 && hour < 21) {
    const temps = [26, 28, 27, 25];
    return `🌤 Golden hour • ${temps[seed]}°C`;
  }
  const temps = [20, 22, 21, 23];
  return `🌙 Cool evening • ${temps[seed]}°C`;
}

export function getUrgencyHint(activity: Activity): string | null {
  const spots = getSpotsLeft(activity);
  if (activity.status === 'almost_full' || (spots != null && spots > 0 && spots <= 2)) {
    return '🔥 Filling fast';
  }
  if (activity.featured) {
    return '🌟 Featured';
  }
  if (activity.joinedCount >= 5) {
    return '✨ Popular';
  }
  return null;
}
