
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
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
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      // Navigate to instructor dashboard
      navigate('/instructor/dashboard');
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-indigo-700">TRIZEN</span>
              </Link>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-700">Home</Link>
                <Link to="/courses" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-700">My Courses</Link>
                <Link to="/explore" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-700">Explore Courses</Link>
                <Link to="/pricing" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-700">Pricing</Link>
                <Link to="/about" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-700">About</Link>
                <Link to="/contact" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-700">Contact</Link>
              </nav>
            </div>
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
              <Button variant="default" className="ml-2 bg-indigo-700 hover:bg-indigo-800" onClick={() => navigate('/signup')}>Signup</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="name@example.com" {...field} />
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
                        <FormLabel>Password</FormLabel>
                        <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full bg-indigo-700 hover:bg-indigo-800" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm">
              <p>Don't have an account?{' '}
                <Link to="/signup" className="text-indigo-600 hover:text-indigo-500 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">TRIZEN</h3>
              <p className="text-gray-600 text-sm">High-quality recorded and live online training for professionals and beginners.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-gray-600 hover:text-indigo-600 text-sm">Contribute</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-indigo-600 text-sm">Events</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-indigo-600 text-sm">Gallery</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-indigo-600 text-sm">About Us</Link></li>
                <li><Link to="/instructor-signup" className="text-gray-600 hover:text-indigo-600 text-sm">Become an Instructor</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-gray-600 hover:text-indigo-600 text-sm">Terms of Service</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-indigo-600 text-sm">Privacy Policy</Link></li>
                <li><Link to="#" className="text-gray-600 hover:text-indigo-600 text-sm">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-500 text-sm">© 2025 Trizen. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
