import { z } from 'zod';

const timeValueSchema = z.string().trim().regex(/^([01]\d|2[0-3]):([0-5]\d)$/,
  'Use o formato HH:mm para horarios persistidos.');

function isValidTimezone(value: string) {
  try {
    Intl.DateTimeFormat('en-US', { timeZone: value }).format();

    return true;
  } catch {
    return false;
  }
}

const settingsFieldSchemas = {
  cycleStartHour: timeValueSchema,
  dailyReviewTime: timeValueSchema,
  notificationsEnabled: z.boolean(),
  timezone: z.string().trim().min(1).max(120).refine(isValidTimezone, 'Use um timezone IANA valido.'),
} as const;

export const updateUserSettingsSchema = z.object({
  cycleStartHour: settingsFieldSchemas.cycleStartHour.optional(),
  dailyReviewTime: settingsFieldSchemas.dailyReviewTime.optional(),
  notificationsEnabled: settingsFieldSchemas.notificationsEnabled.optional(),
  timezone: settingsFieldSchemas.timezone.optional(),
}).refine((input) => Object.values(input).some((value) => value !== undefined), {
  message: 'At least one settings field must be provided for update.',
});

export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>;