
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Menu, X } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { login, user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Effect to redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/instructor');
    }
  }, [isAuthenticated, user, navigate]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  });

  const handleSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      await login(values.email, values.password);
      // Login will trigger the useEffect above to navigate
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Invalid email or password. Please try again.';
      
      // Check if the error is about pending instructor status
      if (errorMessage.includes('pending approval') || errorMessage.includes('still pending')) {
        toast({
          title: "Application Under Review",
          description: "Your instructor application is still pending approval. We'll notify you once it's approved.",
          variant: "default",
          duration: 5000,
        });
        // Redirect to pending approval page
        setTimeout(() => {
          navigate('/pending-approval');
        }, 1500);
      } else {
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/logo.png" 
                alt="TRIZEN Logo" 
                className="h-8 w-8"
              />
              <span className="text-xl font-bold text-indigo-700">TRIZEN</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-indigo-700 transition-colors">
                Home
              </Link>
              <Link to="/instructor-signup" className="text-gray-600 hover:text-indigo-700 transition-colors">
                Become an Instructor
              </Link>
              <Link to="/login" className="bg-indigo-700 text-white px-4 py-2 rounded-lg hover:bg-indigo-800 transition-colors">
                Login
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-indigo-700 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 text-gray-600 hover:text-indigo-700 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/instructor-signup"
                className="block px-3 py-2 text-gray-600 hover:text-indigo-700 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Become an Instructor
              </Link>
              <Link
                to="/login"
                className="block px-3 py-2 bg-indigo-700 text-white rounded-md hover:bg-indigo-800"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="pt-16 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              {/* Logo in form */}
              <div className="mx-auto mb-4">
                <img 
                  src="/logo.png" 
                  alt="TRIZEN Logo" 
                  className="h-16 w-16 mx-auto"
                />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
              <CardDescription className="text-gray-600">
                Enter your credentials to access your instructor account
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="name@example.com" 
                            className="h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between">
                          <FormLabel className="text-gray-700">Password</FormLabel>
                          <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
                            Forgot password?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              className="h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 pr-12"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-indigo-700 hover:bg-indigo-800 text-white font-medium" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center text-sm">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/instructor-signup" className="text-indigo-600 hover:text-indigo-500 hover:underline font-medium">
                    Sign up as an Instructor
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
