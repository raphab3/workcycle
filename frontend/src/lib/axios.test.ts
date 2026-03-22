import axios, { AxiosError, AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { clearMock, mergeSessionMock, signOutMock } = vi.hoisted(() => ({
  clearMock: vi.fn(),
  mergeSessionMock: vi.fn(),
  signOutMock: vi.fn(),
}));

vi.mock('@/lib/queryClient', () => ({
  queryClient: {
    clear: clearMock,
  },
}));

vi.mock('@/modules/auth/store/useAuthStore', () => ({
  useAuthStore: {
    getState: () => ({
      mergeSession: mergeSessionMock,
      signOut: signOutMock,
    }),
  },
}));

import { persistAuthSession } from '@/modules/auth/storage/authStorage';
import { api, handleApiResponseError, resetRefreshSessionPromiseForTests } from '@/lib/axios';

import type { AuthSessionDTO } from '@/modules/auth/types';

function createSession(accessToken: string, refreshToken: string): AuthSessionDTO {
  return {
    accessToken,
    accessTokenExpiresAt: '2026-03-22T12:00:00.000Z',
    refreshToken,
    refreshTokenExpiresAt: '2026-03-29T12:00:00.000Z',
    refreshTokenPolicy: {
      endpoint: '/api/auth/refresh',
      rotation: 'rotate',
      transport: 'body',
    },
    tokenType: 'Bearer',
    user: {
      authProvider: 'email',
      displayName: 'Rafa',
      email: 'rafa@example.com',
      hasGoogleLinked: false,
      hasPassword: true,
      id: 'user-1',
    },
  };
}

function createUnauthorizedError(url: string) {
  const config = {
    headers: new AxiosHeaders({
      Authorization: 'Bearer stale-token',
    }),
    url,
  } as InternalAxiosRequestConfig;

  return new AxiosError(
    'Unauthorized',
    undefined,
    config,
    undefined,
    {
      config,
      data: { message: 'expired' },
      headers: {},
      status: 401,
      statusText: 'Unauthorized',
    },
  );
}

describe('axios auth policy', () => {
  beforeEach(() => {
    clearMock.mockReset();
    mergeSessionMock.mockReset();
    signOutMock.mockReset();
    persistAuthSession(createSession('stale-token', 'refresh-token'));
    resetRefreshSessionPromiseForTests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    persistAuthSession(null);
  });

  it('refreshes once and retries the original request', async () => {
    const refreshedSession = createSession('fresh-token', 'fresh-refresh-token');

    vi.spyOn(axios, 'post').mockResolvedValue({
      config: {
        headers: new AxiosHeaders(),
      },
      data: refreshedSession,
      headers: {},
      status: 200,
      statusText: 'OK',
    } as AxiosResponse<AuthSessionDTO>);
    const requestSpy = vi.spyOn(api, 'request').mockResolvedValue({
      config: {
        headers: new AxiosHeaders(),
      },
      data: { ok: true, url: '/protected' },
      headers: {},
      status: 200,
      statusText: 'OK',
    } as AxiosResponse<{ ok: true; url: string }>);

    const response = await handleApiResponseError(createUnauthorizedError('/protected'));

    expect((response as AxiosResponse<{ ok: true; url: string }>).data).toEqual({ ok: true, url: '/protected' });
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(mergeSessionMock).toHaveBeenCalledWith(refreshedSession);
    expect(signOutMock).not.toHaveBeenCalled();
    expect(clearMock).not.toHaveBeenCalled();
    expect((requestSpy.mock.calls[0]?.[0] as InternalAxiosRequestConfig).headers.Authorization).toBe('Bearer fresh-token');
  });

  it('serializes concurrent 401 refresh attempts', async () => {
    const refreshedSession = createSession('fresh-token', 'fresh-refresh-token');

    let resolveRefresh: ((value: AxiosResponse<AuthSessionDTO>) => void) | null = null;
    vi.spyOn(axios, 'post').mockReturnValue(new Promise((resolve) => {
      resolveRefresh = resolve;
    }) as Promise<AxiosResponse<AuthSessionDTO>>);
    vi.spyOn(api, 'request').mockImplementation(async (config) => ({
      config: {
        headers: new AxiosHeaders(),
      },
      data: { ok: true, url: config.url },
      headers: {},
      status: 200,
      statusText: 'OK',
    }) as AxiosResponse<{ ok: true; url?: string }>);

    const requests = Promise.all([
      handleApiResponseError(createUnauthorizedError('/first')),
      handleApiResponseError(createUnauthorizedError('/second')),
    ]);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(axios.post).toHaveBeenCalledTimes(1);

    resolveRefresh?.({
      config: {
        headers: new AxiosHeaders(),
      },
      data: refreshedSession,
      headers: {},
      status: 200,
      statusText: 'OK',
    });

    const [first, second] = await requests as [AxiosResponse<{ ok: true; url?: string }>, AxiosResponse<{ ok: true; url?: string }>];

    expect(first.data).toEqual({ ok: true, url: '/first' });
    expect(second.data).toEqual({ ok: true, url: '/second' });
    expect(mergeSessionMock).toHaveBeenCalledTimes(1);
  });

  it('logs out in a controlled way when refresh fails', async () => {
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('refresh failed'));

    await expect(handleApiResponseError(createUnauthorizedError('/protected'))).rejects.toThrow('refresh failed');

    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(clearMock).toHaveBeenCalledTimes(1);
  });
});