import { Module } from '@nestjs/common';

import { AuthController } from '@/modules/auth/controllers/auth.controller';
import { AuthFinderService } from '@/modules/auth/services/auth-finder.service';
import { GetAuthStatusUseCase } from '@/modules/auth/use-cases/get-auth-status.use-case';

@Module({
  controllers: [AuthController],
  providers: [GetAuthStatusUseCase, AuthFinderService],
  exports: [AuthFinderService],
})
export class AuthModule {}