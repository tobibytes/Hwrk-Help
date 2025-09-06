import React from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';

interface Props { structure: any | null }

const DocumentStructureCard: React.FC<Props> = ({ structure }) => (
  <Surface variant="card" padding="lg">
    <Stack gap="md">
      <h2 className="text-xl font-semibold">Structure</h2>
      <pre className="text-sm font-mono bg-background-secondary p-3 rounded overflow-auto">
        {structure ? JSON.stringify(structure, null, 2) : 'Loading...'}
      </pre>
    </Stack>
  </Surface>
);

export default DocumentStructureCard;

