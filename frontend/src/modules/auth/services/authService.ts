import { api } from '@/lib/axios';
import { env } from '@/config/env';

import type { AuthSessionDTO, AuthStatusDTO, AuthUserDTO, GoogleAccountDTO } from '@/modules/auth/types';

async function getAuthStatus() {
  const response = await api.get<AuthStatusDTO>('/api/auth/status');

  return response.data;
}

async function getAuthSession() {
  const response = await api.get<AuthUserDTO>('/api/auth/session');

  return response.data;
}

async function getGoogleAccounts() {
  const response = await api.get<GoogleAccountDTO[]>('/api/accounts');

  return response.data;
}

function getGoogleLoginUrl() {
  return `${env.NEXT_PUBLIC_API_URL}/api/auth/google/start`;
}

async function getGoogleLinkUrl() {
  const response = await api.get<{ url: string }>('/api/auth/google/link-url');

  return response.data;
}

async function login(input: { email: string; password: string }) {
  const response = await api.post<AuthSessionDTO>('/api/auth/login', input);

  return response.data;
}

async function register(input: { displayName: string; email: string; password: string }) {
  const response = await api.post<AuthSessionDTO>('/api/auth/register', input);

  return response.data;
}

export const authService = {
  getAuthSession,
  getAuthStatus,
  getGoogleAccounts,
  getGoogleLinkUrl,
  getGoogleLoginUrl,
  login,
  register,
};