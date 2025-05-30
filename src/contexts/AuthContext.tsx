import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { isAxiosError } from 'axios';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
    rating?: number;
    totalReviews?: number;
    courses?: string[];
  };
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role?: 'student' | 'instructor';
  specialty?: string;
  experience?: number | string;
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
  const navigate = useNavigate();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
        try {
          const response = await axiosInstance.get('/api/auth/me');
          if (response.data) {
            setUser(response.data);
          }
        } catch (error) {
          // Only clear token if it's invalid
          if (isAxiosError(error) && error.response?.status === 401) {
            localStorage.removeItem('auth_token');
          }
          console.error('Auth check error:', error);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', { email, password });
      
      // Store token and user data
      localStorage.setItem('auth_token', response.data.token);
      setUser(response.data.user);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${response.data.user.name}!`
      });
      
      // Navigate based on user role
      if (response.data.user.role === 'instructor') {
        navigate('/instructor');
      }
      
      return;
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const signup = async (data: SignupData) => {
    try {
      // Ensure all required fields have default values if not provided
      const signupData = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || 'student',
        specialty: data.specialty || 'General',
        experience: data.experience !== undefined ? Number(data.experience) : 0
      };

      console.log("Sending signup data:", signupData);
      
      // Determine the endpoint based on the role
      const endpoint = signupData.role === 'instructor' 
        ? '/api/auth/instructor-signup' 
        : '/api/auth/signup';
      
      const response = await axiosInstance.post(endpoint, signupData);
      
      // Store token and user data
      localStorage.setItem('auth_token', response.data.token);
      setUser(response.data.user);
      
      toast({
        title: "Account created",
        description: data.role === 'instructor' 
          ? "Your instructor application has been submitted!" 
          : "Your account has been successfully created."
      });
      
      return;
    } catch (error: any) {
      console.error("Signup error:", error);
      const message = error.response?.data?.message || 'Signup failed';
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
