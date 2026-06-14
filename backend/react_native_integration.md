# React Native Integration Guide for NestJS Backend

This guide outlines how to integrate the NestJS Google OAuth and JWT-based backend into your React Native application. It covers package installation, Google Sign-in flow, secure storage, automatic token refreshing using Axios, and custom profile picture uploads.

---

## 1. Required Libraries

Install the following packages in your React Native project (`mobile/` directory):

```bash
# Install Google Sign-in SDK
npm install @react-native-google-signin/google-signin

# Install Secure Keychain Storage for JWTs
npm install react-native-keychain

# Install Axios for API requests
npm install axios

# Install Image Picker for custom profile photo uploads
npm install react-native-image-picker
```

Make sure to run `pod install` in your `ios/` folder after installation.

---

## 2. Secure Token Storage Helper

Create a helper file `src/services/token.service.ts` to manage securely storing and retrieving JWT Access and Refresh tokens using `react-native-keychain`.

```typescript
import * as Keychain from 'react-native-keychain';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export class TokenService {
  /**
   * Save access and refresh tokens securely in Keychain.
   */
  static async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Keychain.setGenericPassword(ACCESS_TOKEN_KEY, accessToken, {
      service: ACCESS_TOKEN_KEY,
    });
    await Keychain.setGenericPassword(REFRESH_TOKEN_KEY, refreshToken, {
      service: REFRESH_TOKEN_KEY,
    });
  }

  /**
   * Retrieve the stored Access Token.
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({ service: ACCESS_TOKEN_KEY });
      return credentials ? credentials.password : null;
    } catch {
      return null;
    }
  }

  /**
   * Retrieve the stored Refresh Token.
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({ service: REFRESH_TOKEN_KEY });
      return credentials ? credentials.password : null;
    } catch {
      return null;
    }
  }

  /**
   * Delete tokens on logout.
   */
  static async clearTokens(): Promise<void> {
    await Keychain.resetGenericPassword({ service: ACCESS_TOKEN_KEY });
    await Keychain.resetGenericPassword({ service: REFRESH_TOKEN_KEY });
  }
}
```

---

## 3. Axios API Client with Automatic Refresh Interceptors

Create an Axios client in `src/services/api.client.ts` that automatically:
1. Attaches the Access Token to every outgoing request.
2. Intercepts `401 Unauthorized` responses and attempts to use the Refresh Token to obtain a new Access Token.
3. Retries the failed request with the new Access Token, or redirects to login if the refresh token is expired.

```typescript
import axios from 'axios';
import { TokenService } from './token.service';

const API_URL = 'http://YOUR_BACKEND_IP_OR_LOCALHOST:3000'; // Use your development machine IP for physical devices

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject Access Token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await TokenService.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refresh Rotation
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If request failed with 401 and hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await TokenService.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call NestJS refresh endpoint
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        // Store the newly rotated tokens
        await TokenService.saveTokens(newAccessToken, newRefreshToken);

        // Update retry headers and execute original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh token failed/expired -> Force Logout
        await TokenService.clearTokens();
        // Redirect to Login Screen (trigger global state change or navigation reset)
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

---

## 4. Google Sign-In & Auth Hook

Create a hook `src/hooks/useAuth.ts` or a service for managing the Google Sign-In and authorization state.

```typescript
import { useState, useEffect } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { apiClient } from '../services/api.client';
import { TokenService } from '../services/token.service';

export interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  fullName: string;
  bio: string | null;
  profilePhoto: string; // Resolves to customPhotoUrl ?? googlePhotoUrl
  isProfileCompleted: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Initialize Google SDK
    GoogleSignin.configure({
      webClientId: 'YOUR_GOOGLE_CLIENT_ID_WEB.apps.googleusercontent.com', // Required for verification
      iosClientId: 'YOUR_GOOGLE_CLIENT_ID_IOS.apps.googleusercontent.com',
      offlineAccess: false,
    });

    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const token = await TokenService.getAccessToken();
      if (token) {
        const response = await apiClient.get<UserProfile>('/users/me');
        setUser(response.data);
      }
    } catch (err) {
      console.log('Session restore failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.idToken;

      if (!idToken) {
        throw new Error('Google Sign-In failed: No ID Token retrieved');
      }

      // Send Google Token to NestJS Backend
      const response = await apiClient.post<{
        tokens: { accessToken: string; refreshToken: string };
        user: UserProfile;
      }>('/auth/google', { token: idToken });

      const { tokens, user: userProfile } = response.data;

      // Save tokens securely
      await TokenService.saveTokens(tokens.accessToken, tokens.refreshToken);
      setUser(userProfile);
      
      return userProfile;
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled sign-in');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign-in in progress');
      } else {
        console.error('Google Sign-In Error:', error);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiClient.post('/auth/logout');
      await GoogleSignin.signOut();
    } catch (err) {
      console.log('Server logout failed, clearing tokens locally anyway:', err);
    } finally {
      await TokenService.clearTokens();
      setUser(null);
      setLoading(false);
    }
  };

  return { user, setUser, loading, loginWithGoogle, logout };
}
```

---

## 5. UI Component: User Profile & Custom Photo Upload

This React Native component demonstrates how to:
1. Display the User Profile photo, which defaults to their Google avatar and falls back to a custom avatar if uploaded.
2. Select and upload a custom profile image to `/users/profile-photo` using `multipart/form-data`.

```tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { apiClient } from '../services/api.client';
import { UserProfile } from '../hooks/useAuth';

interface ProfileProps {
  user: UserProfile;
  onProfileUpdate: (updatedUser: UserProfile) => void;
}

export const ProfileScreen: React.FC<ProfileProps> = ({ user, onProfileUpdate }) => {
  const [uploading, setUploading] = useState(false);

  const handleSelectAndUploadPhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.didCancel || !result.assets || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];
    
    // Create form-data payload for multer on NestJS
    const formData = new FormData();
    formData.append('file', {
      uri: asset.uri,
      type: asset.type || 'image/jpeg',
      name: asset.fileName || 'profile.jpg',
    } as any);

    setUploading(true);
    try {
      const response = await apiClient.patch<UserProfile>('/users/profile-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', 'Profile photo updated successfully!');
      onProfileUpdate(response.data); // Update profile state with new customPhotoUrl
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message?.[0] || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 
        DISPLAYING THE PHOTO:
        user.profilePhoto automatically resolves to: customPhotoUrl ?? googlePhotoUrl
      */}
      <View style={styles.photoContainer}>
        <Image
          source={{
            uri: user.profilePhoto || 'https://www.gravatar.com/avatar/?d=mp',
          }}
          style={styles.profileImage}
        />
        {uploading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.uploadButton}
        onPress={handleSelectAndUploadPhoto}
        disabled={uploading}
      >
        <Text style={styles.uploadButtonText}>Update Profile Photo</Text>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.nameText}>{user.fullName}</Text>
        <Text style={styles.emailText}>{user.email}</Text>
        <Text style={styles.usernameText}>
          {user.username ? `@${user.username}` : 'No username set'}
        </Text>
        {user.bio && <Text style={styles.bioText}>{user.bio}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  photoContainer: {
    position: 'relative',
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 30,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  infoContainer: {
    width: '100%',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 5,
  },
  usernameText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
    marginBottom: 15,
  },
  bioText: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
});
```
