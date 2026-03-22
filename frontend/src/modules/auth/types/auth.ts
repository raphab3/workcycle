export interface AuthStatusDTO {
  emailPasswordEnabled: boolean;
  firebaseConfigured: boolean;
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

export interface AuthUserDTO {
  authProvider: 'email' | 'google' | 'hybrid';
  displayName: string;
  email: string;
  hasGoogleLinked: boolean;
  hasPassword: boolean;
  id: string;
}

export interface AuthSessionDTO {
  token: string;
  user: AuthUserDTO;
}

export interface StoredAuthSession {
  token: string;
  user: AuthUserDTO;
}

export type AuthSessionStatus = 'loading' | 'authenticated' | 'unauthenticated';