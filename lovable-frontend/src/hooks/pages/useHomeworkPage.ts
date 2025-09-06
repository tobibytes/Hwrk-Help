import { useEffect, useMemo, useState } from 'react';
import { useAPI } from '@/lib/useAPI';

export interface CourseRow { id: string; name: string; term?: string | null }
export interface AssignmentRow { id: string; name: string; due_at?: string | null }
export interface HomeworkItem { id: string; name: string; due_at?: string | null; course_id: string; course_name: string }

export function useHomeworkPage() {
  const coursesQ = useAPI<{ ok: true; courses: CourseRow[] }>({ route: { endpoint: '/api/canvas/courses', method: 'GET' } });
  const courses = coursesQ.data?.ok ? (coursesQ.data.courses || []) : [];

  const [assignmentsMap, setAssignmentsMap] = useState<Record<string, AssignmentRow[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadAssignments() {
      if (!courses.length) return;
      setLoading(true);
      try {
        const entries = await Promise.all(
          courses.map(async (c) => {
            const res = await useAPI<{ ok: true; assignments: AssignmentRow[] }>({
              route: { endpoint: '/api/canvas/assignments', method: 'GET' },
              enabled: false,
            }).run({ query: { course_id: c.id } }) as any;
            const list: AssignmentRow[] = res?.data?.assignments || [];
            return [c.id, list] as const;
          })
        );
        const map: Record<string, AssignmentRow[]> = {};
        for (const [cid, list] of entries) map[cid] = list;
        setAssignmentsMap(map);
      } finally { setLoading(false); }
    }
    void loadAssignments();
  }, [courses.map(c => c.id).join(',')]);

  const items: HomeworkItem[] = useMemo(() => {
    const list: HomeworkItem[] = [];
    for (const c of courses) {
      const arr = assignmentsMap[c.id] || [];
      for (const a of arr) list.push({ id: a.id, name: a.name, due_at: a.due_at, course_id: c.id, course_name: c.name });
    }
    // sort by due date ascending, undefined last
    return list.sort((a, b) => {
      const da = a.due_at ? new Date(a.due_at).getTime() : Infinity;
      const db = b.due_at ? new Date(b.due_at).getTime() : Infinity;
      return da - db;
    });
  }, [courses, assignmentsMap]);

  return { loading, items };
}
