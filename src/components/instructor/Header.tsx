
import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@/contexts/AuthContext';
import UserMenu from './UserMenu';

type HeaderProps = {
  toggleSidebar: () => void;
  user: User | null;
  onLogout: () => void;
};

const Header = ({ toggleSidebar, user, onLogout }: HeaderProps) => {
  return (
    <div className="h-full px-4 flex items-center justify-between md:justify-end space-x-4">
      {/* Mobile menu button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-6 w-6" />
      </Button>
      
      <div className="md:hidden flex-1 flex justify-center">
        <h1 className="text-lg font-bold">Instructor Panel</h1>
      </div>
      
      <UserMenu user={user} onLogout={onLogout} />
    </div>
  );
};

export default Header;
