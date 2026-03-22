import { Global, Module } from '@nestjs/common';

import { QueuesService } from '@/shared/providers/queues/queues.service';

@Global()
@Module({
  providers: [QueuesService],
  exports: [QueuesService],
})
export class QueuesModule {}