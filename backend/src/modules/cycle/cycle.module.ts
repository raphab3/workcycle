import { Module } from '@nestjs/common';

import { CycleController } from '@/modules/cycle/controllers/cycle.controller';
import { CycleFinderService } from '@/modules/cycle/services/cycle-finder.service';
import { GetCycleStatusUseCase } from '@/modules/cycle/use-cases/get-cycle-status.use-case';

@Module({
  controllers: [CycleController],
  providers: [GetCycleStatusUseCase, CycleFinderService],
  exports: [CycleFinderService],
})
export class CycleModule {}