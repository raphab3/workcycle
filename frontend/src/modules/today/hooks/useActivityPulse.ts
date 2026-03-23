'use client';

import { useEffect, useRef } from 'react';

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
  const firePulse = useWorkspaceStore((state) => state.firePulse);
  const expireActivePulse = useWorkspaceStore((state) => state.expireActivePulse);
  const firePulseMutation = useFirePulseMutation();
  const updateTodaySessionMutation = useUpdateTodaySessionMutation();
  const pendingFireRef = useRef<string | null>(null);
  const pendingExpireRef = useRef<string | null>(null);

  const shouldUseBackend = Boolean(sessionId);

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