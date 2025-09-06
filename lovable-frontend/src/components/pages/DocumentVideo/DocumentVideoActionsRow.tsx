import React from 'react';
import { Stack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const DocumentVideoActionsRow: React.FC<{ documentId: string }> = ({ documentId }) => (
  <Stack direction="row" gap="sm">
    <Button asChild variant="outline">
      <Link to={`/documents/${documentId}`}>Back to Document</Link>
    </Button>
  </Stack>
);

export default DocumentVideoActionsRow;

