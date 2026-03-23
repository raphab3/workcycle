export type BrowserNotificationPermission = NotificationPermission | 'unsupported';

export interface NotificationCapabilityState {
  permission: BrowserNotificationPermission;
  productEnabled: boolean;
  supportsBrowserNotification: boolean;
  visibilityState: DocumentVisibilityState;
  windowFocused: boolean;
}