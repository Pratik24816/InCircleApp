import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = '@incircle/access_token';
const REFRESH_TOKEN_KEY = '@incircle/refresh_token';

export class TokenService {
  static async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  static async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  }

  static async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  }

  static async clearTokens(): Promise<void> {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}
