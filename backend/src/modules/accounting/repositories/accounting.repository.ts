import { Injectable } from '@nestjs/common';
import { desc } from 'drizzle-orm';

import { DrizzleService } from '@/shared/database/drizzle.service';
import { eventAccountingStatuses } from '@/shared/database/schema';

@Injectable()
export class AccountingRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async listStatuses() {
    return this.drizzleService.db
      .select({
        id: eventAccountingStatuses.id,
        eventId: eventAccountingStatuses.eventId,
        date: eventAccountingStatuses.date,
        status: eventAccountingStatuses.status,
        approvedMinutes: eventAccountingStatuses.approvedMinutes,
        projectId: eventAccountingStatuses.projectId,
        updatedAt: eventAccountingStatuses.updatedAt,
      })
      .from(eventAccountingStatuses)
      .orderBy(desc(eventAccountingStatuses.updatedAt));
  }
}