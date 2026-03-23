import { z } from 'zod';

function parseStringArray(value: unknown) {
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (Array.isArray(value)) {
    return value
      .flatMap((item) => (typeof item === 'string' ? item.split(',') : []))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return value;
}

function parseBoolean(value: unknown) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value === 'true';
  }

  return false;
}

export const listCalendarEventsQuerySchema = z.object({
  accountIds: z.preprocess(parseStringArray, z.array(z.string().min(1)).optional()),
  calendarIds: z.preprocess(parseStringArray, z.array(z.string().min(1)).optional()),
  from: z.string().min(1).refine((value) => !Number.isNaN(Date.parse(value)), 'from must be a valid ISO datetime'),
  refresh: z.preprocess(parseBoolean, z.boolean().default(false)),
  to: z.string().min(1).refine((value) => !Number.isNaN(Date.parse(value)), 'to must be a valid ISO datetime'),
}).superRefine((value, context) => {
  if (Date.parse(value.from) >= Date.parse(value.to)) {
    context.addIssue({
      code: 'custom',
      message: 'from must be earlier than to',
      path: ['from'],
    });
  }
});