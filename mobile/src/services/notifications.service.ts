import { apiClient } from './api.client';

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  activityId?: string | null;
  chatId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

export type NotificationTone = 'normal' | 'cheesy' | 'cute' | 'flirty';

export type NotificationPreferences = {
  id: string;
  userId: string;
  pushEnabled: boolean;
  pushActivity: boolean;
  pushChat: boolean;
  pushReminders: boolean;
  pushDiscovery: boolean;
  tone: NotificationTone;
};

export const NOTIFICATION_TONE_OPTIONS: { id: NotificationTone; label: string; hint: string }[] = [
  { id: 'normal', label: 'Normal', hint: 'Straightforward updates' },
  { id: 'cheesy', label: 'Cheesy', hint: 'Zomato-style movie-night energy' },
  { id: 'cute', label: 'Cute', hint: 'Warm, bestie vibes' },
  { id: 'flirty', label: 'Flirty', hint: 'Playful nudge (not for reports)' },
];

export async function fetchNotifications(limit = 50): Promise<AppNotification[]> {
  const { data } = await apiClient.get<AppNotification[]>('/notifications', { params: { limit } });
  return data;
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const { data } = await apiClient.get<{ count: number }>('/notifications/unread-count');
  return data.count;
}

export async function markNotificationRead(id: string): Promise<AppNotification> {
  const { data } = await apiClient.patch<AppNotification>(`/notifications/${id}/read`);
  return data;
}

export async function markAllNotificationsRead(): Promise<{ updated: number }> {
  const { data } = await apiClient.patch<{ updated: number }>('/notifications/read-all');
  return data;
}

export async function registerPushDevice(pushToken: string, platform: 'ios' | 'android'): Promise<void> {
  await apiClient.post('/notifications/devices', { pushToken, platform });
}

export async function removePushDevice(pushToken: string): Promise<void> {
  await apiClient.delete('/notifications/devices', { data: { pushToken } });
}

export async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  const { data } = await apiClient.get<NotificationPreferences>('/notifications/preferences');
  return data;
}

export async function updateNotificationPreferences(
  patch: Partial<Pick<NotificationPreferences, 'tone' | 'pushEnabled' | 'pushActivity' | 'pushChat' | 'pushReminders' | 'pushDiscovery'>>,
): Promise<NotificationPreferences> {
  const { data } = await apiClient.patch<NotificationPreferences>('/notifications/preferences', patch);
  return data;
}

export async function sendTestNotification(): Promise<AppNotification> {
  const { data } = await apiClient.post<AppNotification>('/notifications/test');
  return data;
}

export async function fetchPushStatus(): Promise<{ enabled: boolean }> {
  const { data } = await apiClient.get<{ enabled: boolean }>('/notifications/push-status');
  return data;
}
