import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { apiClient, getApiErrorMessage } from './api.client';
import { TokenService } from './token.service';
import type { AuthUser, GoogleLoginResponse, UpdateProfilePayload } from '../types/auth';

export async function loginWithGoogle(): Promise<AuthUser> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();

  if (result.type === 'cancelled') {
    throw Object.assign(new Error('Sign-in cancelled'), { code: statusCodes.SIGN_IN_CANCELLED });
  }

  const idToken = result.data.idToken;
  if (!idToken) {
    throw new Error('Google Sign-In did not return an ID token. Check GOOGLE_WEB_CLIENT_ID.');
  }

  const { data } = await apiClient.post<GoogleLoginResponse>('/auth/google', {
    token: idToken,
  });

  await TokenService.saveTokens(data.tokens.accessToken, data.tokens.refreshToken);
  return fetchCurrentUser();
}

/** Local dev login — requires backend ENABLE_DEV_AUTH=true and npm run seed */
export async function loginWithDev(email = 'you@incircle.app'): Promise<AuthUser> {
  const { data } = await apiClient.post<GoogleLoginResponse>('/auth/dev', { email });
  await TokenService.saveTokens(data.tokens.accessToken, data.tokens.refreshToken);
  return fetchCurrentUser();
}

export async function restoreSession(): Promise<AuthUser | null> {
  const accessToken = await TokenService.getAccessToken();
  if (!accessToken) {
    return null;
  }

  try {
    const { data } = await apiClient.get<AuthUser>('/users/me');
    return data;
  } catch {
    await TokenService.clearTokens();
    return null;
  }
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>('/users/me');
  return data;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
  await apiClient.patch<AuthUser>('/users/profile', payload);
  return fetchCurrentUser();
}

export async function logoutFromServer(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } catch {
    // Clear local session even if server call fails
  } finally {
    await TokenService.clearTokens();
    try {
      await GoogleSignin.signOut();
    } catch {
      // ignore
    }
  }
}

export function isGoogleSignInCancelled(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === statusCodes.SIGN_IN_CANCELLED
  );
}

export { getApiErrorMessage };
