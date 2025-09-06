import React from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Input } from '@/components/ui/input';
import { Chip } from '@/components/ui/chip';
import { Button } from '@/components/ui/button';
import { Box } from '@/components/ui/box';
import { CheckCircleIcon, AlertTriangleIcon, KeyIcon } from 'lucide-react';

interface Props {
  isTokenValid: boolean;
  canvasToken: string;
  onChangeToken: (v: string) => void;
  onConnect: () => void;
}

const CanvasIntegrationCard: React.FC<Props> = ({ isTokenValid, canvasToken, onChangeToken, onConnect }) => (
  <Surface variant="card" padding="lg">
    <Stack gap="lg">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Canvas API Configuration</h3>
        <p className="text-foreground-secondary">Connect your Canvas account to import courses and materials</p>
      </div>
      <Stack className="flex items-center gap-3 p-4 rounded-lg bg-background-secondary">
        {isTokenValid ? (
          <>
            <CheckCircleIcon className="h-5 w-5 text-success" />
            <div>
              <p className="font-medium text-foreground">Connected</p>
              <p className="text-sm text-foreground-secondary">Canvas API token is valid and active</p>
            </div>
            <Chip variant="success" size="sm">Connected</Chip>
          </>
        ) : (
          <>
            <AlertTriangleIcon className="h-5 w-5 text-warning" />
            <div>
              <p className="font-medium text-foreground">Not Connected</p>
              <p className="text-sm text-foreground-secondary">Enter your Canvas API token to get started</p>
            </div>
            <Chip variant="warning" size="sm">Disconnected</Chip>
          </>
        )}
      </Stack>
      <Stack gap="md">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Canvas API Token</label>
          <Input type="password" placeholder="Enter your Canvas API token..." value={canvasToken} onChange={(e) => onChangeToken(e.target.value)} />
          <p className="text-xs text-foreground-muted mt-1">You can generate an API token in your Canvas Account Settings</p>
        </div>
        <Button variant="default" onClick={onConnect} disabled={!canvasToken.trim()}>
          <KeyIcon className="h-4 w-4" />
          {isTokenValid ? 'Update Token' : 'Connect Canvas'}
        </Button>
      </Stack>
      <Box className="p-4 rounded-lg bg-primary-light">
        <h4 className="font-medium text-primary mb-2">How to get your Canvas API token:</h4>
        <ol className="text-sm text-primary space-y-1 list-decimal list-inside">
          <li>Log into your Canvas account</li>
          <li>Go to Account → Settings</li>
          <li>Scroll down to "Approved Integrations"</li>
          <li>Click "+ New Access Token"</li>
          <li>Enter "Talvra" as the purpose</li>
          <li>Copy the generated token and paste it above</li>
        </ol>
      </Box>
    </Stack>
  </Surface>
);

export default CanvasIntegrationCard;

