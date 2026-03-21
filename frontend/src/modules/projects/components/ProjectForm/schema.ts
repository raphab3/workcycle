import { z } from 'zod';

export const weekDayValues = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'] as const;
export const sprintDayValues = [7, 14, 30] as const;
const sprintDaysSchema = z.union([z.literal(7), z.literal(14), z.literal(30)]);

export const projectFormSchema = z
  .object({
    name: z.string().min(3, 'Informe pelo menos 3 caracteres').max(40, 'Use no maximo 40 caracteres'),
    colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Informe uma cor hexadecimal valida'),
    allocationPct: z.coerce.number().min(1, 'A alocacao minima e 1%').max(100, 'A alocacao maxima e 100%'),
    type: z.enum(['fixed', 'rotative']),
    sprintDays: z.preprocess((value) => Number(value), sprintDaysSchema),
    status: z.enum(['active', 'paused']),
    fixedDays: z.array(z.enum(weekDayValues)).default([]),
    fixedHoursPerDay: z.coerce.number().min(0, 'Horas fixas nao podem ser negativas').max(12, 'Use no maximo 12h por dia'),
  })
  .superRefine((values, context) => {
    if (values.type === 'fixed') {
      if (values.fixedDays.length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['fixedDays'],
          message: 'Selecione ao menos um dia fixo',
        });
      }

      if (values.fixedHoursPerDay <= 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['fixedHoursPerDay'],
          message: 'Informe horas reservadas para projeto fixo',
        });
      }
    }
  });

export type ProjectFormSchema = z.infer<typeof projectFormSchema>;
export type ProjectFormSchemaInput = z.input<typeof projectFormSchema>;
export type ProjectFormSchemaOutput = z.output<typeof projectFormSchema>;