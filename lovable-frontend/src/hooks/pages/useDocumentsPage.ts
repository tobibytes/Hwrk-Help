import { useMemo, useState } from 'react';
import { useAPI } from '@/lib/useAPI';

export interface DocRow { doc_id: string; title: string | null; course_canvas_id: string | null; mime_type: string | null; size_bytes: number | null; created_at: string }

export function useDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const docsQ = useAPI<{ ok: true; documents: DocRow[] }>({ route: { endpoint: '/api/canvas/documents', method: 'GET' }, query: { limit: '100' } });
  const docs = docsQ.data?.ok ? (docsQ.data.documents || []) : [];

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return docs.filter(d => (d.title || d.doc_id).toLowerCase().includes(q));
  }, [docs, searchQuery]);

  return { searchQuery, setSearchQuery, activeTab, setActiveTab, docs, filtered };
}

