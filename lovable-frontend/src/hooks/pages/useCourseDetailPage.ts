import { useMemo, useState } from 'react';
import { useAPI } from '@/lib/useAPI';
import { API_BASE, fetchJSON, postKickoff } from '@/lib/api';
import { useCanvasSyncJobPoller } from '@/hooks/useCanvasSyncJobPoller';

interface DocRow { doc_id: string; title: string | null; mime_type: string | null; size_bytes: number | null; created_at: string }
interface AssignmentRow { id: string; name: string; due_at?: string | null }

export function useCourseDetailPage(courseId: string | null) {
  const docsQ = useAPI<{ ok: true; documents: DocRow[] }>({ route: { endpoint: '/api/canvas/documents', method: 'GET' }, query: courseId ? { course_id: courseId, limit: '200' } : undefined, enabled: !!courseId });
  const assignmentsQ = useAPI<{ ok: true; assignments: AssignmentRow[] }>({ route: { endpoint: '/api/canvas/assignments', method: 'GET' }, query: courseId ? { course_id: courseId } : undefined, enabled: !!courseId });

  const docs = docsQ.data?.ok ? (docsQ.data.documents || []) : null;
  const assignments = assignmentsQ.data?.ok ? (assignmentsQ.data.assignments || []) : null;

  const [syncBusy, setSyncBusy] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const { job } = useCanvasSyncJobPoller(jobId, courseId, async () => { await Promise.all([docsQ.refetch?.(), assignmentsQ.refetch?.()]); });

  async function syncNow() {
    if (!courseId) return;
    setSyncBusy(true); setSyncMsg(null);
    try { const res = await postKickoff<{ ok: true; job_id: string; existing?: boolean }>(`${API_BASE}/api/canvas/sync/course/${encodeURIComponent(courseId)}/start`); setJobId(res.job_id); setSyncMsg(res.existing ? 'Sync already running…' : 'Sync started…'); }
    catch (e: any) { setSyncMsg(`Sync kickoff failed: ${String(e?.message || e)}`); }
    finally { setSyncBusy(false); }
  }

  return { docs, assignments, syncBusy, syncMsg, job, syncNow };
}

