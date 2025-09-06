import React from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';

interface Props {
  busy: boolean;
  message: string | null;
  onEmbed: () => void;
}

const DocumentEmbeddingsCard: React.FC<Props> = ({ busy, message, onEmbed }) => (
  <Surface variant="card" padding="lg">
    <Stack gap="md">
      <h2 className="text-xl font-semibold">Embeddings</h2>
      <Stack>
        <Button disabled={busy} onClick={onEmbed}>{busy ? 'Embedding…' : 'Compute embeddings'}</Button>
        {message && <div className="text-sm text-foreground-secondary">{message}</div>}
      </Stack>
    </Stack>
  </Surface>
);

export default DocumentEmbeddingsCard;

