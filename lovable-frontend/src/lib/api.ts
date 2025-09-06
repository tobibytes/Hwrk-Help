export const API_BASE: string = (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:3001';

export async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { ...(init?.headers as any) };
  if (init?.body && !Object.keys(headers).some((k) => k.toLowerCase() === 'content-type')) {
    headers['content-type'] = 'application/json';
  }
  const res = await fetch(url, {
    credentials: 'include',
    ...init,
    headers,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return await res.text();
}

export async function postJSON<T>(url: string, body?: any): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return (await res.json()) as T;
}

// Kickoff helper without JSON content-type/body wrapper
export async function postKickoff<T>(url: string): Promise<T> {
  const res = await fetch(url, { method: 'POST', credentials: 'include' });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return (await res.json()) as T;
}

export function googleLogin() {
  const redirect = window.location.origin;
  window.location.href = `${API_BASE}/api/auth/google/start?redirect=${encodeURIComponent(redirect)}`;
}
