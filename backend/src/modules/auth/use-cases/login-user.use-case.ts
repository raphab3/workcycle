import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthRepository } from '@/modules/auth/repositories/auth.repository';
import { verifyPassword } from '@/shared/utils/password';

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(AuthRepository)
    private readonly authRepository: AuthRepository,
  ) {}

  async execute(input: { email: string; password: string }) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await this.authRepository.findUserByEmail(normalizedEmail);

    if (!user?.passwordHash || !verifyPassword(input.password, user.passwordHash)) {
      throw new UnauthorizedException('Email or password is invalid.');
    }

    return user;
  }
}