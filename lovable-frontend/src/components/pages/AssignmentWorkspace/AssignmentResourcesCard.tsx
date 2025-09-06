import React from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export interface ResourceRow { id: string; score: number; snippet: string; docId: string }

const AssignmentResourcesCard: React.FC<{ busy: boolean; resources: ResourceRow[]; onBuild: () => void }> = ({ busy, resources, onBuild }) => (
  <Surface variant="card" padding="lg">
    <Stack gap="md">
      <h2 className="text-xl font-semibold">Resources</h2>
      <Button onClick={onBuild} disabled={busy}>{busy ? 'Building…' : 'Build Study Pack'}</Button>
      <Stack>
        {resources.length === 0 ? (
          <div>No resources yet.</div>
        ) : (
          resources.map(r => (
            <Surface key={r.id} variant="card" padding="md" className="border border-border">
              <Stack gap="xs">
                <div className="text-sm text-foreground-muted">Relevance: {Math.round(r.score * 100)}%</div>
                <div className="text-foreground-secondary">{r.snippet}</div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/documents/${encodeURIComponent(r.docId)}`}>Open Document</Link>
                  </Button>
                  <Button variant="secondary" size="sm" asChild>
                    <Link to={`/documents/${encodeURIComponent(r.docId)}/ai`}>AI Summary</Link>
                  </Button>
                </div>
              </Stack>
            </Surface>
          ))
        )}
      </Stack>
    </Stack>
  </Surface>
);

export default AssignmentResourcesCard;
