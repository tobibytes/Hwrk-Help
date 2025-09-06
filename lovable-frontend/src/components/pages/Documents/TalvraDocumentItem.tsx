import React from 'react';
import { TalvraCard } from '@/components/talvra/TalvraCard';
import { TalvraStack } from '@/components/talvra/TalvraStack';
import { TalvraChip } from '@/components/talvra/TalvraChip';
import { TalvraButton } from '@/components/talvra/TalvraButton';
import { BookOpenIcon, FileTextIcon, ClockIcon, DownloadIcon, SparklesIcon, PlayIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface DocumentItem {
  doc_id: string;
  title: string | null;
  course_canvas_id: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
}

export function TalvraDocumentItem({ doc }: { doc: DocumentItem }) {
  return (
    <TalvraCard className="hover:shadow-md transition-all duration-smooth">
      <TalvraStack direction={"row" as any} className="justify-between items-center gap-4">
        <div className="flex-1 min-w-0">
          <TalvraStack className="gap-2">
            <div className="flex items-center gap-3">
              <FileTextIcon className="h-4 w-4" />
              <h3 className="font-medium text-foreground truncate">{doc.title || doc.doc_id}</h3>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {doc.course_canvas_id && (
                <TalvraChip variant="default" size="sm">
                  <BookOpenIcon className="h-3 w-3" />
                  {doc.course_canvas_id}
                </TalvraChip>
              )}
              {doc.mime_type && <TalvraChip variant="default" size="sm">{doc.mime_type}</TalvraChip>}
              <span className="text-xs text-foreground-muted flex items-center gap-1">
                <ClockIcon className="h-3 w-3" /> {new Date(doc.created_at).toLocaleString()}
              </span>
              {typeof doc.size_bytes === 'number' && (
                <span className="text-xs text-foreground-muted">{doc.size_bytes} bytes</span>
              )}
            </div>
          </TalvraStack>
        </div>
        <TalvraStack direction={"row" as any} className="gap-2 flex-shrink-0">
          <TalvraButton variant="outline" size="sm" asChild>
            <Link to={`/documents/${encodeURIComponent(doc.doc_id)}`}>
              <DownloadIcon className="h-4 w-4" />
              Open
            </Link>
          </TalvraButton>
          <TalvraButton variant="secondary" size="sm" asChild>
            <Link to={`/documents/${encodeURIComponent(doc.doc_id)}/ai`}>
              <SparklesIcon className="h-4 w-4" />
              AI Summary
            </Link>
          </TalvraButton>
          <TalvraButton variant="accent" size="sm" asChild>
            <Link to={`/documents/${encodeURIComponent(doc.doc_id)}/video`}>
              <PlayIcon className="h-4 w-4" />
              Video
            </Link>
          </TalvraButton>
        </TalvraStack>
      </TalvraStack>
    </TalvraCard>
  );
}

