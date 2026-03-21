import type { Task } from '@/modules/tasks/types';

export const mockTasks: Task[] = [
  {
    id: 'billing-migration',
    title: 'Ajustar migration de faturamento',
    projectId: 'datavault',
    priority: 'critical',
    status: 'todo',
    dueInDays: 0,
    estimatedHours: 3.5,
  },
  {
    id: 'sprint-refinement',
    title: 'Fechar refinamento da sprint',
    projectId: 'fintrack',
    priority: 'high',
    status: 'doing',
    dueInDays: 2,
    estimatedHours: 2,
  },
  {
    id: 'daily-contract',
    title: 'Revisar daily contract baseline',
    projectId: 'cliente-core',
    priority: 'medium',
    status: 'todo',
    dueInDays: 5,
    estimatedHours: 1.5,
  },
  {
    id: 'auth-audit',
    title: 'Auditar backlog de autenticacao',
    projectId: 'authguard',
    priority: 'low',
    status: 'blocked',
    dueInDays: -1,
    estimatedHours: 2.5,
  },
  {
    id: 'retro-notes',
    title: 'Fechar notas da retro',
    projectId: 'fintrack',
    priority: 'low',
    status: 'done',
    dueInDays: 1,
    estimatedHours: 1,
  },
];