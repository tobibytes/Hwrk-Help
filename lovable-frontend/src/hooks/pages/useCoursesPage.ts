import { useMemo, useState } from 'react';
import { useAPI } from '@/lib/useAPI';

export interface CourseRow { id: string; name: string; term: string | null }

export function useCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const coursesQ = useAPI<{ ok: true; courses: CourseRow[] }>({ route: { endpoint: '/api/canvas/courses', method: 'GET' } });
  const courses = coursesQ.data?.ok ? (coursesQ.data.courses || []) : [];

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return courses.filter((c) => (c.name || '').toLowerCase().includes(q) || (c.id || '').toLowerCase().includes(q));
  }, [courses, searchQuery]);

  return { searchQuery, setSearchQuery, filtered };
}

