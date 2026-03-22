import axios from 'axios';

import { env } from '@/config/env';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import { readStoredAuthSession } from '@/modules/auth/storage/authStorage';

export const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const storedSession = readStoredAuthSession();

  if (storedSession?.accessToken) {
    config.headers.Authorization = `Bearer ${storedSession.accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      useAuthStore.getState().signOut();
    }

    return Promise.reject(error);
  },
);