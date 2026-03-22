import axios from 'axios';

import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

import { env } from '@/config/env';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { readStoredAuthSession } from '@/modules/auth/storage/authStorage';

import type { AuthSessionDTO } from '@/modules/auth/types';

interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _authRetry?: boolean;
}

let refreshSessionPromise: Promise<AuthSessionDTO> | null = null;

function isRefreshRequest(config?: AxiosRequestConfig) {
  return config?.url?.includes('/api/auth/refresh') ?? false;
}

function applyAuthorizationHeader(config: InternalAxiosRequestConfig, accessToken: string | null) {
  if (!accessToken) {
    return config;
  }

  config.headers.Authorization = `Bearer ${accessToken}`;

  return config;
}

function performControlledLogout() {
  useAuthStore.getState().signOut();
  queryClient.clear();
}

async function refreshAuthSession() {
  if (!refreshSessionPromise) {
    const storedSession = readStoredAuthSession();

    if (!storedSession?.refreshToken) {
      throw new Error('Refresh token is unavailable.');
    }

    refreshSessionPromise = axios.post<AuthSessionDTO>(
      `${env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
      { refreshToken: storedSession.refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      },
    )
      .then((response) => {
        useAuthStore.getState().mergeSession(response.data);

        return response.data;
      })
      .finally(() => {
        refreshSessionPromise = null;
      });
  }

  return refreshSessionPromise;
}

export function resetRefreshSessionPromiseForTests() {
  refreshSessionPromise = null;
}

export const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const storedSession = readStoredAuthSession();

  return applyAuthorizationHeader(config, storedSession?.accessToken ?? null);
});

export async function handleApiResponseError(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return Promise.reject(error);
  }

  const statusCode = error.response?.status;
  const originalRequest = error.config as RetryableAxiosRequestConfig | undefined;
  const storedSession = readStoredAuthSession();
  const canRefresh = statusCode === 401
    && Boolean(storedSession?.refreshToken)
    && Boolean(originalRequest)
    && !originalRequest?._authRetry
    && !isRefreshRequest(originalRequest);

  if (canRefresh && originalRequest) {
    originalRequest._authRetry = true;

    try {
      const refreshedSession = await refreshAuthSession();

      applyAuthorizationHeader(originalRequest, refreshedSession.accessToken);

      return api.request(originalRequest);
    } catch (refreshError) {
      performControlledLogout();

      return Promise.reject(refreshError);
    }
  }

  if (statusCode === 401) {
    performControlledLogout();
  }

  return Promise.reject(error);
}

api.interceptors.response.use(
  (response) => response,
  handleApiResponseError,
);