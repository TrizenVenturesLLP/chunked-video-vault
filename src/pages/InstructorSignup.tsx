
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const instructorFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  specialty: z.string().min(2, { message: "Specialty must be at least 2 characters." }),
  experience: z.string()
    .refine((val) => !isNaN(Number(val)), { message: "Experience must be a number." })
    .refine((val) => Number(val) >= 0, { message: "Experience must be a positive number." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type InstructorFormValues = z.infer<typeof instructorFormSchema>;

const InstructorSignup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<InstructorFormValues>({
    resolver: zodResolver(instructorFormSchema),
    defaultValues: {
      name: "",
      email: "",
      specialty: "",
      experience: "0",
      password: "",
      confirmPassword: ""
    }
  });

  const handleSubmit = async (values: InstructorFormValues) => {
    setIsLoading(true);
    
    try {
      const signupData = {
        name: values.name,
        email: values.email,
        password: values.password,
        role: 'instructor' as const,
        specialty: values.specialty,
        experience: Number(values.experience) || 0
      };

      await signup(signupData);
      
      toast({
        title: "Application Submitted",
        description: "Your instructor application has been submitted successfully.",
      });
      
      // Navigate to pending approval page
      navigate('/pending-approval');
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMessage = error.message || 'Failed to create account. Please try again.';
      
      toast({
        title: "Signup failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
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
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Become an Instructor</CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Join our teaching community and share your expertise
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="John Doe" 
                            className="h-11 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-colors"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="john@example.com" 
                            className="h-11 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-colors"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Specialty</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Web Development, Data Science" 
                            className="h-11 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-colors"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Years of Experience</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            placeholder="e.g., 5" 
                            className="h-11 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-colors"
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
                        <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="h-11 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 pr-12 bg-gray-50 focus:bg-white transition-colors"
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

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="h-11 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 pr-12 bg-gray-50 focus:bg-white transition-colors"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 mt-6" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Submitting Application...' : 'Submit Application'}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-8 text-center text-sm">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-indigo-600 hover:text-indigo-700 hover:underline font-semibold">
                    Login
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

export default InstructorSignup;
