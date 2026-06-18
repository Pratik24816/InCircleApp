import { Platform } from 'react-native';

/**
 * Backend connection (development)
 * ---------------------------------
 * Physical phone (USB / same Wi‑Fi): set to your laptop LAN IP, e.g. '192.168.1.42'
 * Android emulator: use '10.0.2.2'
 * iOS simulator: use 'localhost'
 */
export const DEV_API_HOST = '192.168.1.42';

export const API_PORT = 3000;

export const API_BASE_URL = __DEV__
  ? `http://${DEV_API_HOST}:${API_PORT}`
  : 'https://api.incircle.app';

/**
 * Web client ID from Google Cloud Console (OAuth 2.0).
 * Must match GOOGLE_CLIENT_ID_WEB in backend/.env
 */
export const GOOGLE_WEB_CLIENT_ID =
  'your_google_client_id_web.apps.googleusercontent.com';

export const isGoogleSignInConfigured = (): boolean =>
  !GOOGLE_WEB_CLIENT_ID.includes('your_google_client_id');

export const apiConfigHint = (): string => {
  if (Platform.OS === 'android') {
    return `API: ${API_BASE_URL} — set DEV_API_HOST in src/config/api.config.ts to your PC IP for a physical device.`;
  }
  return `API: ${API_BASE_URL}`;
};
