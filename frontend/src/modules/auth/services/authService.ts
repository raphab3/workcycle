import { api } from '@/lib/axios';
import { env } from '@/config/env';

import type { AuthStatusDTO, GoogleAccountDTO } from '@/modules/auth/types';

async function getAuthStatus() {
  const response = await api.get<AuthStatusDTO>('/api/auth/status');

  return response.data;
}

async function getGoogleAccounts() {
  const response = await api.get<GoogleAccountDTO[]>('/api/accounts');

  return response.data;
}

function getGoogleLoginUrl() {
  return `${env.NEXT_PUBLIC_API_URL}/api/auth/google`;
}

export const authService = {
  getAuthStatus,
  getGoogleAccounts,
  getGoogleLoginUrl,
};