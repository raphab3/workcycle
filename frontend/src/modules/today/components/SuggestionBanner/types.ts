import type { SuggestedAllocation } from '@/modules/today/types';

export interface SuggestionBannerProps {
  allocations: SuggestedAllocation[];
  planningMoment: string;
}