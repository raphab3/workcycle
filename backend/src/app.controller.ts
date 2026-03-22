import { Controller, Get } from '@nestjs/common';
import { sql } from 'drizzle-orm';

import { DrizzleService } from '@/shared/database/drizzle.service';

@Controller()
export class AppController {
  constructor(private readonly drizzleService: DrizzleService) {}

  @Get('health')
  async health() {
    await this.drizzleService.db.execute(sql`select 1`);

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}