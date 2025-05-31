
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const { login, user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              {/* Logo in form */}
              <div className="mx-auto mb-6">
                <img 
                  src="/lovable-uploads/feba2167-456e-4e3d-b943-30361d3be552.png" 
                  alt="TRIZEN Logo" 
                  className="h-20 w-20 mx-auto object-contain"
                />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Enter your credentials to access your instructor account
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="name@example.com" 
                            className="h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-colors"
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
                          <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                          <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                            Forgot password?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 pr-12 bg-gray-50 focus:bg-white transition-colors"
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
                    className="w-full h-12 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </Form>

              <div className="mt-8 text-center text-sm">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/instructor-signup" className="text-indigo-600 hover:text-indigo-700 hover:underline font-semibold">
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
