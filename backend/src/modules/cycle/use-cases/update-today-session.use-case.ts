import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CycleRepository } from '@/modules/cycle/repositories/cycle.repository';
import { SettingsFinderService } from '@/modules/settings/services/settings-finder.service';
import { buildTodaySessionDTO } from '@/modules/cycle/use-cases/shared-today-session';
import { resolveOperationalCycleDate } from '@/modules/cycle/utils/operational-boundary';

import type { UpdateTodaySessionInput } from '@/modules/cycle/cycle.schemas';

@Injectable()
export class UpdateTodaySessionUseCase {
  constructor(
    @Inject(CycleRepository)
    private readonly cycleRepository: CycleRepository,
    @Inject(SettingsFinderService)
    private readonly settingsFinderService: SettingsFinderService,
  ) {}

  async execute(userId: string, input: UpdateTodaySessionInput) {
    const settings = await this.settingsFinderService.getUserSettings(userId);
    const effectiveCycleDate = input.cycleDate ?? resolveOperationalCycleDate(new Date(), {
      cycleStartHour: settings.cycleStartHour,
      timezone: settings.timezone,
    });

    const session = input.sessionId
      ? await this.cycleRepository.findCycleSessionById(input.sessionId, userId)
      : await this.cycleRepository.findCycleSessionByDate(userId, effectiveCycleDate);

    if (!session) {
      throw new NotFoundException('Cycle session was not found for update.');
    }

    if (input.activeProjectId) {
      const project = await this.cycleRepository.findProjectById(input.activeProjectId, userId);

      if (!project) {
        throw new BadRequestException('Active project does not belong to the authenticated user.');
      }
    }

    await this.cycleRepository.updateCycleSession(session.id, userId, {
      activeProjectId: input.activeProjectId,
      closedAt: input.closedAt === undefined ? undefined : input.closedAt ? new Date(input.closedAt) : null,
      previousCycleDate: input.rollover?.previousCycleDate,
      rolloverNoticeDescription: input.rollover?.noticeDescription,
      rolloverNoticeTitle: input.rollover?.noticeTitle,
      rolloverStrategy: input.rollover?.strategy,
      rolloverTriggeredAt: input.rollover?.triggeredAt ? new Date(input.rollover.triggeredAt) : undefined,
      snapshot: input.snapshot,
      startedAt: input.startedAt === undefined ? undefined : input.startedAt ? new Date(input.startedAt) : null,
      state: input.state,
    });

    if (input.timeBlocks) {
      await this.cycleRepository.replaceTimeBlocks(session.id, userId, input.timeBlocks.map((timeBlock) => ({
        confirmedMinutes: timeBlock.confirmedMinutes,
        endedAt: timeBlock.endedAt ? new Date(timeBlock.endedAt) : null,
        projectId: timeBlock.projectId,
        startedAt: new Date(timeBlock.startedAt),
      })));
    }

    if (input.rollover?.carryOverInProgressTaskIds && input.rollover.carryOverInProgressTaskIds.length > 0) {
      await this.cycleRepository.moveCurrentTasksToNextCycle(userId, session.id, input.rollover.carryOverInProgressTaskIds);
    }

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