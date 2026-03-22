import axios, { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';

import { getApiErrorMessage, normalizeApiError } from '@/lib/apiError';

function createAxiosError(statusCode: number, data: unknown) {
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
      data,
      headers: {},
      status: statusCode,
      statusText: `HTTP ${statusCode}`,
    },
  );
}

describe('apiError', () => {
  it('normalizes 401 auth failures', () => {
    const error = createAxiosError(401, {
      code: 'AUTH_UNAUTHORIZED',
      message: 'Refresh token is invalid or expired.',
      statusCode: 401,
    });

    expect(normalizeApiError(error)).toEqual({
      code: 'AUTH_UNAUTHORIZED',
      kind: 'auth',
      message: 'Refresh token is invalid or expired.',
      retryable: false,
      statusCode: 401,
    });
  });

  it('normalizes 403, 404 and 500 into predictable kinds', () => {
    expect(normalizeApiError(createAxiosError(403, { message: 'Forbidden.', statusCode: 403 })).kind).toBe('forbidden');
    expect(normalizeApiError(createAxiosError(404, { message: 'Missing.', statusCode: 404 })).kind).toBe('not-found');
    expect(normalizeApiError(createAxiosError(500, { message: 'Boom.', statusCode: 500 })).kind).toBe('server');
  });

  it('keeps getApiErrorMessage aligned with the normalized payload', () => {
    const error = createAxiosError(404, {
      code: 'RESOURCE_NOT_FOUND',
      message: 'Project not found.',
      statusCode: 404,
    });

    expect(axios.isAxiosError(error)).toBe(true);
    expect(getApiErrorMessage(error, 'fallback')).toBe('Project not found.');
  });
});