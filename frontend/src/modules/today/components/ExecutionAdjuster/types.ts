import type { SuggestedAllocation } from '@/modules/today/types';

export interface ExecutionAdjusterProps {
  actualHours: Record<string, number>;
  allocations: SuggestedAllocation[];
  availableHours: number;
  onAdjustHours: (projectId: string, delta: number) => void;
}