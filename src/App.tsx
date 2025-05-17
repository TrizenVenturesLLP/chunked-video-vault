import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Index from './pages/Index';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InstructorSignup from './pages/InstructorSignup';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import Courses from './pages/instructor/Courses';
import CreateCourse from './pages/instructor/CreateCourse';
import Students from './pages/instructor/Students';
import Assessments from './pages/instructor/Assessments';
import LiveSessions from './pages/instructor/LiveSessions';
import Messages from './pages/instructor/Messages';
import InstructorProfile from './pages/instructor/InstructorProfile';
import FAQ from './pages/instructor/FAQ';
import VideoUpload from './pages/instructor/VideoUpload';
import TeachingResources from './pages/instructor/TeachingResources';
import InstructorGuidelines from './pages/instructor/InstructorGuidelines';
import Settings from './pages/instructor/Settings';
import Support from './pages/instructor/Support';
import NotFound from './pages/NotFound';
import InstructorLayout from './components/layout/InstructorLayout';
import PendingApproval from './pages/PendingApproval';
import EditCourse from './pages/instructor/EditCourse';

const queryClient = new QueryClient();

// Protected route for regular users
const UserRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role === 'instructor') {
    return <Navigate to="/instructor" />;
  }

  return <>{children}</>;
};

// Protected route for instructors
const InstructorRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'instructor') {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

const App = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            
            {/* Dashboard routes */}
            <Route path="/dashboard" element={
              <UserRoute>
                <Dashboard />
              </UserRoute>
            } />

            {/* Instructor routes */}
            <Route path="/instructor-signup" element={<InstructorSignup />} />
            <Route path="/instructor" element={
              <InstructorRoute>
                <InstructorLayout />
              </InstructorRoute>
            }>
              <Route index element={<InstructorDashboard />} />
              <Route path="courses" element={<Courses />} />
              <Route path="create-course" element={<CreateCourse />} />
              <Route path="edit-course/:courseId" element={<EditCourse />} />
              <Route path="students" element={<Students />} />
              <Route path="assessments" element={<Assessments />} />
              <Route path="live-sessions" element={<LiveSessions />} />
              <Route path="messages" element={<Messages />} />
              <Route path="profile" element={<InstructorProfile />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="video-upload" element={<VideoUpload />} />
              <Route path="teaching-resources" element={<TeachingResources />} />
              <Route path="guidelines" element={<InstructorGuidelines />} />
              <Route path="settings" element={<Settings />} />
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
