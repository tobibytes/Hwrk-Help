import { TalvraStack, TalvraText, TalvraButton, Input, useToast, Label } from '@ui';
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
  const toast = useToast();

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
          toast({ title: 'Canvas connected', description: 'Your token was saved and validated.', variant: 'success' });
        } else {
          const t = await res.text();
          const msg = `Saved token, but Canvas request failed: ${t || res.status}`;
          setCanvasStatus(msg);
          toast({ title: 'Canvas validation failed', description: msg, variant: 'warning' });
        }
      } catch (e: any) {
        const msg = `Saved token, but validation failed: ${String(e?.message || e)}`;
        setCanvasStatus(msg);
        toast({ title: 'Validation error', description: msg, variant: 'error' });
      }
      setCanvasToken(''); // clear field after save
    } catch (e: any) {
      const msg = `Save failed: ${String(e?.message || e)}`;
      setCanvasStatus(msg);
      toast({ title: 'Save failed', description: msg, variant: 'error' });
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
      toast({ title: 'Token cleared', description: 'Your Canvas token has been removed.', variant: 'info' });
    } catch (e: any) {
      const msg = `Clear failed: ${String(e?.message || e)}`;
      setCanvasStatus(msg);
      toast({ title: 'Clear failed', description: msg, variant: 'error' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <TalvraStack>
<TalvraText as="h4">Canvas connection</TalvraText>
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
<Label>
<span className="label-text">Canvas base URL (optional)</span>
            <Input
type="url"
placeholder="e.g., https://morganstate.instructure.com"
              value={canvasBaseUrl}
              onChange={(e) => setCanvasBaseUrl(e.target.value)}
              fullWidth
            />
          </Label>
<Label>
<span className="label-text">Canvas access token</span>
            <Input
type="password"
placeholder="Enter Canvas access token"
              value={canvasToken}
              onChange={(e) => setCanvasToken(e.target.value)}
              fullWidth
            />
          </Label>
          <TalvraStack>
            <TalvraButton disabled={busy || canvasToken.trim() === ''} onClick={saveCanvasToken}>
              Save token
            </TalvraButton>
<TalvraButton disabled={busy} onClick={clearCanvasToken} variant="secondary">
              Clear token
            </TalvraButton>
          </TalvraStack>
          {canvasStatus && <TalvraText>{canvasStatus}</TalvraText>}
        </TalvraStack>
      )}
    </TalvraStack>
  );
}

