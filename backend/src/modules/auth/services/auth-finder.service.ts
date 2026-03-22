import { Injectable } from '@nestjs/common';

import { GetAuthStatusUseCase } from '@/modules/auth/use-cases/get-auth-status.use-case';

@Injectable()
export class AuthFinderService {
  constructor(private readonly getAuthStatusUseCase: GetAuthStatusUseCase) {}

  getStatus() {
    return this.getAuthStatusUseCase.execute();
  }
}