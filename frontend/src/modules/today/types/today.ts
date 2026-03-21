export interface TodayCycleValues {
  availableHours: number;
  projectsInCycle: number;
}

export interface SuggestedAllocation {
  projectId: string;
  projectName: string;
  colorHex: string;
  kind: 'fixed' | 'rotative';
  currentAllocationPct: number;
  suggestedAllocationPct: number;
  plannedHours: number;
  openTasks: number;
  effortHours: number;
  reason: string;
}