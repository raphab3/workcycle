export type AuthProvider = 'email' | 'google' | 'hybrid';

export type AuthTokenType = 'access' | 'refresh';

export interface RefreshTokenPolicyResponse {
  endpoint: '/api/auth/refresh';
  rotation: 'rotate';
  transport: 'body';
}

export interface AuthTokenPayload {
  displayName: string;
  email: string;
  exp: number;
  provider: AuthProvider;
  sub: string;
  tokenType: AuthTokenType;
}

export interface AuthUserResponse {
  authProvider: AuthProvider;
  displayName: string;
  email: string;
  hasGoogleLinked: boolean;
  hasPassword: boolean;
  id: string;
}

export interface AuthSessionResponse {
  accessToken: string | null;
  accessTokenExpiresAt: string | null;
  refreshToken: string | null;
  refreshTokenExpiresAt: string | null;
  refreshTokenPolicy: RefreshTokenPolicyResponse;
  tokenType: 'Bearer';
  user: AuthUserResponse;
}

export interface GoogleOauthState {
  issuedAt: number;
  mode: 'login' | 'link';
  userId?: string;
}