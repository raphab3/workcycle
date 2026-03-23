import { z } from 'zod';

function isValidTimezone(value: string) {
  try {
    Intl.DateTimeFormat('en-US', { timeZone: value }).format();

    return true;
  } catch {
    return false;
  }
}

export const authSettingsFormSchema = z.object({
  cycleStartHour: z.string().trim().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use o formato HH:mm.'),
  dailyReviewTime: z.string().trim().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use o formato HH:mm.'),
  notificationsEnabled: z.boolean(),
  timezone: z.string().trim().min(1, 'Informe um timezone.').refine(isValidTimezone, 'Use um timezone IANA valido.'),
});

export type AuthSettingsFormInput = z.input<typeof authSettingsFormSchema>;
export type AuthSettingsFormOutput = z.output<typeof authSettingsFormSchema>;