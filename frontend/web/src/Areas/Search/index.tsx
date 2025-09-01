import { TalvraSurface, TalvraStack, TalvraText, TalvraCard, TalvraLink, TalvraButton, Label, Input, Select, SectionHeader, CodeBlock, PageContainer, Text as UiText } from '@ui';
import { useEffect, useMemo, useState } from 'react';
import { getCourseDisplayName } from '@/utils/courseNames';
import { useAPI } from '@api';

const API_BASE: string = (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:3001';

interface SearchResult { id: string; doc_id: string; score: number; snippet: string }
interface Course { id: string; name: string }
interface DocMeta { doc_id: string; title: string | null; course_canvas_id: string | null; assignment_canvas_id?: string | null }

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return (await res.json()) as T;
}

function parseCanvasCourseId(docId: string): string | null {
  // Canvas doc_ids are generated like: canvas-<courseId>-...
  const m = /^canvas-([^\-]+)-/.exec(docId);
  return m ? m[1] : null;
}

export default function SearchArea() {
  const [q, setQ] = useState('');
  const [k, setK] = useState(5);

  // Filters
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [assignments, setAssignments] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string>('');
  const [modules, setModules] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedModule, setSelectedModule] = useState<string>('');

  // Metadata map for result docs
  const [docMeta, setDocMeta] = useState<Record<string, DocMeta>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const j = await fetchJSON<{ ok: true; courses: Course[] }>(`${API_BASE}/api/canvas/courses`);
        if (!cancelled) setCourses(j.courses || []);
      } catch {}
    })();
    return () => { cancelled = true };
  }, []);

  const courseOptions = useMemo(() => [{ id: '', name: 'All courses' }, ...courses], [courses]);
  const assignmentOptions = useMemo(() => [{ id: '', name: 'All assignments' }, ...assignments], [assignments]);
  const moduleOptions = useMemo(() => [{ id: '', name: 'All modules' }, ...modules], [modules]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // When course changes, load assignments list and modules list
      setAssignments([]);
      setSelectedAssignment('');
      setModules([]);
      setSelectedModule('');
      if (!selectedCourse) return;
      try {
        const [aRes, mRes] = await Promise.all([
          fetchJSON<{ ok: true; assignments: Array<{ id: string; name: string }> }>(`${API_BASE}/api/canvas/assignments?course_id=${encodeURIComponent(selectedCourse)}`),
          fetchJSON<{ ok: true; modules: Array<{ id: string; name: string }> }>(`${API_BASE}/api/canvas/modules?course_id=${encodeURIComponent(selectedCourse)}`),
        ]);
        if (!cancelled) {
          setAssignments(aRes.assignments || []);
          setModules(mRes.modules || []);
        }
      } catch {}
    })();
    return () => { cancelled = true };
  }, [selectedCourse]);

  // Search query via useAPI with manual trigger (run)
  const searchUrl = `${API_BASE}/api/ai/search-all?q=${encodeURIComponent(q)}&k=${encodeURIComponent(String(k))}`
    + `${selectedCourse ? `&course_id=${encodeURIComponent(selectedCourse)}` : ''}`
    + `${selectedAssignment ? `&assignment_id=${encodeURIComponent(selectedAssignment)}` : ''}`
    + `${selectedModule ? `&module_id=${encodeURIComponent(selectedModule)}` : ''}`;

  const searchQ = useAPI<{ ok: true; results: SearchResult[] }>(
    ['ai-search-all', q, k, selectedCourse, selectedAssignment, selectedModule],
    () => fetchJSON(searchUrl),
    { manual: true }
  );

  useEffect(() => {
    const r = searchQ.data?.results;
    if (r && r.length > 0) {
      void loadDocMetadata(r);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQ.data]);

  async function loadDocMetadata(forResults: SearchResult[]) {
    // Build set of courseIds to fetch documents for
    const courseIds = new Set<string>();
    if (selectedCourse) {
      courseIds.add(selectedCourse);
    } else {
      for (const r of forResults) {
        const cid = parseCanvasCourseId(r.doc_id);
        if (cid) courseIds.add(cid);
      }
    }
    if (courseIds.size === 0) { setDocMeta({}); return }

    // Fetch documents per course (limit to recent 1000 per course)
    const metas: Record<string, DocMeta> = {};
    await Promise.all(
      Array.from(courseIds).map(async (cid) => {
        try {
          const j = await fetchJSON<{ ok: true; documents: DocMeta[] }>(`${API_BASE}/api/canvas/documents?course_id=${encodeURIComponent(cid)}&limit=1000`);
          for (const d of j.documents || []) {
            if (d && d.doc_id) metas[d.doc_id] = d;
          }
        } catch {}
      })
    );
    setDocMeta(metas);
  }

  return (
    <TalvraSurface>
      <PageContainer>
      <TalvraStack>
<SectionHeader title="Search" subtitle="Semantic search across your content." />

        <TalvraCard>
          <TalvraStack>
<Label>
              <span className="label-text">Query</span>
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Type your question or keywords"
                fullWidth
              />
            </Label>
<Label>
              <span className="label-text">Top K</span>
              <Input
                type="number"
                min={1}
                max={50}
                value={k}
                onChange={(e) => setK(Math.max(1, Math.min(50, Number(e.target.value) || 5)))}
              />
            </Label>

<Label>
              <span className="label-text">Course</span>
              <Select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                fullWidth
              >
                {courseOptions.map((c) => (
                  <option key={c.id || 'all'} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Label>

<Label>
              <span className="label-text">Assignment</span>
              <Select
                value={selectedAssignment}
                onChange={(e) => setSelectedAssignment(e.target.value)}
                disabled={!selectedCourse}
                fullWidth
              >
                {assignmentOptions.map((a) => (
                  <option key={a.id || 'all'} value={a.id}>{a.name}</option>
                ))}
              </Select>
            </Label>

<Label>
              <span className="label-text">Module</span>
              <Select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                disabled={!selectedCourse}
                fullWidth
              >
                {moduleOptions.map((m) => (
                  <option key={m.id || 'all'} value={m.id}>{m.name}</option>
                ))}
              </Select>
            </Label>

            <TalvraButton disabled={searchQ.isFetching || !q.trim()} onClick={() => searchQ.run()}>
              {searchQ.isFetching ? 'Searching…' : 'Search'}
            </TalvraButton>
            {searchQ.isError && (
              <UiText color="red-600">Error: {String((searchQ.error as any)?.message ?? searchQ.error)}</UiText>
            )}
          </TalvraStack>
        </TalvraCard>

        <TalvraCard>
          <TalvraStack>
            <TalvraText as="h3">Results</TalvraText>
            {searchQ.data === undefined ? (
              <TalvraText>Enter a query to search your content.</TalvraText>
            ) : (searchQ.data?.results?.length ?? 0) === 0 ? (
              <TalvraText>No results found.</TalvraText>
            ) : (
              <TalvraStack>
                {(searchQ.data?.results || []).map((r) => {
                  const meta = docMeta[r.doc_id];
                  const courseId = meta?.course_canvas_id || parseCanvasCourseId(r.doc_id);
                  const title = (meta && meta.title) ? meta.title : r.doc_id;
                  const courseLabel = courseId ? getCourseDisplayName(courseId, courseId) : null;
                  return (
                    <TalvraCard key={r.id}>
                      <TalvraStack>
                        <TalvraText as="h4">{title}</TalvraText>
                        {courseLabel && (
                          <UiText color="gray-500">Course: {courseLabel}{courseLabel !== courseId ? ` (${courseId})` : ''}</UiText>
                        )}
                        <UiText color="gray-500">Score: {r.score.toFixed(3)}</UiText>
<CodeBlock>
                          {r.snippet}
                        </CodeBlock>
                        <TalvraLink href={`/documents/${encodeURIComponent(r.doc_id)}`}>Open document</TalvraLink>
                      </TalvraStack>
                    </TalvraCard>
                  );
                })}
              </TalvraStack>
            )}
          </TalvraStack>
        </TalvraCard>
      </TalvraStack>
      </PageContainer>
    </TalvraSurface>
  );
}
