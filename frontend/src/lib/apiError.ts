import axios from 'axios';

function isMessageLike(value: unknown): value is { message?: unknown; error?: unknown } {
  return typeof value === 'object' && value !== null;
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

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

    if (typeof error.message === 'string' && error.message.trim().length > 0) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallbackMessage;
}