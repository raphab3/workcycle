import assert from 'node:assert/strict';
import test from 'node:test';

import { updateUserSettingsSchema } from '@/modules/settings/settings.schemas';

test('updateUserSettingsSchema accepts a valid partial payload', () => {
  const parsed = updateUserSettingsSchema.parse({
    dailyReviewTime: '18:30',
    timezone: 'America/Sao_Paulo',
  });

  assert.equal(parsed.dailyReviewTime, '18:30');
  assert.equal(parsed.timezone, 'America/Sao_Paulo');
});

test('updateUserSettingsSchema rejects invalid timezones', () => {
  assert.throws(() => updateUserSettingsSchema.parse({ timezone: 'Mars/Olympus' }), /Use um timezone IANA valido\./);
});

test('updateUserSettingsSchema rejects empty updates', () => {
  assert.throws(() => updateUserSettingsSchema.parse({}), /At least one settings field must be provided for update\./);
});

test('updateUserSettingsSchema rejects invalid persisted time values', () => {
  assert.throws(() => updateUserSettingsSchema.parse({ cycleStartHour: '25:30' }), /Use o formato HH:mm para horarios persistidos\./);
});

test('updateUserSettingsSchema rejects browser-only fields that must not be persisted', () => {
  assert.throws(
    () => updateUserSettingsSchema.parse({ browserPermission: 'granted', notificationsEnabled: true }),
    (error: unknown) => error instanceof Error && /Unrecognized key/.test(error.message),
  );
});