import { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { FRONT_ROUTES, buildPath } from './routes';
import AdminArea from '@/Areas/Admin';
import CoursesArea from '@/Areas/Courses';
import SettingsArea from '@/Areas/Settings';
import DocumentsArea from '@/Areas/Documents';
import DocumentDetailArea from '@/Areas/Documents/Detail';

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
  {
    path: buildPath(FRONT_ROUTES.SETTINGS),
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <SettingsArea />
      </Suspense>
    ),
  },
  {
    path: buildPath(FRONT_ROUTES.DOCUMENTS),
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <DocumentsArea />
      </Suspense>
    ),
  },
  {
    path: buildPath(FRONT_ROUTES.DOCUMENT_DETAIL, { documentId: ':documentId' }),
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <DocumentDetailArea />
      </Suspense>
    ),
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
