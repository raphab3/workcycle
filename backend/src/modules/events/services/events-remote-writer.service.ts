import { BadGatewayException, BadRequestException, ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { AccountsRepository } from '@/modules/accounts/repositories/accounts.repository';
import { env } from '@/shared/config';

import type { CreateCalendarEventInput, UpdateCalendarEventInput } from '@/modules/events/events.schemas';
import type { GoogleCalendarOperationalSource, RemoteGoogleCalendarEvent } from '@/modules/events/types/event';

class GoogleCalendarWriteError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

@Injectable()
export class EventsRemoteWriterService {
  constructor(
    @Inject(AccountsRepository)
    private readonly accountsRepository: AccountsRepository,
  ) {}

  private static buildGoogleEventWritePayload(input: {
    description?: string | undefined;
    endAt?: string | undefined;
    location?: string | undefined;
    startAt?: string | undefined;
    title?: string | undefined;
  }) {
    return {
      description: input.description,
      end: input.endAt ? { dateTime: input.endAt } : undefined,
      location: input.location,
      start: input.startAt ? { dateTime: input.startAt } : undefined,
      summary: input.title,
    };
  }

  async createEvent(source: GoogleCalendarOperationalSource, input: CreateCalendarEventInput) {
    try {
      const response = await this.performRequest(source, `${encodeURIComponent(source.calendarId)}/events`, {
        body: JSON.stringify(EventsRemoteWriterService.buildGoogleEventWritePayload(input)),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      return this.parseRemoteEventResponse(response);
    } catch (error) {
      throw this.toHttpError(error);
    }
  }

  async updateEvent(source: GoogleCalendarOperationalSource, remoteEventId: string, input: Omit<UpdateCalendarEventInput, 'calendarId'>) {
    try {
      const response = await this.performRequest(source, `${encodeURIComponent(source.calendarId)}/events/${encodeURIComponent(remoteEventId)}`, {
        body: JSON.stringify(EventsRemoteWriterService.buildGoogleEventWritePayload(input)),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
      });

      return this.parseRemoteEventResponse(response);
    } catch (error) {
      throw this.toHttpError(error);
    }
  }

  async deleteEvent(source: GoogleCalendarOperationalSource, remoteEventId: string) {
    try {
      await this.performRequest(source, `${encodeURIComponent(source.calendarId)}/events/${encodeURIComponent(remoteEventId)}`, {
        method: 'DELETE',
      });

      return { deleted: true } as const;
    } catch (error) {
      if (error instanceof GoogleCalendarWriteError && error.status === 404) {
        return { deleted: true } as const;
      }

      throw this.toHttpError(error);
    }
  }

  async rollbackCreatedEvent(source: GoogleCalendarOperationalSource, remoteEventId: string) {
    try {
      await this.deleteEvent(source, remoteEventId);
    } catch {
      throw new InternalServerErrorException('Remote event was created but the local rollback also failed.');
    }
  }

  private async performRequest(
    source: GoogleCalendarOperationalSource,
    path: string,
    init: { body?: BodyInit | null; headers?: HeadersInit; method: NonNullable<RequestInit['method']> },
  ) {
    let accessToken = source.accountAccessToken;

    if (this.isTokenExpired(source.accountTokenExpiresAt)) {
      accessToken = await this.refreshAccessToken(source);
    }

    try {
      return await this.fetchWithAccessToken(accessToken, path, init);
    } catch (error) {
      if (!(error instanceof GoogleCalendarWriteError) || error.status !== 401) {
        throw error;
      }

      accessToken = await this.refreshAccessToken(source);
      return this.fetchWithAccessToken(accessToken, path, init);
    }
  }

  private async fetchWithAccessToken(
    accessToken: string,
    path: string,
    init: { body?: BodyInit | null; headers?: HeadersInit; method: NonNullable<RequestInit['method']> },
  ) {
    const requestInit: RequestInit = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(init.headers ?? {}),
      },
      method: init.method,
    };

    if (init.body !== undefined) {
      requestInit.body = init.body;
    }

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${path}`, requestInit);

    if (!response.ok) {
      throw new GoogleCalendarWriteError(response.status, await this.resolveGoogleWriteErrorMessage(response));
    }

    return response;
  }

  private async parseRemoteEventResponse(response: Response) {
    const payload = await response.json() as RemoteGoogleCalendarEvent | undefined;

    if (!payload?.id) {
      throw new BadGatewayException('Google Calendar did not return a persisted event payload.');
    }

    return payload;
  }

  private async refreshAccessToken(source: GoogleCalendarOperationalSource) {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      throw new InternalServerErrorException('Google OAuth environment is not configured for token refresh.');
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
      throw new BadGatewayException('Google token refresh failed.');
    }

    const payload = await response.json() as { access_token?: string; expires_in?: number; refresh_token?: string };

    if (!payload.access_token || !payload.expires_in) {
      throw new BadGatewayException('Google token refresh payload is incomplete.');
    }

    const tokenExpiresAt = new Date(Date.now() + payload.expires_in * 1_000);
    const refreshToken = payload.refresh_token ?? source.accountRefreshToken;

    await this.accountsRepository.updateGoogleAccountTokens(source.accountId, {
      accessToken: payload.access_token,
      refreshToken,
      tokenExpiresAt,
    });

    return payload.access_token;
  }

  private async resolveGoogleWriteErrorMessage(response: Response) {
    try {
      const payload = await response.json() as { error?: { message?: string } };

      if (payload.error?.message) {
        return payload.error.message;
      }
    } catch {
      // Ignore malformed Google error payloads and use the status fallback below.
    }

    return `Google Calendar write failed with status ${response.status}.`;
  }

  private toHttpError(error: unknown) {
    if (error instanceof GoogleCalendarWriteError) {
      if (error.status === 400) {
        return new BadRequestException(error.message);
      }

      if (error.status === 403) {
        return new ForbiddenException('Google Calendar denied write access for this event or calendar.');
      }

      if (error.status === 404) {
        return new NotFoundException('Google calendar event was not found remotely.');
      }

      return new BadGatewayException(error.message);
    }

    if (error instanceof Error) {
      return error;
    }

    return new BadGatewayException('Google Calendar write failed unexpectedly.');
  }

  private isTokenExpired(tokenExpiresAt: Date) {
    return tokenExpiresAt.getTime() <= Date.now() + 60_000;
  }
}