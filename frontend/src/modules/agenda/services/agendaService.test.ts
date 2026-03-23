import { describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/axios';

import { agendaService } from './agendaService';

const agendaEventPayload = {
  accountDisplayName: 'Rafa Work',
  accountEmail: 'rafa@work.dev',
  accountId: 'account-1',
  attendees: [],
  calendarColorHex: '#3367D6',
  calendarId: 'calendar-1',
  calendarName: 'Primary',
  description: 'Daily do produto',
  endAt: '2026-03-22T10:00:00.000Z',
  id: 'calendar-1:event-1',
  isAllDay: false,
  location: 'Meet',
  meetLink: null,
  projectId: null,
  recurrenceRule: null,
  recurringEventId: null,
  responseStatus: 'accepted',
  startAt: '2026-03-22T09:00:00.000Z',
  syncedAt: '2026-03-22T08:50:00.000Z',
  title: 'Daily operacional',
  updatedAt: '2026-03-22T08:50:00.000Z',
} as const;

describe('agendaService', () => {
  it('requests the authenticated agenda list for an interval', async () => {
    const getSpy = vi.spyOn(api, 'get').mockResolvedValue({
      data: { degradedSources: [], events: [agendaEventPayload] },
    });

    const result = await agendaService.getEvents({
      from: '2026-03-22T03:00:00.000Z',
      to: '2026-03-23T02:59:59.999Z',
    });

    expect(getSpy).toHaveBeenCalledWith('/api/events', {
      params: {
        from: '2026-03-22T03:00:00.000Z',
        refresh: false,
        to: '2026-03-23T02:59:59.999Z',
      },
    });
    expect(result.events).toHaveLength(1);

    getSpy.mockRestore();
  });

  it('supports manual refresh for the selected interval', async () => {
    const getSpy = vi.spyOn(api, 'get').mockResolvedValue({
      data: { degradedSources: [], events: [agendaEventPayload] },
    });

    await agendaService.refreshEvents({
      from: '2026-03-22T03:00:00.000Z',
      to: '2026-03-23T02:59:59.999Z',
    });

    expect(getSpy).toHaveBeenCalledWith('/api/events', {
      params: {
        from: '2026-03-22T03:00:00.000Z',
        refresh: true,
        to: '2026-03-23T02:59:59.999Z',
      },
    });

    getSpy.mockRestore();
  });

  it('posts, patches and deletes events through the real endpoints', async () => {
    const postSpy = vi.spyOn(api, 'post').mockResolvedValue({ data: agendaEventPayload });
    const patchSpy = vi.spyOn(api, 'patch').mockResolvedValue({ data: agendaEventPayload });
    const deleteSpy = vi.spyOn(api, 'delete').mockResolvedValue({ data: { deleted: true, id: agendaEventPayload.id } });

    await agendaService.createEvent({
      calendarId: 'calendar-1',
      description: 'Daily do produto',
      endAt: '2026-03-22T10:00:00.000Z',
      location: 'Meet',
      startAt: '2026-03-22T09:00:00.000Z',
      title: 'Daily operacional',
    });
    await agendaService.updateEvent({
      eventId: agendaEventPayload.id,
      values: {
        calendarId: 'calendar-1',
        description: 'Daily revisada',
        endAt: '2026-03-22T10:30:00.000Z',
        location: 'Meet',
        startAt: '2026-03-22T09:30:00.000Z',
        title: 'Daily revisada',
      },
    });
    await agendaService.deleteEvent(agendaEventPayload.id);

    expect(postSpy).toHaveBeenCalledWith('/api/events', {
      calendarId: 'calendar-1',
      description: 'Daily do produto',
      endAt: '2026-03-22T10:00:00.000Z',
      location: 'Meet',
      startAt: '2026-03-22T09:00:00.000Z',
      title: 'Daily operacional',
    });
    expect(patchSpy).toHaveBeenCalledWith(`/api/events/${agendaEventPayload.id}`, {
      calendarId: 'calendar-1',
      description: 'Daily revisada',
      endAt: '2026-03-22T10:30:00.000Z',
      location: 'Meet',
      startAt: '2026-03-22T09:30:00.000Z',
      title: 'Daily revisada',
    });
    expect(deleteSpy).toHaveBeenCalledWith(`/api/events/${agendaEventPayload.id}`);

    postSpy.mockRestore();
    patchSpy.mockRestore();
    deleteSpy.mockRestore();
  });
});