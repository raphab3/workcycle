import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthRepository } from '@/modules/auth/repositories/auth.repository';

import type { AuthSessionResponse } from '@/modules/auth/types/auth';

function buildRefreshTokenPolicy() {
  return {
    endpoint: '/api/auth/refresh' as const,
    rotation: 'rotate' as const,
    transport: 'body' as const,
  };
}

@Injectable()
export class GetAuthSessionUseCase {
  constructor(
    @Inject(AuthRepository)
    private readonly authRepository: AuthRepository,
  ) {}

  async execute(input: { accessTokenExpiresAt?: string | null; userId: string }): Promise<AuthSessionResponse> {
    const { accessTokenExpiresAt = null, userId } = input;
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException('Authenticated user was not found.');
    }

    const googleAccount = await this.authRepository.findGoogleAccountByEmail(user.email);

    return {
      accessToken: null,
      accessTokenExpiresAt,
      refreshToken: null,
      refreshTokenExpiresAt: null,
      refreshTokenPolicy: buildRefreshTokenPolicy(),
      tokenType: 'Bearer',
      user: {
        authProvider: user.authProvider,
        displayName: user.displayName,
        email: user.email,
        hasGoogleLinked: Boolean(googleAccount),
        hasPassword: Boolean(user.passwordHash),
        id: user.id,
      },
    };
  }
}