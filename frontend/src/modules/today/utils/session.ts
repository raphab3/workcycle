import type { Task } from '@/modules/tasks/types';
import type { CycleSnapshot, SuggestedAllocation, TimeBlock, TodayCycleValues } from '@/modules/today/types';

export function getOpenTimeBlock(timeBlocks: TimeBlock[]): TimeBlock | null {
  return timeBlocks.find((block) => block.endedAt === null) ?? null;
}

export function getConfirmedMinutes(timeBlocks: TimeBlock[]): number {
  return timeBlocks
    .filter((block) => block.endedAt !== null)
    .reduce((total, block) => total + block.confirmedMinutes, 0);
}

export function computeCycleSnapshot(state: {
  tasks: Task[];
  timeBlocks: TimeBlock[];
  todayCycleValues: TodayCycleValues;
  allocations?: SuggestedAllocation[];
}): CycleSnapshot {
  const plannedHours = state.allocations
    ? state.allocations.reduce((total, allocation) => total + allocation.plannedHours, 0)
    : state.todayCycleValues.availableHours;

  const actualHours = Math.round((getConfirmedMinutes(state.timeBlocks) / 60) * 10) / 10;

  const completedTaskIds = state.tasks
    .filter((task) => task.status === 'done' && task.cycleAssignment === 'current')
    .map((task) => task.id);

  const incompleteTaskIds = state.tasks
    .filter((task) => task.cycleAssignment === 'current' && task.status !== 'done')
    .map((task) => task.id);

  return { plannedHours, actualHours, completedTaskIds, incompleteTaskIds };
}
