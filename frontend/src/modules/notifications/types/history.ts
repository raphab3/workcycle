import type { OperationalNotificationEventType } from '@/modules/notifications/types/events';

export type ReminderHistoryStatus = 'shown' | 'missed' | 'resolved' | 'suppressed';

export interface ReminderHistoryItem {
  contextLabel: string | null;
  eventId: string;
  occurredAt: string;
  status: ReminderHistoryStatus;
  type: OperationalNotificationEventType;
}