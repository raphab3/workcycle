export interface AuthStatusDTO {
  oauthConfigured: boolean;
  provider: 'google' | string;
  status: 'pending' | 'ready' | string;
}

export interface GoogleAccountDTO {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  tokenExpiresAt: string;
  updatedAt: string;
}

export interface AuthSession {
  accountId?: string;
  displayName: string;
  email: string;
  provider: 'google' | 'local';
  source: 'connected_account' | 'local_fallback';
}

export type AuthSessionStatus = 'loading' | 'authenticated' | 'unauthenticated';