export type CourseNameMap = Record<string, string>;

const KEY = 'courseDisplayNames:v1';

export function loadCourseNames(): CourseNameMap {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as CourseNameMap) : {};
  } catch {
    return {};
  }
}

export function saveCourseNames(map: CourseNameMap) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map || {}));
  } catch {}
}

export function getCourseDisplayName(id: string, fallback: string): string {
  const m = loadCourseNames();
  return (m && m[id]) || fallback;
}

export function setCourseDisplayName(id: string, name: string) {
  const m = loadCourseNames();
  if (name && name.trim()) m[id] = name.trim(); else delete m[id];
  saveCourseNames(m);
}
