import type { AgendaCalendarOption, AgendaEvent, AgendaEventFormValues } from '@/modules/agenda/types';

export interface AgendaEventFormProps {
  calendars: AgendaCalendarOption[];
  defaultValues?: AgendaEvent | null;
  isDisabled?: boolean;
  isSubmitting?: boolean;
  onCancelEdit: () => void;
  onSubmitEvent: (values: AgendaEventFormValues, eventId?: string) => Promise<void>;
}