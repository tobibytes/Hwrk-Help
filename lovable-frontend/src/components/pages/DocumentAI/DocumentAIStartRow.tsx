import React from 'react';
import { Button } from '@/components/ui/button';

const DocumentAIStartRow: React.FC<{ busy: boolean; onStart: () => void }> = ({ busy, onStart }) => (
  <Button disabled={busy} onClick={onStart}>{busy ? 'Starting…' : 'Start AI'}</Button>
);

export default DocumentAIStartRow;

