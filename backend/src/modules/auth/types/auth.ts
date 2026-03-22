export type AuthProvider = 'email' | 'google' | 'hybrid';

export interface AuthTokenPayload {
  displayName: string;
  email: string;
  exp: number;
  provider: AuthProvider;
  sub: string;
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
  token: string;
  user: AuthUserResponse;
}

export interface GoogleOauthState {
  issuedAt: number;
  mode: 'login' | 'link';
  userId?: string;
}