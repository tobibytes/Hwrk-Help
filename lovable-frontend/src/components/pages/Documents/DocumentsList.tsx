import React from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { TalvraDocumentItem, DocumentItem } from '@/components/pages/Documents/TalvraDocumentItem';

interface Props { documents: DocumentItem[] }

const DocumentsList: React.FC<Props> = ({ documents }) => (
  <div className="space-y-4">
    {documents.map((doc) => (
      <Surface key={doc.doc_id} variant="card" padding="lg" className="hover:shadow-md transition-all duration-smooth">
        <Stack>
          <TalvraDocumentItem doc={doc} />
        </Stack>
      </Surface>
    ))}
  </div>
);

export default DocumentsList;

