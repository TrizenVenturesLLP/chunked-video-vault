import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Loader2,
  Trash2
} from 'lucide-react';
import { useCourseDetails, useUpdateCourse } from '@/services/courseService';
import { toast } from 'sonner';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import VideoUploader from '@/components/VideoUploader';
import { UploadedFile } from '@/components/VideoUploader';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import MCQForm from '@/components/instructor/MCQForm';

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

type CourseFormData = {
  title: string;
  description: string;
  longDescription: string;
  instructor: string;
  duration: string;
  category: string;
  language: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Beginner to Intermediate";
  image: string;
  skills: string[];
  rating: number;
  roadmap: {
    day: number;
    topics: string;
    video: string;
    transcript?: string;
    notes?: string;
    mcqs: { question: string; options: { text: string; isCorrect: boolean }[] }[];
    code?: string;
    language?: string;
  }[];
  courseAccess: boolean;
};

const EditCourse = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState<string>("basic-info");
  const [roadmapDays, setRoadmapDays] = useState<any[]>([]);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const { user } = useAuth();
  const lastDayRef = useRef<HTMLDivElement>(null);
  const [newSkill, setNewSkill] = useState("");
  
  const { data: courseData, isLoading: isLoadingCourse } = useCourseDetails(courseId);
  const { mutate: updateCourse, isPending } = useUpdateCourse();
  
  const form = useForm<CourseFormData>({
    defaultValues: {
      title: "",
      description: "",
      longDescription: "",
      instructor: user?.name || "", 
      duration: "",
      category: "",
      language: "English",
      level: "Beginner",
      image: "https://placehold.co/600x400",
      skills: [],
      roadmap: [],
      courseAccess: true,
    },
  });

  // Load course data when available
  useEffect(() => {
    if (courseData) {
      form.reset({
        title: courseData.title || "",
        description: courseData.description || "",
        longDescription: courseData.longDescription || "",
        instructor: courseData.instructor || user?.name || "",
        duration: courseData.duration || "",
        category: courseData.category || "",
        language: courseData.language || "English",
        level: courseData.level || "Beginner",
        image: courseData.image || "https://placehold.co/600x400",
        skills: courseData.skills || [],
        roadmap: courseData.roadmap || [],
        courseAccess: courseData.courseAccess !== undefined ? courseData.courseAccess : true,
      });
      
      setRoadmapDays(courseData.roadmap || []);
    }
  }, [courseData, form, user]);

  const handleTabChange = (value: string) => {
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
      // If on first tab, go back to courses list
      navigate('/instructor/courses');
    }
  };
  
  const handleAddDay = () => {
    const updatedRoadmap = [...form.getValues().roadmap];
    updatedRoadmap.push({ 
      day: updatedRoadmap.length + 1, 
      topics: "", 
      video: "", 
      mcqs: [] 
    });
    form.setValue('roadmap', updatedRoadmap);
    setRoadmapDays(updatedRoadmap);
    
    // Scroll to the newly added day after a short delay to ensure the element is rendered
    setTimeout(() => {
      lastDayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };
  
  const handleVideoUpload = (fileInfo: UploadedFile, dayIndex: number) => {
    setUploadedFile(fileInfo);
    
    // Update the form data with the new video URL
    const updatedRoadmap = [...form.getValues().roadmap];
    if (!updatedRoadmap[dayIndex]) {
      updatedRoadmap[dayIndex] = { day: dayIndex + 1, topics: "", video: fileInfo.videoUrl, mcqs: [] };
    } else {
      updatedRoadmap[dayIndex].video = fileInfo.videoUrl;
    }
    
    form.setValue('roadmap', updatedRoadmap);
    toast.success(`Video uploaded for Day ${dayIndex + 1}`);
  };
  
  const handleTopicChange = (event: React.ChangeEvent<HTMLTextAreaElement>, dayIndex: number) => {
    const updatedRoadmap = [...form.getValues().roadmap];
    if (!updatedRoadmap[dayIndex]) {
      updatedRoadmap[dayIndex] = { day: dayIndex + 1, topics: event.target.value, video: "", mcqs: [] };
    } else {
      updatedRoadmap[dayIndex].topics = event.target.value;
    }
    form.setValue('roadmap', updatedRoadmap);
    
    // Update the local state to ensure the UI reflects the changes
    const newRoadmapDays = [...roadmapDays];
    if (!newRoadmapDays[dayIndex]) {
      newRoadmapDays[dayIndex] = { day: dayIndex + 1, topics: event.target.value, video: "", mcqs: [] };
    } else {
      newRoadmapDays[dayIndex].topics = event.target.value;
    }
    setRoadmapDays(newRoadmapDays);
  };
  
  const handleAddQuestion = (dayIndex: number) => {
    const updatedRoadmap = [...form.getValues().roadmap];
    if (!updatedRoadmap[dayIndex]) {
      updatedRoadmap[dayIndex] = { 
        day: dayIndex + 1, 
        topics: "", 
        video: "", 
        mcqs: [{ 
          question: "", 
          options: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false }
          ] 
        }] 
      };
    } else {
      updatedRoadmap[dayIndex].mcqs.push({ 
        question: "", 
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false }
        ] 
      });
    }
    
    form.setValue('roadmap', updatedRoadmap);
    setRoadmapDays(updatedRoadmap);
  };
  
  const handleDeleteDay = (event: React.MouseEvent, indexToDelete: number) => {
    // Prevent event bubbling and default behavior
    event.preventDefault();
    event.stopPropagation();

    const currentRoadmap = [...form.getValues().roadmap];
    console.log('Before deletion:', currentRoadmap);

    // Prevent deleting if it's the last day
    if (currentRoadmap.length <= 1) {
      toast.error("Cannot delete the last day. A course must have at least one day.");
      return;
    }

    try {
      // Create new array without the deleted day
      const updatedRoadmap = currentRoadmap.filter((_, index) => index !== indexToDelete);
      console.log('After deletion:', updatedRoadmap);
      
      // Update the day numbers for remaining days
      updatedRoadmap.forEach((day, index) => {
        day.day = index + 1;
      });

      // First update the local state
      setRoadmapDays(updatedRoadmap);

      // Then update the form state
      form.setValue('roadmap', updatedRoadmap, { 
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });

      console.log('Final roadmap:', form.getValues().roadmap);
      toast.success("Day deleted successfully");
    } catch (error) {
      console.error('Error deleting day:', error);
      toast.error("Failed to delete day. Please try again.");
    }
  };
  
  // Keep the roadmap state in sync with form state
  useEffect(() => {
    const currentRoadmap = form.getValues().roadmap;
    console.log('Roadmap updated:', currentRoadmap);
    if (currentRoadmap) {
      setRoadmapDays([...currentRoadmap]);
    }
  }, [form.watch('roadmap')]);
  
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
  
  const onSubmit = (data: CourseFormData) => {
    // Update course with the form data
    if (!courseId) {
      toast.error("Course ID is missing");
      return;
    }
    
    updateCourse(
      { courseId, courseData: data },
      {
        onSuccess: () => {
          toast.success("Course updated successfully!");
          navigate('/instructor/courses');
        },
        onError: (error) => {
          toast.error("Failed to update course: " + (error as Error).message);
        }
      }
    );
  };
  
  if (isLoadingCourse) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading course data...</p>
      </div>
    );
  }
  
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
        <h1 className="text-2xl font-bold">Edit Course</h1>
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
                        <Input placeholder="Enter course title" {...field} />
                      </FormControl>
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
                        <FormLabel>Make course available to students</FormLabel>
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
                    {form.getValues().skills?.map((skill, index) => (
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
                  {(!form.getValues().skills || form.getValues().skills.length === 0) && (
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
                              value={roadmapDays[index]?.topics || ""}
                              onChange={(e) => handleTopicChange(e, index)}
                              className="w-full"
                            />
                          </div>
                          
                          <div>
                            <Label className="mb-2 block">Video Upload *</Label>
                            <div className="mt-2">
                              <VideoUploader onUploadComplete={(fileInfo) => handleVideoUpload(fileInfo, index)} />
                            </div>
                            {roadmapDays[index]?.video && (
                              <div className="mt-2">
                                <Label className="text-sm text-muted-foreground">Current video:</Label>
                                <div className="text-sm break-all mt-1">{roadmapDays[index].video}</div>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              Supported formats: MP4, WebM, etc.
                            </p>
                          </div>
                          
                          <div>
                            <Label className="mb-2 block">Transcript (Optional)</Label>
                            <Textarea 
                              placeholder="Video transcript or additional notes" 
                              value={roadmapDays[index]?.transcript || ""}
                              onChange={(e) => {
                                const updatedRoadmap = [...form.getValues().roadmap];
                                if (updatedRoadmap[index]) {
                                  updatedRoadmap[index].transcript = e.target.value;
                                  form.setValue('roadmap', updatedRoadmap);
                                }
                              }}
                            />
                          </div>
                          
                          <div>
                            <Label className="mb-2 block">Notes (Optional)</Label>
                            <Textarea 
                              placeholder="Additional notes, resources, or instructions for this day" 
                              value={roadmapDays[index]?.notes || ""}
                              onChange={(e) => {
                                const updatedRoadmap = [...form.getValues().roadmap];
                                if (updatedRoadmap[index]) {
                                  updatedRoadmap[index].notes = e.target.value;
                                  form.setValue('roadmap', updatedRoadmap);
                                }
                              }}
                            />
                          </div>
                          
                          <div>
                            <Label className="mb-2 block">MCQ Questions</Label>
                            <MCQForm
                              mcqs={roadmapDays[index]?.mcqs || []}
                              onMCQChange={(updatedMCQs) => {
                                const updatedRoadmap = [...form.getValues().roadmap];
                                if (!updatedRoadmap[index]) {
                                  updatedRoadmap[index] = { 
                                    day: index + 1, 
                                    topics: "", 
                                    video: "", 
                                    mcqs: updatedMCQs 
                                  };
                                } else {
                                  updatedRoadmap[index].mcqs = updatedMCQs;
                                }
                                form.setValue('roadmap', updatedRoadmap);
                                setRoadmapDays(updatedRoadmap);
                              }}
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
                        <FormLabel>Course Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter image URL (Google Drive or direct link)" {...field} />
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
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={goToPrevious}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Updating..." : "Update Course"}
                </Button>
              </div>
            </TabsContent>
          </form>
        </Form>
      </Tabs>
    </div>
  );
};

export default EditCourse;
