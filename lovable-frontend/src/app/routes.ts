export interface RouteDefinition {
  path: string;
  name: string;
  params?: readonly string[];
}

export const FRONT_ROUTES = {
  HOME: { path: '/', name: 'Home' },
  COURSES: { path: '/courses', name: 'Courses' },
  COURSE_DETAIL: { path: '/courses/:courseId', name: 'Course Detail', params: ['courseId'] as const },
  DOCUMENTS: { path: '/documents', name: 'Documents' },
  DOCUMENT_DETAIL: { path: '/documents/:documentId', name: 'Document Detail', params: ['documentId'] as const },
  DOCUMENT_AI: { path: '/documents/:documentId/ai', name: 'Document AI', params: ['documentId'] as const },
  DOCUMENT_VIDEO: { path: '/documents/:documentId/video', name: 'Document Video', params: ['documentId'] as const },
  HOMEWORK: { path: '/homework', name: 'Homework' },
  HOMEWORK_DETAIL: { path: '/homework/:courseId/:assignmentId', name: 'Assignment Workspace', params: ['courseId', 'assignmentId'] as const },
  SEARCH: { path: '/search', name: 'Search' },
  SETTINGS: { path: '/settings', name: 'Settings' },
} as const;

export type RouteKey = keyof typeof FRONT_ROUTES;

export function buildPath(route: RouteDefinition, params?: Record<string, string | number>): string {
  let p = route.path;
  if (route.params && params) {
    for (const key of route.params) {
      const val = params[key];
      if (val !== undefined && val !== null) p = p.replace(`:${key}`, String(val));
    }
  }
  return p;
}
