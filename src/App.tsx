
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import InstructorDashboard from "./pages/InstructorDashboard";
import NotFound from "./pages/NotFound";
import InstructorLayout from "./pages/instructor/InstructorLayout";
import InstructorProfile from "./pages/instructor/InstructorProfile";
import CourseContent from "./pages/instructor/CourseContent";
import FAQ from "./pages/instructor/FAQ";
import VideoUpload from "./pages/instructor/VideoUpload";
import InstructorGuidelines from "./pages/instructor/InstructorGuidelines";
import LiveSessions from "./pages/instructor/LiveSessions";
import Messages from "./pages/instructor/Messages";
import Settings from "./pages/instructor/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Instructor Routes */}
          <Route path="/instructor" element={<InstructorLayout />}>
            <Route path="dashboard" element={<InstructorDashboard />} />
            <Route path="profile" element={<InstructorProfile />} />
            <Route path="courses/:courseId/content" element={<CourseContent />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="videos" element={<VideoUpload />} />
            <Route path="guidelines" element={<InstructorGuidelines />} />
            <Route path="sessions" element={<LiveSessions />} />
            <Route path="messages" element={<Messages />} />
            <Route path="settings" element={<Settings />} />
            {/* Add other instructor routes here */}
          </Route>
          
          {/* Legacy route - can be removed once all links are updated */}
          <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
