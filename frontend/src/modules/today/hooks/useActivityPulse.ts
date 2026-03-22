'use client';

import { useEffect } from 'react';

import { getMillisecondsUntil } from '@/modules/today/utils/pulse';
import { useWorkspaceStore } from '@/shared/store/useWorkspaceStore';

export function useActivityPulse() {
  const sessionState = useWorkspaceStore((state) => state.sessionState);
  const activePulse = useWorkspaceStore((state) => state.activePulse);
  const nextPulseDueAt = useWorkspaceStore((state) => state.nextPulseDueAt);
  const firePulse = useWorkspaceStore((state) => state.firePulse);
  const expireActivePulse = useWorkspaceStore((state) => state.expireActivePulse);

  useEffect(() => {
    if (sessionState !== 'running') {
      return undefined;
    }

    if (activePulse) {
      const timeoutId = window.setTimeout(() => {
        expireActivePulse();
      }, getMillisecondsUntil(activePulse.expiresAt));

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    if (!nextPulseDueAt) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      firePulse();
    }, getMillisecondsUntil(nextPulseDueAt));

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activePulse, expireActivePulse, firePulse, nextPulseDueAt, sessionState]);
}