export const authKeys = {
  all: ['auth'] as const,
  status: () => [...authKeys.all, 'status'] as const,
  accounts: () => [...authKeys.all, 'accounts'] as const,
  calendar: (calendarId: string) => [...authKeys.accounts(), 'calendar', calendarId] as const,
};