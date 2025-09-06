import React, { useEffect, useState } from 'react';
import { Surface } from '@/components/ui/surface';
import { TalvraStack as Stack } from '@/components/talvra/TalvraStack';
import { TalvraButton as Button } from '@/components/talvra/TalvraButton';
import { Link } from 'react-router-dom';
import { useAPI } from '@/lib/useAPI';
import { TalvraBox as Box } from '@/components/talvra/TalvraBox';
import { TalvraInput as Input } from '@/components/talvra/TalvraInput';
import { TalvraChip as Chip } from '@/components/talvra/TalvraChip';
import { Loading } from '@/components/ui/loading';
import { TalvraCourseCard } from '@/components/pages/Courses/TalvraCourseCard';
import { 
  BookOpenIcon,
  SearchIcon,
  RefreshCwIcon,
  FolderIcon,
  CalendarIcon,
  ArrowRightIcon,
  PlusIcon
} from 'lucide-react';

const CoursesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<Array<{ id: string; name: string; term: string | null }>>([]);
  const [error, setError] = useState<string | null>(null);

  const coursesQ = useAPI<{ ok: true; courses: Array<{ id: string; name: string; term: string | null }> }>({
    route: { endpoint: '/api/canvas/courses', method: 'GET' },
  });

  useEffect(() => {
    setIsLoading(coursesQ.isLoading);
    if (coursesQ.isError) setError(String(coursesQ.error?.message || coursesQ.error || 'Error'));
    if (coursesQ.data?.ok) setCourses(coursesQ.data.courses || []);
  }, [coursesQ.isLoading, coursesQ.isError, coursesQ.error, coursesQ.data]);

  const filteredCourses = courses.filter((course) => {
    const q = (searchQuery || '').toLowerCase();
    const name = (course?.name ?? '').toString().toLowerCase();
    const id = (course?.id ?? '').toString().toLowerCase();
    return name.includes(q) || id.includes(q);
  });

  const courseSync = useAPI<{ ok: true; job_id: string }>({ route: { endpoint: '/api/canvas/sync/course', method: 'POST' }, enabled: false });
  const handleSyncCourse = async (courseId: string) => {
    setIsLoading(true);
    try {
      await courseSync.run({ endpoint: `/api/canvas/sync/course/${encodeURIComponent(courseId)}/start` });
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="container mx-auto px-4 py-8 space-y-6 max-w-6xl">
      {/* Header */}
      <Stack className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Courses</h1>
          <p className="text-foreground-secondary">
            Manage your enrolled courses and sync materials
          </p>
        </div>
        <Button variant="hero" size="lg" asChild>
          <Link to="/settings">
            <PlusIcon className="h-5 w-5" />
            Connect Canvas
          </Link>
        </Button>
      </Stack>

      {/* Search */}
      <Surface variant="card" padding="md">
        <Box className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </Box>
      </Surface>

      {/* Courses Grid */}
      {isLoading ? (
        <Stack className="flex justify-center py-12">
          <Loading size="lg" text="Syncing courses..." />
        </Stack>
      ) : filteredCourses.length > 0 ? (
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <TalvraCourseCard key={course.id} course={course} onSync={() => handleSyncCourse(course.id)} />
          ))}
        </Box>
      ) : (
        <Surface variant="card" padding="xl" className="text-center">
          <Stack gap="lg" align="center">
            <div className="p-4 rounded-full bg-background-secondary">
              <BookOpenIcon className="h-8 w-8 text-foreground-muted" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">
                {searchQuery ? 'No courses found' : 'No courses yet'}
              </h3>
              {searchQuery ? (
                <p className="text-foreground-secondary">
                  Try adjusting your search terms
                </p>
              ) : (
                <p className="text-foreground-secondary">
                  Connect your Canvas account to import your courses
                </p>
              )}
            </div>
            {!searchQuery && (
              <Button variant="hero" size="lg">
                <PlusIcon className="h-5 w-5" />
                Connect Canvas Account
              </Button>
            )}
          </Stack>
        </Surface>
      )}
    </Box>
  );
};

export default CoursesPage;

