import { api } from '@/lib/axios';

import type {
  AgendaEvent,
  AgendaEventWritePayload,
  AgendaEventsResult,
  AgendaIntervalInput,
  DeleteAgendaEventResult,
  RespondAgendaEventInput,
  UpdateAgendaEventInput,
} from '@/modules/agenda/types';

async function getEvents(input: AgendaIntervalInput) {
  const response = await api.get<AgendaEventsResult>('/api/events', {
    params: {
      from: input.from,
      refresh: false,
      to: input.to,
    },
  });

  return response.data;
}

async function refreshEvents(input: AgendaIntervalInput) {
  const response = await api.get<AgendaEventsResult>('/api/events', {
    params: {
      from: input.from,
      refresh: true,
      to: input.to,
    },
  });

  return response.data;
}

async function createEvent(input: AgendaEventWritePayload) {
  const response = await api.post<AgendaEvent>('/api/events', input);

  return response.data;
}

async function updateEvent({ eventId, values }: UpdateAgendaEventInput) {
  const response = await api.patch<AgendaEvent>(`/api/events/${eventId}`, values);

  return response.data;
}

async function respondToEvent({ eventId, responseStatus }: RespondAgendaEventInput) {
  const response = await api.patch<AgendaEvent>(`/api/events/${eventId}`, { responseStatus });

  return response.data;
}

async function deleteEvent(eventId: string) {
  const response = await api.delete<DeleteAgendaEventResult>(`/api/events/${eventId}`);

  return response.data;
}

export const agendaService = {
  createEvent,
  deleteEvent,
  getEvents,
  refreshEvents,
  respondToEvent,
  updateEvent,
};