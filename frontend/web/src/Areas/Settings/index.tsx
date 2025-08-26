import { TalvraSurface, TalvraStack, TalvraText, TalvraLink, TalvraCard, TalvraButton } from '@ui';
import { FRONT_ROUTES, buildPath } from '@/app/routes';
import { CanvasTokenSettings } from '@/components/CanvasTokenSettings';
import { useState } from 'react';

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

export default function SettingsArea() {
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  async function syncNow() {
    setSyncBusy(true);
    setSyncMsg(null);
    try {
      const res = await postJSON<{ ok: true; results: Array<{ course_id: string; processed: number; skipped: number }> }>(
        `${API_BASE}/api/canvas/sync`,
        {}
      );
      const totalProcessed = res.results.reduce((a, r) => a + (r.processed || 0), 0);
      const totalSkipped = res.results.reduce((a, r) => a + (r.skipped || 0), 0);
      setSyncMsg(`Sync done: processed ${totalProcessed}, skipped ${totalSkipped} across ${res.results.length} courses.`);
    } catch (e: any) {
      setSyncMsg(`Sync failed: ${String(e?.message || e)}`);
    } finally {
      setSyncBusy(false);
    }
  }

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
            <TalvraButton disabled={syncBusy} onClick={syncNow}>
              {syncBusy ? 'Syncing…' : 'Sync now'}
            </TalvraButton>
            {syncMsg && <TalvraText>{syncMsg}</TalvraText>}
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

