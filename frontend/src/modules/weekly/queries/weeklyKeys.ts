export const weeklyKeys = {
  all: ['weekly'] as const,
  history: (scope = 'default') => [...weeklyKeys.all, 'history', scope] as const,
  snapshot: (weekKey = 'current') => [...weeklyKeys.all, 'snapshot', weekKey] as const,
};