import React, { useEffect, useState } from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { API_BASE, fetchJSON } from '@/lib/api';
import { Box } from '@/components/ui/box';
import { Input } from '@/components/ui/input';
import { Chip } from '@/components/ui/chip';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  FileTextIcon,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  SparklesIcon,
  PlayIcon,
  ClockIcon,
  BookOpenIcon
} from 'lucide-react';

const DocumentsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [docs, setDocs] = useState<Array<{ doc_id: string; title: string | null; course_canvas_id: string | null; mime_type: string | null; size_bytes: number | null; created_at: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      try {
        const res = await fetchJSON<{ ok: true; documents: Array<{ doc_id: string; title: string | null; course_canvas_id: string | null; mime_type: string | null; size_bytes: number | null; created_at: string }> }>(
          `${API_BASE}/api/canvas/documents?limit=100`
        );
        if (!cancelled) setDocs(res.documents || []);
      } catch (e: any) {
        if (!cancelled) setError(String(e?.message || e));
      }
    })();
    return () => { cancelled = true };
  }, []);

  const filteredDocuments = docs.filter(doc => {
    const title = (doc.title || doc.doc_id).toLowerCase();
    const matchesSearch = title.includes(searchQuery.toLowerCase());
    return matchesSearch; // tabs currently cosmetic; backend doesn't provide status
  });

  const getStatusIcon = () => {
    return <FileTextIcon className="h-4 w-4" />;
  };

  return (
    <Box className="container mx-auto px-4 py-8 space-y-6 max-w-6xl">
      {/* Header */}
      <Stack className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documents</h1>
          <p className="text-foreground-secondary">
            Browse and manage your course materials
          </p>
        </div>
        <Button variant="outline">
          <FilterIcon className="h-4 w-4" />
          Advanced Filters
        </Button>
      </Stack>

      {/* Search and Tabs */}
      <Surface variant="card" padding="md">
        <Stack gap="md">
          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Documents</TabsTrigger>
              <TabsTrigger value="processed">AI Processed</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
            </TabsList>
          </Tabs>
        </Stack>
      </Surface>

      {/* Documents List */}
      {filteredDocuments.length > 0 ? (
        <Box className="space-y-4">
          {filteredDocuments.map((doc) => (
            <Surface
              key={doc.doc_id}
              variant="card"
              padding="lg"
              className="hover:shadow-md transition-all duration-smooth"
            >
              <Stack direction="row" justify="between" align="center" gap="md">
                {/* Document Info */}
                <div className="flex-1 min-w-0">
                  <Stack gap="sm">
                    <div className="flex items-center gap-3">
                      {getStatusIcon()}
                      <h3 className="font-medium text-foreground truncate">
                        {doc.title || doc.doc_id}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                      {doc.course_canvas_id && (
                        <Chip variant="default" size="sm">
                          <BookOpenIcon className="h-3 w-3" />
                          {doc.course_canvas_id}
                        </Chip>
                      )}
                      {doc.mime_type && (
                        <Chip variant="default" size="sm">
                          {doc.mime_type}
                        </Chip>
                      )}
                      <span className="text-xs text-foreground-muted flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {new Date(doc.created_at).toLocaleString()}
                      </span>
                      {typeof doc.size_bytes === 'number' && (
                        <span className="text-xs text-foreground-muted">
                          {doc.size_bytes} bytes
                        </span>
                      )}
                    </div>
                  </Stack>
                </div>

                {/* Actions */}
                <Stack direction="row" gap="sm" className="flex-shrink-0">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/documents/${encodeURIComponent(doc.doc_id)}`}>
                      <DownloadIcon className="h-4 w-4" />
                      Open
                    </Link>
                  </Button>
                  
                  <Button variant="secondary" size="sm" asChild>
                    <Link to={`/documents/${encodeURIComponent(doc.doc_id)}/ai`}>
                      <SparklesIcon className="h-4 w-4" />
                      AI Summary
                    </Link>
                  </Button>
                  
                  <Button variant="accent" size="sm" asChild>
                    <Link to={`/documents/${encodeURIComponent(doc.doc_id)}/video`}>
                      <PlayIcon className="h-4 w-4" />
                      Video
                    </Link>
                  </Button>
                </Stack>
              </Stack>
            </Surface>
          ))}
        </Box>
      ) : (
        <Surface variant="card" padding="xl" className="text-center">
          <Stack gap="lg" align="center">
            <div className="p-4 rounded-full bg-background-secondary">
              <FileTextIcon className="h-8 w-8 text-foreground-muted" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">
                {searchQuery ? 'No documents found' : 'No documents yet'}
              </h3>
              {searchQuery ? (
                <p className="text-foreground-secondary">
                  Try adjusting your search terms or filters
                </p>
              ) : (
                <p className="text-foreground-secondary">
                  Sync your courses to import documents and materials
                </p>
              )}
            </div>
            {!searchQuery && (
              <Button variant="hero" size="lg">
                Sync Courses
              </Button>
            )}
          </Stack>
        </Surface>
      )}
    </Box>
  );
};

export default DocumentsPage;

