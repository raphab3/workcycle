import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthRepository } from '@/modules/auth/repositories/auth.repository';

import type { AuthUserResponse } from '@/modules/auth/types/auth';

@Injectable()
export class GetAuthSessionUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(userId: string): Promise<AuthUserResponse> {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException('Authenticated user was not found.');
    }

    const googleAccount = await this.authRepository.findGoogleAccountByEmail(user.email);

    return {
      authProvider: user.authProvider,
      displayName: user.displayName,
      email: user.email,
      hasGoogleLinked: Boolean(googleAccount),
      hasPassword: Boolean(user.passwordHash),
      id: user.id,
    };
  }
}