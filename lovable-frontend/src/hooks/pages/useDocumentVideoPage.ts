import { useEffect, useState } from 'react';
import { useAPI } from '@/lib/useAPI';
import { API_BASE } from '@/lib/api';

export function useDocumentVideoPage(documentId: string | null) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaStartAPI = useAPI({ route: { endpoint: '/api/media/start', method: 'POST' }, enabled: false });
  const mediaResultAPI = useAPI<{ ok: true; outputs: { mp4: string; thumbnail: string } }>({ route: { endpoint: documentId ? `/api/media/result/${encodeURIComponent(documentId)}` : '/noop', method: 'GET' }, enabled: !!documentId });

  async function load() {
    setError(null);
    try {
      if (!mediaResultAPI.data?.ok) return;
      setVideoUrl(`${API_BASE}${mediaResultAPI.data.outputs.mp4}`);
      setThumbUrl(`${API_BASE}${mediaResultAPI.data.outputs.thumbnail}`);
    } catch (e: any) { setError(String(e?.message || e)); }
  }

  useEffect(() => { if (documentId) void load(); }, [documentId, mediaResultAPI.data]);

  async function startMedia() {
    setBusy(true); setError(null);
    try { await mediaStartAPI.run({ body: { doc_id: documentId } }); await load(); }
    catch (e: any) { setError(String(e?.message || e)); }
    finally { setBusy(false); }
  }

  return { videoUrl, thumbUrl, busy, error, startMedia };
}

