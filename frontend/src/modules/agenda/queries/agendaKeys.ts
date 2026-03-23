import type { AgendaIntervalInput } from '@/modules/agenda/types';

export const agendaKeys = {
  all: ['agenda'] as const,
  list: (input: AgendaIntervalInput) => [...agendaKeys.all, 'list', input.from, input.to] as const,
};