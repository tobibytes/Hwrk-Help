import React from 'react';
import { Button } from '@/components/ui/button';

const DocumentVideoStartRow: React.FC<{ busy: boolean; onStart: () => void }> = ({ busy, onStart }) => (
  <Button disabled={busy} onClick={onStart}>{busy ? 'Building…' : 'Build Media'}</Button>
);

export default DocumentVideoStartRow;

