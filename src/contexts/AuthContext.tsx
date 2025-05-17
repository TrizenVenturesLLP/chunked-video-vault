
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
      // Verify token and get user data
      axios.get('/auth/me')
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
      // Adding mock static data for development purposes
      if (email === 'test@example.com' && password === 'password') {
        const mockUser = {
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
        
        // Store mock token
        localStorage.setItem('auth_token', 'mock-token-12345');
        setUser(mockUser);
        return mockUser;
      }
      
      const response = await axios.post('/auth/login', { email, password });
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
      console.error("Login error:", error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
    }
  };

  const signup = async (data: SignupData) => {
    try {
      // Adding mock signup functionality for development
      if (data.email.includes('@example.com')) {
        const mockUser = {
          id: '12345',
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
        
        // Store mock token
        localStorage.setItem('auth_token', 'mock-token-12345');
        setUser(mockUser);
        return mockUser;
      }
      
      let response;
      
      // Format the data for instructor signup to match the required MongoDB structure
      if (data.role === 'instructor') {
        const instructorData = {
          name: data.name,
          displayName: data.name, // Set displayName same as name initially
          email: data.email,
          password: data.password,
          role: 'instructor',
          status: 'pending', // New instructors start with pending status
          bio: '',
          timezone: 'UTC',
          instructorProfile: {
            specialty: data.specialty || '',
            experience: data.experience || 0
          }
        };
        
        // Update the endpoint to match the backend API route
        response = await axios.post('/auth/signup', instructorData);
      } else {
        // Use regular signup endpoint for students
        response = await axios.post('/auth/signup', data);
      }
      
      const { token, user } = response.data;
      
      localStorage.setItem('auth_token', token);
      setUser(user);
      
      return user;
    } catch (error: any) {
      console.error("Signup error details:", error.response || error);
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
