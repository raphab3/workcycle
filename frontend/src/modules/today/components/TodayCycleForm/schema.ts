import { z } from 'zod';

export const todayCycleSchema = z.object({
  availableHours: z.coerce.number().min(1, 'Informe ao menos 1h disponivel').max(16, 'Use no maximo 16h no ciclo'),
  projectsInCycle: z.coerce.number().int('Use um numero inteiro').min(1, 'Selecione ao menos 1 projeto').max(6, 'Use no maximo 6 projetos por ciclo'),
});

export type TodayCycleSchemaInput = z.input<typeof todayCycleSchema>;
export type TodayCycleSchemaOutput = z.output<typeof todayCycleSchema>;