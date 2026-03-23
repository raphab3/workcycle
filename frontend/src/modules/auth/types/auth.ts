export interface AuthStatusDTO {
  emailPasswordEnabled: boolean;
  firebaseConfigured: boolean;
  oauthConfigured: boolean;
  provider: 'google' | string;
  status: 'pending' | 'ready' | string;
}

export interface GoogleCalendarDTO {
  accountId: string;
  colorHex: string;
  id: string;
  isIncluded: boolean;
  isPrimary: boolean;
  name: string;
  syncedAt: string | null;
}

export interface GoogleAccountDTO {
  calendars: GoogleCalendarDTO[];
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

export interface RefreshTokenPolicyDTO {
  endpoint: '/api/auth/refresh' | string;
  rotation: 'rotate' | string;
  transport: 'body' | string;
}

export interface AuthSessionDTO {
  accessToken: string | null;
  accessTokenExpiresAt: string | null;
  refreshToken: string | null;
  refreshTokenExpiresAt: string | null;
  refreshTokenPolicy: RefreshTokenPolicyDTO;
  tokenType: 'Bearer';
  user: AuthUserDTO;
}

export interface StoredAuthSession {
  accessToken: string | null;
  accessTokenExpiresAt: string | null;
  refreshToken: string | null;
  refreshTokenExpiresAt: string | null;
  refreshTokenPolicy: RefreshTokenPolicyDTO;
  tokenType: 'Bearer';
  user: AuthUserDTO;
}

export type AuthSessionStatus = 'loading' | 'authenticated' | 'unauthenticated';