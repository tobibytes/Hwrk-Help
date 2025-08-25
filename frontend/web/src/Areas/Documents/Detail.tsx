import { useEffect, useMemo, useState } from 'react';
import { TalvraSurface, TalvraStack, TalvraText, TalvraCard, TalvraLink } from '@ui';
import { useParams } from 'react-router-dom';

const API_BASE: string = (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:3001';

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return await res.text();
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return (await res.json()) as T;
}

export default function DocumentDetailArea() {
  const { documentId } = useParams<{ documentId: string }>();
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [structure, setStructure] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resultUrl = useMemo(() => `${API_BASE}/api/ingestion/result/${encodeURIComponent(documentId || '')}`, [documentId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      setMarkdown(null);
      setStructure(null);
      try {
        const res = await fetchJSON<{ ok: true; outputs: { markdown: string; structure: string } }>(resultUrl);
        const [md, st] = await Promise.all([
          fetchText(`${API_BASE}${res.outputs.markdown}`),
          fetchJSON(`${API_BASE}${res.outputs.structure}`),
        ]);
        if (!cancelled) {
          setMarkdown(md);
          setStructure(st);
        }
      } catch (e: any) {
        if (!cancelled) setError(String(e?.message || e));
      }
    }
    if (documentId) load();
    return () => {
      cancelled = true;
    };
  }, [documentId, resultUrl]);

  return (
    <TalvraSurface>
      <TalvraStack>
        <TalvraText as="h1">Document: {documentId}</TalvraText>
        {error && <TalvraText>Error: {error}</TalvraText>}

        <TalvraCard>
          <TalvraStack>
            <TalvraText as="h3">Structure</TalvraText>
            <pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto', background: '#f8fafc', padding: 12, borderRadius: 8 }}>
              {structure ? JSON.stringify(structure, null, 2) : 'Loading...'}
            </pre>
          </TalvraStack>
        </TalvraCard>

        <TalvraCard>
          <TalvraStack>
            <TalvraText as="h3">Markdown</TalvraText>
            <pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto', background: '#f8fafc', padding: 12, borderRadius: 8 }}>
              {markdown ?? 'Loading...'}
            </pre>
          </TalvraStack>
        </TalvraCard>

        <TalvraStack>
          <TalvraLink href="/documents">Back to Documents</TalvraLink>
          <TalvraLink href={`/documents/${documentId}/ai`}>View AI outputs</TalvraLink>
          <TalvraLink href={`/documents/${documentId}/video`}>View Video</TalvraLink>
        </TalvraStack>
      </TalvraStack>
    </TalvraSurface>
  );
}

