import { useEffect, useState } from 'react';
import { FRONT_ROUTES, buildPath } from '@/app/routes';
import { TalvraStack, TalvraText, TalvraLink, TalvraButton, GlassPanel, SectionHeader, Grid, Text as UiText } from '@ui';
import { AuthPanel } from '@/components/AuthPanel';

const API_BASE: string = (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:3001';

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return (await res.json()) as T;
}

interface DocRow { doc_id: string; title: string | null; created_at: string; mime_type: string | null; size_bytes: number | null }

export default function AdminArea() {
  const [docs, setDocs] = useState<DocRow[] | null>(null);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchJSON<{ ok: true; documents: DocRow[] }>(`${API_BASE}/api/canvas/documents?limit=6`);
        if (!cancelled) setDocs(data.documents);
      } catch {}
    })();
    return () => { cancelled = true };
  }, []);

  async function syncAllNow() {
    setSyncMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/canvas/sync/start`, { method: 'POST', credentials: 'include' });
      if (res.ok) {
        const j = await res.json().catch(() => ({}));
        setSyncMsg(j.existing ? 'A sync is already running…' : 'Sync started…');
      } else {
        setSyncMsg(`Sync failed: ${res.status}`);
      }
    } catch (e: any) {
      setSyncMsg(`Sync failed: ${String(e?.message || e)}`);
    }
  }

  return (
    <TalvraStack>
<GlassPanel>
        <TalvraStack>
          <SectionHeader title="Welcome back" subtitle="Quick actions to get you going." />
          <TalvraStack style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <TalvraButton onClick={syncAllNow}>Sync Canvas</TalvraButton>
<TalvraButton as="a" href={buildPath(FRONT_ROUTES.COURSES)} variant="secondary">Browse Courses</TalvraButton>
            <TalvraButton as="a" href={buildPath(FRONT_ROUTES.DOCUMENTS)} variant="secondary">View Documents</TalvraButton>
            <TalvraButton as="a" href={buildPath(FRONT_ROUTES.SETTINGS)} variant="secondary">Settings</TalvraButton>
          </TalvraStack>
          {syncMsg && <TalvraText>{syncMsg}</TalvraText>}
        </TalvraStack>
      </GlassPanel>

      <GlassPanel>
        <TalvraStack>
<TalvraText as="h2">Recent documents</TalvraText>
          {!docs ? (
            <TalvraText>Loading…</TalvraText>
          ) : docs.length === 0 ? (
            <TalvraText>No documents yet. Try Sync Canvas.</TalvraText>
          ) : (
            <Grid>
              {docs.map((d) => (
                <GlassPanel key={d.doc_id} style={{ padding: 16 }}>
                  <TalvraText as="h4" style={{ marginBottom: 4 }}>
                    {d.title ?? d.doc_id}
                  </TalvraText>
                  <UiText color="gray-500">
                    {d.mime_type ?? 'unknown'} • {new Date(d.created_at).toLocaleString()}
                  </UiText>
                  <TalvraStack style={{ marginTop: 8, flexDirection: 'row', gap: 8 }}>
                    <TalvraLink href={`/documents/${encodeURIComponent(d.doc_id)}`}>Open</TalvraLink>
                    <TalvraLink href={`/documents/${encodeURIComponent(d.doc_id)}/ai`}>AI</TalvraLink>
                  </TalvraStack>
                </GlassPanel>
              ))}
            </Grid>
          )}
        </TalvraStack>
      </GlassPanel>

      <GlassPanel>
        <TalvraStack>
          <TalvraText as="h2">Account</TalvraText>
          <AuthPanel />
        </TalvraStack>
      </GlassPanel>
    </TalvraStack>
  );
}
