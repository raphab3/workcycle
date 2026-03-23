import type { ActivePulse, PulseRecord } from '@/modules/today/types';
import type { OperationalNotificationEvent } from '@/modules/notifications/types/events';

export function createTodayPulseNotificationEventId(firedAt: string, kind: 'due' | 'expired' = 'due') {
  return `today-pulse:${firedAt}:${kind}`;
}

export function createActivityPulseDueNotificationEvent(activePulse: ActivePulse): OperationalNotificationEvent {
  return {
    eventId: createTodayPulseNotificationEventId(activePulse.firedAt, 'due'),
    expiresAt: activePulse.expiresAt,
    message: 'Confirme o bloco atual para manter a sessao consistente.',
    occurredAt: activePulse.firedAt,
    title: 'Pulso de atividade pendente',
    type: 'activity-pulse-due',
  };
}

export function createActivityPulseExpiredNotificationEvent(pulse: PulseRecord, expiredAt?: string): OperationalNotificationEvent {
  return {
    eventId: createTodayPulseNotificationEventId(pulse.firedAt, 'expired'),
    message: 'O pulso expirou e a sessao foi pausada por inatividade. Revise o intervalo para retomar o fluxo.',
    occurredAt: expiredAt ?? pulse.firedAt,
    title: 'Sessao pausada por inatividade',
    type: 'activity-pulse-expired',
  };
}