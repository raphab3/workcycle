export interface GoogleConnectionDTO {
  connectedAccountCount: number;
  hasGoogleLinked: boolean;
  linkedAt: string | null;
}

export interface UserSettingsDTO {
  cycleStartHour: string;
  dailyReviewTime: string;
  googleConnection: GoogleConnectionDTO;
  notificationsEnabled: boolean;
  timezone: string;
}

export type UpdateUserSettingsInput = Partial<Pick<UserSettingsDTO, 'cycleStartHour' | 'dailyReviewTime' | 'notificationsEnabled' | 'timezone'>>;