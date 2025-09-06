import React from 'react';
import { Stack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Props { documentId: string }

const DocumentActionsRow: React.FC<Props> = ({ documentId }) => (
  <Stack direction="row" gap="sm">
    <Button variant="outline" asChild>
      <Link to="/documents">Back to Documents</Link>
    </Button>
    <Button variant="secondary" asChild>
      <Link to={`/documents/${documentId}/ai`}>View AI outputs</Link>
    </Button>
    <Button variant="accent" asChild>
      <Link to={`/documents/${documentId}/video`}>View Video</Link>
    </Button>
  </Stack>
);

export default DocumentActionsRow;

