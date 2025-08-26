import { TalvraStack, TalvraText, TalvraButton, Input } from '@ui';
import { useAPI } from '@api';
import { useState } from 'react';

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

export function CanvasTokenSettings() {
  const meQ = useAPI<{ ok: true; user: { id: string; email: string; google_sub: string | null; created_at: string } }>(
    ['me'],
    () => fetchJSON(`${API_BASE}/api/auth/me`),
    { retry: false, refetchOnWindowFocus: true }
  );

  const isAuthed = meQ.data?.ok === true;

  const [canvasToken, setCanvasToken] = useState('');
  const [canvasBaseUrl, setCanvasBaseUrl] = useState('');
  const [canvasStatus, setCanvasStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function saveCanvasToken() {
    setBusy(true);
    setCanvasStatus(null);
    try {
      await fetchJSON(`${API_BASE}/api/auth/canvas/token`, {
        method: 'PUT',
        body: JSON.stringify({ token: canvasToken.trim(), base_url: canvasBaseUrl.trim() || undefined }),
      });
      // quick validation call
      try {
        const res = await fetch(`${API_BASE}/api/canvas/courses`, { credentials: 'include' });
        if (res.ok) {
          setCanvasStatus('Connected to Canvas successfully.');
        } else {
          const t = await res.text();
          setCanvasStatus(`Saved token, but Canvas request failed: ${t || res.status}`);
        }
      } catch (e: any) {
        setCanvasStatus(`Saved token, but validation failed: ${String(e?.message || e)}`);
      }
      setCanvasToken(''); // clear field after save
    } catch (e: any) {
      setCanvasStatus(`Save failed: ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  }

  async function clearCanvasToken() {
    setBusy(true);
    setCanvasStatus(null);
    try {
      await fetchJSON(`${API_BASE}/api/auth/canvas/token`, { method: 'DELETE' });
      setCanvasStatus('Canvas token cleared.');
    } catch (e: any) {
      setCanvasStatus(`Clear failed: ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <TalvraStack>
      <TalvraText as="h4" style={{ marginTop: 16 }}>Canvas connection</TalvraText>
      {!isAuthed ? (
        <TalvraStack>
          <TalvraText>You are not logged in.</TalvraText>
          <TalvraButton onClick={googleLogin}>Login with Google</TalvraButton>
        </TalvraStack>
      ) : (
        <TalvraStack>
          <TalvraText>
            Provide your Canvas personal access token. Your institution base URL is fixed. We encrypt your token and never display it again.
          </TalvraText>
          <Input
            type="url"
            placeholder="Canvas base URL (optional, e.g., https://morganstate.instructure.com)"
            value={canvasBaseUrl}
            onChange={(e) => setCanvasBaseUrl(e.target.value)}
            fullWidth
          />
          <Input
            type="password"
            placeholder="Enter Canvas access token"
            value={canvasToken}
            onChange={(e) => setCanvasToken(e.target.value)}
            fullWidth
          />
          <TalvraStack>
            <TalvraButton disabled={busy || canvasToken.trim() === ''} onClick={saveCanvasToken}>
              Save token
            </TalvraButton>
            <TalvraButton disabled={busy} onClick={clearCanvasToken}>
              Clear token
            </TalvraButton>
          </TalvraStack>
          {canvasStatus && <TalvraText>{canvasStatus}</TalvraText>}
        </TalvraStack>
      )}
    </TalvraStack>
  );
}

