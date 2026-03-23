'use client';

import { useEffect, useRef } from 'react';

import {
  createActivityPulseDueNotificationEvent,
  createActivityPulseExpiredNotificationEvent,
  createPulseInactivityState,
  createTodayPulseNotificationEventId,
  useNotificationCapability,
  useNotificationsStore,
} from '@/modules/notifications';
import { useFirePulseMutation } from '@/modules/today/queries/useFirePulseMutation';
import { useUpdateTodaySessionMutation } from '@/modules/today/queries/useUpdateTodaySessionMutation';
import { getMillisecondsUntil } from '@/modules/today/utils/pulse';
import { useWorkspaceStore } from '@/shared/store/useWorkspaceStore';

export function useActivityPulse() {
  const sessionId = useWorkspaceStore((state) => state.todaySessionId);
  const sessionState = useWorkspaceStore((state) => state.sessionState);
  const timeBlocks = useWorkspaceStore((state) => state.timeBlocks);
  const activePulse = useWorkspaceStore((state) => state.activePulse);
  const nextPulseDueAt = useWorkspaceStore((state) => state.nextPulseDueAt);
  const activeProjectId = useWorkspaceStore((state) => state.activeProjectId);
  const pulseHistory = useWorkspaceStore((state) => state.pulseHistory);
  const firePulse = useWorkspaceStore((state) => state.firePulse);
  const expireActivePulse = useWorkspaceStore((state) => state.expireActivePulse);
  const firePulseMutation = useFirePulseMutation();
  const updateTodaySessionMutation = useUpdateTodaySessionMutation();
  const notificationCapability = useNotificationCapability({ enabled: sessionState === 'running' || sessionState === 'paused_inactivity' });
  const dispatchNotificationEvent = useNotificationsStore((state) => state.dispatchEvent);
  const dismissNotificationEvent = useNotificationsStore((state) => state.dismissNotificationEvent);
  const syncPulseInactivityState = useNotificationsStore((state) => state.syncPulseInactivityState);
  const pendingFireRef = useRef<string | null>(null);
  const pendingExpireRef = useRef<string | null>(null);
  const dispatchedDuePulseRef = useRef<string | null>(null);
  const dispatchedExpiredPulseRef = useRef<string | null>(null);
  const dismissedPulseRef = useRef<string | null>(null);

  const shouldUseBackend = Boolean(sessionId);
  const latestPulse = pulseHistory[pulseHistory.length - 1] ?? null;

  useEffect(() => {
    syncPulseInactivityState(
      createPulseInactivityState(sessionState, latestPulse),
      latestPulse?.reviewedAt ?? latestPulse?.respondedAt ?? latestPulse?.firedAt,
    );
  }, [latestPulse, sessionState, syncPulseInactivityState]);

  useEffect(() => {
    if (!activePulse || dispatchedDuePulseRef.current === activePulse.firedAt) {
      return;
    }

    dispatchNotificationEvent(createActivityPulseDueNotificationEvent(activePulse), notificationCapability, activePulse.firedAt);
    dispatchedDuePulseRef.current = activePulse.firedAt;
  }, [activePulse, dispatchNotificationEvent, notificationCapability]);

  useEffect(() => {
    if (!latestPulse) {
      return;
    }

    if (latestPulse.status === 'unconfirmed' && latestPulse.resolution === 'pending' && dispatchedExpiredPulseRef.current !== latestPulse.firedAt) {
      dispatchNotificationEvent(
        createActivityPulseExpiredNotificationEvent(latestPulse, latestPulse.reviewedAt ?? latestPulse.respondedAt ?? new Date().toISOString()),
        notificationCapability,
        latestPulse.firedAt,
      );
      dispatchedExpiredPulseRef.current = latestPulse.firedAt;
      return;
    }

    if (latestPulse.resolution !== 'pending' && dismissedPulseRef.current !== latestPulse.firedAt) {
      dismissNotificationEvent(createTodayPulseNotificationEventId(latestPulse.firedAt, 'due'));
      dismissNotificationEvent(createTodayPulseNotificationEventId(latestPulse.firedAt, 'expired'));
      dismissedPulseRef.current = latestPulse.firedAt;
    }
  }, [dismissNotificationEvent, dispatchNotificationEvent, latestPulse, notificationCapability]);

  useEffect(() => {
    if (sessionState !== 'running') {
      return undefined;
    }

    if (activePulse) {
      const timeoutId = window.setTimeout(() => {
        if (!shouldUseBackend || !sessionId) {
          expireActivePulse();
          return;
        }

        if (pendingExpireRef.current === activePulse.firedAt) {
          return;
        }

        const expiredAt = activePulse.expiresAt;
        const nextTimeBlocks = timeBlocks.map((timeBlock) => (
          timeBlock.endedAt === null ? { ...timeBlock, endedAt: expiredAt } : timeBlock
        ));

        pendingExpireRef.current = activePulse.firedAt;

        void firePulseMutation.mutateAsync({
          expiresAt: activePulse.expiresAt,
          firedAt: activePulse.firedAt,
          projectId: activePulse.projectId,
          resolution: 'pending',
          sessionId,
          status: 'unconfirmed',
        }).then(() => updateTodaySessionMutation.mutateAsync({
          sessionId,
          state: 'paused_inactivity',
          timeBlocks: nextTimeBlocks,
        })).finally(() => {
          if (pendingExpireRef.current === activePulse.firedAt) {
            pendingExpireRef.current = null;
          }
        });
      }, getMillisecondsUntil(activePulse.expiresAt));

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    if (!nextPulseDueAt) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      if (!shouldUseBackend || !sessionId) {
        firePulse();
        return;
      }

      if (pendingFireRef.current === nextPulseDueAt) {
        return;
      }

      pendingFireRef.current = nextPulseDueAt;

      void firePulseMutation.mutateAsync({
        firedAt: nextPulseDueAt,
        projectId: activeProjectId,
        resolution: 'pending',
        sessionId,
        status: 'unconfirmed',
      }).finally(() => {
        if (pendingFireRef.current === nextPulseDueAt) {
          pendingFireRef.current = null;
        }
      });
    }, getMillisecondsUntil(nextPulseDueAt));

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeProjectId, activePulse, expireActivePulse, firePulse, firePulseMutation, nextPulseDueAt, sessionId, sessionState, shouldUseBackend, timeBlocks, updateTodaySessionMutation]);
}