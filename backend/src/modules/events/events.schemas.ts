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

const calendarEventFieldsSchema = z.object({
  calendarId: z.string().min(1),
  description: z.string().trim().max(4000).optional(),
  endAt: z.string().min(1).refine((value) => !Number.isNaN(Date.parse(value)), 'endAt must be a valid ISO datetime'),
  location: z.string().trim().max(1024).optional(),
  startAt: z.string().min(1).refine((value) => !Number.isNaN(Date.parse(value)), 'startAt must be a valid ISO datetime'),
  title: z.string().trim().min(1).max(512),
});

function validateCalendarEventWindow(input: { endAt: string; startAt: string }, context: z.RefinementCtx) {
  if (Date.parse(input.startAt) >= Date.parse(input.endAt)) {
    context.addIssue({
      code: 'custom',
      message: 'startAt must be earlier than endAt',
      path: ['startAt'],
    });
  }
}

export const createCalendarEventSchema = calendarEventFieldsSchema.superRefine(validateCalendarEventWindow);

export const updateCalendarEventSchema = calendarEventFieldsSchema.partial().superRefine((input, context) => {
  if (Object.keys(input).length === 0) {
    context.addIssue({
      code: 'custom',
      message: 'At least one event field must be provided for update.',
      path: [],
    });
  }

  if (input.startAt && input.endAt) {
    validateCalendarEventWindow({ endAt: input.endAt, startAt: input.startAt }, context);
  }
});

export type CreateCalendarEventInput = z.infer<typeof createCalendarEventSchema>;
export type UpdateCalendarEventInput = z.infer<typeof updateCalendarEventSchema>;