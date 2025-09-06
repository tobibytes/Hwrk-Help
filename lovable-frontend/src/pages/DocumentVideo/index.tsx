import React from 'react';
import { useParams } from 'react-router-dom';
import DocumentVideoLayout from '@/components/pages/DocumentVideo/DocumentVideoLayout';
import DocumentVideoStartRow from '@/components/pages/DocumentVideo/DocumentVideoStartRow';
import DocumentVideoPlayerCard from '@/components/pages/DocumentVideo/DocumentVideoPlayerCard';
import DocumentVideoActionsRow from '@/components/pages/DocumentVideo/DocumentVideoActionsRow';
import { useDocumentVideoPage } from '@/hooks/pages/useDocumentVideoPage';

export default function Index() {
  const { documentId } = useParams<{ documentId: string }>();
  const { videoUrl, thumbUrl, busy, startMedia } = useDocumentVideoPage(documentId || null);

  return (
    <DocumentVideoLayout title={documentId || ''}>
      <DocumentVideoStartRow busy={busy} onStart={startMedia} />
      <DocumentVideoPlayerCard videoUrl={videoUrl} thumbUrl={thumbUrl} />
      <DocumentVideoActionsRow documentId={documentId || ''} />
    </DocumentVideoLayout>
  );
}

