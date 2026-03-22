import { Inject, Injectable } from '@nestjs/common';

import { AuthRepository } from '@/modules/auth/repositories/auth.repository';
import { GetAuthSessionUseCase } from '@/modules/auth/use-cases/get-auth-session.use-case';
import { GetAuthStatusUseCase } from '@/modules/auth/use-cases/get-auth-status.use-case';

import type { AuthTokenPayload } from '@/modules/auth/types/auth';

@Injectable()
export class AuthFinderService {
  constructor(
    @Inject(AuthRepository)
    private readonly authRepository: AuthRepository,
    @Inject(GetAuthSessionUseCase)
    private readonly getAuthSessionUseCase: GetAuthSessionUseCase,
    @Inject(GetAuthStatusUseCase)
    private readonly getAuthStatusUseCase: GetAuthStatusUseCase,
  ) {}

  getStatus() {
    return this.getAuthStatusUseCase.execute();
  }

  async getSession(user: AuthTokenPayload) {
    return this.getAuthSessionUseCase.execute({
      accessTokenExpiresAt: new Date(user.exp * 1_000).toISOString(),
      userId: user.sub,
    });
  }

  async getGoogleConnections(user: AuthTokenPayload) {
    return this.authRepository.listGoogleAccountsByUserId(user.sub);
  }
}