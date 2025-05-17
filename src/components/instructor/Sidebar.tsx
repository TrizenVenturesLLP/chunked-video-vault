
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BookOpen,
  Users,
  BarChart2,
  MessageSquare,
  LogOut,
  HelpCircle,
  BookMarked,
  GraduationCap,
  FileQuestion,
  BookOpenCheck,
  ClipboardList,
  Award,
  UserCheck,
  Video,
  LifeBuoy
} from 'lucide-react';

type NavItemProps = {
  name: string;
  href: string;
  icon: React.ElementType;
  onClick?: () => void;
};

const NavItem = ({ name, href, icon: Icon, onClick }: NavItemProps) => (
  <NavLink
    to={href}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-gray-600 hover:bg-gray-50'
      }`
    }
  >
    <Icon className="w-5 h-5 mr-3" />
    {name}
  </NavLink>
);

type NavGroupProps = {
  title: string;
  items: {
    name: string;
    href: string;
    icon: React.ElementType;
  }[];
  onItemClick?: () => void;
};

const NavGroup = ({ title, items, onItemClick }: NavGroupProps) => (
  <div className="mt-6">
    <h2 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {title}
    </h2>
    <div className="mt-2 space-y-1">
      {items.map((item) => (
        <NavItem 
          key={item.name} 
          {...item} 
          onClick={onItemClick} 
        />
      ))}
    </div>
  </div>
);

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
};

const Sidebar = ({ isOpen, onClose, onLogout }: SidebarProps) => {
  const mainNavigation = [
    { name: 'Dashboard', href: '/instructor/dashboard', icon: BarChart2 },
    { name: 'Courses', href: '/instructor/courses', icon: BookOpen },
    { name: 'Students', href: '/instructor/students', icon: Users },
    { name: 'Videos', href: '/instructor/videos', icon: Video },
    { name: 'Assessments', href: '/instructor/assessments', icon: Award },
    { name: 'Live Sessions', href: '/instructor/sessions', icon: BookOpenCheck },
    { name: 'Messages', href: '/instructor/messages', icon: MessageSquare },
  ];

  const staticPages = [
    { name: 'Instructor Guidelines', href: '/instructor/guidelines', icon: BookMarked },
    { name: 'Teaching Resources', href: '/instructor/teaching-resources', icon: GraduationCap },
    { name: 'FAQ', href: '/instructor/faq', icon: HelpCircle },
    { name: 'Support', href: '/instructor/support', icon: LifeBuoy },
  ];

  const studentContentPages = [
    { name: 'Student Progress', href: '/instructor/student-progress', icon: BookOpenCheck },
    { name: 'Assignment Submissions', href: '/instructor/assignments', icon: ClipboardList },
    { name: 'Student Certificates', href: '/instructor/certificates', icon: Award },
    { name: 'Student Attendance', href: '/instructor/attendance', icon: UserCheck },
  ];

  const onMobileItemClick = () => {
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <div className="mb-4">
          <h2 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Main Menu
          </h2>
          <div className="mt-2 space-y-1">
            {mainNavigation.map((item) => (
              <NavItem 
                key={item.name} 
                {...item} 
                onClick={onMobileItemClick} 
              />
            ))}
          </div>
        </div>

        {/* Student Content Pages */}
        <NavGroup 
          title="Student Content" 
          items={studentContentPages} 
          onItemClick={onMobileItemClick} 
        />

        {/* Static Pages */}
        <NavGroup 
          title="Resources & Support" 
          items={staticPages} 
          onItemClick={onMobileItemClick} 
        />
      </nav>

      {/* Signout Button */}
      <div className="p-4 border-t">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
