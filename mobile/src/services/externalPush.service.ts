import { Platform } from 'react-native';
import notifee, {
  AndroidImportance,
  AndroidStyle,
  AuthorizationStatus,
  EventType,
} from '@notifee/react-native';
import { registerPushDevice, removePushDevice } from './notifications.service';
import {
  getMessagingModule,
  isFirebaseConfigured,
  registerFirebaseBackgroundHandler,
  type RemoteMessageLike,
} from './firebaseMessaging';
import { navigateFromPush } from '../navigation/navigationRef';

export const PUSH_CHANNEL_ID = 'incircle_plans';
const APP_NAME = 'InCircle';
const APP_LOGO = require('../../img/slogo.png');

let cachedToken: string | null = null;
let handlersReady = false;

export type ExternalPushPayload = {
  title: string;
  body: string;
  type?: string;
  notificationId?: string;
  activityId?: string | null;
  chatId?: string | null;
};

export function isExternalPushServerReady(): boolean {
  return isFirebaseConfigured();
}

export async function setupExternalPushChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await notifee.createChannel({
    id: PUSH_CHANNEL_ID,
    name: 'Plans & RSVPs',
    description: 'Join requests, RSVPs, and plan updates',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });
}

export async function requestExternalPushPermission(): Promise<boolean> {
  const messaging = getMessagingModule();

  if (Platform.OS === 'ios' && messaging) {
    const status = await messaging().requestPermission();
    return (
      status === messaging.AuthorizationStatus.AUTHORIZED ||
      status === messaging.AuthorizationStatus.PROVISIONAL
    );
  }

  if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
  }

  return true;
}

export async function showExternalPushNotification(payload: ExternalPushPayload): Promise<void> {
  await setupExternalPushChannel();

  await notifee.displayNotification({
    id: payload.notificationId ?? `incircle-${Date.now()}`,
    title: payload.title,
    subtitle: APP_NAME,
    body: payload.body,
    data: {
      type: payload.type ?? '',
      notificationId: payload.notificationId ?? '',
      activityId: payload.activityId ?? '',
      chatId: payload.chatId ?? '',
    },
    android: {
      channelId: PUSH_CHANNEL_ID,
      smallIcon: 'ic_notification',
      largeIcon: 'ic_notification_logo',
      color: '#8CFF4F',
      pressAction: { id: 'default' },
      style: {
        type: AndroidStyle.BIGTEXT,
        text: payload.body,
      },
      showTimestamp: true,
      timestamp: Date.now(),
    },
    ios: {
      sound: 'default',
      subtitle: APP_NAME,
      attachments: [{ url: APP_LOGO }],
      foregroundPresentationOptions: {
        banner: true,
        sound: true,
        badge: true,
      },
    },
  });
}

function mapRemoteMessage(message: RemoteMessageLike): ExternalPushPayload {
  return {
    title: message.notification?.title ?? message.data?.title ?? APP_NAME,
    body: message.notification?.body ?? message.data?.body ?? '',
    type: message.data?.type,
    notificationId: message.data?.notificationId,
    activityId: message.data?.activityId,
    chatId: message.data?.chatId,
  };
}

export async function getFcmToken(): Promise<string | null> {
  const messaging = getMessagingModule();
  if (!messaging) {
    return null;
  }

  try {
    const token = await messaging().getToken();
    cachedToken = token;
    return token;
  } catch {
    return null;
  }
}

export function getCachedFcmToken(): string | null {
  return cachedToken;
}

export async function registerExternalPushWithBackend(): Promise<string | null> {
  const allowed = await requestExternalPushPermission();
  if (!allowed) {
    return null;
  }

  await setupExternalPushChannel();

  const messaging = getMessagingModule();
  if (!messaging) {
    return null;
  }

  const token = await getFcmToken();
  if (!token) {
    return null;
  }

  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  await registerPushDevice(token, platform);
  return token;
}

export async function unregisterExternalPushFromBackend(): Promise<void> {
  const token = cachedToken ?? (await getFcmToken());
  if (token) {
    try {
      await removePushDevice(token);
    } catch {
      // ignore logout cleanup errors
    }
  }
  cachedToken = null;

  const messaging = getMessagingModule();
  if (!messaging) {
    return;
  }

  try {
    await messaging().deleteToken();
  } catch {
    // ignore when Firebase not configured
  }
}

function handleNotificationOpen(data?: Record<string, string | object | undefined>): void {
  const activityId =
    typeof data?.activityId === 'string' && data.activityId.length > 0 ? data.activityId : null;
  navigateFromPush(activityId);
}

function setupFirebaseMessagingHandlers(): void {
  const messaging = getMessagingModule();
  if (!messaging) {
    return;
  }

  messaging().onMessage(async remoteMessage => {
    const payload = mapRemoteMessage(remoteMessage);
    if (payload.body) {
      await showExternalPushNotification(payload);
    }
  });

  messaging().onTokenRefresh(async token => {
    cachedToken = token;
    try {
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      await registerPushDevice(token, platform);
    } catch {
      // user may not be logged in yet
    }
  });

  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        handleNotificationOpen(remoteMessage.data);
      }
    });

  messaging().onNotificationOpenedApp(remoteMessage => {
    handleNotificationOpen(remoteMessage.data);
  });
}

export function setupExternalPushHandlers(): void {
  if (handlersReady) {
    return;
  }
  handlersReady = true;

  notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      handleNotificationOpen(detail.notification?.data as Record<string, string> | undefined);
    }
  });

  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
      handleNotificationOpen(detail.notification?.data as Record<string, string> | undefined);
    }
  });

  setupFirebaseMessagingHandlers();
}

export async function handleBackgroundRemoteMessage(remoteMessage: RemoteMessageLike): Promise<void> {
  const payload = mapRemoteMessage(remoteMessage);
  if (!payload.body) {
    return;
  }
  await showExternalPushNotification(payload);
}

export function registerExternalPushBackgroundHandler(): void {
  registerFirebaseBackgroundHandler(handleBackgroundRemoteMessage);
}

export async function bootstrapExternalPushForUser(): Promise<void> {
  setupExternalPushHandlers();
  await registerExternalPushWithBackend();
}
