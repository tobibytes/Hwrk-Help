import { useCallback, useEffect, useState } from 'react';
import { useAPI } from '@/lib/useAPI';
import { API_BASE } from '@/lib/api';

export interface DocSearchResult { id: string; score: number; snippet: string }

export function useDocumentDetailPage(documentId: string | null) {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [structure, setStructure] = useState<any | null>(null);
  const [embedBusy, setEmbedBusy] = useState(false);
  const [embedMsg, setEmbedMsg] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [k, setK] = useState(5);
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchErr, setSearchErr] = useState<string | null>(null);
  const [results, setResults] = useState<DocSearchResult[] | null>(null);

  const resultAPI = useAPI<{ ok: true; outputs: { markdown: string; structure: string } }>({
    route: { endpoint: documentId ? `/api/ingestion/result/${encodeURIComponent(documentId)}` : '/noop', method: 'GET' },
    enabled: !!documentId,
  });
  const mdAPI = useAPI<string>({ route: { endpoint: '', method: 'GET' }, enabled: false, responseType: 'text' });
  const structAPI = useAPI<any>({ route: { endpoint: '', method: 'GET' }, enabled: false });

  const loadOutputs = useCallback(async () => {
    if (!resultAPI.data?.ok) return;
    const mdEp = `${API_BASE}${resultAPI.data.outputs.markdown}`;
    const stEp = `${API_BASE}${resultAPI.data.outputs.structure}`;
    const [mdRes, stRes] = await Promise.all([
      mdAPI.run({ endpoint: mdEp, responseType: 'text' }) as any,
      structAPI.run({ endpoint: stEp }) as any,
    ]);
    setMarkdown((mdRes?.data as string) ?? '');
    setStructure(stRes?.data ?? null);
  }, [resultAPI.data]);

  useEffect(() => { if (documentId && resultAPI.data?.ok) { void loadOutputs(); } }, [documentId, resultAPI.data, loadOutputs]);

  const embedAPI = useAPI<{ ok: true; doc_id: string; count?: number; skipped?: string }>({ route: { endpoint: '/api/ai/embed', method: 'POST' }, enabled: false });
  async function onEmbed() {
    if (!documentId) return;
    setEmbedBusy(true); setEmbedMsg(null);
    try {
      const res = (await embedAPI.run({ body: { doc_id: documentId } })) as any;
      const data = res?.data || {};
      if (data.skipped === 'exists') setEmbedMsg('Embeddings already exist.');
      else setEmbedMsg(`Computed embeddings for ${data.count ?? 0} chunk(s).`);
    } catch (e: any) { setEmbedMsg(`Embed failed: ${String(e?.message || e)}`); }
    finally { setEmbedBusy(false); }
  }

  const docSearchAPI = useAPI<{ ok: true; q: string; results: DocSearchResult[] }>({ route: { endpoint: '/api/ai/search', method: 'GET' }, enabled: false });
  async function onSearch() {
    if (!documentId || !query.trim()) return;
    setSearchBusy(true); setSearchErr(null); setResults(null);
    try { const res = (await docSearchAPI.run({ query: { doc_id: documentId, q: query.trim(), k: String(k) } })) as any; setResults(res?.data?.results || []); }
    catch (e: any) { setSearchErr(String(e?.message || e)); }
    finally { setSearchBusy(false); }
  }

  return { markdown, structure, embedBusy, embedMsg, query, setQuery, k, setK, searchBusy, searchErr, results, onEmbed, onSearch };
}

