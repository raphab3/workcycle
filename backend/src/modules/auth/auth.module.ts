import { Module } from '@nestjs/common';

import { AuthController } from '@/modules/auth/controllers/auth.controller';
import { AuthRepository } from '@/modules/auth/repositories/auth.repository';
import { AuthFinderService } from '@/modules/auth/services/auth-finder.service';
import { AuthWriterService } from '@/modules/auth/services/auth-writer.service';
import { BuildGoogleLinkUrlUseCase } from '@/modules/auth/use-cases/build-google-link-url.use-case';
import { GetAuthSessionUseCase } from '@/modules/auth/use-cases/get-auth-session.use-case';
import { GetAuthStatusUseCase } from '@/modules/auth/use-cases/get-auth-status.use-case';
import { LoginUserUseCase } from '@/modules/auth/use-cases/login-user.use-case';
import { RegisterUserUseCase } from '@/modules/auth/use-cases/register-user.use-case';
import { AuthGuard } from '@/shared/guards/auth.guard';

@Module({
  controllers: [AuthController],
  providers: [
    AuthGuard,
    AuthRepository,
    GetAuthStatusUseCase,
    GetAuthSessionUseCase,
    RegisterUserUseCase,
    LoginUserUseCase,
    BuildGoogleLinkUrlUseCase,
    AuthFinderService,
    AuthWriterService,
  ],
  exports: [AuthFinderService, AuthWriterService],
})
export class AuthModule {}