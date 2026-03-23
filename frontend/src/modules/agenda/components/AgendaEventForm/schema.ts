import { z } from 'zod';

export const agendaEventFormSchema = z
  .object({
    calendarId: z.string().min(1, 'Selecione um calendario operacional'),
    description: z.string().trim().max(4000, 'Use no maximo 4000 caracteres').optional(),
    endAt: z.string().min(1, 'Informe o horario de termino'),
    location: z.string().trim().max(1024, 'Use no maximo 1024 caracteres').optional(),
    startAt: z.string().min(1, 'Informe o horario de inicio'),
    title: z.string().trim().min(3, 'Informe pelo menos 3 caracteres').max(512, 'Use no maximo 512 caracteres'),
  })
  .superRefine((values, context) => {
    const startAt = Date.parse(values.startAt);
    const endAt = Date.parse(values.endAt);

    if (!Number.isFinite(startAt)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Use uma data e horario validos',
        path: ['startAt'],
      });
    }

    if (!Number.isFinite(endAt)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Use uma data e horario validos',
        path: ['endAt'],
      });
    }

    if (Number.isFinite(startAt) && Number.isFinite(endAt) && startAt >= endAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'O termino precisa acontecer depois do inicio',
        path: ['startAt'],
      });
    }
  });

export type AgendaEventFormSchemaInput = z.input<typeof agendaEventFormSchema>;
export type AgendaEventFormSchemaOutput = z.output<typeof agendaEventFormSchema>;