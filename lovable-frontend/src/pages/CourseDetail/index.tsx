import React from 'react';
import { useParams } from 'react-router-dom';
import CourseDetailHeader from '@/components/pages/CourseDetail/CourseDetailHeader';
import CourseSyncCard from '@/components/pages/CourseDetail/CourseSyncCard';
import CourseDocumentsCard from '@/components/pages/CourseDetail/CourseDocumentsCard';
import CourseAssignmentsCard from '@/components/pages/CourseDetail/CourseAssignmentsCard';
import { getCourseDisplayName, setCourseDisplayName } from '@/utils/courseNames';
import { useCourseDetailPage } from '@/hooks/pages/useCourseDetailPage';

export default function Index() {
  const { courseId } = useParams<{ courseId: string }>();
  const { docs, assignments, syncBusy, syncMsg, job, syncNow } = useCourseDetailPage(courseId || null);

  function rename() {
    if (!courseId) return;
    const current = getCourseDisplayName(courseId, courseId);
    const next = window.prompt('Set display name for this course', current)?.trim();
    if (next === undefined) return; setCourseDisplayName(courseId, next);
  }

  const header = courseId ? getCourseDisplayName(courseId, courseId) : 'Course';

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-5xl">
      <CourseDetailHeader title={header} onRename={rename} />
      <CourseSyncCard busy={syncBusy} job={job as any} message={syncMsg} onSync={syncNow} />
      <CourseDocumentsCard docs={docs as any} />
      <CourseAssignmentsCard assignments={assignments as any} courseId={courseId || undefined} />
    </div>
  );
}

