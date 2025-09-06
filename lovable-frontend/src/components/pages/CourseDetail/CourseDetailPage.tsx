import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Surface } from '@/components/ui/surface';
import { Stack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { API_BASE, fetchJSON, postKickoff } from '@/lib/api';
import { getCourseDisplayName, setCourseDisplayName } from '@/utils/courseNames';
import { RefreshCwIcon, BookOpenIcon } from 'lucide-react';

interface DocRow {
  doc_id: string;
  title: string | null;
  course_canvas_id: string | null;
  module_canvas_id: string | null;
  module_item_canvas_id: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
}

interface AssignmentRow {
  id: string;
  name: string;
  due_at?: string | null;
  html_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [docs, setDocs] = useState<DocRow[] | null>(null);
  const [assignments, setAssignments] = useState<AssignmentRow[] | null>(null);
  const [errorDocs, setErrorDocs] = useState<string | null>(null);
  const [errorAssign, setErrorAssign] = useState<string | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<null | {
    status: string;
    processed: number;
    skipped: number;
    errors: number;
    created_at?: string | null;
    started_at?: string | null;
    finished_at?: string | null;
    error_message?: string | null;
  }>(null);

  async function loadDocs(cancelled?: { v: boolean }) {
    setErrorDocs(null);
    try {
      const data = await fetchJSON<{ ok: true; documents: DocRow[] }>(
        `${API_BASE}/api/canvas/documents?course_id=${encodeURIComponent(courseId || '')}&limit=200`
      );
      if (!cancelled?.v) setDocs(data.documents);
    } catch (e: any) {
      if (!cancelled?.v) setErrorDocs(String(e?.message || e));
    }
  }

  async function loadAssignments(cancelled?: { v: boolean }) {
    setErrorAssign(null);
    try {
      const data = await fetchJSON<{ ok: true; assignments: AssignmentRow[] }>(
        `${API_BASE}/api/canvas/assignments?course_id=${encodeURIComponent(courseId || '')}`
      );
      if (!cancelled?.v) setAssignments(data.assignments);
    } catch (e: any) {
      if (!cancelled?.v) setErrorAssign(String(e?.message || e));
    }
  }

  async function syncNow() {
    if (!courseId) return;
    setSyncBusy(true);
    setSyncMsg(null);
    try {
      const res = await postKickoff<{ ok: true; job_id: string; existing?: boolean }>(
        `${API_BASE}/api/canvas/sync/course/${encodeURIComponent(courseId)}/start`
      );
      const jid = res.job_id;
      setJobId(jid);
      try { localStorage.setItem(`canvasSyncJob:${courseId}`, JSON.stringify({ job_id: jid, ts: Date.now() })); } catch {}
      setSyncMsg(res.existing ? 'Sync already running…' : 'Sync started…');
    } catch (e: any) {
      setSyncMsg(`Sync kickoff failed: ${String(e?.message || e)}`);
    } finally {
      setSyncBusy(false);
    }
  }

  useEffect(() => {
    let cancelled = { v: false };
    if (courseId) {
      void loadDocs(cancelled);
      void loadAssignments(cancelled);
      try {
        const raw = localStorage.getItem(`canvasSyncJob:${courseId}`);
        if (raw) {
          const parsed = JSON.parse(raw) as { job_id: string };
          if (parsed?.job_id) setJobId(parsed.job_id);
        }
      } catch {}
    }
    return () => { cancelled.v = true };
  }, [courseId]);

  useEffect(() => {
    if (!jobId || !courseId) return;
    let stopped = false;
    const interval = setInterval(async () => {
      try {
        const s = await fetchJSON<{ ok: true; job: any }>(`${API_BASE}/api/canvas/sync/status/${encodeURIComponent(jobId)}`);
        if (stopped) return;
        const j = s.job || {};
        setJob({
          status: j.status,
          processed: Number(j.processed || 0),
          skipped: Number(j.skipped || 0),
          errors: Number(j.errors || 0),
          created_at: j.created_at ?? null,
          started_at: j.started_at ?? null,
          finished_at: j.finished_at ?? null,
          error_message: j.error_message ?? null,
        });
        if (j.status === 'completed' || j.status === 'failed') {
          clearInterval(interval);
          try { localStorage.removeItem(`canvasSyncJob:${courseId}`); } catch {}
          await Promise.all([loadDocs(), loadAssignments()]);
        }
      } catch (e) {
        clearInterval(interval);
        try { localStorage.removeItem(`canvasSyncJob:${courseId}`); } catch {}
      }
    }, 1500);
    return () => { stopped = true; clearInterval(interval); };
  }, [jobId, courseId]);

  function rename() {
    if (!courseId) return;
    const current = getCourseDisplayName(courseId, courseId);
    const next = window.prompt('Set display name for this course', current)?.trim();
    if (next === undefined) return;
    setCourseDisplayName(courseId, next);
  }

  const header = courseId ? getCourseDisplayName(courseId, courseId) : 'Course';

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">{header}</h1>
        <Button variant="secondary" onClick={rename}>Rename</Button>
      </div>

      <Surface variant="card" padding="lg">
        <Stack gap="md">
          <div className="flex items-center gap-3">
            <Button disabled={syncBusy || (job && (job.status === 'pending' || job.status === 'running'))} onClick={syncNow}>
              {syncBusy ? 'Starting…' : (job && (job.status === 'pending' || job.status === 'running')) ? 'Sync in progress…' : 'Sync now'}
            </Button>
            {syncMsg && <span className="text-sm text-foreground-secondary">{syncMsg}</span>}
          </div>
          {job && (
            <div className="p-3 rounded-md bg-background-secondary">
              <div className="text-foreground">Sync status: {job.status}{job.status === 'failed' && job.error_message ? ` — ${job.error_message}` : ''}</div>
              <div className="text-sm text-foreground-muted">processed {job.processed} • skipped {job.skipped} • errors {job.errors}</div>
            </div>
          )}
        </Stack>
      </Surface>

      <Surface variant="card" padding="lg">
        <Stack gap="md">
          <h2 className="text-xl font-semibold">Documents</h2>
          {!docs ? (
            <div>Loading…</div>
          ) : docs.length === 0 ? (
            <div>No documents yet.</div>
          ) : (
            <Stack gap="sm">
              {docs.map((d) => (
                <Surface key={d.doc_id} variant="card" padding="md" className="border border-border">
                  <Stack gap="xs">
                    <div className="flex items-center gap-2">
                      <BookOpenIcon className="h-4 w-4 text-foreground-muted" />
                      <div className="font-medium text-foreground">{d.title ?? d.doc_id}</div>
                    </div>
                    <div className="text-xs text-foreground-muted">
                      {d.mime_type ?? 'unknown'} • {d.size_bytes ? `${d.size_bytes} bytes` : 'size unknown'} • {new Date(d.created_at).toLocaleString()}
                    </div>
                    <Stack direction="row" gap="sm">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/documents/${encodeURIComponent(d.doc_id)}`}>Open</Link>
                      </Button>
                      <Button variant="secondary" size="sm" asChild>
                        <Link to={`/documents/${encodeURIComponent(d.doc_id)}/ai`}>AI</Link>
                      </Button>
                      <Button variant="accent" size="sm" asChild>
                        <Link to={`/documents/${encodeURIComponent(d.doc_id)}/video`}>Video</Link>
                      </Button>
                    </Stack>
                  </Stack>
                </Surface>
              ))}
            </Stack>
          )}
        </Stack>
      </Surface>

      <Surface variant="card" padding="lg">
        <Stack gap="md">
          <h2 className="text-xl font-semibold">Assignments</h2>
          {!assignments ? (
            <div>Loading…</div>
          ) : assignments.length === 0 ? (
            <div>No assignments yet.</div>
          ) : (
            <Stack gap="sm">
              {assignments.map((a) => (
                <Surface key={a.id} variant="card" padding="md" className="border border-border">
                  <div className="font-medium text-foreground">{a.name}</div>
                  {a.due_at && <div className="text-xs text-foreground-muted">Due: {new Date(a.due_at).toLocaleString()}</div>}
                </Surface>
              ))}
            </Stack>
          )}
        </Stack>
      </Surface>
    </div>
  );
}

