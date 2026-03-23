export { useNotificationCapability } from './hooks/useNotificationCapability';
export { useNotificationHistorySync } from './hooks/useNotificationHistorySync';
export { useNotificationRecovery } from './hooks/useNotificationRecovery';
export { NotificationsDrawer } from './components/NotificationsDrawer';
export {
  getBrowserNotificationCapabilitySnapshot,
  getServerNotificationCapabilitySnapshot,
  subscribeToBrowserNotificationCapability,
} from './services/browserNotificationCapability';
export {
  claimMultiTabNotificationEvent,
  clearMultiTabNotificationClaims,
  subscribeToReminderHistorySync,
} from './services/multiTabNotificationSync';
export { createMemoryNotificationDedupeStore } from './services/notificationDedupeStore';
export { createOperationalNotificationDedupeKey, decideNotificationDelivery } from './services/notificationDeliveryEngine';
export { createDailyReviewRecoveryEventId, resolveNotificationRecovery } from './services/notificationRecoveryService';
export {
  clearReminderHistoryStorage,
  persistReminderHistory,
  readReminderHistory,
  REMINDER_HISTORY_STORAGE_KEY,
} from './services/reminderHistoryStorage';
export {
  createInitialPulseInactivityState,
  createPulseInactivityState,
  isPulseNotificationEventActionable,
  shouldSuppressPulseNotificationEvent,
} from './services/pulseInactivityPolicy';
export { resetNotificationsStore, useNotificationsStore } from './store/useNotificationsStore';
export {
  createActivityPulseDueNotificationEvent,
  createActivityPulseExpiredNotificationEvent,
  createTodayPulseNotificationEventId,
} from './adapters/todayNotificationsAdapter';
export type { BrowserNotificationPermission, NotificationCapabilityState } from './types/capability';
export type { ReminderHistoryItem, ReminderHistoryStatus } from './types/history';
export type { DeliveryDecision, NotificationDegradedReason, NotificationDeliveryAttempt, NotificationDeliveryChannel, NotificationDeliveryReason } from './types/delivery';
export type { InAppNotificationState, OperationalNotificationEvent, OperationalNotificationEventType } from './types/events';
export type { PulseInactivityState } from './services/pulseInactivityPolicy';
export type { RecoveryResolution } from './services/notificationRecoveryService';