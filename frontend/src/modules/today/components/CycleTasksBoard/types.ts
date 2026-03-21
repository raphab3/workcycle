import type { TaskCyclePlan } from '@/modules/tasks/types';

export interface CycleTasksBoardProps {
  availableHours: number;
  nextCycleTasksCount: number;
  onCompleteTask: (taskId: string) => void;
  onSkipTask: (taskId: string) => void;
  taskPlan: TaskCyclePlan;
}