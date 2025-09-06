import { useMemo, useState } from 'react';
import { useAPI } from '@/lib/useAPI';
import { API_BASE, fetchJSON } from '@/lib/api';

export interface Course { id: string; name: string }
export interface Assignment { id: string; name: string }
export interface Module { id: string; name: string }
export interface SearchResultRow { id: string; title: string; score: number; snippet: string; docId: string }

export function useSearchPage() {
  const [query, setQuery] = useState('');
  const [k, setK] = useState('10');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<SearchResultRow[]>([]);

  // Data
  const coursesQ = useAPI<{ ok: true; courses: Course[] }>({ route: { endpoint: '/api/canvas/courses', method: 'GET' } });
  const assignmentsQ = useAPI<{ ok: true; assignments: Assignment[] }>({
    route: { endpoint: '/api/canvas/assignments', method: 'GET' },
    query: selectedCourse ? { course_id: selectedCourse } : undefined,
    enabled: !!selectedCourse,
  });
  const modulesQ = useAPI<{ ok: true; modules: Module[] }>({
    route: { endpoint: '/api/canvas/modules', method: 'GET' },
    query: selectedCourse ? { course_id: selectedCourse } : undefined,
    enabled: !!selectedCourse,
  });

  const courses = coursesQ.data?.ok ? (coursesQ.data.courses || []) : [];
  const assignments = selectedCourse && assignmentsQ.data?.ok ? (assignmentsQ.data.assignments || []) : [];
  const modules = selectedCourse && modulesQ.data?.ok ? (modulesQ.data.modules || []) : [];

  const activeFilters = useMemo(() => {
    const list: { id: string; name: string }[] = [];
    if (selectedCourse) {
      const c = courses.find(x => x.id === selectedCourse); if (c) list.push({ id: c.id, name: c.name });
    }
    if (selectedAssignment) {
      const a = assignments.find(x => x.id === selectedAssignment); if (a) list.push({ id: a.id, name: a.name });
    }
    if (selectedModule) {
      const m = modules.find(x => x.id === selectedModule); if (m) list.push({ id: m.id, name: m.name });
    }
    return list;
  }, [selectedCourse, selectedAssignment, selectedModule, courses, assignments, modules]);

  async function onSearch() {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const url = `${API_BASE}/api/ai/search-all?q=${encodeURIComponent(query)}&k=${encodeURIComponent(k)}`
        + `${selectedCourse ? `&course_id=${encodeURIComponent(selectedCourse)}` : ''}`
        + `${selectedAssignment ? `&assignment_id=${encodeURIComponent(selectedAssignment)}` : ''}`
        + `${selectedModule ? `&module_id=${encodeURIComponent(selectedModule)}` : ''}`;
      const j = await fetchJSON<{ ok: true; results: Array<{ id: string; score: number; snippet: string; doc_id: string }> }>(url);
      const normalized: SearchResultRow[] = (j.results || []).map((r, idx) => ({ id: r.id || String(idx + 1), title: r.doc_id, score: r.score, snippet: r.snippet, docId: r.doc_id }));
      setResults(normalized); setHasSearched(true);
    } catch {
      setResults([]); setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  }

  function onClearFilters() {
    setSelectedCourse('');
    setSelectedAssignment('');
    setSelectedModule('');
  }

  function onRemoveFilter(id: string) {
    if (courses.find(c => c.id === id)) { setSelectedCourse(''); setSelectedAssignment(''); }
    else if (assignments.find(a => a.id === id)) { setSelectedAssignment(''); }
    else if (modules.find(m => m.id === id)) { setSelectedModule(''); }
  }

  return {
    // state
    query, setQuery,
    k, setK,
    selectedCourse, setSelectedCourse,
    selectedAssignment, setSelectedAssignment,
    selectedModule, setSelectedModule,
    isSearching, hasSearched,
    results,
    // data
    courses, assignments, modules, activeFilters,
    // handlers
    onSearch, onClearFilters, onRemoveFilter,
  };
}

