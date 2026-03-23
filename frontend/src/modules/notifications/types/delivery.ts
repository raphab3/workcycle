export type NotificationDeliveryChannel = 'in-app' | 'browser' | 'suppressed' | 'recovery';

export type NotificationDegradedReason =
  | 'browser-delivery-failed'
  | 'browser-permission-default'
  | 'browser-permission-denied'
  | 'browser-unsupported';

export type NotificationDeliveryReason =
  | 'browser-delivery-failed-fallback'
  | 'browser-granted-background'
  | 'browser-permission-default-fallback'
  | 'browser-permission-denied-fallback'
  | 'browser-unsupported-fallback'
  | 'duplicate-event'
  | 'event-expired-before-delivery'
  | 'page-visible-in-app-preferred'
  | 'product-disabled';

export interface DeliveryDecision {
  channel: NotificationDeliveryChannel;
  dedupeKey: string | null;
  degradedReason: NotificationDegradedReason | null;
  reason: NotificationDeliveryReason;
  shouldMarkDelivered: boolean;
}

export interface NotificationDeliveryAttempt {
  channel: NotificationDeliveryChannel;
  dedupeKey: string | null;
  degradedReason: NotificationDegradedReason | null;
  deliveredAt: string;
  eventId: string;
  reason: NotificationDeliveryReason;
}