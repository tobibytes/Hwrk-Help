import type { QueryKey, UseQueryOptions, QueryObserverResult } from '@tanstack/react-query'
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
// - Supports manual mode (do not run on mount) and exposes a `run` function
// - Preserves the original react-query return shape and adds `run`
export function useAPI<TData = unknown, TError = unknown>(
  key: QueryKey,
  fn: () => Promise<TData>,
  options?: (Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> & { manual?: boolean }),
) {
  const { manual, ...rest } = options || {}
  const result = useQuery<TData, TError>({
    queryKey: key,
    queryFn: fn,
    // If manual is true, default enabled to false unless explicitly overridden
    enabled: manual ? false : (rest as any)?.enabled ?? true,
    ...(rest as any),
  })

  const run = async () => result.refetch() as Promise<QueryObserverResult<TData, TError>>

  return Object.assign(result, { run })
}

// Example helper for building keys
export const qk = {
  courses: () => ['courses'] as const,
  course: (courseId: string) => ['courses', courseId] as const,
}
