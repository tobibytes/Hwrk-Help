import React from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookOpenIcon } from 'lucide-react';

interface DocRow {
  doc_id: string;
  title: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
}

const CourseDocumentsCard: React.FC<{ docs: DocRow[] | null }> = ({ docs }) => (
  <Surface variant="card" padding="lg">
    <Stack gap="md">
      <h2 className="text-xl font-semibold">Documents</h2>
      {!docs ? (
        <div>Loading…</div>
      ) : docs.length === 0 ? (
        <div>No documents yet.</div>
      ) : (
        <Stack gap="sm">
          {docs.map((d) => (
            <Surface key={d.doc_id} variant="card" padding="md" className="border border-border">
              <Stack gap="xs">
                <div className="flex items-center gap-2">
                  <BookOpenIcon className="h-4 w-4 text-foreground-muted" />
                  <div className="font-medium text-foreground">{d.title ?? d.doc_id}</div>
                </div>
                <div className="text-xs text-foreground-muted">{d.mime_type ?? 'unknown'} • {d.size_bytes ? `${d.size_bytes} bytes` : 'size unknown'} • {new Date(d.created_at).toLocaleString()}</div>
                <Stack direction="row" gap="sm">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/documents/${encodeURIComponent(d.doc_id)}`}>Open</Link>
                  </Button>
                  <Button variant="secondary" size="sm" asChild>
                    <Link to={`/documents/${encodeURIComponent(d.doc_id)}/ai`}>AI</Link>
                  </Button>
                  <Button variant="accent" size="sm" asChild>
                    <Link to={`/documents/${encodeURIComponent(d.doc_id)}/video`}>Video</Link>
                  </Button>
                </Stack>
              </Stack>
            </Surface>
          ))}
        </Stack>
      )}
    </Stack>
  </Surface>
);

export default CourseDocumentsCard;

