import axios from 'axios';

import type { ApiError } from '@/shared/types';

function isMessageLike(value: unknown): value is { message?: unknown; error?: unknown } {
  return typeof value === 'object' && value !== null;
}

export type ApiFailureKind = 'auth' | 'forbidden' | 'not-found' | 'server' | 'unknown';

export interface NormalizedApiError extends ApiError {
  kind: ApiFailureKind;
  retryable: boolean;
}

function resolveApiFailureKind(statusCode?: number): ApiFailureKind {
  switch (statusCode) {
    case 401:
      return 'auth';
    case 403:
      return 'forbidden';
    case 404:
      return 'not-found';
    case 500:
      return 'server';
    default:
      return 'unknown';
  }
}

function resolveApiErrorMessage(responseData: unknown, error: unknown, fallbackMessage: string) {
  if (typeof responseData === 'string' && responseData.trim().length > 0) {
    return responseData;
  }

  if (isMessageLike(responseData)) {
    if (typeof responseData.message === 'string' && responseData.message.trim().length > 0) {
      return responseData.message;
    }

    if (typeof responseData.error === 'string' && responseData.error.trim().length > 0) {
      return responseData.error;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallbackMessage;
}

export function normalizeApiError(error: unknown, fallbackMessage = 'Nao foi possivel concluir a requisicao.'): NormalizedApiError {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;
    const statusCode = error.response?.status ?? 0;
    const message = resolveApiErrorMessage(responseData, error, fallbackMessage);
    const normalizedResponse = isMessageLike(responseData) ? responseData as ApiError : undefined;

    return {
      code: typeof normalizedResponse?.code === 'string' ? normalizedResponse.code : undefined,
      errors: normalizedResponse?.errors,
      kind: resolveApiFailureKind(statusCode),
      message,
      retryable: statusCode >= 500 || statusCode === 0,
      statusCode,
    };
  }

  if (error instanceof Error) {
    return {
      kind: 'unknown',
      message: error.message.trim().length > 0 ? error.message : fallbackMessage,
      retryable: false,
      statusCode: 0,
    };
  }

  return {
    kind: 'unknown',
    message: fallbackMessage,
    retryable: false,
    statusCode: 0,
  };
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  return normalizeApiError(error, fallbackMessage).message;
}