export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isTomorrow(start: Date, now: Date): boolean {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameCalendarDay(start, tomorrow);
}

function isSameDay(a: Date, b: Date): boolean {
  return isSameCalendarDay(a, b);
}

export function getTonightPreset(now = new Date()): Date {
  const tonight = new Date(now);
  tonight.setHours(19, 0, 0, 0);
  if (tonight.getTime() <= now.getTime()) {
    tonight.setTime(now.getTime() + 60 * 60 * 1000);
    tonight.setMinutes(tonight.getMinutes() >= 30 ? 30 : 0, 0, 0);
    if (tonight.getTime() <= now.getTime()) {
      tonight.setHours(tonight.getHours() + 1, 0, 0, 0);
    }
  }
  return tonight;
}

export function getTomorrowPreset(now = new Date()): Date {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(6, 30, 0, 0);
  return tomorrow;
}

export function getWeekendPreset(now = new Date()): Date {
  const target = new Date(now);
  const day = target.getDay();
  let daysUntilSaturday = (6 - day + 7) % 7;
  if (daysUntilSaturday === 0 && target.getHours() >= 10) {
    daysUntilSaturday = 7;
  }
  target.setDate(target.getDate() + daysUntilSaturday);
  target.setHours(10, 0, 0, 0);
  return target;
}

export type ActivityQuickPreset = 'tonight' | 'tomorrow' | 'weekend';

export function getPresetDate(preset: ActivityQuickPreset, now = new Date()): Date {
  switch (preset) {
    case 'tonight':
      return getTonightPreset(now);
    case 'tomorrow':
      return getTomorrowPreset(now);
    case 'weekend':
      return getWeekendPreset(now);
  }
}

export function formatFriendlyActivityDate(date: Date, now = new Date()): string {
  if (isSameDay(date, now)) {
    return 'Tonight';
  }
  if (isTomorrow(date, now)) {
    return 'Tomorrow';
  }

  const day = date.getDay();
  const diffDays = Math.floor((date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays >= 0 && diffDays < 7 && (day === 0 || day === 6)) {
    return date.toLocaleDateString([], { weekday: 'long' });
  }

  return date.toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function formatFriendlyActivityTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: date.getMinutes() === 0 ? undefined : '2-digit',
    hour12: true,
  });
}

export function getUpcomingDays(count = 14, now = new Date()): Date[] {
  return Array.from({ length: count }, (_, index) => {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() + index);
    return day;
  });
}

export function formatDayChipLabel(date: Date, now = new Date()): string {
  if (isSameDay(date, now)) {
    return 'Tonight';
  }
  if (isTomorrow(date, now)) {
    return 'Tomorrow';
  }
  return date.toLocaleDateString([], { weekday: 'short', day: 'numeric' });
}

export function setCalendarDay(base: Date, day: Date): Date {
  const next = new Date(base);
  next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
  return next;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function matchQuickPreset(date: Date, now = new Date()): ActivityQuickPreset | null {
  const presets: ActivityQuickPreset[] = ['tonight', 'tomorrow', 'weekend'];
  for (const preset of presets) {
    const candidate = getPresetDate(preset, now);
    if (
      isSameDay(date, candidate) &&
      date.getHours() === candidate.getHours() &&
      date.getMinutes() === candidate.getMinutes()
    ) {
      return preset;
    }
  }
  return null;
}
