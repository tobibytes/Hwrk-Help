export type CourseNameMap = Record<string, string>;

const STORAGE_KEY = 'talvra:courseNames';

export function loadCourseNames(): CourseNameMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as CourseNameMap) : {};
  } catch {
    return {};
  }
}

export function saveCourseNames(map: CourseNameMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

export function getCourseDisplayName(courseId: string, fallback: string) {
  const m = loadCourseNames();
  return (courseId && m[courseId]) || fallback;
}

export function setCourseDisplayName(courseId: string, name: string) {
  const m = loadCourseNames();
  if (name.trim()) m[courseId] = name.trim();
  else delete m[courseId];
  saveCourseNames(m);
}
