import { useEffect, useMemo, useState } from 'react';
import { TalvraSurface, TalvraStack, TalvraText, TalvraCard, TalvraButton, TalvraLink } from '@ui';
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

export default function DocumentAI() {
  const { documentId } = useParams<{ documentId: string }>();
  const [notes, setNotes] = useState<string | null>(null);
  const [cards, setCards] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const resultUrl = useMemo(() => `${API_BASE}/api/ai/result/${encodeURIComponent(documentId || '')}`, [documentId]);

  async function startAI() {
    setBusy(true);
    setError(null);
    try {
      await fetchJSON(`${API_BASE}/api/ai/start`, {
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
    setNotes(null);
    setCards(null);
    try {
      const res = await fetchJSON<{ ok: true; outputs: { notes: string; flashcards: string } }>(resultUrl);
      const [notesText, cardsJson] = await Promise.all([
        fetch(`${API_BASE}${res.outputs.notes}`, { credentials: 'include' }).then((r) => r.text()),
        fetch(`${API_BASE}${res.outputs.flashcards}`, { credentials: 'include' }).then((r) => r.json()),
      ]);
      setNotes(notesText);
      setCards(cardsJson);
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }

  useEffect(() => {
    if (documentId) void load();
  }, [documentId]);

  return (
    <TalvraSurface>
      <TalvraStack>
        <TalvraText as="h1">AI Outputs for {documentId}</TalvraText>
        {error && <TalvraText>Error: {error}</TalvraText>}

        <TalvraButton disabled={busy} onClick={startAI}>
          {busy ? 'Starting…' : 'Start AI'}
        </TalvraButton>

        <TalvraCard>
          <TalvraStack>
            <TalvraText as="h3">Notes</TalvraText>
            <pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto', background: '#f8fafc', padding: 12, borderRadius: 8 }}>
              {notes ?? 'No notes yet.'}
            </pre>
          </TalvraStack>
        </TalvraCard>

        <TalvraCard>
          <TalvraStack>
            <TalvraText as="h3">Flashcards</TalvraText>
            <pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto', background: '#f8fafc', padding: 12, borderRadius: 8 }}>
              {cards ? JSON.stringify(cards, null, 2) : 'No flashcards yet.'}
            </pre>
          </TalvraStack>
        </TalvraCard>

        <TalvraLink href={`/documents/${documentId}`}>Back to Document</TalvraLink>
      </TalvraStack>
    </TalvraSurface>
  );
}

