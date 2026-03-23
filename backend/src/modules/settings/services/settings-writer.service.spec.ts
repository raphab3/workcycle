import assert from 'node:assert/strict';
import test from 'node:test';

import { SettingsWriterService } from '@/modules/settings/services/settings-writer.service';

test('updateUserSettings maps the updated settings aggregate to the public DTO', async () => {
  const service = new SettingsWriterService({
    execute: async () => ({
      googleConnection: {
        googleAccountCount: 0,
        googleLinkedAt: null,
      },
      settings: {
        createdAt: new Date('2026-03-22T09:00:00.000Z'),
        cycleStartHour: '00:00',
        dailyReviewTime: '17:45',
        id: 'settings-1',
        notificationsEnabled: false,
        timezone: 'UTC',
        updatedAt: new Date('2026-03-22T09:30:00.000Z'),
        userId: 'user-1',
      },
    }),
  } as never);

  const result = await service.updateUserSettings('user-1', { dailyReviewTime: '17:45' });

  assert.deepEqual(result, {
    cycleStartHour: '00:00',
    dailyReviewTime: '17:45',
    googleConnection: {
      connectedAccountCount: 0,
      hasGoogleLinked: false,
      linkedAt: null,
    },
    notificationsEnabled: false,
    timezone: 'UTC',
  });
});