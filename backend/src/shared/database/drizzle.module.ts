import { Global, Module } from '@nestjs/common';

import { DrizzleService } from '@/shared/database/drizzle.service';

@Global()
@Module({
  providers: [DrizzleService],
  exports: [DrizzleService],
})
export class DrizzleModule {}