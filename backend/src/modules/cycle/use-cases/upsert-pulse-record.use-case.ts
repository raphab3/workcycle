import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CycleRepository } from '@/modules/cycle/repositories/cycle.repository';
import { SettingsFinderService } from '@/modules/settings/services/settings-finder.service';
import { buildTodaySessionDTO } from '@/modules/cycle/use-cases/shared-today-session';
import { getPulseWindowKey } from '@/modules/cycle/utils/operational-boundary';
import { addMinutesToTimestamp } from '@/modules/cycle/utils/pulse';

import type { UpsertPulseRecordInput } from '@/modules/cycle/cycle.schemas';

@Injectable()
export class UpsertPulseRecordUseCase {
  constructor(
    @Inject(CycleRepository)
    private readonly cycleRepository: CycleRepository,
    @Inject(SettingsFinderService)
    private readonly settingsFinderService: SettingsFinderService,
  ) {}

  async execute(userId: string, input: UpsertPulseRecordInput) {
    const session = await this.cycleRepository.findCycleSessionById(input.sessionId, userId);

    if (!session) {
      throw new NotFoundException('Cycle session was not found for pulse registration.');
    }

    if (input.projectId) {
      const project = await this.cycleRepository.findProjectById(input.projectId, userId);

      if (!project) {
        throw new BadRequestException('Pulse project does not belong to the authenticated user.');
      }
    }

    await this.cycleRepository.upsertPulseRecord({
      confirmedMinutes: input.confirmedMinutes,
      cycleSessionId: session.id,
      expiresAt: new Date(input.expiresAt ?? addMinutesToTimestamp(input.firedAt, 5)),
      firedAt: new Date(input.firedAt),
      projectId: input.projectId ?? session.activeProjectId,
      resolution: input.resolution,
      respondedAt: input.respondedAt ? new Date(input.respondedAt) : null,
      reviewedAt: input.reviewedAt ? new Date(input.reviewedAt) : null,
      status: input.status,
      userId,
      windowKey: getPulseWindowKey(input.firedAt),
    });

    if (input.status === 'unconfirmed' && input.resolution === 'pending') {
      await this.cycleRepository.updateCycleSession(session.id, userId, {
        state: new Date(input.expiresAt ?? addMinutesToTimestamp(input.firedAt, 5)).getTime() <= Date.now()
          ? 'paused_inactivity'
          : session.state,
      });
    }

    const settings = await this.settingsFinderService.getUserSettings(userId);
    const updatedSession = await this.cycleRepository.findCycleSessionById(session.id, userId);
    const pulseRows = await this.cycleRepository.listPulseRecords(session.id);
    const timeBlockRows = await this.cycleRepository.listTimeBlocks(session.id);
    const taskRows = await this.cycleRepository.listTasksForTaskScope(userId, session.id);

    return buildTodaySessionDTO({
      pulseRows,
      session: updatedSession,
      settings,
      taskRows,
      timeBlockRows,
    });
  }
}