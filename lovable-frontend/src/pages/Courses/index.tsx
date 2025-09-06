import React from 'react';
import CoursesLayout from '@/components/pages/Courses/CoursesLayout';
import CoursesHeader from '@/components/pages/Courses/CoursesHeader';
import CoursesSearchCard from '@/components/pages/Courses/CoursesSearchCard';
import CoursesGrid from '@/components/pages/Courses/CoursesGrid';
import CoursesEmpty from '@/components/pages/Courses/CoursesEmpty';
import { useAPI } from '@/lib/useAPI';
import { useCoursesPage } from '@/hooks/pages/useCoursesPage';

export default function Index() {
  const { searchQuery, setSearchQuery, filtered } = useCoursesPage();
  const courseSync = useAPI<{ ok: true; job_id: string }>({ route: { endpoint: '/api/canvas/sync/course', method: 'POST' }, enabled: false });
  async function onSyncCourse(courseId: string) {
    try { await courseSync.run({ endpoint: `/api/canvas/sync/course/${encodeURIComponent(courseId)}/start` }); } catch {}
  }

  return (
    <CoursesLayout>
      <CoursesHeader />
      <CoursesSearchCard value={searchQuery} onChange={setSearchQuery} />
      {filtered.length > 0 ? (
        <CoursesGrid courses={filtered as any} onSync={onSyncCourse} />
      ) : (
        <CoursesEmpty hasQuery={!!searchQuery} />
      )}
    </CoursesLayout>
  );
}

