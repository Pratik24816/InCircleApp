import { NOTIFICATION_TYPES, type NotificationType } from './notification.types';

export const NOTIFICATION_TONES = ['normal', 'cheesy', 'cute', 'flirty'] as const;
export type NotificationTone = (typeof NOTIFICATION_TONES)[number];

export type CopyVars = {
  activityTitle?: string;
  actorName?: string;
  locationName?: string;
  city?: string;
  spotsLeft?: number;
};

type CopyTemplate = Record<NotificationTone, { title: string; body: string }>;

function fill(template: string, vars: CopyVars): string {
  return template
    .replace(/\{activityTitle\}/g, vars.activityTitle ?? 'your plan')
    .replace(/\{actorName\}/g, vars.actorName ?? 'Someone')
    .replace(/\{locationName\}/g, vars.locationName ?? 'the spot')
    .replace(/\{city\}/g, vars.city ?? 'your city')
    .replace(/\{spotsLeft\}/g, String(vars.spotsLeft ?? 1));
}

const TEMPLATES: Record<string, CopyTemplate> = {
  [NOTIFICATION_TYPES.ACTIVITY_PUBLISHED]: {
    normal: {
      title: 'Plan is live',
      body: '{activityTitle} is on the feed. People can start joining.',
    },
    cheesy: {
      title: 'Main character moment 🍿',
      body: '{activityTitle} is live. The city is watching.',
    },
    cute: {
      title: 'You did it 🥹',
      body: '{activityTitle} is out there waiting for friends.',
    },
    flirty: {
      title: 'Your plan is flirting with the feed 😏',
      body: '{activityTitle} just went public. Let the RSVPs roll in.',
    },
  },
  [NOTIFICATION_TYPES.ACTIVITY_NEW_JOINER]: {
    normal: {
      title: 'Someone joined your plan',
      body: '{actorName} is In on {activityTitle}.',
    },
    cheesy: {
      title: 'Plot twist 🍿',
      body: '{actorName} said yes to {activityTitle}. The squad grows.',
    },
    cute: {
      title: 'New friend alert 🥹',
      body: '{actorName} wants to hang at {activityTitle}!',
    },
    flirty: {
      title: 'Someone\'s interested 😏',
      body: '{actorName} tapped In on {activityTitle}. Your move.',
    },
  },
  [NOTIFICATION_TYPES.RSVP_CONFIRMED]: {
    normal: {
      title: "You're In",
      body: "You're set for {activityTitle}.",
    },
    cheesy: {
      title: 'Certified legend 🔥',
      body: "You're In for {activityTitle}. See you IRL.",
    },
    cute: {
      title: "You're In 🥹",
      body: "{activityTitle} · can't wait to see you there!",
    },
    flirty: {
      title: 'Locked in 😏',
      body: "{activityTitle} — you're on the list. Don't ghost.",
    },
  },
  [NOTIFICATION_TYPES.ACTIVITY_ALMOST_FULL]: {
    normal: {
      title: 'Almost full',
      body: '{activityTitle} — grab the last spot.',
    },
    cheesy: {
      title: 'Last call energy 🚨',
      body: '{activityTitle} has {spotsLeft} spot left. Blink and it\'s gone.',
    },
    cute: {
      title: 'Almost full 🥺',
      body: 'Only {spotsLeft} seat left for {activityTitle}!',
    },
    flirty: {
      title: 'Final spot drama 😏',
      body: '{activityTitle} — one seat left. You in or you out?',
    },
  },
  [NOTIFICATION_TYPES.ACTIVITY_FULL]: {
    normal: {
      title: 'Plan is full',
      body: '{activityTitle} reached capacity.',
    },
    cheesy: {
      title: 'Sold out like a blockbuster 🎬',
      body: '{activityTitle} is full. VIP list closed.',
    },
    cute: {
      title: 'Full house 🎉',
      body: '{activityTitle} — no more spots, but the vibe will be elite.',
    },
    flirty: {
      title: 'Too popular 😏',
      body: '{activityTitle} is full. You snooze, you lose.',
    },
  },
  [NOTIFICATION_TYPES.REPORT_RECEIVED]: {
    normal: {
      title: 'Report received',
      body: 'Thanks — our team will review it.',
    },
    cheesy: {
      title: 'Report received',
      body: 'Thanks — our team will review it.',
    },
    cute: {
      title: 'Report received',
      body: 'Thanks — we\'ve got you. Our team will review it.',
    },
    flirty: {
      title: 'Report received',
      body: 'Thanks — our team will review it.',
    },
  },
  test: {
    normal: {
      title: 'InCircle ping',
      body: 'Notifications are working. Normal vibe.',
    },
    cheesy: {
      title: 'InCircle is alive 🍿',
      body: 'Your notifications are cheesier than movie night popcorn.',
    },
    cute: {
      title: 'Hey bestie 🥹',
      body: 'Cute mode is on. Plans + people = happiness.',
    },
    flirty: {
      title: 'Someone\'s thinking about plans 😏',
      body: 'Flirty mode unlocked. Go touch grass IRL.',
    },
  },
};

export function formatNotificationCopy(
  type: NotificationType | string,
  tone: NotificationTone,
  vars: CopyVars = {},
): { title: string; body: string; tone: NotificationTone } {
  const resolvedTone = NOTIFICATION_TONES.includes(tone) ? tone : 'cheesy';
  const set = TEMPLATES[type] ?? TEMPLATES[NOTIFICATION_TYPES.ACTIVITY_PUBLISHED];
  const picked = set[resolvedTone] ?? set.cheesy;
  return {
    title: fill(picked.title, vars),
    body: fill(picked.body, vars),
    tone: resolvedTone,
  };
}

export function isFlirtyAllowed(type: NotificationType | string): boolean {
  return type !== NOTIFICATION_TYPES.REPORT_RECEIVED;
}

export function resolveToneForType(
  type: NotificationType | string,
  preferred: NotificationTone,
): NotificationTone {
  if (!isFlirtyAllowed(type) && (preferred === 'flirty' || preferred === 'cheesy')) {
    return 'normal';
  }
  return preferred;
}
