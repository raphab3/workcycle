import { describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/axios';

import { authService } from './authService';

const googleCalendarPayload = {
  accountId: 'account-1',
  colorHex: '#3367D6',
  id: 'pt.brazilian#holiday@group.v.calendar.google.com',
  isIncluded: false,
  isPrimary: false,
  name: 'Feriados no Brasil',
  syncedAt: '2026-03-22T09:00:00.000Z',
} as const;

describe('authService', () => {
  it('encodes google calendar ids before patching inclusion', async () => {
    const patchSpy = vi.spyOn(api, 'patch').mockResolvedValue({
      data: googleCalendarPayload,
    });

    const result = await authService.updateGoogleCalendar({
      calendarId: googleCalendarPayload.id,
      isIncluded: false,
    });

    expect(patchSpy).toHaveBeenCalledWith(
      '/api/accounts/calendars/pt.brazilian%23holiday%40group.v.calendar.google.com',
      { isIncluded: false },
    );
    expect(result).toEqual(googleCalendarPayload);

    patchSpy.mockRestore();
  });
});