
import React, { createContext, useContext, ReactNode, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>({
    id: '1234',
    name: 'Dr. Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Instructor'
  });

  const login = async (email: string, password: string) => {
    // Mock login functionality
    setUser({
      id: '1234',
      name: 'Dr. Jane Smith',
      email: email,
      role: 'Instructor'
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
