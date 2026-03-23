export const todayKeys = {
  all: ['today'] as const,
  session: (cycleDate = 'current') => [...todayKeys.all, 'session', cycleDate] as const,
  pulseRecords: (scope = 'current') => [...todayKeys.all, 'pulse-records', scope] as const,
};