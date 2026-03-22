import { z } from 'zod';

export const taskPriorityValues = ['critical', 'high', 'medium', 'low'] as const;
export const taskStatusValues = ['todo', 'doing', 'blocked', 'done'] as const;
export const taskCycleAssignmentValues = ['backlog', 'current', 'next'] as const;

export const taskFormSchema = z.object({
  title: z.string().min(4, 'Informe pelo menos 4 caracteres').max(80, 'Use no maximo 80 caracteres'),
  description: z.string().min(12, 'Descreva melhor a task').max(280, 'Use no maximo 280 caracteres'),
  projectId: z.string().min(1, 'Selecione um projeto'),
  columnId: z.string().min(1, 'Selecione uma coluna do quadro'),
  checklist: z.array(z.object({
    id: z.string(),
    label: z.string().min(2, 'Checklist muito curto').max(80, 'Use no maximo 80 caracteres'),
    done: z.boolean(),
  })),
  priority: z.enum(taskPriorityValues),
  status: z.enum(taskStatusValues),
  cycleAssignment: z.enum(taskCycleAssignmentValues),
  dueInDays: z.coerce.number().int('Use dias inteiros').min(0, 'Use 0 ou mais para o prazo planejado').max(30, 'Use no maximo 30 dias'),
  estimatedHours: z.coerce.number().min(0.5, 'Informe ao menos 0.5h').max(16, 'Use no maximo 16h'),
});

export type TaskFormSchemaInput = z.input<typeof taskFormSchema>;
export type TaskFormSchemaOutput = z.output<typeof taskFormSchema>;