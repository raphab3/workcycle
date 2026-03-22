import { Global, Module } from '@nestjs/common';

import { CacheService } from '@/shared/providers/cache/cache.service';

@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}