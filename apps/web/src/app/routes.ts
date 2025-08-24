// Route definitions as single source of truth
export const FRONT_ROUTES = {
  ADMIN: {
    path: '/admin',
    name: 'Admin',
  },
  COURSES: {
    path: '/courses',
    name: 'Courses',
  },
} as const;

// Helper to build paths with parameters
export function buildPath(route: { path: string }, params?: Record<string, string>): string {
  let path = route.path;
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, value);
    });
  }
  
  return path;
}

export default FRONT_ROUTES;
