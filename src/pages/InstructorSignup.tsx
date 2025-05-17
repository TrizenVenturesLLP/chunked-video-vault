
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, ArrowLeft, BookOpen } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormDescription,
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
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    
    try {
      const signupData = {
        name: values.name,
        email: values.email,
        password: values.password,
        role: 'instructor' as const,
        specialty: values.specialty,
        experience: values.experience
      };

      await signup(signupData);
      
      toast({
        title: "Application Submitted",
        description: "Your instructor application has been submitted successfully.",
      });
      
      // Navigate to pending approval page is handled in AuthContext
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMessage = error.message || 'Failed to create account. Please try again.';
      
      setError(errorMessage);
      
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Button 
        variant="ghost" 
        className="absolute top-4 left-4 flex items-center text-gray-600"
        onClick={() => navigate('/signup')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Signup
      </Button>

      <main className="flex-grow flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="rounded-full bg-indigo-100 p-3">
            <BookOpen className="h-12 w-12 text-indigo-700" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Become an Instructor
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join our teaching community and share your knowledge with students worldwide
        </p>

        {error && (
          <Alert className="mt-4 bg-red-50 border-red-200 text-red-800 w-full max-w-md">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="w-full max-w-md mt-8">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
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
                      <FormLabel>Specialty</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Web Development, Data Science" {...field} />
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
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" placeholder="e.g., 5" {...field} />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
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

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Alert className="bg-indigo-50 border-indigo-200 text-indigo-800 mt-4">
                  <AlertDescription>
                    Your instructor application will be reviewed by our team. We'll notify you by email once it's approved.
                  </AlertDescription>
                </Alert>
                
                <Button 
                  type="submit" 
                  className="w-full bg-indigo-700 hover:bg-indigo-800" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Submitting Application...' : 'Submit Application'}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center text-sm">
              <p>Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-500 hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default InstructorSignup;
