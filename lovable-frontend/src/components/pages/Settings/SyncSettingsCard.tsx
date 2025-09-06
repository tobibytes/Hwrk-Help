import React from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Box } from '@/components/ui/box';
import { Chip } from '@/components/ui/chip';
import { Button } from '@/components/ui/button';
import { RefreshCwIcon } from 'lucide-react';

interface JobStatus {
  status: string;
  processed: number;
  skipped: number;
  errors: number;
  created_at?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  error_message?: string | null;
}

interface Props {
  isSyncing: boolean;
  syncMsg: string | null;
  job: JobStatus | null;
  isTokenValid: boolean;
  onStartGlobalSync: () => void;
}

const SyncSettingsCard: React.FC<Props> = ({ isSyncing, syncMsg, job, isTokenValid, onStartGlobalSync }) => (
  <Surface variant="card" padding="lg">
    <Stack gap="lg">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Global Sync Settings</h3>
        <p className="text-foreground-secondary">Manage synchronization of all your Canvas courses and materials</p>
      </div>

      <Box className="p-4 rounded-lg bg-background-secondary">
        <Stack className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-foreground">Sync Status</h4>
            <p className="text-sm text-foreground-secondary">{isSyncing ? 'Synchronizing…' : (syncMsg || 'Idle')}</p>
          </div>
          {isSyncing ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
              <Chip variant="primary" size="sm">Syncing</Chip>
            </div>
          ) : (
            <Chip variant="success" size="sm">Ready</Chip>
          )}
        </Stack>
      </Box>

      <Stack gap="md">
        <Button variant="hero" size="lg" onClick={onStartGlobalSync} disabled={isSyncing || !isTokenValid} className="w-full">
          {isSyncing ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
              Syncing All Courses...
            </>
          ) : (
            <>
              <RefreshCwIcon className="h-5 w-5" />
              Start Global Sync
            </>
          )}
        </Button>
        {!isTokenValid && (
          <p className="text-center text-sm text-foreground-muted">Connect your Canvas account first to enable sync</p>
        )}
      </Stack>
    </Stack>
  </Surface>
);

export default SyncSettingsCard;

