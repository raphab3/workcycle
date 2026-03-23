import { Inject, Injectable } from '@nestjs/common';

import { GetWeeklySnapshotUseCase } from '@/modules/weekly/use-cases/get-weekly-snapshot.use-case';
import { ListWeeklyHistoryUseCase } from '@/modules/weekly/use-cases/list-weekly-history.use-case';

@Injectable()
export class WeeklyFinderService {
  constructor(
    @Inject(GetWeeklySnapshotUseCase)
    private readonly getWeeklySnapshotUseCase: GetWeeklySnapshotUseCase,
    @Inject(ListWeeklyHistoryUseCase)
    private readonly listWeeklyHistoryUseCase: ListWeeklyHistoryUseCase,
  ) {}

  getWeeklySnapshot(userId: string, weekKey?: string) {
    return this.getWeeklySnapshotUseCase.execute(userId, weekKey);
  }

  listWeeklyHistory(userId: string, options?: { fromWeekKey?: string; limit?: number; toWeekKey?: string }) {
    return this.listWeeklyHistoryUseCase.execute(userId, options);
  }
}