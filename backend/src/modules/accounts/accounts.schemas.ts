import { z } from 'zod';

export const updateGoogleCalendarSchema = z.object({
  isIncluded: z.boolean(),
});

export type UpdateGoogleCalendarInput = z.infer<typeof updateGoogleCalendarSchema>;