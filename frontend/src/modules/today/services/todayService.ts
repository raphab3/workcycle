import { api } from '@/lib/axios';

import type { FirePulseInputDTO, PulseRecord, TodaySessionDTO, UpdateTodaySessionInput } from '@/modules/today/types';

async function getTodaySession(cycleDate?: string) {
  const response = await api.get<TodaySessionDTO>('/api/cycle/session', {
    params: cycleDate ? { cycleDate } : undefined,
  });

  return response.data;
}

async function getPulseRecords(params?: { cycleDate?: string; sessionId?: string }) {
  const response = await api.get<PulseRecord[]>('/api/cycle/pulse-records', {
    params,
  });

  return response.data;
}

async function updateTodaySession(input: UpdateTodaySessionInput) {
  const response = await api.patch<TodaySessionDTO>('/api/cycle/session', input);

  return response.data;
}

async function firePulse(input: FirePulseInputDTO) {
  const response = await api.post<TodaySessionDTO>('/api/cycle/pulse', input);

  return response.data;
}

export const todayService = {
  firePulse,
  getPulseRecords,
  getTodaySession,
  updateTodaySession,
};