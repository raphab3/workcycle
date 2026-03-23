import type { UserSettings } from '@/shared/database/schema';

export const DEFAULT_USER_SETTINGS_VALUES = {
  cycleStartHour: '00:00',
  dailyReviewTime: '18:00',
  notificationsEnabled: false,
  timezone: 'UTC',
} as const;

export interface GoogleConnectionSummaryDTO {
  connectedAccountCount: number;
  hasGoogleLinked: boolean;
  linkedAt: string | null;
}

export interface UserSettingsDTO {
  cycleStartHour: string;
  dailyReviewTime: string;
  googleConnection: GoogleConnectionSummaryDTO;
  notificationsEnabled: boolean;
  timezone: string;
}

export interface UserGoogleConnectionRow {
  googleAccountCount: number;
  googleLinkedAt: Date | null;
}

export function toGoogleConnectionSummary(row: UserGoogleConnectionRow): GoogleConnectionSummaryDTO {
  return {
    connectedAccountCount: Number(row.googleAccountCount),
    hasGoogleLinked: Number(row.googleAccountCount) > 0 || Boolean(row.googleLinkedAt),
    linkedAt: row.googleLinkedAt?.toISOString() ?? null,
  };
}

export function toUserSettingsDTO(settings: UserSettings, googleConnection: GoogleConnectionSummaryDTO): UserSettingsDTO {
  return {
    cycleStartHour: settings.cycleStartHour,
    dailyReviewTime: settings.dailyReviewTime,
    googleConnection,
    notificationsEnabled: settings.notificationsEnabled,
    timezone: settings.timezone,
  };
}