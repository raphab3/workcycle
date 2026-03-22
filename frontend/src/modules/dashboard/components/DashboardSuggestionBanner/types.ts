import type { SuggestedAllocation } from '@/modules/today/types';

export interface DashboardSuggestionBannerProps {
  allocations: SuggestedAllocation[];
  planningMoment: string;
}