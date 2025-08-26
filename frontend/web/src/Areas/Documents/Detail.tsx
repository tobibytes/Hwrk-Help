import { useEffect, useMemo, useState } from 'react';
import { TalvraSurface, TalvraStack, TalvraText, TalvraCard, TalvraLink, TalvraButton } from '@ui';
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

async function postJSON<T>(url: string, body?: any): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return (await res.json()) as T;
}

interface SearchResult {
  id: string;
  doc_id: string;
  score: number;
  snippet: string;
}

export default function DocumentDetailArea() {
  const { documentId } = useParams<{ documentId: string }>();
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [structure, setStructure] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Embed/search UI state
  const [embedBusy, setEmbedBusy] = useState(false);
  const [embedMsg, setEmbedMsg] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [k, setK] = useState(5);
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchErr, setSearchErr] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[] | null>(null);

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

  async function onEmbed() {
    if (!documentId) return;
    setEmbedBusy(true);
    setEmbedMsg(null);
    try {
      const res = await postJSON<{ ok: true; doc_id: string; count?: number; skipped?: string }>(
        `${API_BASE}/api/ai/embed`,
        { doc_id: documentId }
      );
      if ((res as any).skipped === 'exists') {
        setEmbedMsg('Embeddings already exist.');
      } else {
        setEmbedMsg(`Computed embeddings for ${res.count ?? 0} chunk(s).`);
      }
    } catch (e: any) {
      setEmbedMsg(`Embed failed: ${String(e?.message || e)}`);
    } finally {
      setEmbedBusy(false);
    }
  }

  async function onSearch() {
    if (!documentId || !query.trim()) return;
    setSearchBusy(true);
    setSearchErr(null);
    setResults(null);
    try {
      const url = `${API_BASE}/api/ai/search?doc_id=${encodeURIComponent(documentId)}&q=${encodeURIComponent(query.trim())}&k=${encodeURIComponent(String(k))}`;
      const res = await fetchJSON<{ ok: true; q: string; results: SearchResult[] }>(url);
      setResults(res.results || []);
    } catch (e: any) {
      setSearchErr(String(e?.message || e));
    } finally {
      setSearchBusy(false);
    }
  }

  return (
    <TalvraSurface>
      <TalvraStack>
        <TalvraText as="h1">Document: {documentId}</TalvraText>
        {error && <TalvraText>Error: {error}</TalvraText>}

        <TalvraCard>
          <TalvraStack>
            <TalvraText as="h3">Embeddings</TalvraText>
            <TalvraStack>
              <TalvraButton disabled={embedBusy} onClick={onEmbed}>
                {embedBusy ? 'Embedding…' : 'Compute embeddings'}
              </TalvraButton>
              {embedMsg && <TalvraText>{embedMsg}</TalvraText>}
            </TalvraStack>
          </TalvraStack>
        </TalvraCard>

        <TalvraCard>
          <TalvraStack>
            <TalvraText as="h3">Semantic search (within this document)</TalvraText>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Enter search keywords…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6, minWidth: 260 }}
              />
              <input
                type="number"
                min={1}
                max={20}
                value={k}
                onChange={(e) => setK(Math.max(1, Math.min(Number(e.target.value) || 5, 20)))}
                style={{ width: 80, padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
                title="Top-K"
              />
              <TalvraButton disabled={searchBusy || !query.trim()} onClick={onSearch}>
                {searchBusy ? 'Searching…' : 'Search'}
              </TalvraButton>
            </div>
            {searchErr && <TalvraText>Error: {searchErr}</TalvraText>}
            {results && (
              <TalvraStack>
                {results.length === 0 ? (
                  <TalvraText>No matches.</TalvraText>
                ) : (
                  results.map((r) => (
                    <TalvraCard key={r.id}>
                      <TalvraStack>
                        <TalvraText style={{ color: '#64748b' }}>score {(r.score * 100).toFixed(1)}%</TalvraText>
                        <TalvraText>{r.snippet}</TalvraText>
                      </TalvraStack>
                    </TalvraCard>
                  ))
                )}
              </TalvraStack>
            )}
          </TalvraStack>
        </TalvraCard>

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

