import { Module } from '@nestjs/common';

import { SettingsController } from '@/modules/settings/controllers/settings.controller';
import { SettingsRepository } from '@/modules/settings/repositories/settings.repository';
import { SettingsFinderService } from '@/modules/settings/services/settings-finder.service';
import { SettingsWriterService } from '@/modules/settings/services/settings-writer.service';
import { GetUserSettingsUseCase } from '@/modules/settings/use-cases/get-user-settings.use-case';
import { UpdateUserSettingsUseCase } from '@/modules/settings/use-cases/update-user-settings.use-case';
import { AuthGuard } from '@/shared/guards/auth.guard';

@Module({
  controllers: [SettingsController],
  providers: [
    AuthGuard,
    SettingsRepository,
    GetUserSettingsUseCase,
    UpdateUserSettingsUseCase,
    SettingsFinderService,
    SettingsWriterService,
  ],
  exports: [SettingsRepository, SettingsFinderService, SettingsWriterService],
})
export class SettingsModule {}