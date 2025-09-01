import React, { useState } from 'react';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Chip } from '@/components/ui/chip';
import { Loading } from '@/components/ui/loading';
import { 
  BookOpenIcon,
  SearchIcon,
  RefreshCwIcon,
  FolderIcon,
  CalendarIcon,
  ArrowRightIcon,
  PlusIcon
} from 'lucide-react';

const Courses = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in real app this would come from API
  const courses = [
    {
      id: '1',
      name: 'Advanced Algorithms',
      code: 'CS 2420',
      term: 'Fall 2024',
      documentCount: 24,
      lastSync: '2 hours ago',
      color: 'primary'
    },
    {
      id: '2',
      name: 'Calculus II',
      code: 'MATH 1210',
      term: 'Fall 2024',
      documentCount: 18,
      lastSync: '1 day ago',
      color: 'secondary'
    },
    {
      id: '3',
      name: 'Modern Physics',
      code: 'PHYS 3710',
      term: 'Fall 2024',
      documentCount: 31,
      lastSync: '3 days ago',
      color: 'accent'
    },
    {
      id: '4',
      name: 'Software Engineering',
      code: 'CS 3500',
      term: 'Fall 2024',
      documentCount: 15,
      lastSync: '1 week ago',
      color: 'primary'
    },
  ];

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSyncCourse = (courseId: string) => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Courses</h1>
          <p className="text-foreground-secondary">
            Manage your enrolled courses and sync materials
          </p>
        </div>
        <Button variant="hero" size="lg">
          <PlusIcon className="h-5 w-5" />
          Connect Canvas
        </Button>
      </div>

      {/* Search */}
      <Surface variant="card" padding="md">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Surface>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" text="Syncing courses..." />
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Surface
              key={course.id}
              variant="card"
              padding="lg"
              className="group hover:shadow-lg transition-all duration-smooth cursor-pointer"
            >
              <Stack gap="md">
                {/* Course Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Stack gap="xs">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {course.name}
                      </h3>
                      <Chip variant={course.color as any} size="sm">
                        {course.code}
                      </Chip>
                    </Stack>
                  </div>
                  <BookOpenIcon className="h-5 w-5 text-foreground-muted" />
                </div>

                {/* Course Stats */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                    <CalendarIcon className="h-4 w-4" />
                    {course.term}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                    <FolderIcon className="h-4 w-4" />
                    {course.documentCount} documents
                  </div>
                  <div className="text-xs text-foreground-muted">
                    Last synced: {course.lastSync}
                  </div>
                </div>

                {/* Actions */}
                <Stack direction="row" gap="sm" className="pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                  >
                    <ArrowRightIcon className="h-4 w-4" />
                    Open
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSyncCourse(course.id)}
                  >
                    <RefreshCwIcon className="h-4 w-4" />
                  </Button>
                </Stack>
              </Stack>
            </Surface>
          ))}
        </div>
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
    </div>
  );
};

export default Courses;