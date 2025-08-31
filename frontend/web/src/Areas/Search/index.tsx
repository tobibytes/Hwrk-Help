import { TalvraSurface, TalvraStack, TalvraText, TalvraCard, TalvraLink, TalvraButton } from '@ui';
import { useState } from 'react';

const API_BASE: string = (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:3001';

interface SearchResult { id: string; doc_id: string; score: number; snippet: string }

export default function SearchArea() {
  const [q, setQ] = useState('');
  const [k, setK] = useState(5);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function runSearch() {
    setBusy(true);
    setError(null);
    setResults(null);
    try {
      const url = `${API_BASE}/api/ai/search-all?q=${encodeURIComponent(q)}&k=${encodeURIComponent(String(k))}`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
      const json = (await res.json()) as { ok: true; results: SearchResult[] };
      setResults(json.results);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <TalvraSurface>
      <TalvraStack>
        <TalvraText as="h1">Search</TalvraText>

        <TalvraCard>
          <TalvraStack>
            <label>
              <TalvraText as="span">Query</TalvraText>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Type your question or keywords"
                style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', width: '100%' }}
              />
            </label>
            <label>
              <TalvraText as="span">Top K</TalvraText>
              <input
                type="number"
                min={1}
                max={50}
                value={k}
                onChange={(e) => setK(Math.max(1, Math.min(50, Number(e.target.value) || 5)))}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', width: 100 }}
              />
            </label>
            <TalvraButton disabled={busy || !q.trim()} onClick={runSearch}>
              {busy ? 'Searching…' : 'Search'}
            </TalvraButton>
            {error && <TalvraText style={{ color: '#dc2626' }}>Error: {error}</TalvraText>}
          </TalvraStack>
        </TalvraCard>

        <TalvraCard>
          <TalvraStack>
            <TalvraText as="h3">Results</TalvraText>
            {results === null ? (
              <TalvraText>Enter a query to search your content.</TalvraText>
            ) : results.length === 0 ? (
              <TalvraText>No results found.</TalvraText>
            ) : (
              <TalvraStack>
                {results.map((r) => (
                  <TalvraCard key={r.id}>
                    <TalvraStack>
                      <TalvraText as="h4">{r.doc_id}</TalvraText>
                      <TalvraText style={{ color: '#64748b' }}>Score: {r.score.toFixed(3)}</TalvraText>
                      <pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto', background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                        {r.snippet}
                      </pre>
                      <TalvraLink href={`/documents/${encodeURIComponent(r.doc_id)}`}>Open document</TalvraLink>
                    </TalvraStack>
                  </TalvraCard>
                ))}
              </TalvraStack>
            )}
          </TalvraStack>
        </TalvraCard>
      </TalvraStack>
    </TalvraSurface>
  );
}
