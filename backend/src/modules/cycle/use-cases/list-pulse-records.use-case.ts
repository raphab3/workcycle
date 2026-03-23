import { Inject, Injectable } from '@nestjs/common';

import { CycleRepository } from '@/modules/cycle/repositories/cycle.repository';

import type { TodayPulseRecordDTO } from '@/modules/cycle/types/today';

@Injectable()
export class ListPulseRecordsUseCase {
  constructor(
    @Inject(CycleRepository)
    private readonly cycleRepository: CycleRepository,
  ) {}

  async execute(userId: string, options?: { cycleDate?: string; sessionId?: string }): Promise<TodayPulseRecordDTO[]> {
    let sessionId = options?.sessionId;

    if (!sessionId && options?.cycleDate) {
      const session = await this.cycleRepository.findCycleSessionByDate(userId, options.cycleDate);

      sessionId = session?.id;
    }

    if (!sessionId) {
      const latestSession = await this.cycleRepository.findLatestCycleSession(userId);

      sessionId = latestSession?.id;
    }

    if (!sessionId) {
      return [];
    }

    const pulseRows = await this.cycleRepository.listPulseRecords(sessionId);

    return pulseRows.map((pulse) => ({
      confirmedMinutes: pulse.confirmedMinutes,
      firedAt: pulse.firedAt.toISOString(),
      projectId: pulse.projectId,
      resolution: pulse.resolution,
      respondedAt: pulse.respondedAt?.toISOString() ?? null,
      reviewedAt: pulse.reviewedAt?.toISOString() ?? null,
      status: pulse.status,
    }));
  }
}