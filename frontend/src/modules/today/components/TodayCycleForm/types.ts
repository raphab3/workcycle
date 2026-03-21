import type { TodayCycleValues } from '@/modules/today/types';

export interface TodayCycleFormProps {
  defaultValues: TodayCycleValues;
  onSubmitCycle: (values: TodayCycleValues) => void;
}