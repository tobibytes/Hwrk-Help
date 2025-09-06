import React from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Box } from '@/components/ui/box';
import { SearchIcon, XIcon } from 'lucide-react';

export interface Course { id: string; name: string }
export interface Assignment { id: string; name: string }
export interface Module { id: string; name: string }

interface Props {
  query: string;
  k: string;
  selectedCourse: string;
  selectedAssignment: string;
  selectedModule: string;
  courses: Course[];
  assignments: Assignment[];
  modules: Module[];
  onChangeQuery: (v: string) => void;
  onChangeK: (v: string) => void;
  onChangeCourse: (v: string) => void;
  onChangeAssignment: (v: string) => void;
  onChangeModule: (v: string) => void;
  onClearFilters: () => void;
  onSearch: () => void;
  isSearching: boolean;
}

const SearchForm: React.FC<Props> = ({
  query, k, selectedCourse, selectedAssignment, selectedModule,
  courses, assignments, modules,
  onChangeQuery, onChangeK, onChangeCourse, onChangeAssignment, onChangeModule,
  onClearFilters, onSearch, isSearching
}) => {
  return (
    <Surface variant="card" padding="lg">
      <Stack gap="md">
        <Box className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground-muted" />
          <Input
            placeholder="Ask about your course materials..."
            value={query}
            onChange={(e) => onChangeQuery(e.target.value)}
            className="pl-12 text-base h-12"
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
        </Box>

        <Stack className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground-secondary">Results:</span>
            <Input type="number" value={k} onChange={(e) => onChangeK(e.target.value)} className="w-16 h-8" min="1" max="50" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground-secondary">Course:</span>
            <div className="min-w-[200px]">
              <Select value={selectedCourse || '__all_courses__'} onValueChange={(v) => onChangeCourse(v === '__all_courses__' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all_courses__">All Courses</SelectItem>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground-secondary">Assignment:</span>
            <div className="min-w-[200px]">
              <Select value={selectedAssignment || '__all_assignments__'} onValueChange={(v) => onChangeAssignment(v === '__all_assignments__' ? '' : v)}>
                <SelectTrigger disabled={!selectedCourse}>
                  <SelectValue placeholder="All Assignments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all_assignments__">All Assignments</SelectItem>
                  {assignments.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground-secondary">Module:</span>
            <div className="min-w-[200px]">
              <Select value={selectedModule || '__all_modules__'} onValueChange={(v) => onChangeModule(v === '__all_modules__' ? '' : v)}>
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

          {(selectedCourse || selectedAssignment || selectedModule) && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <XIcon className="h-4 w-4" />
              Clear
            </Button>
          )}
        </Stack>

        <Button variant="hero" size="lg" onClick={onSearch} disabled={!query.trim() || isSearching} className="w-full">
          {isSearching ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
              Searching...
            </>
          ) : (
            <>Search with AI</>
          )}
        </Button>
      </Stack>
    </Surface>
  );
};

export default SearchForm;

