import type { CopyVars } from './notification-copy';
import type { NotificationTone } from './notification-copy';

export const NOTIFICATION_TYPES = {
  ACTIVITY_PUBLISHED: 'activity_published',
  ACTIVITY_NEW_JOINER: 'activity_new_joiner',
  RSVP_CONFIRMED: 'rsvp_confirmed',
  ACTIVITY_ALMOST_FULL: 'activity_almost_full',
  ACTIVITY_FULL: 'activity_full',
  REPORT_RECEIVED: 'report_received',
  TEST: 'test',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export type NotifyPayload = {
  userId: string;
  type: NotificationType | string;
  title: string;
  body: string;
  activityId?: string | null;
  chatId?: string | null;
  metadata?: Record<string, unknown>;
  dedupeKey?: string | null;
};

export type NotifyEventPayload = {
  userId: string;
  type: NotificationType | string;
  copyVars?: CopyVars;
  activityId?: string | null;
  chatId?: string | null;
  metadata?: Record<string, unknown>;
  dedupeKey?: string | null;
  toneOverride?: NotificationTone;
};
