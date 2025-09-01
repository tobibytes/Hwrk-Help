import React, { useState } from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const Search = () => {
  const [query, setQuery] = useState('');
  const [k, setK] = useState('10');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Mock data
  const courses = [
    { id: '1', name: 'CS 2420', color: 'primary' },
    { id: '2', name: 'MATH 1210', color: 'secondary' },
    { id: '3', name: 'PHYS 3710', color: 'accent' },
  ];

  const assignments = [
    { id: '1', name: 'Homework 3', courseId: '1' },
    { id: '2', name: 'Midterm Review', courseId: '1' },
    { id: '3', name: 'Problem Set 4', courseId: '2' },
  ];

  const searchResults = [
    {
      id: '1',
      title: 'Dynamic Programming Fundamentals',
      course: 'CS 2420',
      courseColor: 'primary',
      score: 0.94,
      snippet: 'Dynamic programming is an algorithmic paradigm that solves complex problems by breaking them down into simpler subproblems. It is applicable to problems exhibiting the properties of overlapping subproblems...',
      docId: 'doc-123'
    },
    {
      id: '2',
      title: 'Integration by Parts Method',
      course: 'MATH 1210',
      courseColor: 'secondary',
      score: 0.87,
      snippet: 'Integration by parts is a method of integration that allows us to integrate products of functions. The formula is derived from the product rule for differentiation and states that...',
      docId: 'doc-456'
    },
    {
      id: '3',
      title: 'Quantum State Superposition',
      course: 'PHYS 3710',
      courseColor: 'accent',
      score: 0.82,
      snippet: 'In quantum mechanics, a quantum superposition is a fundamental principle that allows particles to exist in multiple states simultaneously until measured. This concept is central to understanding...',
      docId: 'doc-789'
    },
  ];

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
    }, 1500);
  };

  const clearFilters = () => {
    setSelectedCourse('');
    setSelectedAssignment('');
  };

  const activeFilters = [
    selectedCourse && courses.find(c => c.id === selectedCourse),
    selectedAssignment && assignments.find(a => a.id === selectedAssignment)
  ].filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Semantic Search
        </h1>
        <p className="text-foreground-secondary">
          Search across all your course materials using AI-powered understanding
        </p>
      </div>

      {/* Search Form */}
      <Surface variant="card" padding="lg">
        <Stack gap="md">
          {/* Main Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground-muted" />
            <Input
              placeholder="Ask about your course materials..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 text-base h-12"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
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
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-1 rounded-md border border-input-border bg-background text-sm"
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground-secondary">Assignment:</span>
              <select
                value={selectedAssignment}
                onChange={(e) => setSelectedAssignment(e.target.value)}
                className="px-3 py-1 rounded-md border border-input-border bg-background text-sm"
                disabled={!selectedCourse}
              >
                <option value="">All Assignments</option>
                {assignments
                  .filter(a => !selectedCourse || a.courseId === selectedCourse)
                  .map(assignment => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.name}
                    </option>
                  ))}
              </select>
            </div>

            {activeFilters.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <XIcon className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
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
            </div>
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Search Results
            </h2>
            <span className="text-sm text-foreground-secondary">
              {searchResults.length} results found
            </span>
          </div>

          {searchResults.map((result) => (
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
                        <Chip variant={result.courseColor as any} size="sm">
                          <BookOpenIcon className="h-3 w-3" />
                          {result.course}
                        </Chip>
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
                  <Button variant="default" size="sm">
                    <ArrowRightIcon className="h-4 w-4" />
                    Open Document
                  </Button>
                  <Button variant="secondary" size="sm">
                    <SparklesIcon className="h-4 w-4" />
                    AI Summary
                  </Button>
                  <Button variant="accent" size="sm">
                    <PlayIcon className="h-4 w-4" />
                    Video
                  </Button>
                </Stack>
              </Stack>
            </Surface>
          ))}
        </div>
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
    </div>
  );
};

export default Search;