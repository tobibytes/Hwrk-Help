import { useEffect, useMemo, useState } from 'react';
import { TalvraSurface, TalvraStack, TalvraText, TalvraCard, Video, TalvraLink, TalvraButton, SectionHeader, PageContainer } from '@ui';
import { useParams } from 'react-router-dom';

const API_BASE: string = (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:3001';

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { ...(init?.headers as any) };
  if (init?.body && !Object.keys(headers).some((k) => k.toLowerCase() === 'content-type')) {
    headers['content-type'] = 'application/json';
  }
  const res = await fetch(url, { credentials: 'include', ...init, headers });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return (await res.json()) as T;
}

export default function DocumentVideo() {
  const { documentId } = useParams<{ documentId: string }>();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const resultUrl = useMemo(() => `${API_BASE}/api/media/result/${encodeURIComponent(documentId || '')}`, [documentId]);

  async function startMedia() {
    setBusy(true);
    setError(null);
    try {
      await fetchJSON(`${API_BASE}/api/media/start`, {
        method: 'POST',
        body: JSON.stringify({ doc_id: documentId }),
      });
      await load();
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function load() {
    setError(null);
    try {
      const res = await fetchJSON<{ ok: true; outputs: { mp4: string; thumbnail: string } }>(resultUrl);
      setVideoUrl(`${API_BASE}${res.outputs.mp4}`);
      setThumbUrl(`${API_BASE}${res.outputs.thumbnail}`);
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }

  useEffect(() => {
    if (documentId) void load();
  }, [documentId]);

  return (
    <TalvraSurface>
      <PageContainer>
      <TalvraStack>
<SectionHeader title={`Video: ${documentId ?? ''}`} subtitle="Auto-generated video preview." />
        {error && <TalvraText>Error: {error}</TalvraText>}

        <TalvraButton disabled={busy} onClick={startMedia}>
          {busy ? 'Building…' : 'Build Media'}
        </TalvraButton>

        <TalvraCard>
          <TalvraStack>
            {videoUrl ? (
              <Video src={videoUrl} poster={thumbUrl || undefined} />
            ) : (
              <TalvraText>No video yet. Click Build Media.</TalvraText>
            )}
          </TalvraStack>
        </TalvraCard>

        <TalvraStack>
          <TalvraLink href={`/documents/${documentId}`}>Back to Document</TalvraLink>
        </TalvraStack>
      </TalvraStack>
      </PageContainer>
    </TalvraSurface>
  );
}

