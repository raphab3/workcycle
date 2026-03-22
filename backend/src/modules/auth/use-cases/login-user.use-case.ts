import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthRepository } from '@/modules/auth/repositories/auth.repository';
import { verifyPassword } from '@/shared/utils/password';

@Injectable()
export class LoginUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(input: { email: string; password: string }) {
    const user = await this.authRepository.findUserByEmail(input.email);

    if (!user?.passwordHash || !verifyPassword(input.password, user.passwordHash)) {
      throw new UnauthorizedException('Email or password is invalid.');
    }

    return user;
  }
}