import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/api.config';
import { TokenService } from './token.service';
import type { AuthTokens } from '../types/auth';

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

apiClient.interceptors.request.use(async config => {
  const token = await TokenService.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined;
    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshToken = await TokenService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const { data } = await axios.post<AuthTokens>(`${API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      await TokenService.saveTokens(data.accessToken, data.refreshToken);
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      }
      return apiClient(originalRequest);
    } catch (refreshError) {
      await TokenService.clearTokens();
      return Promise.reject(refreshError);
    }
  },
);

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (Array.isArray(data?.message)) {
      return data.message.join(', ');
    }
    if (typeof data?.message === 'string') {
      return data.message;
    }
    if (error.message === 'Network Error') {
      return `Cannot reach backend at ${API_BASE_URL}. Same Wi-Fi? Set DEV_API_HOST in mobile/src/config/api.config.local.ts to your PC IP. Or USB: adb reverse tcp:3000 tcp:3000 and use 127.0.0.1.`;
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong';
}
