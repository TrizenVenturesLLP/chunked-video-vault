import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  Edit,
  Star,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Users,
  Clock,
  FileCheck,
  Linkedin,
  Twitter,
  Globe,
  Award,
  Briefcase,
  GraduationCap,
  User,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  Copy,
  Link as LinkIcon,
  Share2,
  ChevronDown
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { fetchProfile, updateProfile, uploadProfilePicture, ProfileData } from '@/services/profileService';
import { useInstructorCourses } from '@/services/courseService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form schema
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  role: z.string().optional(),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().optional(),
  location: z.string().optional(),
  specialty: z.string().min(2, {
    message: "Specialty must be at least 2 characters.",
  }),
  experience: z.coerce.number().min(0),
  bio: z.string().max(500, {
    message: "Bio cannot exceed 500 characters."
  }),
  linkedin: z.string().url({ message: "Must be a valid URL." }).optional().or(z.literal('')),
  twitter: z.string().url({ message: "Must be a valid URL." }).optional().or(z.literal('')),
  website: z.string().url({ message: "Must be a valid URL." }).optional().or(z.literal('')),
});

const InstructorProfile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  
  // Fetch instructor courses
  const { data: instructorCourses = [] } = useInstructorCourses();

  // Initialize form with profile data
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      location: '',
      specialty: '',
      experience: 0,
      bio: '',
      linkedin: '',
      twitter: '',
      website: '',
    },
  });

  // Fetch instructor profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProfile();
        setProfileData(data);
        
        // Update form with fetched data
        form.reset({
          name: data.name,
          email: data.email,
          phone: data.instructorProfile?.phone || '',
          location: data.instructorProfile?.location || '',
          specialty: data.instructorProfile?.specialty || '',
          experience: data.instructorProfile?.experience || 0,
          bio: data.bio || data.instructorProfile?.bio || '',
          linkedin: data.instructorProfile?.socialLinks?.linkedin || '',
          twitter: data.instructorProfile?.socialLinks?.twitter || '',
          website: data.instructorProfile?.socialLinks?.website || '',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load profile data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [form, toast, refreshTrigger]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    try {
      setIsLoading(true);
      
      // Prepare the update data
      const updateData: Partial<ProfileData> = {
        name: values.name,
        email: values.email,
        bio: values.bio || '',
        displayName: values.name,
      };

      // Prepare instructor profile data
      if (profileData?.role === 'instructor') {
        updateData.instructorProfile = {
          ...profileData.instructorProfile,
          specialty: values.specialty || '',
          experience: Number(values.experience) || 0,
          phone: values.phone || '',
          location: values.location || '',
        socialLinks: {
          linkedin: values.linkedin || '',
          twitter: values.twitter || '',
          website: values.website || '',
          },
          rating: profileData.instructorProfile?.rating || 0,
          totalReviews: profileData.instructorProfile?.totalReviews || 0,
          courses: profileData.instructorProfile?.courses || [],
          teachingHours: profileData.instructorProfile?.teachingHours || 0
        };
      }
      
      const updatedProfile = await updateProfile(updateData);
      setProfileData(updatedProfile);
      setIsEditing(false);
      setRefreshTrigger(prev => prev + 1);
      
      toast({
        title: 'Success',
        description: 'Your profile has been updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.response?.data?.error || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Add profile picture upload handler
  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const profilePicturePath = await uploadProfilePicture(file);
      
      // Update profile data with new profile picture
      if (profileData) {
        const updatedProfile = await updateProfile({
          ...profileData,
          profilePicture: profilePicturePath
        });
        setProfileData(updatedProfile);
      }

      toast({
        title: 'Success',
        description: 'Profile picture uploaded successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to upload profile picture',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Add trigger for file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  // Function to get referral link
  const getReferralLink = (courseId?: string) => {
    const baseUrl = 'https://lms.trizenventures.com/enroll';
    const userUrl = profileData?.userId || '';
    
    if (courseId && courseId !== 'all') {
      const course = instructorCourses.find(c => c._id === courseId);
      if (course) {
        return `${baseUrl}?ref=${userUrl}&course=${course.courseUrl}`;
      }
    }
    return `${baseUrl}?ref=${userUrl}`;
  };

  if (isLoading || !profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3F2B96]" />
      </div>
    );
  }

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!profileData) return 0;
    
    const fields = [
      profileData.name,
      profileData.email,
      profileData.instructorProfile?.phone,
      profileData.instructorProfile?.location,
      profileData.bio || profileData.instructorProfile?.bio,
      profileData.instructorProfile?.specialty,
      profileData.instructorProfile?.experience,
      profileData.instructorProfile?.socialLinks?.linkedin,
      profileData.instructorProfile?.socialLinks?.twitter,
      profileData.instructorProfile?.socialLinks?.website,
    ];
    
    const filledFields = fields.filter(field => field).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#3F2B96]/5 bg-[url('/grid-pattern.svg')] bg-fixed">
      <div className="container mx-auto p-6 space-y-8 max-w-7xl py-12">
        <motion.div {...fadeIn} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
            <CardContent className="p-8">
              <div className="flex flex-col items-center space-y-8">
                {/* Profile Picture Section with improved styling */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#3F2B96] to-[#6b5fbb] rounded-full opacity-50 group-hover:opacity-100 transition duration-300 blur"></div>
                  <Avatar className="relative w-48 h-48 border-4 border-white shadow-xl">
                    {profileData?.profilePicture ? (
                      <AvatarImage 
                        src={profileData.profilePicture} 
                        alt={profileData.name}
                        className="object-cover"
                      />
                  ) : (
                      <AvatarFallback className="bg-[#3F2B96] text-4xl text-white">
                        {getInitials(profileData?.name || '')}
                    </AvatarFallback>
                  )}
                </Avatar>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white"
                    onClick={triggerFileInput}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#3F2B96]" />
                    ) : (
                      <Edit className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {/* Name and Role */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-[#3F2B96]">{profileData.name}</h2>
                  <p className="text-gray-600">{profileData?.userId || 'TIN****'}</p>
                  <Badge variant="outline" className="bg-[#3F2B96]/5 text-[#3F2B96]">
                    {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
                  </Badge>
                </div>

                {/* Profile Completion */}
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Profile Completion</span>
                    <span className="text-[#3F2B96] font-semibold">{calculateProfileCompletion()}%</span>
              </div>
                  <Progress 
                    value={calculateProfileCompletion()} 
                    className="h-2 bg-gray-100" 
                  />
                </div>
                
                {/* Contact Information */}
                <div className="w-full space-y-4">
                  <h3 className="font-semibold text-[#3F2B96] border-b pb-2">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Mail className="h-5 w-5 text-[#3F2B96]" />
                      <span className="text-sm">{profileData.email}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Phone className="h-5 w-5 text-[#3F2B96]" />
                      <span className="text-sm">{profileData.instructorProfile?.phone || 'No phone number added'}</span>
                  </div>
                    <div className="flex items-center space-x-3 text-gray-600">
                      <MapPin className="h-5 w-5 text-[#3F2B96]" />
                      <span className="text-sm">{profileData.instructorProfile?.location || 'No location added'}</span>
                  </div>
                </div>
              </div>
              
                {/* Social Links */}
                <div className="w-full space-y-4">
                  <h3 className="font-semibold text-[#3F2B96] border-b pb-2">Social Profiles</h3>
                  <div className="space-y-3">
                    {profileData.instructorProfile?.socialLinks?.linkedin && (
                      <a 
                        href={profileData.instructorProfile.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 text-gray-600 hover:text-[#3F2B96] transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                        <span className="text-sm">LinkedIn Profile</span>
                    </a>
                  )}
                    {profileData.instructorProfile?.socialLinks?.twitter && (
                      <a 
                        href={profileData.instructorProfile.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 text-gray-600 hover:text-[#3F2B96] transition-colors"
                      >
                        <Twitter className="h-5 w-5" />
                        <span className="text-sm">Twitter Profile</span>
                    </a>
                  )}
                    {profileData.instructorProfile?.socialLinks?.website && (
                      <a 
                        href={profileData.instructorProfile.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 text-gray-600 hover:text-[#3F2B96] transition-colors"
                      >
                        <Globe className="h-5 w-5" />
                        <span className="text-sm">Personal Website</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
            </CardContent>
          </Card>
            
          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header with Edit Button */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-[#3F2B96]">Instructor Profile</h1>
                <p className="text-gray-600">Manage your professional information and credentials</p>
              </div>
              <Button 
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="border-[#3F2B96] text-[#3F2B96] hover:bg-[#3F2B96]/5"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              </div>
              
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
                <Card className="relative overflow-hidden bg-gradient-to-br from-white to-[#3F2B96]/5 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16">
                    <div className="absolute inset-0 bg-[#3F2B96] opacity-10 rounded-full"></div>
                  </div>
                  <CardContent className="relative p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white rounded-xl shadow-lg">
                        <BookOpen className="h-8 w-8 text-[#3F2B96]" />
                      </div>
                    <div>
                        <div className="text-4xl font-bold text-[#3F2B96]">{instructorCourses.length}</div>
                        <div className="text-sm font-medium text-gray-600">Courses Created</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
                <Card className="relative overflow-hidden bg-gradient-to-br from-white to-[#3F2B96]/5 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16">
                    <div className="absolute inset-0 bg-[#3F2B96] opacity-10 rounded-full"></div>
                  </div>
                  <CardContent className="relative p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white rounded-xl shadow-lg">
                        <Star className="h-8 w-8 text-[#3F2B96]" />
                      </div>
                    <div>
                        <div className="flex items-baseline">
                          <span className="text-4xl font-bold text-[#3F2B96]">
                            {profileData.instructorProfile?.rating || 0}
                          </span>
                          <span className="text-sm text-gray-600 ml-1">/ 5</span>
                        </div>
                        <div className="text-sm font-medium text-gray-600">
                          {profileData.instructorProfile?.totalReviews || 0} Reviews
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
                <Card className="relative overflow-hidden bg-gradient-to-br from-white to-[#3F2B96]/5 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16">
                    <div className="absolute inset-0 bg-[#3F2B96] opacity-10 rounded-full"></div>
                  </div>
                  <CardContent className="relative p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white rounded-xl shadow-lg">
                        <Users className="h-8 w-8 text-[#3F2B96]" />
                      </div>
                    <div>
                        <div className="text-4xl font-bold text-[#3F2B96]">
                          {profileData?.referralCount || 0}
                        </div>
                        <div className="text-sm font-medium text-gray-600">Total Referrals</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* About Section */}
            <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0">
              <CardContent className="p-8 space-y-8">
                {/* About Me Section */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-[#3F2B96] flex items-center">
                    <GraduationCap className="h-6 w-6 mr-3" />
                    About Me
                  </h3>
                  <div className="relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#3F2B96] to-transparent rounded-full"></div>
                    <p className="text-gray-600 leading-relaxed pl-6">
                      {profileData.bio || profileData.instructorProfile?.bio || 'No bio added yet.'}
                    </p>
                  </div>
                </div>

                {/* Course Referral Links Section */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-[#3F2B96] flex items-center gap-2">
                    <Share2 className="h-6 w-6" />
                    Course Referral Program
                  </h3>
                  <p className="text-gray-600">Share your favorite courses with friends and earn rewards</p>

                  <div className="bg-white rounded-lg border p-6 space-y-6">
                    {/* Step 1: Select Course */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700">Step 1: Select Course to Share</h4>
                      <Select
                        value={selectedCourse}
                        onValueChange={setSelectedCourse}
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Courses</SelectItem>
                          {instructorCourses.map((course) => (
                            <SelectItem key={course._id} value={course._id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Step 2: Copy Link */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700">Step 2: Copy Your Unique Referral Link</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2">
                          <Input 
                            readOnly
                            value={getReferralLink(selectedCourse)}
                            className="bg-gray-50 font-mono text-sm"
                          />
                          <span className="text-xs text-[#3F2B96]">Your Link</span>
                        </div>
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(getReferralLink(selectedCourse));
                            toast({
                              title: "Success",
                              description: "Referral link copied to clipboard!",
                            });
                          }}
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
              </div>
              
                    {/* How it Works */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-[#3F2B96] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#3F2B96]/10 flex items-center justify-center">
                          <span className="text-[#3F2B96] text-sm">?</span>
                        </span>
                        How the Referral Program Works
                      </h4>
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#3F2B96]/10 flex items-center justify-center shrink-0">
                            <span className="text-[#3F2B96] text-sm">1</span>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-700">Select & Share</h5>
                            <p className="text-sm text-gray-500">Choose a course and share your unique referral link with friends</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#3F2B96]/10 flex items-center justify-center shrink-0">
                            <span className="text-[#3F2B96] text-sm">2</span>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-700">Friend Enrolls</h5>
                            <p className="text-sm text-gray-500">When your friend uses your link to enroll in the course</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#3F2B96]/10 flex items-center justify-center shrink-0">
                            <span className="text-[#3F2B96] text-sm">3</span>
                          </div>
              <div>
                            <h5 className="font-medium text-gray-700">Earn Rewards</h5>
                            <p className="text-sm text-gray-500">Get exclusive rewards for successful referrals</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Skills & Expertise Section */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-[#3F2B96] flex items-center">
                    <Award className="h-6 w-6 mr-3" />
                    Skills & Expertise
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Specialty Card */}
                    <Card className="bg-gradient-to-br from-white to-[#3F2B96]/5 border-0 shadow-lg">
                      <CardContent className="p-6">
                        <h4 className="text-lg font-semibold text-[#3F2B96] mb-3">Specialty</h4>
                        <div className="flex flex-wrap gap-2">
                          {profileData.instructorProfile?.specialty ? (
                            <Badge className="px-4 py-2 bg-[#3F2B96] text-white hover:bg-[#3F2B96]/90 transition-colors">
                              {profileData.instructorProfile.specialty}
                            </Badge>
                          ) : (
                            <span className="text-gray-500 italic">No specialty added</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Experience Level */}
                    <Card className="bg-gradient-to-br from-white to-[#3F2B96]/5 border-0 shadow-lg">
                      <CardContent className="p-6">
                        <h4 className="text-lg font-semibold text-[#3F2B96] mb-3">Experience Level</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Years of Experience</span>
                            <span className="font-semibold text-[#3F2B96]">
                              {profileData.instructorProfile?.experience || 0} Years
                            </span>
                          </div>
                          <Progress 
                            value={Math.min((profileData.instructorProfile?.experience || 0) * 10, 100)} 
                            className="h-2 bg-[#3F2B96]/10"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="sm:max-w-[1000px] max-h-[85vh] p-0 bg-white flex flex-col">
            {/* Fixed Header */}
            <div className="p-6 border-b">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-[#3F2B96]">
                  <Edit className="h-5 w-5" />
                  <h2 className="text-xl font-semibold">Edit Profile</h2>
                </div>
                <p className="text-gray-500">Update your professional information and credentials</p>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {/* Left Column */}
                    <div className="space-y-8">
                      {/* Personal Information */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-2 text-[#3F2B96]">
                          <User className="h-5 w-5" />
                          <h3 className="text-lg font-semibold">Personal Information</h3>
          </div>
                        
                        <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                                <FormLabel className="text-gray-700">Full Name</FormLabel>
                      <FormControl>
                                  <Input 
                                    {...field} 
                                    className="border-gray-200 focus-visible:ring-[#3F2B96] h-10" 
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
                                <FormLabel className="text-gray-700">Email Address</FormLabel>
                      <FormControl>
                                  <Input 
                                    {...field} 
                                    type="email" 
                                    className="border-gray-200 focus-visible:ring-[#3F2B96] h-10" 
                                  />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-2 text-[#3F2B96]">
                          <Phone className="h-5 w-5" />
                          <h3 className="text-lg font-semibold">Contact Information</h3>
              </div>
              
                        <div className="space-y-4">
                <FormField
                  control={form.control}
                            name="phone"
                  render={({ field }) => (
                    <FormItem>
                                <FormLabel className="text-gray-700">Phone Number</FormLabel>
                      <FormControl>
                                  <Input 
                                    {...field} 
                                    className="border-gray-200 focus-visible:ring-[#3F2B96] h-10" 
                                  />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                            name="location"
                  render={({ field }) => (
                    <FormItem>
                                <FormLabel className="text-gray-700">Location</FormLabel>
                      <FormControl>
                                  <Input 
                                    {...field} 
                                    className="border-gray-200 focus-visible:ring-[#3F2B96] h-10" 
                                  />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
                      </div>

                      {/* Professional Details */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-2 text-[#3F2B96]">
                          <Briefcase className="h-5 w-5" />
                          <h3 className="text-lg font-semibold">Professional Details</h3>
              </div>
              
                        <div className="space-y-4">
                <FormField
                  control={form.control}
                            name="specialty"
                  render={({ field }) => (
                    <FormItem>
                                <FormLabel className="text-gray-700">Specialty</FormLabel>
                      <FormControl>
                                  <Input 
                                    {...field} 
                                    className="border-gray-200 focus-visible:ring-[#3F2B96] h-10" 
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
                                <FormLabel className="text-gray-700">Years of Experience</FormLabel>
                      <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    min="0" 
                                    className="border-gray-200 focus-visible:ring-[#3F2B96] h-10" 
                                  />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                      {/* Biography */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-2 text-[#3F2B96]">
                          <FileText className="h-5 w-5" />
                          <h3 className="text-lg font-semibold">Biography</h3>
              </div>
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                              <FormLabel className="text-gray-700">Professional Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                                  className="border-gray-200 focus-visible:ring-[#3F2B96] min-h-[150px] resize-none" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                      </div>

                      {/* Social Links */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-2 text-[#3F2B96]">
                          <Globe className="h-5 w-5" />
                          <h3 className="text-lg font-semibold">Social Links</h3>
                        </div>
              
              <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                                <FormLabel className="text-gray-700 flex items-center space-x-2">
                                  <Linkedin className="h-4 w-4" />
                                  <span>LinkedIn URL</span>
                                </FormLabel>
                        <FormControl>
                                  <Input 
                                    {...field} 
                                    className="border-gray-200 focus-visible:ring-[#3F2B96] h-10" 
                                    placeholder="https://linkedin.com/in/username"
                                  />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="twitter"
                    render={({ field }) => (
                      <FormItem>
                                <FormLabel className="text-gray-700 flex items-center space-x-2">
                                  <Twitter className="h-4 w-4" />
                                  <span>Twitter URL</span>
                                </FormLabel>
                        <FormControl>
                                  <Input 
                                    {...field} 
                                    className="border-gray-200 focus-visible:ring-[#3F2B96] h-10" 
                                    placeholder="https://twitter.com/username"
                                  />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                                <FormLabel className="text-gray-700 flex items-center space-x-2">
                                  <Globe className="h-4 w-4" />
                                  <span>Personal Website</span>
                                </FormLabel>
                        <FormControl>
                                  <Input 
                                    {...field} 
                                    className="border-gray-200 focus-visible:ring-[#3F2B96] h-10" 
                                    placeholder="https://yourwebsite.com"
                                  />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                      </div>
                    </div>
                  </div>
                </form>
              </Form>
              </div>
              
            {/* Fixed Footer */}
            <div className="p-6 border-t bg-white">
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  className="border-gray-200"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isLoading}
                  className="bg-[#3F2B96] hover:bg-[#3F2B96]/90 text-white px-6"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default InstructorProfile;
