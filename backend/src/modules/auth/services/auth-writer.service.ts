import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

import { BuildGoogleLinkUrlUseCase } from '@/modules/auth/use-cases/build-google-link-url.use-case';
import { GetAuthSessionUseCase } from '@/modules/auth/use-cases/get-auth-session.use-case';
import { LoginUserUseCase } from '@/modules/auth/use-cases/login-user.use-case';
import { RegisterUserUseCase } from '@/modules/auth/use-cases/register-user.use-case';
import { AuthRepository } from '@/modules/auth/repositories/auth.repository';
import { issueAuthToken } from '@/shared/utils/auth-token';
import { env } from '@/shared/config';

import type { AuthSessionResponse, AuthTokenPayload, GoogleOauthState } from '@/modules/auth/types/auth';

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

@Injectable()
export class AuthWriterService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly buildGoogleLinkUrlUseCase: BuildGoogleLinkUrlUseCase,
    private readonly getAuthSessionUseCase: GetAuthSessionUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
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

    await this.authRepository.upsertGoogleAccount({
      accessToken: tokens.access_token,
      displayName: profile.name,
      email: profile.email,
      googleId: profile.id,
      refreshToken: tokens.refresh_token ?? existingGoogleAccount?.refreshToken ?? '',
      tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1_000),
      userId: user.id,
    });


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
    redirectUrl.searchParams.set('authToken', session.token);
    redirectUrl.searchParams.set('authDisplayName', session.user.displayName);
    redirectUrl.searchParams.set('authEmail', session.user.email);
    redirectUrl.searchParams.set('authProvider', session.user.authProvider);
    redirectUrl.searchParams.set('authUserId', session.user.id);
    redirectUrl.searchParams.set('authHasGoogleLinked', String(session.user.hasGoogleLinked));
    redirectUrl.searchParams.set('authHasPassword', String(session.user.hasPassword));

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

  private async buildSessionResponse(userId: string, email: string, displayName: string, provider: AuthTokenPayload['provider']): Promise<AuthSessionResponse> {
    const user = await this.getAuthSessionUseCase.execute(userId);

    return {
      token: issueAuthToken({
        displayName,
        email,
        provider,
        userId,
      }),
      user,
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
}