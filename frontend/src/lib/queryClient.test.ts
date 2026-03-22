import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';

import { httpClientPolicy, queryClient, shouldRetryRequest } from '@/lib/queryClient';

function createAxiosError(statusCode: number) {
  return new AxiosError(
    `HTTP ${statusCode}`,
    undefined,
    {
      headers: new AxiosHeaders(),
    },
    undefined,
    {
      config: {
        headers: new AxiosHeaders(),
      },
      data: { message: `HTTP ${statusCode}` },
      headers: {},
      status: statusCode,
      statusText: `HTTP ${statusCode}`,
    },
  );
}

describe('queryClient policy', () => {
  it('exposes explicit defaults for stale time and retry mode', () => {
    const defaults = queryClient.getDefaultOptions();

    expect(httpClientPolicy).toEqual({
      authFailureMode: 'refresh-and-retry',
      defaultRetry: 1,
      defaultStaleTimeMs: 300000,
    });
    expect(defaults.queries?.staleTime).toBe(httpClientPolicy.defaultStaleTimeMs);
    expect(defaults.queries?.refetchOnWindowFocus).toBe(false);
    expect(defaults.queries?.refetchOnReconnect).toBe(false);
  });

  it('does not retry 401 or 404 responses', () => {
    expect(shouldRetryRequest(0, createAxiosError(401))).toBe(false);
    expect(shouldRetryRequest(0, createAxiosError(404))).toBe(false);
  });

  it('retries a single time for 500 responses', () => {
    expect(shouldRetryRequest(0, createAxiosError(500))).toBe(true);
    expect(shouldRetryRequest(1, createAxiosError(500))).toBe(false);
  });
});