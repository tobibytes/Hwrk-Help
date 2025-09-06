import React from 'react';
import { useParams } from 'react-router-dom';
import DocumentAILayout from '@/components/pages/DocumentAI/DocumentAILayout';
import DocumentAIStartRow from '@/components/pages/DocumentAI/DocumentAIStartRow';
import DocumentAINotesCard from '@/components/pages/DocumentAI/DocumentAINotesCard';
import DocumentAIFlashcardsCard from '@/components/pages/DocumentAI/DocumentAIFlashcardsCard';
import { useDocumentAIPage } from '@/hooks/pages/useDocumentAIPage';

export default function Index() {
  const { documentId } = useParams<{ documentId: string }>();
  const {
    notes, cards, cardIdx, setCardIdx,
    showAnswer, setShowAnswer,
    showHint, setShowHint,
    busy, startAI,
  } = useDocumentAIPage(documentId || null);

  return (
    <DocumentAILayout title={documentId || ''}>
      <DocumentAIStartRow busy={busy} onStart={startAI} />
      <DocumentAINotesCard notes={notes} />
      <DocumentAIFlashcardsCard
        cards={cards}
        index={cardIdx}
        showAnswer={showAnswer}
        showHint={showHint}
        onToggleHint={() => setShowHint(v => !v)}
        onToggleAnswer={() => setShowAnswer(v => !v)}
        onPrev={() => { if (!cards?.length) return; setCardIdx((i) => (i - 1 + (cards?.length || 1)) % (cards?.length || 1)); setShowAnswer(false); setShowHint(false); }}
        onNext={() => { if (!cards?.length) return; setCardIdx((i) => (i + 1) % (cards?.length || 1)); setShowAnswer(false); setShowHint(false); }}
      />
    </DocumentAILayout>
  );
}

