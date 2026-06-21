type RemoteMessageLike = {
  notification?: { title?: string; body?: string };
  data?: Record<string, string | undefined>;
};

type MessagingModule = typeof import('@react-native-firebase/messaging').default;

export function isFirebaseConfigured(): boolean {
  try {
    const firebase = require('@react-native-firebase/app').default as {
      apps: unknown[];
    };
    return firebase.apps.length > 0;
  } catch {
    return false;
  }
}

export function getMessagingModule(): MessagingModule | null {
  if (!isFirebaseConfigured()) {
    return null;
  }

  try {
    return require('@react-native-firebase/messaging').default as MessagingModule;
  } catch {
    return null;
  }
}

export function registerFirebaseBackgroundHandler(
  handler: (message: RemoteMessageLike) => Promise<void>,
): void {
  const messaging = getMessagingModule();
  if (!messaging) {
    return;
  }

  try {
    messaging().setBackgroundMessageHandler(handler);
  } catch {
    // Firebase not ready — Notifee-only mode
  }
}

export type { RemoteMessageLike };
