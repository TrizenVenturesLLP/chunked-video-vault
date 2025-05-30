import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Upload,
  Code,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { useCreateCourse, checkTitleAvailability } from '@/services/courseService';
import { toast } from 'sonner';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import VideoUploader from '@/components/VideoUploader';
import { UploadedFile } from '@/components/VideoUploader';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import MCQForm from '@/components/instructor/MCQForm';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const TABS = [
  { id: "basic-info", label: "Basic Information" },
  { id: "course-details", label: "Course Details" },
  { id: "course-roadmap", label: "Course Roadmap" },
  { id: "media-resources", label: "Media & Resources" },
];

const CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'Cloud Computing',
  'DevOps',
  'Cybersecurity',
  'Blockchain',
  'Design',
  'Digital Marketing'
] as const;

const LANGUAGES = [
  'English',
  'Hindi',
  'Tamil',
  'Telugu',
  'Malayalam',
  'Kannada',
  'Bengali',
  'Marathi',
  'Gujarati',
  'Punjabi'
] as const;

const courseFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  longDescription: z.string().optional(),
  instructor: z.string().min(1, "Instructor name is required"),
  duration: z.string().min(1, "Duration is required"),
  category: z.string().min(1, "Category is required"),
  language: z.string().min(1, "Language is required"),
  level: z.enum(["Beginner", "Intermediate", "Advanced", "Beginner to Intermediate"]),
  image: z.string().min(1, "Course image URL is required"),
  skills: z.array(z.string()).default([]),
  roadmap: z.array(z.object({
    day: z.number(),
    topics: z.string().min(1, "Topics are required for each day"),
    video: z.string().min(1, "Video is required for each day"),
    mcqs: z.array(z.object({
      question: z.string(),
      options: z.array(z.object({
        text: z.string(),
        isCorrect: z.boolean()
      })),
      explanation: z.string().optional()
    })).default([]),
    transcript: z.string().default(""),
    notes: z.string().default("")
  })).min(1, "At least one day is required"),
  courseAccess: z.boolean().default(true)
});

type CourseFormData = z.infer<typeof courseFormSchema>;

type RoadmapDay = {
    day: number;
    topics: string;
    video: string;
  mcqs: MCQQuestion[];
  transcript: string;
  notes: string;
};

type MCQQuestion = {
  question: string;
  options: MCQOption[];
  explanation?: string;
};

type MCQOption = {
  text: string;
  isCorrect: boolean;
};

const CreateCourse = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("basic-info");
  const [roadmapDays, setRoadmapDays] = useState<RoadmapDay[]>([{ 
    day: 1, 
    topics: "", 
    video: "", 
    mcqs: [],
    transcript: "",
    notes: ""
  }]);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const lastDayRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  const { mutate: createCourse, isPending } = useCreateCourse();
  
  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      longDescription: "",
      instructor: user?.name || "",
      duration: "",
      category: "",
      language: "English",
      level: "Beginner",
      image: "",
      skills: [],
      roadmap: roadmapDays,
      courseAccess: true,
    },
    mode: "onChange"
  });

  // Update instructor name when user data is available
  useEffect(() => {
    if (user?.name) {
      form.setValue('instructor', user.name);
    }
  }, [user, form]);

  // Keep roadmap state synchronized
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'roadmap' && value.roadmap) {
        const typedRoadmap = value.roadmap.map(day => ({
          day: day.day || 1,
          topics: day.topics || "",
          video: day.video || "",
          mcqs: (day.mcqs || []).map(mcq => ({
            question: mcq.question || "",
            options: (mcq.options || []).map(opt => ({
              text: opt.text || "",
              isCorrect: !!opt.isCorrect
            })),
            explanation: mcq.explanation
          })),
          transcript: day.transcript || "",
          notes: day.notes || ""
        }));
        console.log('Roadmap updated in form:', typedRoadmap);
        setRoadmapDays(typedRoadmap);
    }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleTabChange = (value: string) => {
    const currentFormState = form.getValues();
    console.log('Current form state before tab change:', currentFormState);
    console.log('Current roadmap state:', currentFormState.roadmap);
    setActiveTab(value);
  };
  
  const goToNext = () => {
    const currentIndex = TABS.findIndex(tab => tab.id === activeTab);
    if (currentIndex < TABS.length - 1) {
      setActiveTab(TABS[currentIndex + 1].id);
    }
  };
  
  const goToPrevious = () => {
    const currentIndex = TABS.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(TABS[currentIndex - 1].id);
    } else {
      navigate('/instructor/courses');
    }
  };
  
  const handleAddDay = () => {
    const newDay: RoadmapDay = {
      day: roadmapDays.length + 1,
      topics: "", 
      video: "", 
      mcqs: [],
      transcript: "",
      notes: ""
    };
    
    const updatedRoadmap = [...roadmapDays, newDay];
    form.setValue('roadmap', updatedRoadmap);
    setRoadmapDays(updatedRoadmap);
  };
  
  const handleVideoUpload = (fileInfo: UploadedFile, dayIndex: number) => {
    console.log('Uploading video for day:', dayIndex, fileInfo);
    setUploadedFile(fileInfo);
    
    const updatedRoadmap = roadmapDays.map((day, idx): RoadmapDay => ({
      day: idx + 1,
      topics: day.topics,
      video: idx === dayIndex ? fileInfo.videoUrl : day.video,
      mcqs: day.mcqs,
      transcript: day.transcript,
      notes: day.notes
    }));
    
    form.setValue('roadmap', updatedRoadmap);
    setRoadmapDays(updatedRoadmap);
  };
  
  const handleTopicChange = (event: React.ChangeEvent<HTMLTextAreaElement>, dayIndex: number) => {
    const updatedRoadmap = roadmapDays.map((day, idx): RoadmapDay => ({
      day: idx + 1,
      topics: idx === dayIndex ? event.target.value : day.topics,
      video: day.video,
      mcqs: day.mcqs,
      transcript: day.transcript,
      notes: day.notes
    }));
    
    form.setValue('roadmap', updatedRoadmap, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
    setRoadmapDays(updatedRoadmap);
  };
  
  const handleAddQuestion = (dayIndex: number) => {
    const currentRoadmap = [...form.getValues().roadmap];
    const newQuestion: MCQQuestion = {
          question: "", 
          options: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false }
      ],
      explanation: ""
    };

    const updatedRoadmap: RoadmapDay[] = currentRoadmap.map((day, idx): RoadmapDay => {
      const validatedMCQs = (day.mcqs || []).map((mcq): MCQQuestion => ({
        question: mcq.question || "",
        options: (mcq.options || []).map(opt => ({
          text: opt.text || "",
          isCorrect: !!opt.isCorrect
        })),
        explanation: mcq.explanation || ""
      }));

      if (idx === dayIndex) {
        return {
          day: idx + 1,
          topics: day.topics || "",
          video: day.video || "",
          mcqs: [...validatedMCQs, newQuestion],
          transcript: day.transcript || "",
          notes: day.notes || ""
        };
      }
      return {
        day: idx + 1,
        topics: day.topics || "",
        video: day.video || "",
        mcqs: validatedMCQs,
        transcript: day.transcript || "",
        notes: day.notes || ""
      };
    });
    
    form.setValue('roadmap', updatedRoadmap);
    setRoadmapDays(updatedRoadmap);
  };
  
  const handleDeleteDay = (event: React.MouseEvent, indexToDelete: number) => {
    event.preventDefault();
    event.stopPropagation();

    if (roadmapDays.length <= 1) {
      toast.error("Cannot delete the last day. A course must have at least one day.");
      return;
    }

    try {
      const updatedRoadmap = roadmapDays
        .filter((_, index) => index !== indexToDelete)
        .map((day, index): RoadmapDay => ({
          day: index + 1,
          topics: day.topics,
          video: day.video,
          mcqs: day.mcqs,
          transcript: day.transcript,
          notes: day.notes
        }));

      setRoadmapDays(updatedRoadmap);
      form.setValue('roadmap', updatedRoadmap, { 
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });

      toast.success("Day deleted successfully");
    } catch (error) {
      console.error('Error deleting day:', error);
      toast.error("Failed to delete day. Please try again.");
    }
  };
  
  const handleAddSkill = () => {
    if (newSkill.trim()) {
      const currentSkills = form.getValues().skills || [];
      if (!currentSkills.includes(newSkill.trim())) {
        form.setValue('skills', [...currentSkills, newSkill.trim()]);
        setNewSkill("");
      }
    }
  };
  
  const handleRemoveSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues().skills || [];
    form.setValue('skills', currentSkills.filter(skill => skill !== skillToRemove));
  };

  const handleMCQChange = (updatedMCQs: MCQQuestion[], dayIndex: number) => {
    const updatedRoadmap = form.getValues().roadmap.map((day, idx): RoadmapDay => ({
      day: idx + 1,
      topics: day.topics || "",
      video: day.video || "",
      mcqs: updatedMCQs,
      transcript: day.transcript || "",
      notes: day.notes || ""
    }));
    
    form.setValue('roadmap', updatedRoadmap);
    setRoadmapDays(updatedRoadmap);
  };

  const onSubmit = async (data: CourseFormData) => {
    try {
      console.log('Submitting form with data:', data);
      
      // Validate roadmap data
      const validatedRoadmap = data.roadmap.map((day, index): RoadmapDay => {
        if (!day.topics || !day.video) {
          throw new Error(`Day ${index + 1} is missing required content (topics or video)`);
        }
        
        return {
          day: day.day || index + 1,
          topics: day.topics,
          video: day.video,
          mcqs: (day.mcqs || []).map(mcq => ({
            question: mcq.question || "",
            options: (mcq.options || []).map(opt => ({
              text: opt.text || "",
              isCorrect: !!opt.isCorrect
            })),
            explanation: mcq.explanation || ""
          })),
          transcript: day.transcript || "",
          notes: day.notes || ""
        };
      });

      // Prepare the course data
      const courseData = {
        ...data,
        roadmap: validatedRoadmap,
        skills: data.skills || [],
        courseAccess: data.courseAccess ?? true
      };

      await createCourse(courseData, {
      onSuccess: () => {
        toast.success("Course created successfully!");
        navigate('/instructor/courses');
      },
        onError: (error: any) => {
          console.error('Course creation error:', error);
          toast.error(error.message || 'Failed to create course');
        }
      });
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast.error(error.message || 'Please fill in all required fields');
      }
  };

  // Add title validation on blur
  const handleTitleBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
    const title = event.target.value;
    if (title) {
      const isAvailable = await checkTitleAvailability(title);
      if (!isAvailable) {
        form.setError('title', {
          type: 'manual',
          message: 'This course title is already taken. Please choose a different title.'
        });
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrevious}
          className="mr-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {activeTab === "basic-info" ? "Back to Courses" : "Back"}
        </Button>
        <h1 className="text-2xl font-bold">Create New Course</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="text-sm">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information Tab */}
            <TabsContent value="basic-info" className="space-y-6 py-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="instructor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructor Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} readOnly disabled className="bg-gray-100" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Title *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter course title" 
                          {...field} 
                          onBlur={(e) => {
                            field.onBlur();
                            handleTitleBlur(e);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description (displayed in course cards)" 
                          className="h-20"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="longDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detailed course description" 
                          className="h-32"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 30 Days, 8 Weeks" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <FormControl>
                          <select
                            className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background"
                            {...field}
                          >
                            {LANGUAGES.map((lang) => (
                              <option key={lang} value={lang}>
                                {lang}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <FormControl>
                          <select
                            className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background"
                            {...field}
                          >
                            <option value="">Select a category</option>
                            {CATEGORIES.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Level *</FormLabel>
                        <FormControl>
                          <select
                            className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background"
                            {...field}
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Beginner to Intermediate">Beginner to Intermediate</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="courseAccess"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-4">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Make course available immediately after creation</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end">
                <Button onClick={goToNext}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            {/* Course Details Tab */}
            <TabsContent value="course-details" className="space-y-6 py-4">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Course Skills & Requirements</h2>
                <div className="space-y-4">
                  <Label>Skills Students Will Learn</Label>
                  <div className="flex flex-wrap gap-2">
                    <Input 
                      placeholder="Add a skill" 
                      className="max-w-xs"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <Button 
                      variant="outline" 
                      type="button"
                      onClick={handleAddSkill}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.watch('skills')?.map((skill, index) => (
                      <div 
                        key={index} 
                        className="bg-secondary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  {(!form.watch('skills') || form.watch('skills').length === 0) && (
                  <p className="text-sm text-muted-foreground">No skills added yet</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={goToPrevious}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button onClick={goToNext}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            {/* Course Roadmap Tab */}
            <TabsContent value="course-roadmap" className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Course Roadmap</h2>
                  <Button variant="outline" onClick={handleAddDay} type="button">
                    <Plus className="h-4 w-4 mr-2" /> Add Day
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add and manage the daily content for your course.
                </p>
                
                <div className="space-y-8">
                  {roadmapDays.map((day, index) => (
                    <Card 
                      key={`day-${index}-${day.day}`}
                      className="border"
                      ref={index === roadmapDays.length - 1 ? lastDayRef : undefined}
                    >
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">Day {day.day}</h3>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => handleDeleteDay(e, index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <Label className="mb-2 block">Topics *</Label>
                            <Textarea 
                              placeholder="Topics covered on this day"
                              value={day.topics || ""}
                              onChange={(e) => handleTopicChange(e, index)}
                              className="w-full"
                            />
                          </div>
                          
                          <div>
                            <Label className="mb-2 block">Video Upload *</Label>
                            <div className="mt-2">
                              <VideoUploader onUploadComplete={(fileInfo) => handleVideoUpload(fileInfo, index)} />
                            </div>
                            {day.video && (
                              <div className="mt-2 p-2 bg-secondary/50 rounded">
                                <Label className="text-sm text-muted-foreground">Current video:</Label>
                                <div className="text-sm break-all mt-1">{day.video}</div>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              Supported formats: MP4, WebM, etc.
                            </p>
                          </div>
                          
                          <div>
                            <Label className="mb-2 block">Transcript (Optional)</Label>
                            <Textarea placeholder="Video transcript or additional notes" />
                          </div>
                          
                          <div>
                            <Label className="mb-2 block">Notes (Optional)</Label>
                            <Textarea placeholder="Additional notes, resources, or instructions for this day" />
                          </div>
                          
                          <div>
                            <Label className="mb-2 block">MCQ Questions</Label>
                            <MCQForm
                              mcqs={day.mcqs || []}
                              onMCQChange={(updatedMCQs) => handleMCQChange(updatedMCQs, index)}
                              dayIndex={index}
                            />
                          </div>
                          
                          <div>
                            <Label className="mb-2 block">Code Content</Label>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-muted-foreground">Add code examples or snippets for this day's content</p>
                              <Button variant="outline" size="sm" type="button">
                                <Code className="h-4 w-4 mr-2" /> Edit Code Content
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={goToPrevious}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button onClick={goToNext}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            {/* Media & Resources Tab */}
            <TabsContent value="media-resources" className="space-y-6 py-4">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Media & Resources</h2>
                
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Image URL *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter image URL (Google Drive or direct link)" 
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          <div className="space-y-2">
                    <p>For Google Drive images:</p>
                    <ol className="list-decimal ml-5">
                      <li>Upload image to Google Drive</li>
                      <li>Right-click the image → Share</li>
                      <li>Set access to "Anyone with the link"</li>
                      <li>Copy link and paste here</li>
                    </ol>
                  </div>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Preview current image if available */}
                {form.watch('image') && (
                  <div className="mt-4">
                    <Label className="mb-2 block">Image Preview</Label>
                    <div className="relative w-full max-w-md h-48 rounded-lg overflow-hidden border">
                      <img 
                        src={form.watch('image')} 
                        alt="Course preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={goToPrevious}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button 
                  type="submit" 
                  disabled={isPending || !form.formState.isValid}
                >
                  {isPending ? "Creating..." : "Create Course"}
                </Button>
              </div>
            </TabsContent>
          </form>
        </Form>
      </Tabs>
    </div>
  );
};

export default CreateCourse;
