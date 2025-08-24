import { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { FRONT_ROUTES, buildPath } from './routes';
import AdminArea from '@/Areas/Admin';
import CoursesArea from '@/Areas/Courses';

// Create router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <AdminArea />
      </Suspense>
    ),
  },
  {
    path: buildPath(FRONT_ROUTES.ADMIN),
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <AdminArea />
      </Suspense>
    ),
  },
  {
    path: buildPath(FRONT_ROUTES.COURSES),
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <CoursesArea />
      </Suspense>
    ),
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
