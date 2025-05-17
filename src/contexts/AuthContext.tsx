
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  status?: string;
  instructorProfile?: {
    specialty: string;
    experience: number;
  };
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'instructor';
  specialty?: string;
  experience?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  isAuthenticated: false,
  loading: true
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      // Verify token and get user data
      axios.get('/api/auth/me')
        .then(response => {
          setUser(response.data.user);
        })
        .catch(() => {
          // If token is invalid, clear it
          localStorage.removeItem('auth_token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('auth_token', token);
      
      // Store user data
      setUser(user);
      
      // Check if the instructor account is pending
      if (user.role === 'instructor' && user.status === 'pending') {
        throw new Error('Your instructor account is still pending approval.');
      }
      
      return user;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
    }
  };

  const signup = async (data: SignupData) => {
    try {
      let response;
      
      if (data.role === 'instructor') {
        // Use instructor-specific signup endpoint
        response = await axios.post('/api/auth/instructor-signup', data);
      } else {
        // Use regular signup endpoint
        response = await axios.post('/api/auth/signup', data);
      }
      
      const { token, user } = response.data;
      
      localStorage.setItem('auth_token', token);
      setUser(user);
      
      return user;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Signup failed';
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
