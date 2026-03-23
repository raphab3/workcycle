import { Injectable } from '@nestjs/common';

import { AccountsRepository } from '@/modules/accounts/repositories/accounts.repository';
import { EventsRepository } from '@/modules/events/repositories/events.repository';
import { env } from '@/shared/config';

import type {
  DegradedSourceDTO,
  GoogleCalendarEventsResponse,
  GoogleCalendarOperationalSource,
  ListCalendarEventsInputDTO,
  RemoteGoogleCalendarEvent,
} from '@/modules/events/types/event';

class GoogleCalendarApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

@Injectable()
export class EventsSyncService {
  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly eventsRepository: EventsRepository,
  ) {}

  async refreshEvents(userId: string, input: ListCalendarEventsInputDTO) {
    const sources = await this.accountsRepository.listOperationalCalendarSources(userId, {
      accountIds: input.accountIds,
      calendarIds: input.calendarIds,
    });
    const degradedSources: DegradedSourceDTO[] = [];
    const from = new Date(input.from);
    const to = new Date(input.to);

    for (const source of sources) {
      if (!source.accountIsActive) {
        degradedSources.push({
          accountId: source.accountId,
          calendarId: source.calendarId,
          reason: 'Google account is inactive for sync.',
        });
        continue;
      }

      try {
        await this.refreshCalendarSource(source, input.from, input.to, from, to);
      } catch (error) {
        degradedSources.push({
          accountId: source.accountId,
          calendarId: source.calendarId,
          reason: this.describeSyncError(error),
        });
      }
    }

    return degradedSources;
  }

  private async refreshCalendarSource(
    source: GoogleCalendarOperationalSource,
    fromIso: string,
    toIso: string,
    from: Date,
    to: Date,
  ) {
    const syncedAt = new Date();
    let accessToken = source.accountAccessToken;

    if (this.isTokenExpired(source.accountTokenExpiresAt)) {
      accessToken = await this.refreshAccessToken(source);
    }

    let remoteEvents: RemoteGoogleCalendarEvent[];

    try {
      remoteEvents = await this.fetchCalendarEvents(source.calendarId, accessToken, fromIso, toIso);
    } catch (error) {
      if (!(error instanceof GoogleCalendarApiError) || error.status !== 401) {
        throw error;
      }

      accessToken = await this.refreshAccessToken(source);
      remoteEvents = await this.fetchCalendarEvents(source.calendarId, accessToken, fromIso, toIso);
    }

    const persistedIds: string[] = [];

    for (const remoteEvent of remoteEvents) {
      const record = this.toCalendarEventRecord(source, remoteEvent, syncedAt);
      persistedIds.push(record.id);
      await this.eventsRepository.upsertEvent(record);
    }

    await this.eventsRepository.deleteMissingCalendarEvents(source.calendarId, from, to, persistedIds);
    await this.accountsRepository.touchCalendarSync(source.calendarId, syncedAt);
  }

  private async refreshAccessToken(source: GoogleCalendarOperationalSource) {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth environment is not configured for token refresh.');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: source.accountRefreshToken,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Google token refresh failed.');
    }

    const payload = await response.json() as { access_token: string; expires_in: number; refresh_token?: string };
    const tokenExpiresAt = new Date(Date.now() + payload.expires_in * 1_000);
    const refreshToken = payload.refresh_token ?? source.accountRefreshToken;

    await this.accountsRepository.updateGoogleAccountTokens(source.accountId, {
      accessToken: payload.access_token,
      refreshToken,
      tokenExpiresAt,
    });

    return payload.access_token;
  }

  private async fetchCalendarEvents(calendarId: string, accessToken: string, fromIso: string, toIso: string) {
    const events: RemoteGoogleCalendarEvent[] = [];
    let pageToken: string | undefined;

    do {
      const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
      url.searchParams.set('maxResults', '2500');
      url.searchParams.set('showDeleted', 'false');
      url.searchParams.set('singleEvents', 'true');
      url.searchParams.set('timeMax', toIso);
      url.searchParams.set('timeMin', fromIso);

      if (pageToken) {
        url.searchParams.set('pageToken', pageToken);
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new GoogleCalendarApiError(response.status, `Google Calendar fetch failed with status ${response.status}.`);
      }

      const payload = await response.json() as GoogleCalendarEventsResponse;
      events.push(...(payload.items ?? []).filter((item) => item.id && item.status !== 'cancelled'));
      pageToken = payload.nextPageToken ?? undefined;
    } while (pageToken);

    return events;
  }

  private toCalendarEventRecord(source: GoogleCalendarOperationalSource, event: RemoteGoogleCalendarEvent, syncedAt: Date) {
    const startAt = this.resolveGoogleDate(event.start);
    const endAt = this.resolveGoogleDate(event.end);
    const isAllDay = Boolean(event.start?.date && event.end?.date);

    return {
      attendees: event.attendees ?? [],
      calendarId: source.calendarId,
      description: event.description ?? null,
      endAt,
      id: `${source.calendarId}:${event.id}`,
      isAllDay,
      location: event.location ?? null,
      meetLink: event.hangoutLink ?? null,
      projectId: null,
      recurrenceRule: event.recurrence?.join('\n') ?? null,
      recurringEventId: event.recurringEventId ?? null,
      responseStatus: this.resolveResponseStatus(event),
      startAt,
      syncedAt,
      title: event.summary?.trim() || 'Sem titulo',
    };
  }

  private resolveGoogleDate(value: { date?: string; dateTime?: string } | undefined) {
    if (!value) {
      throw new Error('Google Calendar event payload is missing a date boundary.');
    }

    if (value.dateTime) {
      return new Date(value.dateTime);
    }

    if (value.date) {
      return new Date(`${value.date}T00:00:00.000Z`);
    }

    throw new Error('Google Calendar event payload is missing a valid date or datetime field.');
  }

  private resolveResponseStatus(event: RemoteGoogleCalendarEvent): 'accepted' | 'declined' | 'tentative' | 'needsAction' {
    const selfAttendee = event.attendees?.find((attendee) => attendee.self);

    if (
      selfAttendee?.responseStatus === 'accepted'
      || selfAttendee?.responseStatus === 'declined'
      || selfAttendee?.responseStatus === 'tentative'
      || selfAttendee?.responseStatus === 'needsAction'
    ) {
      return selfAttendee.responseStatus;
    }

    if (event.creator?.self || event.organizer?.self) {
      return 'accepted';
    }

    return 'needsAction';
  }

  private describeSyncError(error: unknown) {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown Google Calendar sync error.';
  }

  private isTokenExpired(tokenExpiresAt: Date) {
    return tokenExpiresAt.getTime() <= Date.now() + 60_000;
  }
}