import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_BASE } from '@/lib/api';
import { useAPI } from '@/lib/useAPI';
import { Box } from '@/components/ui/box';

interface SearchResult {
  id: string;
  doc_id: string;
  score: number;
  snippet: string;
}

export default function DocumentDetailPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [structure, setStructure] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [embedBusy, setEmbedBusy] = useState(false);
  const [embedMsg, setEmbedMsg] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [k, setK] = useState(5);
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchErr, setSearchErr] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[] | null>(null);

  const resultAPI = useAPI<{ ok: true; outputs: { markdown: string; structure: string } }>({
    route: { endpoint: `/api/ingestion/result/${encodeURIComponent(documentId || '')}`, method: 'GET' },
    enabled: !!documentId,
  });
  const mdAPI = useAPI<string>({ route: { endpoint: '', method: 'GET' }, enabled: false, responseType: 'text' });
  const structAPI = useAPI<any>({ route: { endpoint: '', method: 'GET' }, enabled: false });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      setMarkdown(null);
      setStructure(null);
      try {
        if (!resultAPI.data?.ok) return;
        const mdEp = `${API_BASE}${resultAPI.data.outputs.markdown}`;
        const stEp = `${API_BASE}${resultAPI.data.outputs.structure}`;
        const [mdRes, stRes] = await Promise.all([
          mdAPI.run({ endpoint: mdEp, responseType: 'text' }) as any,
          structAPI.run({ endpoint: stEp }) as any,
        ]);
        if (!cancelled) {
          setMarkdown((mdRes?.data as string) ?? '');
          setStructure(stRes?.data ?? null);
        }
      } catch (e: any) {
        if (!cancelled) setError(String(e?.message || e));
      }
    }
    if (documentId && resultAPI.data?.ok) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId, resultAPI.data]);

  const embedAPI = useAPI<{ ok: true; doc_id: string; count?: number; skipped?: string }>({ route: { endpoint: '/api/ai/embed', method: 'POST' }, enabled: false });
  async function onEmbed() {
    if (!documentId) return;
    setEmbedBusy(true);
    setEmbedMsg(null);
    try {
      const res = (await embedAPI.run({ body: { doc_id: documentId } })) as any;
      const data = res?.data || {};
      if (data.skipped === 'exists') {
        setEmbedMsg('Embeddings already exist.');
      } else {
        setEmbedMsg(`Computed embeddings for ${data.count ?? 0} chunk(s).`);
      }
    } catch (e: any) {
      setEmbedMsg(`Embed failed: ${String(e?.message || e)}`);
    } finally {
      setEmbedBusy(false);
    }
  }

  const docSearchAPI = useAPI<{ ok: true; q: string; results: SearchResult[] }>({ route: { endpoint: '/api/ai/search', method: 'GET' }, enabled: false });
  async function onSearch() {
    if (!documentId || !query.trim()) return;
    setSearchBusy(true);
    setSearchErr(null);
    setResults(null);
    try {
      const res = (await docSearchAPI.run({ query: { doc_id: documentId, q: query.trim(), k: String(k) } })) as any;
      setResults(res?.data?.results || []);
    } catch (e: any) {
      setSearchErr(String(e?.message || e));
    } finally {
      setSearchBusy(false);
    }
  }

  return (
    <Box className="container mx-auto px-4 py-8 space-y-6 max-w-6xl">
      <h1 className="text-3xl font-bold text-foreground">Document: {documentId}</h1>

      <Surface variant="card" padding="lg">
        <Stack gap="md">
          <h2 className="text-xl font-semibold">Embeddings</h2>
          <Stack>
            <Button disabled={embedBusy} onClick={onEmbed}>
              {embedBusy ? 'Embedding…' : 'Compute embeddings'}
            </Button>
            {embedMsg && <div className="text-sm text-foreground-secondary">{embedMsg}</div>}
          </Stack>
        </Stack>
      </Surface>

      <Surface variant="card" padding="lg">
        <Stack gap="md">
          <h2 className="text-xl font-semibold">Semantic search (within this document)</h2>
          <Stack className="gap-2">
            <Input
              type="text"
              placeholder="Enter search keywords…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Input
              type="number"
              min={1}
              max={20}
              value={k}
              onChange={(e) => setK(Math.max(1, Math.min(Number(e.target.value) || 5, 20)))}
              title="Top-K"
            />
            <Button disabled={searchBusy || !query.trim()} onClick={onSearch}>
              {searchBusy ? 'Searching…' : 'Search'}
            </Button>
          </Stack>
          {searchErr && <div className="text-foreground">Error: {searchErr}</div>}
          {results && (
            <Stack>
              {results.length === 0 ? (
                <div>No matches.</div>
              ) : (
                results.map((r) => (
                  <Surface key={r.id} variant="card" padding="md" className="border border-border">
                    <Stack>
                      <div className="text-sm text-foreground-muted">score {(r.score * 100).toFixed(1)}%</div>
                      <div className="text-foreground">{r.snippet}</div>
                    </Stack>
                  </Surface>
                ))
              )}
            </Stack>
          )}
        </Stack>
      </Surface>

      <Surface variant="card" padding="lg">
        <Stack gap="md">
          <h2 className="text-xl font-semibold">Structure</h2>
          <pre className="text-sm font-mono bg-background-secondary p-3 rounded overflow-auto">
            {structure ? JSON.stringify(structure, null, 2) : 'Loading...'}
          </pre>
        </Stack>
      </Surface>

      <Surface variant="card" padding="lg">
        <Stack gap="md">
          <h2 className="text-xl font-semibold">Markdown</h2>
          <pre className="text-sm font-mono bg-background-secondary p-3 rounded overflow-auto">
            {markdown ?? 'Loading...'}
          </pre>
        </Stack>
      </Surface>

      <Stack direction="row" gap="sm">
        <Button variant="outline" asChild>
          <Link to="/documents">Back to Documents</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link to={`/documents/${documentId}/ai`}>View AI outputs</Link>
        </Button>
        <Button variant="accent" asChild>
          <Link to={`/documents/${documentId}/video`}>View Video</Link>
        </Button>
      </Stack>
    </Box>
  );
}

