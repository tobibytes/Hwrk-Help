import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';
import { API_BASE } from '@/lib/api';
import { useAPI } from '@/lib/useAPI';
import { Box } from '@/components/ui/box';

interface Flashcard { q: string; a: string; hint?: string; source?: string | string[] }

export default function DocumentAIPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const [notes, setNotes] = useState<string | null>(null);
  const [cards, setCards] = useState<Flashcard[] | null>(null);
  const [cardIdx, setCardIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const resultUrl = useMemo(() => `${API_BASE}/api/ai/result/${encodeURIComponent(documentId || '')}`, [documentId]);

  const startAIAPI = useAPI({ route: { endpoint: '/api/ai/start', method: 'POST' }, enabled: false });
  async function startAI() {
    setBusy(true);
    setError(null);
    try {
      await startAIAPI.run({ body: { doc_id: documentId } });
      await load();
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  const resultAPI = useAPI<{ ok: true; outputs: { notes: string; flashcards: string } }>({ route: { endpoint: `/api/ai/result/${encodeURIComponent(documentId || '')}`, method: 'GET' }, enabled: !!documentId });
  const notesAPI = useAPI<string>({ route: { endpoint: '', method: 'GET' }, enabled: false, responseType: 'text' });
  const cardsAPI = useAPI<any>({ route: { endpoint: '', method: 'GET' }, enabled: false });
  async function load() {
    setError(null);
    setNotes(null);
    setCards(null);
    try {
      if (!resultAPI.data?.ok) return;
      const [notesRes, cardsRes] = await Promise.all([
        notesAPI.run({ endpoint: `${API_BASE}${resultAPI.data.outputs.notes}`, responseType: 'text' }) as any,
        cardsAPI.run({ endpoint: `${API_BASE}${resultAPI.data.outputs.flashcards}` }) as any,
      ]);
      setNotes(notesRes?.data ?? null);
      const cj = cardsRes?.data;
      const arr: Flashcard[] = Array.isArray(cj) ? cj : (Array.isArray((cj as any)?.flashcards) ? (cj as any).flashcards : []);
      setCards(arr);
      setCardIdx(0);
      setShowAnswer(false);
      setShowHint(false);
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }

  useEffect(() => {
    if (documentId) void load();
  }, [documentId]);

  return (
    <Box className="container mx-auto px-4 py-8 space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-foreground">AI Outputs: {documentId}</h1>

      <Button disabled={busy} onClick={startAI}>
        {busy ? 'Starting…' : 'Start AI'}
      </Button>

      <Surface variant="card" padding="lg">
        <Stack gap="md">
          <h2 className="text-xl font-semibold">Notes</h2>
          <pre className="text-sm font-mono bg-background-secondary p-3 rounded overflow-auto">
            {notes ?? 'No notes yet.'}
          </pre>
        </Stack>
      </Surface>

      <Surface variant="card" padding="lg">
        <Stack gap="md">
          <h2 className="text-xl font-semibold">Flashcards</h2>
          {!cards || cards.length === 0 ? (
            <div>No flashcards yet.</div>
          ) : (
            <Stack>
              <div className="text-sm text-foreground-secondary">Card {cardIdx + 1} of {cards.length}</div>
              <Surface variant="card" padding="md" className="border border-border">
                <Stack>
                  <div className="font-semibold text-foreground">Q: {cards[cardIdx].q}</div>
                  {cards[cardIdx].hint && (
                    <div className="text-sm text-foreground-muted">
                      {showHint ? `Hint: ${cards[cardIdx].hint}` : 'Hint: •••'}
                    </div>
                  )}
                  {showAnswer && (
                    <div className="text-foreground">A: {cards[cardIdx].a}</div>
                  )}
                  {showAnswer && cards[cardIdx].source && (
                    <div className="text-sm text-foreground-muted">
                      Source: {Array.isArray(cards[cardIdx].source) ? cards[cardIdx].source.join(', ') : cards[cardIdx].source}
                    </div>
                  )}
                  <Stack direction="row" gap="sm">
                    <Button onClick={() => setShowHint((v) => !v)}>
                      {showHint ? 'Hide hint' : 'Show hint'}
                    </Button>
                    <Button onClick={() => setShowAnswer((v) => !v)}>
                      {showAnswer ? 'Hide answer' : 'Show answer'}
                    </Button>
                  </Stack>
                </Stack>
              </Surface>
              <Stack direction="row" gap="sm">
                <Button
                  onClick={() => {
                    setCardIdx((i) => (i - 1 + cards.length) % cards.length);
                    setShowAnswer(false);
                    setShowHint(false);
                  }}
                  variant="secondary"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => {
                    setCardIdx((i) => (i + 1) % cards.length);
                    setShowAnswer(false);
                    setShowHint(false);
                  }}
                  variant="secondary"
                >
                  Next
                </Button>
              </Stack>
            </Stack>
          )}
        </Stack>
      </Surface>

      <Button asChild variant="outline">
        <Link to={`/documents/${documentId}`}>Back to Document</Link>
      </Button>
    </Box>
  );
}

