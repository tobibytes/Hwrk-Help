import { useEffect, useMemo, useState } from 'react';
import { useAPI } from '@/lib/useAPI';
import { API_BASE, fetchJSON, postJSON } from '@/lib/api';

interface AssignmentRow { id: string; name: string; due_at?: string | null; html_url?: string | null }
interface CourseRow { id: string; name: string }
export interface ResourceRow { id: string; score: number; snippet: string; docId: string }
export interface BriefData {
  assignment_id: string;
  title: string;
  deliverables?: string[];
  constraints?: string[];
  format?: { length?: string; citation?: string };
  rubric_points?: string[];
  updated_at?: string;
}
export interface PlanStep { id: string; title: string; eta_minutes: number; refs?: string[] }
export interface PlanData { assignment_id: string; q: string; steps: PlanStep[]; updated_at?: string }

export function useAssignmentWorkspacePage(courseId: string | null, assignmentId: string | null) {
  const courseQ = useAPI<{ ok: true; courses: CourseRow[] }>({ route: { endpoint: '/api/canvas/courses', method: 'GET' } });
  const course = useMemo(() => (courseQ.data?.courses || []).find(c => c.id === courseId) || null, [courseQ.data, courseId]);

  const assignmentsQ = useAPI<{ ok: true; assignments: AssignmentRow[] }>({ route: { endpoint: '/api/canvas/assignments', method: 'GET' }, query: courseId ? { course_id: courseId } : undefined, enabled: !!courseId });
  const assignment = useMemo(() => (assignmentsQ.data?.assignments || []).find(a => a.id === assignmentId) || null, [assignmentsQ.data, assignmentId]);

  const [brief, setBrief] = useState<BriefData | null>(null);
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [busyPack, setBusyPack] = useState(false);
  const [busyBrief, setBusyBrief] = useState(false);
  const [busyPlan, setBusyPlan] = useState(false);

  // Load persisted brief/plan on assignment change
  useEffect(() => {
    setResources([]);
    setPlan(null);
    setBrief(null);
    async function loadPersisted() {
      if (!assignmentId) return;
      try {
        const b = await fetchJSON<{ ok: true; assignment_id: string; brief: BriefData }>(`${API_BASE}/api/homework/${encodeURIComponent(assignmentId)}/brief`);
        setBrief(b.brief);
      } catch {}
      try {
        const p = await fetchJSON<{ ok: true; assignment_id: string; plan: PlanData }>(`${API_BASE}/api/homework/${encodeURIComponent(assignmentId)}/plan`);
        setPlan(p.plan);
      } catch {}
    }
    void loadPersisted();
  }, [assignmentId]);

  async function buildStudyPack() {
    if (!assignment || !assignmentId) return;
    setBusyPack(true);
    try {
      const url = `${API_BASE}/api/homework/${encodeURIComponent(assignmentId)}/resources?q=${encodeURIComponent(assignment.name)}&k=10`
        + `${courseId ? `&course_id=${encodeURIComponent(courseId)}` : ''}`;
      const j = await fetchJSON<{ ok: true; results: Array<{ id: string; score: number; snippet: string; doc_id: string }> }>(url);
      const rows: ResourceRow[] = (j.results || []).map((r, i) => ({ id: r.id || String(i + 1), score: r.score, snippet: r.snippet, docId: r.doc_id }));
      setResources(rows);
    } finally { setBusyPack(false); }
  }

  async function extractBrief(inputText: string, title?: string) {
    if (!assignmentId) return;
    setBusyBrief(true);
    try {
      const resp = await postJSON<{ ok: true; assignment_id: string; brief: BriefData }>(
        `${API_BASE}/api/homework/${encodeURIComponent(assignmentId)}/brief`,
        { text: inputText, title: title || assignment?.name || undefined, course_id: courseId || undefined }
      );
      setBrief(resp.brief);
    } finally { setBusyBrief(false); }
  }

  async function generatePlan() {
    if (!assignmentId) return;
    setBusyPlan(true);
    try {
      const resp = await postJSON<{ ok: true; assignment_id: string; plan: PlanData }>(
        `${API_BASE}/api/homework/${encodeURIComponent(assignmentId)}/plan`,
        { q: assignment?.name || 'Study', course_id: courseId || undefined }
      );
      setPlan(resp.plan);
    } finally { setBusyPlan(false); }
  }

  return { course, assignment, brief, plan, resources, busyPack, busyBrief, busyPlan, buildStudyPack, extractBrief, generatePlan };
}
