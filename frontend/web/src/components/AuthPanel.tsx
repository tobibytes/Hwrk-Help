import { TalvraCard, TalvraStack, TalvraText, TalvraButton } from '@ui';
import { useQueryClient } from '@tanstack/react-query';
import { useAPI } from '@api';

const API_BASE: string = (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:3001';

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
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

function googleLogin() {
  const redirect = window.location.origin;
  window.location.href = `${API_BASE}/api/auth/google/start?redirect=${encodeURIComponent(redirect)}`;
}

async function doLogout() {
  await fetchJSON(`${API_BASE}/api/auth/logout`, { method: 'POST' });
}

export function AuthPanel() {
  const qc = useQueryClient();
  const meQ = useAPI<{ ok: true; user: { id: string; email: string; google_sub: string | null; created_at: string } }>(
    ['me'],
    () => fetchJSON(`${API_BASE}/api/auth/me`),
    { retry: false, refetchOnWindowFocus: true }
  );

  const isAuthed = meQ.data?.ok === true;
  const email = meQ.data?.user?.email;


  return (
    <TalvraCard>
      <TalvraStack>
        <TalvraText as="h3">Authentication</TalvraText>
        {!isAuthed ? (
          <TalvraStack>
            <TalvraText>You are not logged in.</TalvraText>
            <TalvraButton onClick={googleLogin}>Login with Google</TalvraButton>
          </TalvraStack>
        ) : (
          <TalvraStack>
            <TalvraText>Logged in as {email}</TalvraText>
            <TalvraButton
              onClick={async () => {
                await doLogout();
                await qc.invalidateQueries({ queryKey: ['me'] });
              }}
            >
              Logout
            </TalvraButton>

            <TalvraText as="h4" style={{ marginTop: 16 }}>Canvas connection</TalvraText>
            <TalvraText>
              Manage your Canvas personal access token in Settings.
            </TalvraText>
          </TalvraStack>
        )}
      </TalvraStack>
    </TalvraCard>
  );
}
