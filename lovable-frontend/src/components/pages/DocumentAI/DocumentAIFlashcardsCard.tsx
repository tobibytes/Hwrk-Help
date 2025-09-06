import React from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';

export interface Flashcard { q: string; a: string; hint?: string; source?: string | string[] }

interface Props {
  cards: Flashcard[] | null;
  index: number;
  showAnswer: boolean;
  showHint: boolean;
  onToggleHint: () => void;
  onToggleAnswer: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const DocumentAIFlashcardsCard: React.FC<Props> = ({ cards, index, showAnswer, showHint, onToggleHint, onToggleAnswer, onPrev, onNext }) => (
  <Surface variant="card" padding="lg">
    <Stack gap="md">
      <h2 className="text-xl font-semibold">Flashcards</h2>
      {!cards || cards.length === 0 ? (
        <div>No flashcards yet.</div>
      ) : (
        <Stack>
          <div className="text-sm text-foreground-secondary">Card {index + 1} of {cards.length}</div>
          <Surface variant="card" padding="md" className="border border-border">
            <Stack>
              <div className="font-semibold text-foreground">Q: {cards[index].q}</div>
              {cards[index].hint && (
                <div className="text-sm text-foreground-muted">{showHint ? `Hint: ${cards[index].hint}` : 'Hint: •••'}</div>
              )}
              {showAnswer && (
                <div className="text-foreground">A: {cards[index].a}</div>
              )}
              {showAnswer && cards[index].source && (
                <div className="text-sm text-foreground-muted">Source: {Array.isArray(cards[index].source) ? cards[index].source.join(', ') : cards[index].source}</div>
              )}
              <Stack direction="row" gap="sm">
                <Button onClick={onToggleHint}>{showHint ? 'Hide hint' : 'Show hint'}</Button>
                <Button onClick={onToggleAnswer}>{showAnswer ? 'Hide answer' : 'Show answer'}</Button>
              </Stack>
            </Stack>
          </Surface>
          <Stack direction="row" gap="sm">
            <Button onClick={onPrev} variant="secondary">Previous</Button>
            <Button onClick={onNext} variant="secondary">Next</Button>
          </Stack>
        </Stack>
      )}
    </Stack>
  </Surface>
);

export default DocumentAIFlashcardsCard;

