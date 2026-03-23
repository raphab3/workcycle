import { Inject, Injectable } from '@nestjs/common';

import { UpdateTodaySessionUseCase } from '@/modules/cycle/use-cases/update-today-session.use-case';
import { UpsertPulseRecordUseCase } from '@/modules/cycle/use-cases/upsert-pulse-record.use-case';

import type { UpdateTodaySessionInput, UpsertPulseRecordInput } from '@/modules/cycle/cycle.schemas';

@Injectable()
export class CycleWriterService {
  constructor(
    @Inject(UpdateTodaySessionUseCase)
    private readonly updateTodaySessionUseCase: UpdateTodaySessionUseCase,
    @Inject(UpsertPulseRecordUseCase)
    private readonly upsertPulseRecordUseCase: UpsertPulseRecordUseCase,
  ) {}

  updateTodaySession(userId: string, input: UpdateTodaySessionInput) {
    return this.updateTodaySessionUseCase.execute(userId, input);
  }

  upsertPulseRecord(userId: string, input: UpsertPulseRecordInput) {
    return this.upsertPulseRecordUseCase.execute(userId, input);
  }
}