export const QUEUE_NAMES = {
  GOOGLE_SYNC: 'google-sync',
  ACCOUNTING: 'accounting',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];