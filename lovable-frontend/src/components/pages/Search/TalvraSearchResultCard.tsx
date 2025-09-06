import React from 'react';
import { TalvraCard } from '@/components/talvra/TalvraCard';
import { TalvraStack } from '@/components/talvra/TalvraStack';
import { TalvraButton } from '@/components/talvra/TalvraButton';
import { FileTextIcon, SparklesIcon, PlayIcon, ArrowRightIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface SearchResultItem {
  id: string;
  title: string;
  score: number;
  snippet: string;
  docId: string;
}

export function TalvraSearchResultCard({ result }: { result: SearchResultItem }) {
  return (
    <TalvraCard className="hover:shadow-md transition-all duration-smooth">
      <TalvraStack className="gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <TalvraStack className="gap-1">
              <h3 className="font-semibold text-foreground hover:text-primary cursor-pointer transition-colors">
                {result.title}
              </h3>
              <div className="flex items-center gap-1 text-sm text-foreground-secondary">
                <span>Relevance:</span>
                <span className="font-medium text-accent">{Math.round(result.score * 100)}%</span>
              </div>
            </TalvraStack>
          </div>
          <FileTextIcon className="h-5 w-5 text-foreground-muted flex-shrink-0" />
        </div>
        <p className="text-foreground-secondary leading-relaxed">{result.snippet}</p>
        <TalvraStack direction={"row" as any} className="gap-2 pt-2">
          <TalvraButton variant="default" size="sm" asChild>
            <Link to={`/documents/${encodeURIComponent(result.docId)}`}>
              <ArrowRightIcon className="h-4 w-4" />
              Open Document
            </Link>
          </TalvraButton>
          <TalvraButton variant="secondary" size="sm" asChild>
            <Link to={`/documents/${encodeURIComponent(result.docId)}/ai`}>
              <SparklesIcon className="h-4 w-4" />
              AI Summary
            </Link>
          </TalvraButton>
          <TalvraButton variant="accent" size="sm" asChild>
            <Link to={`/documents/${encodeURIComponent(result.docId)}/video`}>
              <PlayIcon className="h-4 w-4" />
              Video
            </Link>
          </TalvraButton>
        </TalvraStack>
      </TalvraStack>
    </TalvraCard>
  );
}

