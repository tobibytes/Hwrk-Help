import { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { FRONT_ROUTES, buildPath } from './routes';
// Import lovable pages
import LovableIndex from '@/lovable/pages/Index';
import LovableCourses from '@/lovable/pages/Courses';
import LovableDocuments from '@/lovable/pages/Documents';
import LovableSettings from '@/lovable/pages/Settings';
import LovableSearch from '@/lovable/pages/Search';
import LovableNotFound from '@/lovable/pages/NotFound';

// Legacy pages (kept for functionality wiring; will be migrated into lovable pages)
import CourseDetailArea from '@/Areas/Courses/Detail';
import DocumentDetailArea from '@/Areas/Documents/Detail';
import DocumentAIArea from '@/Areas/Documents/AI';
import DocumentVideoArea from '@/Areas/Documents/Video';

// Create router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <LovableIndex />
      </Suspense>
    ),
  },
  {
    path: buildPath(FRONT_ROUTES.ADMIN),
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <LovableIndex />
      </Suspense>
    ),
  },
  {
    path: buildPath(FRONT_ROUTES.COURSES),
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <LovableCourses />
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
        <LovableSettings />
      </Suspense>
    ),
  },
  {
    path: buildPath(FRONT_ROUTES.DOCUMENTS),
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <LovableDocuments />
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
        <LovableSearch />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <LovableNotFound />
      </Suspense>
    ),
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
