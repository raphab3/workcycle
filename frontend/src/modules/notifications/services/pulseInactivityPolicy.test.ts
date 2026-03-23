import { describe, expect, it } from 'vitest';

import {
  createInitialPulseInactivityState,
  createPulseInactivityState,
  isPulseNotificationEventActionable,
  shouldSuppressPulseNotificationEvent,
} from './pulseInactivityPolicy';

describe('pulseInactivityPolicy', () => {
  it('creates an inactive initial state by default', () => {
    expect(createInitialPulseInactivityState()).toEqual({
      activeExpiredEventId: null,
      suppressFurtherPulseAlerts: false,
      suppressedSince: null,
    });
  });

  it('activates suppression only when the session is paused_inactivity with a pending unconfirmed pulse', () => {
    expect(createPulseInactivityState('paused_inactivity', {
      confirmedMinutes: 0,
      firedAt: '2026-03-22T09:30:00.000Z',
      projectId: 'proj-1',
      resolution: 'pending',
      respondedAt: null,
      reviewedAt: null,
      status: 'unconfirmed',
    })).toEqual({
      activeExpiredEventId: 'today-pulse:2026-03-22T09:30:00.000Z:expired',
      suppressFurtherPulseAlerts: true,
      suppressedSince: '2026-03-22T09:30:00.000Z',
    });

    expect(createPulseInactivityState('running', {
      confirmedMinutes: 0,
      firedAt: '2026-03-22T09:30:00.000Z',
      projectId: 'proj-1',
      resolution: 'pending',
      respondedAt: null,
      reviewedAt: null,
      status: 'unconfirmed',
    })).toEqual(createInitialPulseInactivityState());
  });

  it('suppresses new pulse-due events while inactivity recovery is active', () => {
    const state = createPulseInactivityState('paused_inactivity', {
      confirmedMinutes: 0,
      firedAt: '2026-03-22T09:30:00.000Z',
      projectId: 'proj-1',
      resolution: 'pending',
      respondedAt: null,
      reviewedAt: null,
      status: 'unconfirmed',
    });

    expect(shouldSuppressPulseNotificationEvent(state, {
      eventId: 'today-pulse:2026-03-22T10:00:00.000Z:due',
      message: 'Confirme o bloco atual.',
      occurredAt: '2026-03-22T10:00:00.000Z',
      title: 'Pulso',
      type: 'activity-pulse-due',
    })).toBe(true);

    expect(shouldSuppressPulseNotificationEvent(state, {
      eventId: 'today-pulse:2026-03-22T09:30:00.000Z:expired',
      message: 'Sessao pausada por inatividade.',
      occurredAt: '2026-03-22T09:35:00.000Z',
      title: 'Expirado',
      type: 'activity-pulse-expired',
    })).toBe(false);
  });

  it('marks only the active expired notification as actionable while suppression is active', () => {
    const state = createPulseInactivityState('paused_inactivity', {
      confirmedMinutes: 0,
      firedAt: '2026-03-22T09:30:00.000Z',
      projectId: 'proj-1',
      resolution: 'pending',
      respondedAt: null,
      reviewedAt: null,
      status: 'unconfirmed',
    });

    expect(isPulseNotificationEventActionable(state, 'today-pulse:2026-03-22T09:30:00.000Z:expired')).toBe(true);
    expect(isPulseNotificationEventActionable(state, 'today-pulse:2026-03-22T09:30:00.000Z:due')).toBe(false);
    expect(isPulseNotificationEventActionable(state, 'today-pulse:2026-03-22T10:00:00.000Z:expired')).toBe(false);
  });
});