import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TalvraSurface, TalvraStack, TalvraText, TalvraCard, TalvraLink, TalvraButton } from '@ui';
import { FRONT_ROUTES, buildPath } from '@/app/routes';

const API_BASE: string = (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:3001';

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return (await res.json()) as T;
}

async function postJSON<T>(url: string, body?: any): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return (await res.json()) as T;
}

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

export default function CourseDetailArea() {
  const { courseId } = useParams<{ courseId: string }>();
  const [docs, setDocs] = useState<DocRow[] | null>(null);
  const [assignments, setAssignments] = useState<AssignmentRow[] | null>(null);
  const [errorDocs, setErrorDocs] = useState<string | null>(null);
  const [errorAssign, setErrorAssign] = useState<string | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  async function loadDocs(cancelledFlag?: { v: boolean }) {
    setErrorDocs(null);
    try {
      const data = await fetchJSON<{ ok: true; documents: DocRow[] }>(
        `${API_BASE}/api/canvas/documents?course_id=${encodeURIComponent(courseId || '')}&limit=200`
      );
      if (!cancelledFlag?.v) setDocs(data.documents);
    } catch (e: any) {
      if (!cancelledFlag?.v) setErrorDocs(String(e?.message || e));
    }
  }

  async function loadAssignments(cancelledFlag?: { v: boolean }) {
    setErrorAssign(null);
    try {
      const data = await fetchJSON<{ ok: true; assignments: AssignmentRow[] }>(
        `${API_BASE}/api/canvas/assignments?course_id=${encodeURIComponent(courseId || '')}`
      );
      if (!cancelledFlag?.v) setAssignments(data.assignments);
    } catch (e: any) {
      if (!cancelledFlag?.v) setErrorAssign(String(e?.message || e));
    }
  }

  async function syncNow() {
    setSyncBusy(true);
    setSyncMsg(null);
    try {
      const res = await postJSON<{ ok: true; result: { course_id: string; processed: number; skipped: number } }>(
        `${API_BASE}/api/canvas/sync/course/${encodeURIComponent(courseId || '')}`,
        {}
      );
      setSyncMsg(`Sync done: processed ${res.result.processed}, skipped ${res.result.skipped} for course ${res.result.course_id}.`);
      await Promise.all([loadDocs(), loadAssignments()]);
    } catch (e: any) {
      setSyncMsg(`Sync failed: ${String(e?.message || e)}`);
    } finally {
      setSyncBusy(false);
    }
  }

  useEffect(() => {
    let cancelled = { v: false };
    if (courseId) {
      void loadDocs(cancelled);
      void loadAssignments(cancelled);
    }
    return () => { cancelled.v = true };
  }, [courseId]);

  return (
    <TalvraSurface>
      <TalvraStack>
        <TalvraText as="h1">Course {courseId}</TalvraText>

        <TalvraStack>
          <TalvraText as="h2">Documents</TalvraText>
          <TalvraStack>
            <TalvraButton disabled={syncBusy} onClick={syncNow}>
              {syncBusy ? 'Syncing…' : 'Sync now'}
            </TalvraButton>
            {syncMsg && <TalvraText>{syncMsg}</TalvraText>}
          </TalvraStack>
          {errorDocs && <TalvraText>Error loading documents: {errorDocs}</TalvraText>}
          <TalvraCard>
            <TalvraStack>
              {!docs ? (
                <TalvraText>Loading…</TalvraText>
              ) : docs.length === 0 ? (
                <TalvraText>No documents synced yet. Try Settings → Sync now.</TalvraText>
              ) : (
                docs.map((d) => (
                  <TalvraCard key={d.doc_id}>
                    <TalvraStack>
                      <TalvraText as="h4">{d.title ?? d.doc_id}</TalvraText>
                      <TalvraStack>
                        <TalvraLink href={buildPath(FRONT_ROUTES.DOCUMENT_DETAIL, { documentId: d.doc_id })}>Open</TalvraLink>
                        <TalvraLink href={buildPath(FRONT_ROUTES.DOCUMENT_AI, { documentId: d.doc_id })}>AI</TalvraLink>
                        <TalvraLink href={buildPath(FRONT_ROUTES.DOCUMENT_VIDEO, { documentId: d.doc_id })}>Video</TalvraLink>
                      </TalvraStack>
                      <TalvraText style={{ color: '#64748b' }}>
                        {d.mime_type ?? 'unknown'} • {d.size_bytes ? `${d.size_bytes} bytes` : 'size unknown'} • {new Date(d.created_at).toLocaleString()}
                      </TalvraText>
                    </TalvraStack>
                  </TalvraCard>
                ))
              )}
            </TalvraStack>
          </TalvraCard>
        </TalvraStack>

        <TalvraStack>
          <TalvraText as="h2">Assignments</TalvraText>
          {errorAssign && <TalvraText>Error loading assignments: {errorAssign}</TalvraText>}
          <TalvraCard>
            <TalvraStack>
              {!assignments ? (
                <TalvraText>Loading…</TalvraText>
              ) : assignments.length === 0 ? (
                <TalvraText>No assignments found.</TalvraText>
              ) : (
                assignments.map((a) => (
                  <TalvraCard key={a.id}>
                    <TalvraStack>
                      <TalvraText as="h4">{a.name}</TalvraText>
                      <TalvraText style={{ color: '#64748b' }}>
                        {a.due_at ? `Due ${new Date(a.due_at).toLocaleString()}` : 'No due date'}
                      </TalvraText>
                      <TalvraStack>
                        {a.html_url && (
                          <a href={a.html_url} target="_blank" rel="noreferrer">Open in Canvas</a>
                        )}
                      </TalvraStack>
                    </TalvraStack>
                  </TalvraCard>
                ))
              )}
            </TalvraStack>
          </TalvraCard>
        </TalvraStack>

        <TalvraStack>
          <TalvraText as="h2">Navigation</TalvraText>
          <TalvraStack>
            <TalvraLink href={buildPath(FRONT_ROUTES.COURSES)}>
              Back to Courses
            </TalvraLink>
            <TalvraLink href={buildPath(FRONT_ROUTES.SETTINGS)}>
              Settings
            </TalvraLink>
          </TalvraStack>
        </TalvraStack>
      </TalvraStack>
    </TalvraSurface>
  );
}
