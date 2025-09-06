import { useEffect, useState } from 'react';
import { useAPI } from '@/lib/useAPI';
import { API_BASE } from '@/lib/api';

export interface Flashcard { q: string; a: string; hint?: string; source?: string | string[] }

export function useDocumentAIPage(documentId: string | null) {
  const [notes, setNotes] = useState<string | null>(null);
  const [cards, setCards] = useState<Flashcard[] | null>(null);
  const [cardIdx, setCardIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAIAPI = useAPI({ route: { endpoint: '/api/ai/start', method: 'POST' }, enabled: false });
  const resultAPI = useAPI<{ ok: true; outputs: { notes: string; flashcards: string } }>({ route: { endpoint: documentId ? `/api/ai/result/${encodeURIComponent(documentId)}` : '/noop', method: 'GET' }, enabled: !!documentId });
  const notesAPI = useAPI<string>({ route: { endpoint: '', method: 'GET' }, enabled: false, responseType: 'text' });
  const cardsAPI = useAPI<any>({ route: { endpoint: '', method: 'GET' }, enabled: false });

  async function load() {
    setError(null); setNotes(null); setCards(null);
    try {
      if (!resultAPI.data?.ok) return;
      const [notesRes, cardsRes] = await Promise.all([
        notesAPI.run({ endpoint: `${API_BASE}${resultAPI.data.outputs.notes}`, responseType: 'text' }) as any,
        cardsAPI.run({ endpoint: `${API_BASE}${resultAPI.data.outputs.flashcards}` }) as any,
      ]);
      setNotes(notesRes?.data ?? null);
      const cj = cardsRes?.data; const arr: Flashcard[] = Array.isArray(cj) ? cj : (Array.isArray((cj as any)?.flashcards) ? (cj as any).flashcards : []);
      setCards(arr); setCardIdx(0); setShowAnswer(false); setShowHint(false);
    } catch (e: any) { setError(String(e?.message || e)); }
  }

  useEffect(() => { if (documentId) void load(); }, [documentId, resultAPI.data]);

  async function startAI() {
    setBusy(true); setError(null);
    try { await startAIAPI.run({ body: { doc_id: documentId } }); await load(); }
    catch (e: any) { setError(String(e?.message || e)); }
    finally { setBusy(false); }
  }

  return { notes, cards, cardIdx, setCardIdx, showAnswer, setShowAnswer, showHint, setShowHint, busy, error, startAI };
}

