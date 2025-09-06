import React from 'react';
import { useParams } from 'react-router-dom';
import DocumentDetailLayout from '@/components/pages/DocumentDetail/DocumentDetailLayout';
import DocumentEmbeddingsCard from '@/components/pages/DocumentDetail/DocumentEmbeddingsCard';
import DocumentSearchCard from '@/components/pages/DocumentDetail/DocumentSearchCard';
import DocumentStructureCard from '@/components/pages/DocumentDetail/DocumentStructureCard';
import DocumentMarkdownCard from '@/components/pages/DocumentDetail/DocumentMarkdownCard';
import DocumentActionsRow from '@/components/pages/DocumentDetail/DocumentActionsRow';
import { useDocumentDetailPage } from '@/hooks/pages/useDocumentDetailPage';

export default function Index() {
  const { documentId } = useParams<{ documentId: string }>();
  const {
    markdown, structure,
    embedBusy, embedMsg,
    query, setQuery,
    k, setK,
    searchBusy, searchErr, results,
    onEmbed, onSearch,
  } = useDocumentDetailPage(documentId || null);

  return (
    <DocumentDetailLayout title={documentId || ''}>
      <DocumentEmbeddingsCard busy={embedBusy} message={embedMsg} onEmbed={onEmbed} />
      <DocumentSearchCard
        query={query}
        k={k}
        busy={searchBusy}
        error={searchErr}
        results={results}
        onChangeQuery={setQuery}
        onChangeK={setK}
        onSearch={onSearch}
      />
      <DocumentStructureCard structure={structure} />
      <DocumentMarkdownCard markdown={markdown} />
      <DocumentActionsRow documentId={documentId || ''} />
    </DocumentDetailLayout>
  );
}

