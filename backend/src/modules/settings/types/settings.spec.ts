import assert from 'node:assert/strict';
import test from 'node:test';

import { toGoogleConnectionSummary, toUserSettingsDTO } from '@/modules/settings/types/settings';

test('settings types map persisted values and Google linkage summary to the public DTO', () => {
  const googleConnection = toGoogleConnectionSummary({
    googleAccountCount: 2,
    googleLinkedAt: new Date('2026-03-22T09:00:00.000Z'),
  });

  const result = toUserSettingsDTO({
    createdAt: new Date('2026-03-22T09:00:00.000Z'),
    cycleStartHour: '00:00',
    dailyReviewTime: '18:00',
    id: 'settings-1',
    notificationsEnabled: true,
    timezone: 'America/Sao_Paulo',
    updatedAt: new Date('2026-03-22T09:00:00.000Z'),
    userId: 'user-1',
  }, googleConnection);

  assert.deepEqual(result, {
    cycleStartHour: '00:00',
    dailyReviewTime: '18:00',
    googleConnection: {
      connectedAccountCount: 2,
      hasGoogleLinked: true,
      linkedAt: '2026-03-22T09:00:00.000Z',
    },
    notificationsEnabled: true,
    timezone: 'America/Sao_Paulo',
  });

  assert.deepEqual(Object.keys(result).sort(), [
    'cycleStartHour',
    'dailyReviewTime',
    'googleConnection',
    'notificationsEnabled',
    'timezone',
  ]);
});