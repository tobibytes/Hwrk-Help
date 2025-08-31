import { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { FRONT_ROUTES, buildPath } from './routes';
import AdminArea from '@/Areas/Admin';
import CoursesArea from '@/Areas/Courses';
import SettingsArea from '@/Areas/Settings';
import DocumentsArea from '@/Areas/Documents';
import DocumentDetailArea from '@/Areas/Documents/Detail';
import DocumentAIArea from '@/Areas/Documents/AI';
import DocumentVideoArea from '@/Areas/Documents/Video';
import SearchArea from '@/Areas/Search';

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
    path: buildPath(FRONT_ROUTES.COURSE_DETAIL, { courseId: ':courseId' }),
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <CourseDetailArea />
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
  {
    path: buildPath(FRONT_ROUTES.DOCUMENT_AI, { documentId: ':documentId' }),
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <DocumentAIArea />
      </Suspense>
    ),
  },
  {
    path: buildPath(FRONT_ROUTES.DOCUMENT_VIDEO, { documentId: ':documentId' }),
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <DocumentVideoArea />
      </Suspense>
    ),
  },
  {
    path: buildPath(FRONT_ROUTES.SEARCH),
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <SearchArea />
      </Suspense>
    ),
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
