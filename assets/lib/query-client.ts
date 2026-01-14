import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 30 seconds
      staleTime: 30 * 1000,
      // Retry failed requests up to 2 times
      retry: 2,
      // Refetch on window focus
      refetchOnWindowFocus: true,
      // Refetch when network reconnects
      refetchOnReconnect: true,
      // Garbage collection after 5 minutes of inactivity
      gcTime: 5 * 60 * 1000,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});
