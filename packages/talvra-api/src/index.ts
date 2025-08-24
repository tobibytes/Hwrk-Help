import type { QueryKey, UseQueryOptions } from '@tanstack/react-query'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'

// Factory to create a QueryClient with sensible defaults
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
  })
}

export { QueryClientProvider }

// Generic typed useAPI wrapper for GET style queries
export function useAPI<TData = unknown, TError = unknown>(
  key: QueryKey,
  fn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<TData, TError>({
    queryKey: key,
    queryFn: fn,
    ...options,
  })
}

// Example helper for building keys
export const qk = {
  courses: () => ['courses'] as const,
  course: (courseId: string) => ['courses', courseId] as const,
}
