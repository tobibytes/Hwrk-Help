import { QueryClient } from '@tanstack/react-query';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000, // 1 min
        gcTime: 5 * 60_000, // 5 mins
        refetchOnWindowFocus: false,
        retry: (failureCount) => failureCount < 2,
      },
      mutations: {
        retry: 1,
      },
    },
  });
}
