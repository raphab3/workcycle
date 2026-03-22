import { Injectable } from '@nestjs/common';

import { CACHE_NAMESPACE } from '@/shared/providers/cache/cache.constants';

@Injectable()
export class CacheService {
  getNamespace() {
    return CACHE_NAMESPACE;
  }

  async get<T>(_key: string): Promise<T | null> {
    void _key;

    return null;
  }

  async set(_key: string, _value: unknown, _ttlInSeconds?: number) {
    void _key;
    void _value;
    void _ttlInSeconds;

    return;
  }

  async del(_key: string) {
    void _key;

    return;
  }
}