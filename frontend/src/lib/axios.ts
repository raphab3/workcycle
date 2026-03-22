import axios from 'axios';

import { env } from '@/config/env';
import { readStoredAuthSession } from '@/modules/auth/storage/authStorage';

export const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const storedSession = readStoredAuthSession();

  if (storedSession?.token) {
    config.headers.Authorization = `Bearer ${storedSession.token}`;
  }

  return config;
});