import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID, isGoogleSignInConfigured } from '../config/api.config';
import {
  fetchCurrentUser,
  loginWithDev,
  loginWithGoogle,
  logoutFromServer,
  restoreSession,
  updateProfile as updateProfileApi,
} from '../services/auth.service';
import { bootstrapExternalPushForUser, unregisterExternalPushFromBackend } from '../services/externalPush.service';
import { useAppStore } from '../store/useAppStore';
import type { AuthUser, UpdateProfilePayload } from '../types/auth';

type AuthContextValue = {
  user: AuthUser | null;
  authLoading: boolean;
  authReady: boolean;
  signInWithGoogle: () => Promise<AuthUser>;
  signInWithDev: (email?: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
  saveProfile: (payload: UpdateProfilePayload) => Promise<AuthUser>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function syncUserToStore(user: AuthUser | null) {
  const store = useAppStore.getState();
  if (user) {
    store.setAuthenticated(true);
    store.setProfileComplete(user.isProfileCompleted);
    if (user.interestIds?.length) {
      store.setSelectedInterests(user.interestIds);
      store.setInterestsComplete(true);
    }
    if (user.city) {
      store.setSelectedCity(user.city);
    }
  } else {
    store.setAuthenticated(false);
    store.setProfileComplete(false);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (isGoogleSignInConfigured()) {
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        offlineAccess: false,
      });
    }

    let cancelled = false;
    (async () => {
      setAuthLoading(true);
      try {
        const restored = await restoreSession();
        if (!cancelled) {
          setUser(restored);
          syncUserToStore(restored);
          if (restored) {
            bootstrapExternalPushForUser().catch(() => undefined);
          }
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
          setAuthReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthLoading(true);
    try {
      const loggedInUser = await loginWithGoogle();
      setUser(loggedInUser);
      syncUserToStore(loggedInUser);
      bootstrapExternalPushForUser().catch(() => undefined);
      return loggedInUser;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const signInWithDev = useCallback(async (email?: string) => {
    setAuthLoading(true);
    try {
      const loggedInUser = await loginWithDev(email);
      setUser(loggedInUser);
      syncUserToStore(loggedInUser);
      bootstrapExternalPushForUser().catch(() => undefined);
      return loggedInUser;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthLoading(true);
    try {
      await unregisterExternalPushFromBackend();
      await logoutFromServer();
      setUser(null);
      useAppStore.getState().resetDemo();
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const current = await fetchCurrentUser();
      setUser(current);
      syncUserToStore(current);
      return current;
    } catch {
      setUser(null);
      syncUserToStore(null);
      return null;
    }
  }, []);

  const saveProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const updated = await updateProfileApi(payload);
    setUser(updated);
    syncUserToStore(updated);
    return updated;
  }, []);

  const value = useMemo(
    () => ({
      user,
      authLoading,
      authReady,
      signInWithGoogle,
      signInWithDev,
      signOut,
      refreshUser,
      saveProfile,
    }),
    [user, authLoading, authReady, signInWithGoogle, signInWithDev, signOut, refreshUser, saveProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
