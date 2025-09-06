import React from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';

interface JobStatus {
  status: string;
  processed: number;
  skipped: number;
  errors: number;
  error_message?: string | null;
}

const CourseSyncCard: React.FC<{ busy: boolean; job: JobStatus | null; message: string | null; onSync: () => void }> = ({ busy, job, message, onSync }) => (
  <Surface variant="card" padding="lg">
    <Stack gap="md">
      <div className="flex items-center gap-3">
        <Button disabled={busy || (job && (job.status === 'pending' || job.status === 'running'))} onClick={onSync}>
          {busy ? 'Starting…' : (job && (job.status === 'pending' || job.status === 'running')) ? 'Sync in progress…' : 'Sync now'}
        </Button>
        {message && <span className="text-sm text-foreground-secondary">{message}</span>}
      </div>
      {job && (
        <div className="p-3 rounded-md bg-background-secondary">
          <div className="text-foreground">Sync status: {job.status}{job.status === 'failed' && job.error_message ? ` — ${job.error_message}` : ''}</div>
          <div className="text-sm text-foreground-muted">processed {job.processed} • skipped {job.skipped} • errors {job.errors}</div>
        </div>
      )}
    </Stack>
  </Surface>
);

export default CourseSyncCard;

