import { Module } from '@nestjs/common';

import { CycleController } from '@/modules/cycle/controllers/cycle.controller';
import { CycleRepository } from '@/modules/cycle/repositories/cycle.repository';
import { CycleFinderService } from '@/modules/cycle/services/cycle-finder.service';
import { CycleWriterService } from '@/modules/cycle/services/cycle-writer.service';
import { GetCycleStatusUseCase } from '@/modules/cycle/use-cases/get-cycle-status.use-case';
import { GetTodaySessionUseCase } from '@/modules/cycle/use-cases/get-today-session.use-case';
import { ListPulseRecordsUseCase } from '@/modules/cycle/use-cases/list-pulse-records.use-case';
import { UpdateTodaySessionUseCase } from '@/modules/cycle/use-cases/update-today-session.use-case';
import { UpsertPulseRecordUseCase } from '@/modules/cycle/use-cases/upsert-pulse-record.use-case';
import { SettingsModule } from '@/modules/settings/settings.module';
import { AuthGuard } from '@/shared/guards/auth.guard';

@Module({
  imports: [SettingsModule],
  controllers: [CycleController],
  providers: [
    AuthGuard,
    CycleRepository,
    GetCycleStatusUseCase,
    GetTodaySessionUseCase,
    ListPulseRecordsUseCase,
    UpdateTodaySessionUseCase,
    UpsertPulseRecordUseCase,
    CycleFinderService,
    CycleWriterService,
  ],
  exports: [CycleFinderService, CycleWriterService],
})
export class CycleModule {}