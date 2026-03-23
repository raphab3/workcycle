import { Injectable } from '@nestjs/common';

import { GetTodaySessionUseCase } from '@/modules/cycle/use-cases/get-today-session.use-case';
import { GetCycleStatusUseCase } from '@/modules/cycle/use-cases/get-cycle-status.use-case';
import { ListPulseRecordsUseCase } from '@/modules/cycle/use-cases/list-pulse-records.use-case';

@Injectable()
export class CycleFinderService {
  constructor(
    private readonly getCycleStatusUseCase: GetCycleStatusUseCase,
    private readonly getTodaySessionUseCase: GetTodaySessionUseCase,
    private readonly listPulseRecordsUseCase: ListPulseRecordsUseCase,
  ) {}

  getStatus() {
    return this.getCycleStatusUseCase.execute();
  }

  getTodaySession(userId: string, cycleDate?: string) {
    return this.getTodaySessionUseCase.execute(userId, cycleDate);
  }

  listPulseRecords(userId: string, options?: { cycleDate?: string; sessionId?: string }) {
    return this.listPulseRecordsUseCase.execute(userId, options);
  }
}