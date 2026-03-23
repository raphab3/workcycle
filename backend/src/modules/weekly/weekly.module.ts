import { Module } from '@nestjs/common';

import { SettingsModule } from '@/modules/settings/settings.module';
import { WeeklyController } from '@/modules/weekly/controllers/weekly.controller';
import { WeeklyRepository } from '@/modules/weekly/repositories/weekly.repository';
import { WeeklyFinderService } from '@/modules/weekly/services/weekly-finder.service';
import { GetWeeklySnapshotUseCase } from '@/modules/weekly/use-cases/get-weekly-snapshot.use-case';
import { ListWeeklyHistoryUseCase } from '@/modules/weekly/use-cases/list-weekly-history.use-case';
import { AuthGuard } from '@/shared/guards/auth.guard';

@Module({
  imports: [SettingsModule],
  controllers: [WeeklyController],
  providers: [
    AuthGuard,
    WeeklyRepository,
    GetWeeklySnapshotUseCase,
    ListWeeklyHistoryUseCase,
    WeeklyFinderService,
  ],
  exports: [WeeklyFinderService],
})
export class WeeklyModule {}