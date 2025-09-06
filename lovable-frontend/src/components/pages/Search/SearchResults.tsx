import React from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileTextIcon, ArrowRightIcon, SparklesIcon, PlayIcon } from 'lucide-react';

export interface SearchResultRow {
  id: string;
  title: string;
  score: number;
  snippet: string;
  docId: string;
}

interface Props { results: SearchResultRow[] }

const SearchResults: React.FC<Props> = ({ results }) => {
  return (
    <div className="space-y-4">
      <Stack className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Search Results</h2>
        <span className="text-sm text-foreground-secondary">{results.length} results found</span>
      </Stack>

      {results.map((r) => (
        <Surface key={r.id} variant="card" padding="lg" className="hover:shadow-md transition-all duration-smooth">
          <Stack gap="md">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Stack gap="xs">
                  <h3 className="font-semibold text-foreground hover:text-primary cursor-pointer transition-colors">{r.title}</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm text-foreground-secondary">
                      <span>Relevance:</span>
                      <span className="font-medium text-accent">{Math.round(r.score * 100)}%</span>
                    </div>
                  </div>
                </Stack>
              </div>
              <FileTextIcon className="h-5 w-5 text-foreground-muted flex-shrink-0" />
            </div>

            <p className="text-foreground-secondary leading-relaxed">{r.snippet}</p>

            <Stack direction="row" gap="sm" className="pt-2">
              <Button variant="default" size="sm" asChild>
                <Link to={`/documents/${encodeURIComponent(r.docId)}`}>
                  <ArrowRightIcon className="h-4 w-4" />
                  Open Document
                </Link>
              </Button>
              <Button variant="secondary" size="sm" asChild>
                <Link to={`/documents/${encodeURIComponent(r.docId)}/ai`}>
                  <SparklesIcon className="h-4 w-4" />
                  AI Summary
                </Link>
              </Button>
              <Button variant="accent" size="sm" asChild>
                <Link to={`/documents/${encodeURIComponent(r.docId)}/video`}>
                  <PlayIcon className="h-4 w-4" />
                  Video
                </Link>
              </Button>
            </Stack>
          </Stack>
        </Surface>
      ))}
    </div>
  );
};

export default SearchResults;

