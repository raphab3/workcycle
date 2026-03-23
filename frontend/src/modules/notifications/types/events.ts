export type OperationalNotificationEventType =
  | 'activity-pulse-due'
  | 'activity-pulse-expired'
  | 'daily-review-due'
  | 'recovery-pending';

export interface OperationalNotificationEvent {
  eventId: string;
  type: OperationalNotificationEventType;
  occurredAt: string;
  title: string;
  message: string;
  expiresAt?: string;
  context?: Record<string, string | number | boolean | null>;
}

export interface InAppNotificationState {
  eventId: string;
  type: OperationalNotificationEventType;
  title: string;
  message: string;
  occurredAt: string;
}