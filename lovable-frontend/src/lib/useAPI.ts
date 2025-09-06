import { useQuery, QueryObserverResult } from '@tanstack/react-query';
import { API_BASE, fetchJSON } from '@/lib/api';

export type RouteDef = {
  endpoint: string; // e.g., "/api/canvas/courses"
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  auth?: boolean;
  description?: string;
};

export function buildUrl(endpoint: string, query?: Record<string, any>) {
  const base = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  if (!query || Object.keys(query).length === 0) return base;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === '') continue;
    qs.set(k, String(v));
  }
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}${qs.toString()}`;
}

export function useAPI<TResp = unknown, TBody = unknown>(opts: {
  route: RouteDef;
  query?: Record<string, any>;
  body?: TBody;
  enabled?: boolean;
  responseType?: 'json' | 'text';
  options?: Partial<Parameters<typeof useQuery<TResp, Error>>[0]>;
}) {
  const { route, query, body, enabled = true, responseType = 'json', options } = opts;
  const key = [route.endpoint, query, route.method, responseType];
  const q = useQuery<TResp, Error>({
    queryKey: key,
    enabled,
    queryFn: async () => {
      const url = buildUrl(route.endpoint, query);
      if (route.method === 'GET') {
        if (responseType === 'text') {
          const res = await fetch(url, { credentials: 'include' });
          if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
          return (await res.text()) as unknown as TResp;
        }
        return await fetchJSON<TResp>(url);
      }
      return await fetchJSON<TResp>(url, {
        method: route.method,
        body: body ? JSON.stringify(body) : undefined,
      });
    },
    retry: (count) => count < 2,
    ...(options as any),
  });

  const run = async (next?: { endpoint?: string; query?: Record<string, any>; body?: TBody; method?: RouteDef['method']; responseType?: 'json' | 'text' }) => {
    const ep = next?.endpoint ?? route.endpoint;
    const url = buildUrl(ep, next?.query ?? query);
    const method = next?.method ?? route.method;
    const rtype = next?.responseType ?? responseType;
    if (method === 'GET') {
      if (rtype === 'text') {
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
        const data = (await res.text()) as unknown as TResp;
        return { data } as any;
      }
      return (await q.refetch()) as QueryObserverResult<TResp, Error>;
    }
    const data = await fetchJSON<TResp>(url, {
      method,
      body: (next?.body ?? body) ? JSON.stringify(next?.body ?? body) : undefined,
    });
    return { data } as any;
  };

  return Object.assign(q, { run });
}
