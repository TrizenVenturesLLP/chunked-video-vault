
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

// Export the User interface so it can be imported elsewhere
export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  status?: string;
  displayName?: string;
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
      // In a real application, we would verify the token with the backend
      // For now, let's retrieve mock user data from local storage if available
      const storedUser = localStorage.getItem('user_data');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          // If JSON parsing fails, clear the invalid data
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // For development purposes, let's use mock authentication for any email/password
      // In production, this would validate against a real backend
      
      // Mock login for demonstration purposes - works with any email/password
      // But using specific test values for consistency
      if (email && password) {
        // If it's our test account, use predefined data
        let mockUser: User;
        
        if (email === 'test@example.com' && password === 'password') {
          mockUser = {
            id: '12345',
            name: 'Test User',
            email: 'test@example.com',
            role: 'instructor',
            status: 'active',
            displayName: 'Test Instructor',
            instructorProfile: {
              specialty: 'Web Development',
              experience: 5
            }
          };
        } else if (email.includes('instructor')) {
          // For any email with 'instructor', create an instructor account
          mockUser = {
            id: `user-${Date.now()}`,
            name: email.split('@')[0],
            email: email,
            role: 'instructor',
            status: 'active',
            displayName: email.split('@')[0],
            instructorProfile: {
              specialty: 'General',
              experience: 1
            }
          };
        } else {
          // Default to student account
          mockUser = {
            id: `user-${Date.now()}`,
            name: email.split('@')[0],
            email: email,
            role: 'student',
            status: 'active',
            displayName: email.split('@')[0]
          };
        }
        
        // Store mock token and user data
        localStorage.setItem('auth_token', `mock-token-${mockUser.id}`);
        localStorage.setItem('user_data', JSON.stringify(mockUser));
        setUser(mockUser);
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${mockUser.name}!`
        });
        
        return;
      }
      
      throw new Error('Email and password are required');
    } catch (error: any) {
      console.error("Login error:", error);
      const message = error.message || 'Login failed';
      throw new Error(message);
    }
  };

  const signup = async (data: SignupData) => {
    try {
      // Using mock signup functionality for development
      // In production, this would send data to a real backend
      
      const mockUser: User = {
        id: `user-${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.role === 'instructor' ? 'pending' : 'active',
        displayName: data.name
      };
      
      if (data.role === 'instructor') {
        mockUser.instructorProfile = {
          specialty: data.specialty || 'General',
          experience: data.experience || 0
        };
      }
      
      // Store mock token and user data
      localStorage.setItem('auth_token', `mock-token-${mockUser.id}`);
      localStorage.setItem('user_data', JSON.stringify(mockUser));
      setUser(mockUser);
      
      toast({
        title: "Account created",
        description: data.role === 'instructor' 
          ? "Your instructor application has been submitted!" 
          : "Your account has been successfully created."
      });
      
      return;
    } catch (error: any) {
      console.error("Signup error details:", error);
      const message = error.message || 'Signup failed';
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
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
