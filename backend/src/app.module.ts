import { Module } from '@nestjs/common';

import { AppController } from '@/app.controller';
import { AccountingModule } from '@/modules/accounting/accounting.module';
import { AccountsModule } from '@/modules/accounts/accounts.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { CycleModule } from '@/modules/cycle/cycle.module';
import { EventsModule } from '@/modules/events/events.module';
import { CacheModule } from '@/shared/providers/cache/cache.module';
import { DrizzleModule } from '@/shared/database/drizzle.module';
import { QueuesModule } from '@/shared/providers/queues/queues.module';

@Module({
  imports: [
    DrizzleModule,
    CacheModule,
    QueuesModule,
    AuthModule,
    AccountsModule,
    EventsModule,
    AccountingModule,
    CycleModule,
  ],
  controllers: [AppController],
})
export class AppModule {}