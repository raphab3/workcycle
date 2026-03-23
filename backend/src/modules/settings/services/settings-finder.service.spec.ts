import assert from 'node:assert/strict';
import test from 'node:test';

import { SettingsFinderService } from '@/modules/settings/services/settings-finder.service';

test('getUserSettings maps persisted settings and Google linkage summary to the public DTO', async () => {
  const service = new SettingsFinderService({
    execute: async () => ({
      googleConnection: {
        connectedAccountCount: 1,
        hasGoogleLinked: true,
        linkedAt: '2026-03-22T09:00:00.000Z',
      },
      settings: {
        createdAt: new Date('2026-03-22T09:00:00.000Z'),
        cycleStartHour: '00:00',
        dailyReviewTime: '18:00',
        id: 'settings-1',
        notificationsEnabled: true,
        timezone: 'America/Sao_Paulo',
        updatedAt: new Date('2026-03-22T09:00:00.000Z'),
        userId: 'user-1',
      },
    }),
  } as never);

  const result = await service.getUserSettings('user-1');

  assert.deepEqual(result, {
    cycleStartHour: '00:00',
    dailyReviewTime: '18:00',
    googleConnection: {
      connectedAccountCount: 1,
      hasGoogleLinked: true,
      linkedAt: '2026-03-22T09:00:00.000Z',
    },
    notificationsEnabled: true,
    timezone: 'America/Sao_Paulo',
  });
});