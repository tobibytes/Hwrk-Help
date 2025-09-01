import React, { useState } from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';
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

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Mock data
  const documents = [
    {
      id: '1',
      title: 'Introduction to Algorithms - Chapter 5: Dynamic Programming',
      course: 'CS 2420',
      courseColor: 'primary',
      type: 'PDF',
      size: '2.4 MB',
      lastModified: '2 hours ago',
      hasAI: true,
      hasVideo: false,
      status: 'processed'
    },
    {
      id: '2',
      title: 'Calculus II - Integration Techniques and Applications',
      course: 'MATH 1210',
      courseColor: 'secondary',
      type: 'Notes',
      size: '856 KB',
      lastModified: '1 day ago',
      hasAI: true,
      hasVideo: true,
      status: 'processed'
    },
    {
      id: '3',
      title: 'Modern Physics - Quantum Mechanics Fundamentals',
      course: 'PHYS 3710',
      courseColor: 'accent',
      type: 'Slides',
      size: '5.2 MB',
      lastModified: '2 days ago',
      hasAI: false,
      hasVideo: false,
      status: 'processing'
    },
    {
      id: '4',
      title: 'Software Engineering - Design Patterns Workshop',
      course: 'CS 3500',
      courseColor: 'primary',
      type: 'PDF',
      size: '1.8 MB',
      lastModified: '3 days ago',
      hasAI: true,
      hasVideo: true,
      status: 'processed'
    },
    {
      id: '5',
      title: 'Linear Algebra - Matrix Operations and Eigenvalues',
      course: 'MATH 2270',
      courseColor: 'secondary',
      type: 'Notes',
      size: '1.2 MB',
      lastModified: '1 week ago',
      hasAI: true,
      hasVideo: false,
      status: 'processed'
    },
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'processed' && doc.hasAI) ||
      (activeTab === 'processing' && doc.status === 'processing');
    return matchesSearch && matchesTab;
  });

  const getStatusIcon = (status: string) => {
    if (status === 'processing') {
      return <div className="animate-spin w-4 h-4 border-2 border-accent border-t-transparent rounded-full" />;
    }
    return <FileTextIcon className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
      </div>

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
        <div className="space-y-4">
          {filteredDocuments.map((doc) => (
            <Surface
              key={doc.id}
              variant="card"
              padding="lg"
              className="hover:shadow-md transition-all duration-smooth"
            >
              <Stack direction="row" justify="between" align="center" gap="md">
                {/* Document Info */}
                <div className="flex-1 min-w-0">
                  <Stack gap="sm">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(doc.status)}
                      <h3 className="font-medium text-foreground truncate">
                        {doc.title}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                      <Chip variant={doc.courseColor as any} size="sm">
                        <BookOpenIcon className="h-3 w-3" />
                        {doc.course}
                      </Chip>
                      <Chip variant="default" size="sm">
                        {doc.type}
                      </Chip>
                      <span className="text-xs text-foreground-muted flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {doc.lastModified}
                      </span>
                      <span className="text-xs text-foreground-muted">
                        {doc.size}
                      </span>
                    </div>
                  </Stack>
                </div>

                {/* Actions */}
                <Stack direction="row" gap="sm" className="flex-shrink-0">
                  <Button variant="outline" size="sm">
                    <DownloadIcon className="h-4 w-4" />
                    Open
                  </Button>
                  
                  {doc.hasAI ? (
                    <Button variant="secondary" size="sm">
                      <SparklesIcon className="h-4 w-4" />
                      AI Summary
                    </Button>
                  ) : doc.status === 'processing' ? (
                    <Button variant="ghost" size="sm" disabled>
                      Processing...
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm">
                      <SparklesIcon className="h-4 w-4" />
                      Generate AI
                    </Button>
                  )}
                  
                  {doc.hasVideo ? (
                    <Button variant="accent" size="sm">
                      <PlayIcon className="h-4 w-4" />
                      Video
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      <PlayIcon className="h-4 w-4" />
                      Video
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Surface>
          ))}
        </div>
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
    </div>
  );
};

export default Documents;