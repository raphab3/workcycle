import { ConflictException, Injectable } from '@nestjs/common';

import { AuthRepository } from '@/modules/auth/repositories/auth.repository';
import { hashPassword } from '@/shared/utils/password';

@Injectable()
export class RegisterUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(input: { displayName: string; email: string; password: string }) {
    const existingUser = await this.authRepository.findUserByEmail(input.email);

    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }

    return this.authRepository.createUser({
      authProvider: 'email',
      displayName: input.displayName,
      email: input.email,
      passwordHash: hashPassword(input.password),
    });
  }
}