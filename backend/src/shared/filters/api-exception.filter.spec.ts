import assert from 'node:assert/strict';
import test from 'node:test';

import { HttpStatus, UnauthorizedException } from '@nestjs/common';

import { ApiExceptionFilter } from '@/shared/filters/api-exception.filter';

function createHost(send: (statusCode: number, payload: unknown) => void) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        log: {
          error: () => undefined,
        },
      }),
      getResponse: () => ({
        status(statusCode: number) {
          return {
            send(payload: unknown) {
              send(statusCode, payload);
            },
          };
        },
      }),
    }),
  };
}

test('maps unauthorized exceptions to the standardized auth envelope', () => {
  const filter = new ApiExceptionFilter();
  let response: { payload: unknown; statusCode: number } | null = null;

  filter.catch(
    new UnauthorizedException('Authentication token is invalid or expired.'),
    createHost((statusCode, payload) => {
      response = { payload, statusCode };
    }) as never,
  );

  assert.deepEqual(response, {
    payload: {
      code: 'AUTH_UNAUTHORIZED',
      message: 'Authentication token is invalid or expired.',
      statusCode: HttpStatus.UNAUTHORIZED,
    },
    statusCode: HttpStatus.UNAUTHORIZED,
  });
});

test('maps unexpected exceptions to the standardized internal-server envelope', () => {
  const filter = new ApiExceptionFilter();
  let response: { payload: unknown; statusCode: number } | null = null;

  filter.catch(
    new Error('Database offline'),
    createHost((statusCode, payload) => {
      response = { payload, statusCode };
    }) as never,
  );

  assert.deepEqual(response, {
    payload: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred.',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    },
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  });
});