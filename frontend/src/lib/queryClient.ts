import axios from 'axios';

import { QueryClient } from '@tanstack/react-query';

function shouldRetryRequest(failureCount: number, error: unknown) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (status && status < 500) {
      return false;
    }
  }

  return failureCount < 1;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: shouldRetryRequest,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});