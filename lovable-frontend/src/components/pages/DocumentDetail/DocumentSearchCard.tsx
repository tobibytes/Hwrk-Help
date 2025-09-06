import React from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface DocSearchResult { id: string; score: number; snippet: string }

interface Props {
  query: string;
  k: number;
  busy: boolean;
  error: string | null;
  results: DocSearchResult[] | null;
  onChangeQuery: (v: string) => void;
  onChangeK: (v: number) => void;
  onSearch: () => void;
}

const DocumentSearchCard: React.FC<Props> = ({ query, k, busy, error, results, onChangeQuery, onChangeK, onSearch }) => (
  <Surface variant="card" padding="lg">
    <Stack gap="md">
      <h2 className="text-xl font-semibold">Semantic search (within this document)</h2>
      <Stack className="gap-2">
        <Input type="text" placeholder="Enter search keywords…" value={query} onChange={(e) => onChangeQuery(e.target.value)} />
        <Input type="number" min={1} max={20} value={k} onChange={(e) => onChangeK(Math.max(1, Math.min(Number(e.target.value) || 5, 20)))} title="Top-K" />
        <Button disabled={busy || !query.trim()} onClick={onSearch}>{busy ? 'Searching…' : 'Search'}</Button>
      </Stack>
      {error && <div className="text-foreground">Error: {error}</div>}
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
);

export default DocumentSearchCard;

