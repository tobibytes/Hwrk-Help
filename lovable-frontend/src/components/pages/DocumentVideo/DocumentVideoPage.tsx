import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';
import { API_BASE } from '@/lib/api';
import { useAPI } from '@/lib/useAPI';
import { Box } from '@/components/ui/box';

export default function DocumentVideoPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const resultUrl = useMemo(() => `${API_BASE}/api/media/result/${encodeURIComponent(documentId || '')}`, [documentId]);

  const mediaStartAPI = useAPI({ route: { endpoint: '/api/media/start', method: 'POST' }, enabled: false });
  async function startMedia() {
    setBusy(true);
    setError(null);
    try {
      await mediaStartAPI.run({ body: { doc_id: documentId } });
      await load();
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  const mediaResultAPI = useAPI<{ ok: true; outputs: { mp4: string; thumbnail: string } }>({ route: { endpoint: `/api/media/result/${encodeURIComponent(documentId || '')}`, method: 'GET' }, enabled: !!documentId });
  async function load() {
    setError(null);
    try {
      if (!mediaResultAPI.data?.ok) return;
      setVideoUrl(`${API_BASE}${mediaResultAPI.data.outputs.mp4}`);
      setThumbUrl(`${API_BASE}${mediaResultAPI.data.outputs.thumbnail}`);
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }

  useEffect(() => {
    if (documentId) void load();
  }, [documentId]);

  return (
    <Box className="container mx-auto px-4 py-8 space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-foreground">Video: {documentId}</h1>

      <Button disabled={busy} onClick={startMedia}>
        {busy ? 'Building…' : 'Build Media'}
      </Button>

      <Surface variant="card" padding="lg">
        <Stack>
          {videoUrl ? (
            <video controls src={videoUrl} poster={thumbUrl || undefined} className="w-full rounded" />
          ) : (
            <div>No video yet. Click Build Media.</div>
          )}
        </Stack>
      </Surface>

      <Button asChild variant="outline">
        <Link to={`/documents/${documentId}`}>Back to Document</Link>
      </Button>
    </Box>
  );
}

