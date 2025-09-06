import React, { useEffect, useMemo, useState } from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';
import { API_BASE, fetchJSON } from '@/lib/api';
import { Link } from 'react-router-dom';
import { useAPI } from '@/lib/useAPI';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Box } from '@/components/ui/box';
import { Chip } from '@/components/ui/chip';
import { 
  SearchIcon,
  FilterIcon,
  SparklesIcon,
  PlayIcon,
  BookOpenIcon,
  FileTextIcon,
  ArrowRightIcon,
  XIcon
} from 'lucide-react';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [k, setK] = useState('10');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [courses, setCourses] = useState<Array<{ id: string; name: string }>>([]);
  const [assignments, setAssignments] = useState<Array<{ id: string; name: string; courseId?: string }>>([]);
  const [modules, setModules] = useState<Array<{ id: string; name: string }>>([]);
  const [results, setResults] = useState<Array<{ id: string; title: string; course?: string; courseColor?: string; score: number; snippet: string; docId: string }>>([]);

  const coursesQ = useAPI<{ ok: true; courses: Array<{ id: string; name: string }> }>({
    route: { endpoint: '/api/canvas/courses', method: 'GET' },
  });
  useEffect(() => {
    if (coursesQ.data?.ok) setCourses(coursesQ.data.courses || []);
  }, [coursesQ.data]);

  const assignmentsQ = useAPI<{ ok: true; assignments: Array<{ id: string; name: string }> }>({
    route: { endpoint: '/api/canvas/assignments', method: 'GET' },
    query: selectedCourse ? { course_id: selectedCourse } : undefined,
    enabled: !!selectedCourse,
  });
  const modulesQ = useAPI<{ ok: true; modules: Array<{ id: string; name: string }> }>({
    route: { endpoint: '/api/canvas/modules', method: 'GET' },
    query: selectedCourse ? { course_id: selectedCourse } : undefined,
    enabled: !!selectedCourse,
  });
  useEffect(() => {
    if (!selectedCourse) {
      setAssignments([]);
      setSelectedAssignment('');
      setModules([]);
      setSelectedModule('');
      return;
    }
    if (assignmentsQ.data?.ok) setAssignments(assignmentsQ.data.assignments || []);
    if (modulesQ.data?.ok) setModules(modulesQ.data.modules || []);
  }, [selectedCourse, assignmentsQ.data, modulesQ.data]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const url = `${API_BASE}/api/ai/search-all?q=${encodeURIComponent(query)}&k=${encodeURIComponent(k)}`
        + `${selectedCourse ? `&course_id=${encodeURIComponent(selectedCourse)}` : ''}`
        + `${selectedAssignment ? `&assignment_id=${encodeURIComponent(selectedAssignment)}` : ''}`
        + `${selectedModule ? `&module_id=${encodeURIComponent(selectedModule)}` : ''}`;
      const j = await fetchJSON<{ ok: true; results: Array<{ id: string; score: number; snippet: string; doc_id: string }> }>(url);
      const normalized = (j.results || []).map((r, idx) => ({
        id: r.id || String(idx + 1),
        title: r.doc_id,
        score: r.score,
        snippet: r.snippet,
        docId: r.doc_id,
      }));
      setResults(normalized);
      setHasSearched(true);
    } catch {
      setResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  const clearFilters = () => {
    setSelectedCourse('');
    setSelectedAssignment('');
    setSelectedModule('');
  };

  const activeFilters = [
    selectedCourse && courses.find(c => c.id === selectedCourse),
    selectedAssignment && assignments.find(a => a.id === selectedAssignment),
    selectedModule && modules.find(m => m.id === selectedModule)
  ].filter(Boolean);

  return (
    <Box className="container mx-auto px-4 py-8 space-y-6 max-w-4xl">
      {/* Header */}
      <Box className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Semantic Search
        </h1>
        <p className="text-foreground-secondary">
          Search across all your course materials using AI-powered understanding
        </p>
      </Box>

      {/* Search Form */}
      <Surface variant="card" padding="lg">
        <Stack gap="md">
          {/* Main Search */}
          <Box className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground-muted" />
            <Input
              placeholder="Ask about your course materials..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 text-base h-12"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </Box>

          {/* Filters Row */}
          <Stack className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground-secondary">Results:</span>
              <Input
                type="number"
                value={k}
                onChange={(e) => setK(e.target.value)}
                className="w-16 h-8"
                min="1"
                max="50"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground-secondary">Course:</span>
              <div className="min-w-[200px]">
                <Select value={selectedCourse || '__all_courses__'} onValueChange={(v) => setSelectedCourse(v === '__all_courses__' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all_courses__">All Courses</SelectItem>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground-secondary">Assignment:</span>
              <div className="min-w-[200px]">
                <Select value={selectedAssignment || '__all_assignments__'} onValueChange={(v) => setSelectedAssignment(v === '__all_assignments__' ? '' : v)}>
                  <SelectTrigger disabled={!selectedCourse}>
                    <SelectValue placeholder="All Assignments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all_assignments__">All Assignments</SelectItem>
                    {assignments.map(assignment => (
                      <SelectItem key={assignment.id} value={assignment.id}>{assignment.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground-secondary">Module:</span>
              <div className="min-w-[200px]">
                <Select value={selectedModule || '__all_modules__'} onValueChange={(v) => setSelectedModule(v === '__all_modules__' ? '' : v)}>
                  <SelectTrigger disabled={!selectedCourse}>
                    <SelectValue placeholder="All Modules" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all_modules__">All Modules</SelectItem>
                    {modules.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeFilters.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <XIcon className="h-4 w-4" />
                Clear
              </Button>
            )}
          </Stack>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <Stack className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-foreground-muted">Active filters:</span>
              {activeFilters.map((filter: any) => (
                <Chip
                  key={filter.id}
                  variant="primary"
                  size="sm"
                  removable
                  onRemove={() => {
                    if (courses.find(c => c.id === filter.id)) {
                      setSelectedCourse('');
                      setSelectedAssignment('');
                    } else {
                      setSelectedAssignment('');
                    }
                  }}
                >
                  {filter.name}
                </Chip>
              ))}
            </Stack>
          )}

          {/* Search Button */}
          <Button
            variant="hero"
            size="lg"
            onClick={handleSearch}
            disabled={!query.trim() || isSearching}
            className="w-full"
          >
            {isSearching ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                Searching...
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5" />
                Search with AI
              </>
            )}
          </Button>
        </Stack>
      </Surface>

      {/* Search Results */}
          {hasSearched && (
        <Box className="space-y-4">
          <Stack className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Search Results
            </h2>
            <span className="text-sm text-foreground-secondary">
              {results.length} results found
            </span>
          </Stack>

          {results.map((result) => (
            <Surface
              key={result.id}
              variant="card"
              padding="lg"
              className="hover:shadow-md transition-all duration-smooth"
            >
              <Stack gap="md">
                {/* Result Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Stack gap="xs">
                      <h3 className="font-semibold text-foreground hover:text-primary cursor-pointer transition-colors">
                        {result.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-sm text-foreground-secondary">
                          <span>Relevance:</span>
                          <span className="font-medium text-accent">
                            {Math.round(result.score * 100)}%
                          </span>
                        </div>
                      </div>
                    </Stack>
                  </div>
                  <FileTextIcon className="h-5 w-5 text-foreground-muted flex-shrink-0" />
                </div>

                {/* Snippet */}
                <p className="text-foreground-secondary leading-relaxed">
                  {result.snippet}
                </p>

                {/* Actions */}
                <Stack direction="row" gap="sm" className="pt-2">
                  <Button variant="default" size="sm" asChild>
                    <Link to={`/documents/${encodeURIComponent(result.docId)}`}>
                      <ArrowRightIcon className="h-4 w-4" />
                      Open Document
                    </Link>
                  </Button>
                  <Button variant="secondary" size="sm" asChild>
                    <Link to={`/documents/${encodeURIComponent(result.docId)}/ai`}>
                      <SparklesIcon className="h-4 w-4" />
                      AI Summary
                    </Link>
                  </Button>
                  <Button variant="accent" size="sm" asChild>
                    <Link to={`/documents/${encodeURIComponent(result.docId)}/video`}>
                      <PlayIcon className="h-4 w-4" />
                      Video
                    </Link>
                  </Button>
                </Stack>
              </Stack>
            </Surface>
          ))}
        </Box>
      )}

      {/* Empty State */}
      {!hasSearched && (
        <Surface variant="card" padding="xl" className="text-center">
          <Stack gap="lg" align="center">
            <div className="p-4 rounded-full bg-primary-light">
              <SparklesIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">
                Intelligent Document Search
              </h3>
              <p className="text-foreground-secondary max-w-md">
                Use natural language to find relevant information across all your course materials. 
                Our AI understands context and meaning, not just keywords.
              </p>
            </div>
            <div className="text-sm text-foreground-muted space-y-1">
              <p><strong>Try asking:</strong></p>
              <p>"How does dynamic programming work?"</p>
              <p>"Integration techniques for trigonometric functions"</p>
              <p>"Quantum mechanics wave functions"</p>
            </div>
          </Stack>
        </Surface>
      )}
    </Box>
  );
};

export default SearchPage;

