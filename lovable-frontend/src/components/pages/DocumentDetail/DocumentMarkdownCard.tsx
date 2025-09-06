import React from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';

interface Props { markdown: string | null }

const DocumentMarkdownCard: React.FC<Props> = ({ markdown }) => (
  <Surface variant="card" padding="lg">
    <Stack gap="md">
      <h2 className="text-xl font-semibold">Markdown</h2>
      <pre className="text-sm font-mono bg-background-secondary p-3 rounded overflow-auto">
        {markdown ?? 'Loading...'}
      </pre>
    </Stack>
  </Surface>
);

export default DocumentMarkdownCard;

