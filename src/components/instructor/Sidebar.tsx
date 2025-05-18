
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BookOpen,
  Users,
  BarChart2,
  MessageSquare,
  LogOut,
  Video,
  Award
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

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
};

const Sidebar = ({ isOpen, onClose, onLogout }: SidebarProps) => {
  const mainNavigation = [
    { name: 'Dashboard', href: '/instructor', icon: BarChart2 },
    { name: 'Courses', href: '/instructor/courses', icon: BookOpen },
    { name: 'Students', href: '/instructor/students', icon: Users },
    { name: 'Videos', href: '/instructor/video-upload', icon: Video },
    { name: 'Assessments', href: '/instructor/assessments', icon: Award },
    { name: 'Live Sessions', href: '/instructor/live-sessions', icon: BookOpen },
    { name: 'Messages', href: '/instructor/messages', icon: MessageSquare },
    { name: 'Profile', href: '/instructor/profile', icon: Users },
  ];

  const onMobileItemClick = () => {
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <div className="space-y-1">
          {mainNavigation.map((item) => (
            <NavItem 
              key={item.name} 
              {...item} 
              onClick={onMobileItemClick} 
            />
          ))}
        </div>
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
