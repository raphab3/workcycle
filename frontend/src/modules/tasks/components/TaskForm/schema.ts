import { z } from 'zod';

export const taskPriorityValues = ['critical', 'high', 'medium', 'low'] as const;
export const taskStatusValues = ['todo', 'doing', 'blocked', 'done'] as const;

export const taskFormSchema = z.object({
  title: z.string().min(4, 'Informe pelo menos 4 caracteres').max(80, 'Use no maximo 80 caracteres'),
  projectId: z.string().min(1, 'Selecione um projeto'),
  priority: z.enum(taskPriorityValues),
  status: z.enum(taskStatusValues),
  dueInDays: z.coerce.number().int('Use dias inteiros').min(0, 'Use 0 ou mais para o prazo planejado').max(30, 'Use no maximo 30 dias'),
  estimatedHours: z.coerce.number().min(0.5, 'Informe ao menos 0.5h').max(16, 'Use no maximo 16h'),
});

export type TaskFormSchemaInput = z.input<typeof taskFormSchema>;
export type TaskFormSchemaOutput = z.output<typeof taskFormSchema>;