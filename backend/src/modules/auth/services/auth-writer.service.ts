import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

import { BuildGoogleLinkUrlUseCase } from '@/modules/auth/use-cases/build-google-link-url.use-case';
import { GetAuthSessionUseCase } from '@/modules/auth/use-cases/get-auth-session.use-case';
import { LoginUserUseCase } from '@/modules/auth/use-cases/login-user.use-case';
import { RegisterUserUseCase } from '@/modules/auth/use-cases/register-user.use-case';
import { AuthRepository } from '@/modules/auth/repositories/auth.repository';
import { FirebaseAdminService } from '@/shared/providers/firebase/firebase-admin.service';
import { issueAccessToken, issueRefreshToken, verifyRefreshToken } from '@/shared/utils/auth-token';
import { env } from '@/shared/config';

import type { DecodedIdToken } from 'firebase-admin/auth';

import type { AuthProvider, AuthSessionResponse, AuthTokenPayload, GoogleOauthState } from '@/modules/auth/types/auth';

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}

interface GoogleProfileResponse {
  email: string;
  id: string;
  name: string;
}

interface GoogleCalendarListResponse {
  items?: GoogleCalendarListItem[];
  nextPageToken?: string;
}

interface GoogleCalendarListItem {
  backgroundColor?: string;
  id?: string;
  primary?: boolean;
  summary?: string;
}

@Injectable()
export class AuthWriterService {
  constructor(
    @Inject(AuthRepository)
    private readonly authRepository: AuthRepository,
    @Inject(FirebaseAdminService)
    private readonly firebaseAdminService: FirebaseAdminService,
    @Inject(BuildGoogleLinkUrlUseCase)
    private readonly buildGoogleLinkUrlUseCase: BuildGoogleLinkUrlUseCase,
    @Inject(GetAuthSessionUseCase)
    private readonly getAuthSessionUseCase: GetAuthSessionUseCase,
    @Inject(LoginUserUseCase)
    private readonly loginUserUseCase: LoginUserUseCase,
    @Inject(RegisterUserUseCase)
    private readonly registerUserUseCase: RegisterUserUseCase,
  ) {}

  async getGoogleLinkUrl(user: AuthTokenPayload) {
    return {
      url: this.buildGoogleLinkUrlUseCase.execute({
        issuedAt: Date.now(),
        mode: 'link',
        userId: user.sub,
      }),
    };
  }

  getGoogleLoginUrl() {
    return this.buildGoogleLinkUrlUseCase.execute({
      issuedAt: Date.now(),
      mode: 'login',
    });
  }

  async handleGoogleCallback(code: string, encodedState: string) {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REDIRECT_URI) {
      throw new InternalServerErrorException('Google OAuth is not configured.');
    }

    const state = JSON.parse(Buffer.from(encodedState, 'base64url').toString('utf-8')) as GoogleOauthState;
    const tokens = await this.exchangeGoogleCode(code);
    const profile = await this.fetchGoogleProfile(tokens.access_token);

    let user = state.userId
      ? await this.authRepository.findUserById(state.userId)
      : await this.authRepository.findUserByEmail(profile.email);

    const existingGoogleAccount = await this.authRepository.findGoogleAccountByGoogleId(profile.id)
      ?? await this.authRepository.findGoogleAccountByEmail(profile.email);

    if (state.mode === 'link' && !user) {
      throw new UnauthorizedException('Authenticated user was not found for Google linking.');
    }

    if (!user) {
      user = await this.authRepository.createUser({
        authProvider: 'google',
        displayName: profile.name,
        email: profile.email,
        passwordHash: null,
      });
    } else {
      const nextProvider = user.passwordHash ? 'hybrid' : 'google';

      user = await this.authRepository.updateUser({
        authProvider: nextProvider,
        displayName: user.displayName || profile.name,
        googleLinkedAt: new Date(),
        passwordHash: user.passwordHash,
        userId: user.id,
      });
    }

    if (existingGoogleAccount?.userId && existingGoogleAccount.userId !== user.id) {
      throw new ConflictException('This Google account is already linked to another user.');
    }

    const googleAccount = await this.authRepository.upsertGoogleAccount({
      accessToken: tokens.access_token,
      displayName: profile.name,
      email: profile.email,
      googleId: profile.id,
      refreshToken: tokens.refresh_token ?? existingGoogleAccount?.refreshToken ?? '',
      tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1_000),
      userId: user.id,
    });

    const calendars = await this.fetchGoogleCalendars(tokens.access_token);

    await this.authRepository.syncGoogleCalendars(googleAccount.id, calendars);


    if (!user) {
      throw new InternalServerErrorException('Google authentication could not resolve a user.');
    }
    const session = await this.buildSessionResponse(user.id, user.email, user.displayName, user.authProvider);

    if (state.mode === 'link') {
      const redirectUrl = new URL('/configuracoes', env.FRONTEND_ORIGIN);
      redirectUrl.searchParams.set('google', 'linked');

      return redirectUrl.toString();
    }

    const redirectUrl = new URL('/login', env.FRONTEND_ORIGIN);
    redirectUrl.searchParams.set('authSession', Buffer.from(JSON.stringify(session)).toString('base64url'));

    return redirectUrl.toString();
  }

  async login(input: { email: string; password: string }): Promise<AuthSessionResponse> {
    const user = await this.loginUserUseCase.execute(input);

    return this.buildSessionResponse(user.id, user.email, user.displayName, user.authProvider);
  }

  async register(input: { displayName: string; email: string; password: string }): Promise<AuthSessionResponse> {
    const user = await this.registerUserUseCase.execute(input);

    return this.buildSessionResponse(user.id, user.email, user.displayName, user.authProvider);
  }

  async loginWithFirebase(idToken: string): Promise<AuthSessionResponse> {
    const decodedToken = await this.firebaseAdminService.verifyIdToken(idToken);
    const email = decodedToken.email?.trim().toLowerCase();

    if (!email) {
      throw new UnauthorizedException('Firebase token does not contain a usable email.');
    }

    const firebaseProvider = this.resolveFirebaseProvider(decodedToken);
    const displayName = decodedToken.name?.trim() || email.split('@')[0] || 'WorkCycle User';
    let user = await this.authRepository.findUserByEmail(email);

    if (!user) {
      user = await this.authRepository.createUser({
        authProvider: firebaseProvider,
        displayName,
        email,
        passwordHash: null,
      });
    } else {
      user = await this.authRepository.updateUser({
        authProvider: this.mergeAuthProviders(user.authProvider, firebaseProvider),
        displayName: user.displayName || displayName,
        googleLinkedAt: firebaseProvider === 'google' ? user.googleLinkedAt ?? new Date() : user.googleLinkedAt,
        passwordHash: user.passwordHash,
        userId: user.id,
      });
    }

    return this.buildSessionResponse(user.id, user.email, user.displayName, user.authProvider);
  }

  async refreshSession(refreshToken: string): Promise<AuthSessionResponse> {
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new UnauthorizedException('Refresh token is invalid or expired.');
    }

    return this.buildSessionResponse(payload.sub, payload.email, payload.displayName, payload.provider);
  }

  private async buildSessionResponse(userId: string, email: string, displayName: string, provider: AuthTokenPayload['provider']): Promise<AuthSessionResponse> {
    const accessToken = issueAccessToken({
      displayName,
      email,
      provider,
      userId,
    });
    const refreshToken = issueRefreshToken({
      displayName,
      email,
      provider,
      userId,
    });
    const session = await this.getAuthSessionUseCase.execute({
      accessTokenExpiresAt: accessToken.expiresAt,
      userId,
    });

    return {
      ...session,
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
      refreshTokenExpiresAt: refreshToken.expiresAt,
    };
  }

  private async exchangeGoogleCode(code: string) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID!,
        client_secret: env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: env.GOOGLE_REDIRECT_URI!,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });

    if (!response.ok) {
      throw new BadRequestException('Google token exchange failed.');
    }

    return response.json() as Promise<GoogleTokenResponse>;
  }

  private async fetchGoogleProfile(accessToken: string) {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new BadRequestException('Google profile fetch failed.');
    }

    return response.json() as Promise<GoogleProfileResponse>;
  }

  private async fetchGoogleCalendars(accessToken: string) {
    const calendars: Array<{
      colorHex: string;
      googleCalendarId: string;
      isPrimary: boolean;
      name: string;
    }> = [];
    let pageToken: string | undefined;

    do {
      const url = new URL('https://www.googleapis.com/calendar/v3/users/me/calendarList');
      url.searchParams.set('maxResults', '250');

      if (pageToken) {
        url.searchParams.set('pageToken', pageToken);
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new BadRequestException('Google calendar list fetch failed.');
      }

      const payload = await response.json() as GoogleCalendarListResponse;

      calendars.push(
        ...(payload.items ?? [])
          .filter((calendar): calendar is Required<Pick<GoogleCalendarListItem, 'id' | 'summary'>> & GoogleCalendarListItem => Boolean(calendar.id && calendar.summary))
          .map((calendar) => ({
            colorHex: calendar.backgroundColor ?? '#9ca3af',
            googleCalendarId: calendar.id,
            isPrimary: Boolean(calendar.primary),
            name: calendar.summary,
          })),
      );

      pageToken = payload.nextPageToken ?? undefined;
    } while (pageToken);

    return calendars;
  }

  private mergeAuthProviders(currentProvider: AuthProvider, nextProvider: 'email' | 'google') {
    if (currentProvider === 'hybrid' || currentProvider !== nextProvider) {
      return currentProvider === nextProvider ? currentProvider : 'hybrid';
    }

    return currentProvider;
  }

  private resolveFirebaseProvider(decodedToken: DecodedIdToken): 'email' | 'google' {
    return decodedToken.firebase.sign_in_provider === 'google.com' ? 'google' : 'email';
  }
}