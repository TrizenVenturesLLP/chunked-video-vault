
import React from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import InstructorLanding from './pages/InstructorLanding';
import Login from './pages/Login';
import InstructorSignup from './pages/InstructorSignup';
import InstructorLayout from './pages/InstructorLayout';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import Courses from './pages/instructor/Courses';
import CreateCourse from './pages/instructor/CreateCourse';
import Students from './pages/instructor/Students';
import Assessments from './pages/instructor/Assessments';
import LiveSessions from './pages/instructor/LiveSessions';
import Messages from './pages/instructor/Messages';
import InstructorProfile from './pages/instructor/InstructorProfile';
import VideoUpload from './pages/instructor/VideoUpload';
import PendingApproval from './pages/PendingApproval';
import EditCourse from './pages/instructor/EditCourse';
import NotFound from './pages/NotFound';
import InstructorGuidelines from './pages/instructor/InstructorGuidelines';
import FAQ from './pages/instructor/FAQ';
import Support from './pages/instructor/Support';

const queryClient = new QueryClient();

// Protected route for instructors
const InstructorRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'instructor') {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Routes>
            {/* Landing page as root */}
            <Route path="/" element={<InstructorLanding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/instructor-signup" element={<InstructorSignup />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            
            {/* Instructor routes */}
            <Route path="/instructor" element={
              <InstructorRoute>
                <InstructorLayout />
              </InstructorRoute>
            }>
              <Route index element={<InstructorDashboard />} />
              <Route path="courses" element={<Courses />} />
              <Route path="create-course" element={<CreateCourse />} />
              <Route path="edit-course/:courseId" element={<EditCourse />} />
              <Route path="courses/:courseId/students" element={<Students />} />
              <Route path="students" element={<Students />} />
              <Route path="assessments" element={<Assessments />} />
              <Route path="live-sessions" element={<LiveSessions />} />
              <Route path="messages" element={<Messages />} />
              <Route path="profile" element={<InstructorProfile />} />
              <Route path="video-upload" element={<VideoUpload />} />
              <Route path="guidelines" element={<InstructorGuidelines />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="support" element={<Support />} />
            </Route>
            
            {/* Wildcard route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
