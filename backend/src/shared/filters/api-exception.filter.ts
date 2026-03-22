import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import type { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

import type { ApiErrorResponse } from '@/shared/types/http';

function resolveErrorCode(statusCode: number) {
  switch (statusCode) {
    case HttpStatus.BAD_REQUEST:
      return 'BAD_REQUEST';
    case HttpStatus.UNAUTHORIZED:
      return 'AUTH_UNAUTHORIZED';
    case HttpStatus.FORBIDDEN:
      return 'AUTH_FORBIDDEN';
    case HttpStatus.NOT_FOUND:
      return 'RESOURCE_NOT_FOUND';
    default:
      return 'INTERNAL_SERVER_ERROR';
  }
}

function resolveErrorMessage(error: HttpException | ZodError | Error, statusCode: number) {
  if (error instanceof ZodError) {
    return 'Request payload is invalid.';
  }

  if (error instanceof HttpException) {
    const response = error.getResponse();

    if (typeof response === 'string') {
      return response;
    }

    if (typeof response === 'object' && response && 'message' in response) {
      const message = response.message;

      if (Array.isArray(message)) {
        return message.join(', ');
      }

      if (typeof message === 'string') {
        return message;
      }
    }
  }

  if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
    return 'An unexpected error occurred.';
  }

  return error.message;
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<FastifyReply>();
    const request = context.getRequest<FastifyRequest>();

    const statusCode = exception instanceof ZodError
      ? HttpStatus.BAD_REQUEST
      : exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const error = exception instanceof Error ? exception : new Error('Unknown error');
    const payload: ApiErrorResponse = {
      code: resolveErrorCode(statusCode),
      message: resolveErrorMessage(error, statusCode),
      statusCode,
    };

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      request.log.error({ err: exception }, 'Unhandled request error');
    }

    response.status(statusCode).send(payload);
  }
}