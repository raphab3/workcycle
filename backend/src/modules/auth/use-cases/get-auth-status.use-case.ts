import { Injectable } from '@nestjs/common';

@Injectable()
export class GetAuthStatusUseCase {
  execute() {
    return {
      oauthConfigured: false,
      provider: 'google',
      status: 'pending',
    } as const;
  }
}