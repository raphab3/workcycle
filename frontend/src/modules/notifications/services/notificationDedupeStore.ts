export interface NotificationDedupeStore {
  has: (dedupeKey: string, now?: number) => boolean;
  mark: (dedupeKey: string, now?: number) => void;
  reset: () => void;
  size: () => number;
}

interface CreateMemoryNotificationDedupeStoreOptions {
  ttlMs?: number;
}

export function createMemoryNotificationDedupeStore(options?: CreateMemoryNotificationDedupeStoreOptions): NotificationDedupeStore {
  const ttlMs = options?.ttlMs ?? 5 * 60 * 1000;
  const entries = new Map<string, number>();

  function prune(now = Date.now()) {
    for (const [dedupeKey, createdAt] of entries.entries()) {
      if (createdAt + ttlMs <= now) {
        entries.delete(dedupeKey);
      }
    }
  }

  return {
    has(dedupeKey, now = Date.now()) {
      prune(now);
      return entries.has(dedupeKey);
    },
    mark(dedupeKey, now = Date.now()) {
      prune(now);
      entries.set(dedupeKey, now);
    },
    reset() {
      entries.clear();
    },
    size() {
      return entries.size;
    },
  };
}