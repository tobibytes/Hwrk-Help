import React from 'react';
import { Box } from '@/components/ui/box';
import { TalvraCourseCard, CourseItem } from '@/components/pages/Courses/TalvraCourseCard';

interface Props {
  courses: CourseItem[];
  onSync: (courseId: string) => void;
}

const CoursesGrid: React.FC<Props> = ({ courses, onSync }) => (
  <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {courses.map((c) => (
      <TalvraCourseCard key={c.id} course={c} onSync={() => onSync(c.id)} />
    ))}
  </Box>
);

export default CoursesGrid;

