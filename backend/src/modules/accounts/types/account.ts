export interface GoogleCalendarConnectionDTO {
  accountId: string;
  colorHex: string;
  id: string;
  isIncluded: boolean;
  isPrimary: boolean;
  name: string;
  syncedAt: string | null;
}

export interface GoogleAccountConnectionDTO {
  calendars: GoogleCalendarConnectionDTO[];
  displayName: string;
  email: string;
  id: string;
  isActive: boolean;
  tokenExpiresAt: string;
  updatedAt: string;
}

export interface GoogleAccountCalendarRow {
  accountDisplayName: string;
  accountEmail: string;
  accountId: string;
  accountIsActive: boolean;
  accountTokenExpiresAt: Date;
  accountUpdatedAt: Date;
  calendarAccountId: string | null;
  calendarColorHex: string | null;
  calendarId: string | null;
  calendarIsIncluded: boolean | null;
  calendarIsPrimary: boolean | null;
  calendarName: string | null;
  calendarSyncedAt: Date | null;
}

export function toGoogleAccountConnections(rows: GoogleAccountCalendarRow[]) {
  const accountsById = new Map<string, GoogleAccountConnectionDTO>();

  for (const row of rows) {
    const existingAccount = accountsById.get(row.accountId);

    const account = existingAccount ?? {
      calendars: [],
      displayName: row.accountDisplayName,
      email: row.accountEmail,
      id: row.accountId,
      isActive: row.accountIsActive,
      tokenExpiresAt: row.accountTokenExpiresAt.toISOString(),
      updatedAt: row.accountUpdatedAt.toISOString(),
    };

    if (row.calendarId && row.calendarAccountId && row.calendarColorHex && row.calendarName) {
      account.calendars.push({
        accountId: row.calendarAccountId,
        colorHex: row.calendarColorHex,
        id: row.calendarId,
        isIncluded: row.calendarIsIncluded ?? true,
        isPrimary: row.calendarIsPrimary ?? false,
        name: row.calendarName,
        syncedAt: row.calendarSyncedAt?.toISOString() ?? null,
      });
    }

    accountsById.set(row.accountId, account);
  }

  return [...accountsById.values()];
}