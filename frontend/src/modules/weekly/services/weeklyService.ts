import { api } from '@/lib/axios';

import type { WeeklyHistoryDTO, WeeklyHistoryQueryInput, WeeklySnapshotDTO, WeeklySnapshotQueryInput } from '@/modules/weekly/types';

async function getWeeklySnapshot(params?: WeeklySnapshotQueryInput) {
  const response = await api.get<WeeklySnapshotDTO>('/api/weekly/snapshots', {
    params,
  });

  return response.data;
}

async function getWeeklyHistory(params?: WeeklyHistoryQueryInput) {
  const response = await api.get<WeeklyHistoryDTO>('/api/weekly/history', {
    params,
  });

  return response.data;
}

export const weeklyService = {
  getWeeklyHistory,
  getWeeklySnapshot,
};