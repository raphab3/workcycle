import axios from 'axios';

import { QueryClient } from '@tanstack/react-query';

export const httpClientPolicy = {
  authFailureMode: 'refresh-and-retry' as const,
  defaultRetry: 1,
  defaultStaleTimeMs: 1000 * 60 * 5,
};

export function shouldRetryRequest(failureCount: number, error: unknown) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (status && status < 500) {
      return false;
    }
  }

  return failureCount < httpClientPolicy.defaultRetry;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: httpClientPolicy.defaultStaleTimeMs,
      gcTime: 1000 * 60 * 30,
      retry: shouldRetryRequest,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});