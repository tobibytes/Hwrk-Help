import { TalvraSurface, TalvraStack, TalvraText, TalvraLink, TalvraCard, TalvraButton } from '@ui';
import { FRONT_ROUTES, buildPath } from '@/app/routes';
import { CanvasTokenSettings } from '@/components/CanvasTokenSettings';
import { useEffect, useState } from 'react';

const API_BASE: string = (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:3001';

async function postJSON<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return (await res.json()) as T;
}

// Kickoff helper without JSON body/content-type
async function postKickoff<T>(url: string): Promise<T> {
  const res = await fetch(url, { method: 'POST', credentials: 'include' });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return (await res.json()) as T;
}

export default function SettingsArea() {
  const [syncBusy, setSyncBusy] = useState(false); // kickoff busy
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  // Global job state for full sync
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<null | {
    status: 'pending' | 'running' | 'completed' | 'failed' | string;
    processed: number;
    skipped: number;
    errors: number;
    created_at?: string | null;
    started_at?: string | null;
    finished_at?: string | null;
    error_message?: string | null;
  }>(null);

  async function syncNow() {
    setSyncBusy(true);
    setSyncMsg(null);
    try {
      // Kick off global async sync
      const res = await postKickoff<{ ok: true; job_id: string; existing?: boolean }>(
        `${API_BASE}/api/canvas/sync/start`
      );
      const jid = res.job_id;
      setJobId(jid);
      try { localStorage.setItem('canvasSyncJob:GLOBAL', JSON.stringify({ job_id: jid, ts: Date.now() })); } catch {}
      setSyncMsg(res.existing ? 'Global sync already running…' : 'Global sync started…');
    } catch (e: any) {
      setSyncMsg(`Sync kickoff failed: ${String(e?.message || e)}`);
    } finally {
      setSyncBusy(false);
    }
  }

  // Restore active job on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('canvasSyncJob:GLOBAL');
      if (raw) {
        const parsed = JSON.parse(raw) as { job_id: string };
        if (parsed?.job_id) setJobId(parsed.job_id);
      }
    } catch {}
  }, []);

  // Poll status when jobId is present
  useEffect(() => {
    if (!jobId) return;
    let stopped = false;
    const interval = setInterval(async () => {
      try {
        const s = await fetch(`${API_BASE}/api/canvas/sync/status/${encodeURIComponent(jobId)}`, { credentials: 'include' });
        if (!s.ok) throw new Error('status not ok');
        const data = await s.json();
        if (stopped) return;
        const j = data.job || {};
        setJob({
          status: j.status,
          processed: Number(j.processed || 0),
          skipped: Number(j.skipped || 0),
          errors: Number(j.errors || 0),
          created_at: j.created_at ?? null,
          started_at: j.started_at ?? null,
          finished_at: j.finished_at ?? null,
          error_message: j.error_message ?? null,
        });
        if (j.status === 'completed' || j.status === 'failed') {
          clearInterval(interval);
          try { localStorage.removeItem('canvasSyncJob:GLOBAL'); } catch {}
        }
      } catch (_) {
        clearInterval(interval);
        try { localStorage.removeItem('canvasSyncJob:GLOBAL'); } catch {}
      }
    }, 1500);
    return () => { stopped = true; clearInterval(interval); };
  }, [jobId]);

  return (
    <TalvraSurface>
      <TalvraStack>
        <TalvraText as="h1">Settings</TalvraText>

        <TalvraCard>
          <TalvraStack>
            <CanvasTokenSettings />
          </TalvraStack>
        </TalvraCard>

        <TalvraCard>
          <TalvraStack>
            <TalvraText as="h3">Canvas sync</TalvraText>
            <TalvraButton disabled={syncBusy || (job && (job.status === 'pending' || job.status === 'running'))} onClick={syncNow}>
              {syncBusy ? 'Starting…' : (job && (job.status === 'pending' || job.status === 'running')) ? 'Sync in progress…' : 'Sync now'}
            </TalvraButton>
            {syncMsg && <TalvraText>{syncMsg}</TalvraText>}
            {job && (
              <TalvraCard>
                <TalvraStack>
                  <TalvraText>
                    Global sync status: {job.status}
                    {job.status === 'failed' && job.error_message ? ` — ${job.error_message}` : ''}
                  </TalvraText>
                  <TalvraText style={{ color: '#64748b' }}>
                    processed {job.processed} • skipped {job.skipped} • errors {job.errors}
                  </TalvraText>
                </TalvraStack>
              </TalvraCard>
            )}
          </TalvraStack>
        </TalvraCard>

        <TalvraStack>
          <TalvraText as="h2">Navigation</TalvraText>
          <TalvraStack>
            <TalvraLink href={buildPath(FRONT_ROUTES.ADMIN)}>
              {FRONT_ROUTES.ADMIN.name}
            </TalvraLink>
            <TalvraLink href={buildPath(FRONT_ROUTES.COURSES)}>
              {FRONT_ROUTES.COURSES.name}
            </TalvraLink>
            <TalvraLink href={buildPath(FRONT_ROUTES.SETTINGS)}>
              {FRONT_ROUTES.SETTINGS.name}
            </TalvraLink>
          </TalvraStack>
        </TalvraStack>
      </TalvraStack>
    </TalvraSurface>
  );
}

