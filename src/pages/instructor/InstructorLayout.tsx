
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Changed from importing AuthContext directly
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Header from '@/components/instructor/Header';
import Sidebar from '@/components/instructor/Sidebar';

const InstructorLayout = () => {
  const { logout, user } = useAuth(); // Using useAuth hook instead of destructuring from AuthContext
  const { toast } = useToast(); 
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-50 md:pl-64">
        <Header 
          toggleSidebar={toggleSidebar} 
          user={user} 
          onLogout={handleLogout} 
        />
      </div>

      {/* Title Section - Desktop only */}
      <div className="hidden md:flex fixed top-0 left-0 w-64 h-16 bg-primary z-50 items-center justify-center">
        <h1 className="text-xl font-bold text-white">Instructor Panel</h1>
      </div>

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 z-40",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-primary">
          <h1 className="text-xl font-bold text-white">Instructor Portal</h1>
          {/* Close button for mobile */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-white hover:bg-primary/80"
            onClick={toggleSidebar}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          onLogout={handleLogout} 
        />
      </div>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="md:pl-64 pt-16">
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InstructorLayout;
