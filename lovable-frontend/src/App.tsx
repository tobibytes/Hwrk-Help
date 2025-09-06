import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FRONT_ROUTES } from "@routes/routes";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index/index";
import Courses from "./pages/Courses/index";
import Documents from "./pages/Documents/index";
import CourseDetail from "./pages/CourseDetail/index";
import DocumentDetail from "./pages/DocumentDetail/index";
import DocumentAI from "./pages/DocumentAI/index";
import DocumentVideo from "./pages/DocumentVideo/index";
import Homework from "./pages/Homework/index";
import AssignmentWorkspace from "./pages/AssignmentWorkspace/index";
import Search from "./pages/Search/index";
import Settings from "./pages/Settings/index";
import NotFound from "./pages/NotFound/index";

const queryClient = createQueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path={FRONT_ROUTES.HOME.path} element={<Index />} />
            <Route path={FRONT_ROUTES.COURSES.path} element={<Courses />} />
            <Route path={FRONT_ROUTES.COURSE_DETAIL.path} element={<CourseDetail />} />
            <Route path={FRONT_ROUTES.DOCUMENTS.path} element={<Documents />} />
            <Route path={FRONT_ROUTES.DOCUMENT_DETAIL.path} element={<DocumentDetail />} />
            <Route path={FRONT_ROUTES.DOCUMENT_AI.path} element={<DocumentAI />} />
            <Route path={FRONT_ROUTES.DOCUMENT_VIDEO.path} element={<DocumentVideo />} />
            <Route path={FRONT_ROUTES.HOMEWORK.path} element={<Homework />} />
            <Route path={FRONT_ROUTES.HOMEWORK_DETAIL.path} element={<AssignmentWorkspace />} />
            <Route path={FRONT_ROUTES.SEARCH.path} element={<Search />} />
            <Route path={FRONT_ROUTES.SETTINGS.path} element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
