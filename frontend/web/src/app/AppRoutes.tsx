import { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { FRONT_ROUTES, buildPath } from './routes';
import { Loading } from '@ui';
import AdminArea from '@/Areas/Admin';
import CoursesArea from '@/Areas/Courses';
import SettingsArea from '@/Areas/Settings';
import DocumentsArea from '@/Areas/Documents';
import DocumentDetailArea from '@/Areas/Documents/Detail';
import DocumentAIArea from '@/Areas/Documents/AI';
import DocumentVideoArea from '@/Areas/Documents/Video';
import CourseDetailArea from '@/Areas/Courses/Detail';
import AppLayout from '@/components/AppLayout';

// Create router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: (
<Suspense fallback={<Loading />}> 
        <AppLayout>
          <AdminArea />
        </AppLayout>
      </Suspense>
    ),
  },
  {
    path: buildPath(FRONT_ROUTES.ADMIN),
    element: (
<Suspense fallback={<Loading />}>
        <AppLayout>
          <AdminArea />
        </AppLayout>
      </Suspense>
    ),
  },
  {
    path: buildPath(FRONT_ROUTES.COURSES),
    element: (
<Suspense fallback={<Loading />}> 
        <AppLayout>
          <CoursesArea />
        </AppLayout>
      </Suspense>
    ),
  },
  {
    path: buildPath(FRONT_ROUTES.COURSE_DETAIL, { courseId: ':courseId' }),
    element: (
<Suspense fallback={<Loading />}> 
        <AppLayout>
          <CourseDetailArea />
        </AppLayout>
      </Suspense>
    ),
  },
  {
    path: buildPath(FRONT_ROUTES.SETTINGS),
    element: (
<Suspense fallback={<Loading />}> 
        <AppLayout>
          <SettingsArea />
        </AppLayout>
      </Suspense>
    ),
  },
  {
    path: buildPath(FRONT_ROUTES.DOCUMENTS),
    element: (
<Suspense fallback={<Loading />}> 
        <AppLayout>
          <DocumentsArea />
        </AppLayout>
      </Suspense>
    ),
  },
  {
    path: buildPath(FRONT_ROUTES.DOCUMENT_DETAIL, { documentId: ':documentId' }),
    element: (
<Suspense fallback={<Loading />}> 
        <AppLayout>
          <DocumentDetailArea />
        </AppLayout>
      </Suspense>
    ),
  },
  {
    path: buildPath(FRONT_ROUTES.DOCUMENT_AI, { documentId: ':documentId' }),
    element: (
<Suspense fallback={<Loading />}> 
        <AppLayout>
          <DocumentAIArea />
        </AppLayout>
      </Suspense>
    ),
  },
  {
    path: buildPath(FRONT_ROUTES.DOCUMENT_VIDEO, { documentId: ':documentId' }),
    element: (
<Suspense fallback={<Loading />}> 
        <AppLayout>
          <DocumentVideoArea />
        </AppLayout>
      </Suspense>
    ),
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
