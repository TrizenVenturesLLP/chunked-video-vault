
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, ArrowLeft, BookOpen } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const InstructorSignup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialty: '',
    experience: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.specialty.trim()) newErrors.specialty = 'Specialty is required';
    
    if (!formData.experience.trim()) newErrors.experience = 'Years of experience is required';
    else if (isNaN(Number(formData.experience)) || Number(formData.experience) < 0)
      newErrors.experience = 'Experience must be a valid number';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords don't match";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'instructor' as const,
        specialty: formData.specialty,
        experience: Number(formData.experience)
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

        <Card className="w-full max-w-md mt-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  name="specialty"
                  type="text"
                  placeholder="e.g., Web Development, Data Science"
                  value={formData.specialty}
                  onChange={handleChange}
                  className={errors.specialty ? "border-red-500" : ""}
                />
                {errors.specialty && <p className="text-xs text-red-500">{errors.specialty}</p>}
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  name="experience"
                  type="number"
                  min="0"
                  placeholder="e.g., 5"
                  value={formData.experience}
                  onChange={handleChange}
                  className={errors.experience ? "border-red-500" : ""}
                />
                {errors.experience && <p className="text-xs text-red-500">{errors.experience}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
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
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
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
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>

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
