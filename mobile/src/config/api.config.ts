import { Platform } from 'react-native';

/**
 * ========== EDIT BEFORE TESTING ==========
 * 1. Google Web Client ID (optional if using Dev Login)
 * 2. API host: copy api.config.local.example.ts → api.config.local.ts
 *    and set your PC Wi-Fi IP (physical phone) OR use adb reverse with 127.0.0.1
 */
export const GOOGLE_WEB_CLIENT_ID =
  'REPLACE_WITH_WEB_CLIENT_ID.apps.googleusercontent.com';

let localDevHost: string | undefined;
try {
  // Per-machine override (gitignored) — api.config.local.ts
  localDevHost = require('./api.config.local').DEV_API_HOST as string;
} catch {
  localDevHost = undefined;
}

/**
 * Physical Android phone: your PC LAN IP in api.config.local.ts
 * USB + adb reverse: 127.0.0.1 (run adb reverse tcp:3000 tcp:3000)
 * Android emulator: 10.0.2.2
 */
export const DEV_API_HOST =
  localDevHost ?? (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');

export const API_PORT = 3000;

export const API_BASE_URL = __DEV__
  ? `http://${DEV_API_HOST}:${API_PORT}`
  : 'https://api.incircle.app';

export const isGoogleSignInConfigured = (): boolean =>
  GOOGLE_WEB_CLIENT_ID.includes('.apps.googleusercontent.com') &&
  !GOOGLE_WEB_CLIENT_ID.startsWith('REPLACE_WITH');

export const apiConfigHint = (): string => {
  if (DEV_API_HOST === '127.0.0.1') {
    return `API: ${API_BASE_URL} — run: adb reverse tcp:3000 tcp:3000`;
  }
  return `API: ${API_BASE_URL} — phone & PC on same Wi-Fi`;
};
