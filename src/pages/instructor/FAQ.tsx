import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  Users, 
  Video, 
  FileText,
  Settings,
  MessageSquare,
  Star,
  Layers,
  Shield,
  PenTool,
  Clock
} from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const FAQ = () => {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
      </div>
      
      <Alert className="border-[#3F2B96]/20 bg-[#3F2B96]/5">
        <HelpCircle className="h-4 w-4 text-[#3F2B96]" />
        <AlertTitle className="text-[#3F2B96]">FAQ Section</AlertTitle>
        <AlertDescription>
          Here are some common questions and answers to help you.
        </AlertDescription>
      </Alert>

      <Accordion type="single" collapsible>
        <AccordionItem value="question1">
          <AccordionTrigger className="text-[#3F2B96] hover:text-[#3F2B96]">What is the purpose of this platform?</AccordionTrigger>
          <AccordionContent>
            <p>This platform is designed to help instructors create and manage their courses effectively.</p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="question2">
          <AccordionTrigger className="text-[#3F2B96] hover:text-[#3F2B96]">How can I create a course?</AccordionTrigger>
          <AccordionContent>
            <p>You can create a course by following the steps outlined in the "Getting Started" section.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="question3">
          <AccordionTrigger className="text-[#3F2B96] hover:text-[#3F2B96]">What resources are available for instructors?</AccordionTrigger>
          <AccordionContent>
            <p>We offer various resources, including templates, guides, and webinars to support your teaching.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input 
          placeholder="Search all FAQs..." 
          className="w-full pl-10 py-6 text-lg border-[#3F2B96]/20 focus-visible:ring-[#3F2B96]"
        />
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-16 bg-[#3F2B96]/10">
          <TabsTrigger value="general" className="data-[state=active]:bg-[#3F2B96] data-[state=active]:text-white">General</TabsTrigger>
          <TabsTrigger value="courses" className="data-[state=active]:bg-[#3F2B96] data-[state=active]:text-white">Courses</TabsTrigger>
          <TabsTrigger value="students" className="data-[state=active]:bg-[#3F2B96] data-[state=active]:text-white">Students</TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-[#3F2B96] data-[state=active]:text-white">Content</TabsTrigger>
          <TabsTrigger value="technical" className="data-[state=active]:bg-[#3F2B96] data-[state=active]:text-white">Technical</TabsTrigger>
        </TabsList>
        
        {/* General FAQs Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="w-5 h-5 mr-2 text-[#3F2B96]" />
                General Questions
              </CardTitle>
              <CardDescription>
                Basic information about the instructor platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="general-1">
                  <AccordionTrigger className="text-[#3F2B96] hover:text-[#3F2B96]">What are the requirements to become an instructor?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">To become an instructor on our platform, you need:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Expertise in your subject area (demonstrated through credentials or experience)</li>
                      <li>Ability to create high-quality educational content</li>
                      <li>Good communication skills in English</li>
                      <li>Basic technical skills for recording videos and uploading content</li>
                      <li>Commitment to supporting student learning</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">After applying, our team reviews your application, which typically takes 5-7 business days.</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="general-2">
                  <AccordionTrigger className="text-[#3F2B96] hover:text-[#3F2B96]">How much time should I dedicate to being an instructor?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">The time commitment varies depending on:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Course creation: 20-40 hours per course (varies by length and complexity)</li>
                      <li>Student support: 2-5 hours per week (depends on enrollment numbers)</li>
                      <li>Course maintenance: 1-2 hours per week for updates and improvements</li>
                      <li>Administrative tasks: 1 hour per week</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">Many instructors start with one course while maintaining other professional commitments, and gradually expand their course offerings as they build their student base.</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="general-3">
                  <AccordionTrigger className="text-[#3F2B96] hover:text-[#3F2B96]">What support does the platform provide to instructors?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">We provide comprehensive support including:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Course creation tools and templates</li>
                      <li>Technical support for the platform</li>
                      <li>Marketing assistance to help promote your courses</li>
                      <li>Student management tools</li>
                      <li>Payment processing and analytics</li>
                      <li>Professional development resources and webinars</li>
                      <li>Dedicated instructor success team</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="general-4">
                  <AccordionTrigger className="text-[#3F2B96] hover:text-[#3F2B96]">Can I teach on other platforms simultaneously?</AccordionTrigger>
                  <AccordionContent>
                    <p>Yes, you can teach on multiple platforms. However, we have the following guidelines:</p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>Courses on our platform should not be exact duplicates of courses elsewhere</li>
                      <li>You should be able to maintain quality student support across all platforms</li>
                      <li>Any exclusive promotional offers should be honored</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">Many instructors find that tailoring content to each platform's audience leads to better engagement and success.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Courses FAQs Tab */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-[#3F2B96]" />
                Course Creation & Management
              </CardTitle>
              <CardDescription>
                Information about creating and managing your courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="courses-1">
                  <AccordionTrigger className="text-[#3F2B96] hover:text-[#3F2B96]">How do I create my first course?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">To create your first course:</p>
                    <ol className="list-decimal list-inside space-y-1 mb-2">
                      <li>Navigate to the "Courses" section from your dashboard</li>
                      <li>Click the "Create Course" button in the top right</li>
                      <li>Fill in the course details (title, description, category, etc.)</li>
                      <li>Upload a course thumbnail image</li>
                      <li>Set your course pricing</li>
                      <li>Click "Save" to create the course shell</li>
                    </ol>
                    <p className="text-sm text-muted-foreground">After creating the course, you'll be directed to add modules and lessons.</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="courses-2">
                  <AccordionTrigger className="text-[#3F2B96] hover:text-[#3F2B96]">What should I include in my course description?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">An effective course description should include:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Clear explanation of what students will learn</li>
                      <li>Target audience (who the course is designed for)</li>
                      <li>Prerequisites or required knowledge</li>
                      <li>Course structure and format</li>
                      <li>Estimated time to complete</li>
                      <li>Tangible outcomes or skills gained</li>
                      <li>Your qualifications as an instructor</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">Use bullet points for readability and highlight the most compelling benefits early in the description.</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="courses-3">
                  <AccordionTrigger className="text-[#3F2B96] hover:text-[#3F2B96]">How long should my course be?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Course length depends on your subject matter, but some guidelines:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Mini-courses: 30-60 minutes of content in 5-10 lessons</li>
                      <li>Standard courses: 1-3 hours of content in 10-25 lessons</li>
                      <li>Comprehensive courses: 3+ hours of content in 25+ lessons</li>
                    </ul>
                    <p className="mt-2">For video content specifically:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Keep individual videos concise (5-10 minutes is ideal)</li>
                      <li>Break complex topics into multiple shorter videos</li>
                      <li>Include text summaries and supplementary materials</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">Focus on quality over quantity – it's better to have concise, high-quality content than lengthy but less engaging material.</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="courses-4">
                  <AccordionTrigger className="text-[#3F2B96] hover:text-[#3F2B96]">Can I update my course after publishing?</AccordionTrigger>
                  <AccordionContent>
                    <p>Yes, you can update your course at any time. We actually encourage regular updates to keep content fresh and valuable.</p>
                    <p className="mt-2">You can make the following changes to published courses:</p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>Add, remove, or reorder modules and lessons</li>
                      <li>Update existing video or text content</li>
                      <li>Add new assignments or quizzes</li>
                      <li>Modify course details (title, description, thumbnail)</li>
                      <li>Adjust pricing</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">Students who have already enrolled will automatically see your updates. For significant updates, consider notifying students through a course announcement.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Students FAQs Tab */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-[#3F2B96]" />
                Student Management
              </CardTitle>
              <CardDescription>
                Managing student enrollment, engagement, and communication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="students-1">
                  <AccordionTrigger className="text-[#3F2B96] hover:text-[#3F2B96]">How do I communicate with my students?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">You have several options for communicating with students:</p>
                    <ul className="list-disc list-inside space-y-1 mb-2">
                      <li>Course announcements - reach all enrolled students at once</li>
                      <li>Direct messaging - contact individual students from the Students page</li>
                      <li>Discussion forums - interact with students in course-specific forums</li>
                      <li>Live sessions - schedule and host video calls with your students</li>
                      <li>Feedback on assignments - provide personalized feedback on submitted work</li>
                    </ul>
                    <p className="text-sm text-muted-foreground">We recommend using course announcements for important updates that all students should see, and direct messaging for individualized support.</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="students-2">
                  <AccordionTrigger className="text-[#3F2B96] hover:text-[#3F2B96]">How do I track student progress?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Our platform provides several tools to track student progress:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Student Dashboard - shows completion percentage and last activity for all enrolled students</li>
                      <li>Individual Progress Reports - detailed view of a specific student's activity</li>
                      <li>Content Engagement Analytics - shows which lessons students spend the most time on</li>
                      <li>Assessment Results - displays scores and completion rates for quizzes and assignments</li>
                      <li>Completion Certificates - automatically issued when students complete all required components</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">The analytics dashboard also allows you to identify potential drop-off points where students might be struggling.</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="students-3">
                  <AccordionTrigger className="text-[#3F2B96] hover:text-[#3F2B96]">How can I increase student engagement?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Successful strategies to boost student engagement include:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Send regular course announcements (weekly updates work well)</li>
                      <li>Respond to questions promptly (aim for 24 hours maximum)</li>
                      <li>Create interactive content like polls, quizzes, and discussion prompts</li>
                      <li>Host live Q&A sessions or office hours</li>
                      <li>Recognize student achievements and highlight success stories</li>
                      <li>Break content into manageable chunks with clear learning objectives</li>
                      <li>Include practical, real-world exercises and examples</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">Consistency is key – regular interaction shows students you're invested in their success.</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="students-4">
                  <AccordionTrigger className="text-[#3F2B96] hover:text-[#3F2B96]">How should I handle difficult students or negative feedback?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">When dealing with challenging situations:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Respond promptly but take time to compose a thoughtful reply</li>
                      <li>Address legitimate concerns with specific solutions</li>
                      <li>Keep communication professional regardless of the student's tone</li>
                      <li>For extremely difficult cases, contact platform support for mediation</li>
                    </ol>
                    <p className="mt-2">For negative reviews specifically:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Thank the student for their feedback</li>
                      <li>Address specific issues and explain how you'll improve</li>
                      <li>Avoid defensive responses or arguments</li>
                      <li>If appropriate, offer additional help or resources</li>
                      <li>For inaccurate or abusive reviews, contact platform support</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Content FAQs Tab */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-[#3F2B96]" />
                Course Content
              </CardTitle>
              <CardDescription>
                Creating and managing course content and materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="content-1">
                  <AccordionTrigger className="text-[#3F2B96] hover:text-[#3F2B96]">What file types can I upload for course content?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Supported file types include:</p>
                    <ul className="list-disc list-inside grid grid-cols-1 md:grid-cols-2 gap-1 mb-2">
                      <li>Videos: MP4, MOV, AVI (max 2GB)</li>
                      <li>Images: JPG, PNG, GIF (max 10MB)</li>
                      <li>Documents: PDF, DOCX, PPTX (max 50MB)</li>
                      <li>Audio: MP3, WAV (max 500MB)</li>
                      <li>Code files: ZIP, GitHub repositories</li>
                      <li>Spreadsheets: XLSX, CSV</li>
                    </ul>
                    <p className="text-sm text-muted-foreground">For video content, we recommend using our native video player for best performance and analytics tracking.</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="content-2">
                  <AccordionTrigger className="text-[#3F2B96] hover:text-[#3F2B96]">How do I create and grade assignments?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">To create assignments:</p>
                    <ol className="list-decimal list-inside space-y-1 mb-2">
                      <li>Navigate to the module where you want to add an assignment</li>
                      <li>Click "Add Content" and select "Assignment"</li>
                      <li>Define requirements, instructions, and submission types</li>
                      <li>Set point value and due dates if applicable</li>
                      <li>Save the assignment</li>
                    </ol>
                    <p className="mb-2">For grading:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Go to the "Assignments" tab in your instructor dashboard</li>
                      <li>View pending submissions</li>
                      <li>Review student work and provide a score and feedback</li>
                      <li>Submit grades which will be automatically added to student records</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="content-3">
                  <AccordionTrigger className="text-[#3F2B96] hover:text-[#3F2B96]">What equipment do I need to create video content?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Basic equipment requirements:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Camera: A good webcam (1080p), smartphone camera, or DSLR is sufficient</li>
                      <li>Microphone: A dedicated USB microphone is strongly recommended for clear audio</li>
                      <li>Lighting: Simple ring light or natural light from a window</li>
                      <li>Background: Clean, professional background or simple backdrop</li>
                      <li>Screen recording: Software like OBS (free), Camtasia, or Screenflow</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">Audio quality is often more important than video quality. Invest in a decent microphone before upgrading your camera.</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="content-4">
                  <AccordionTrigger className="text-[#3F2B96] hover:text-[#3F2B96]">Can I use copyrighted materials in my course?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">You must have proper rights to all content used in your courses. Here are the guidelines:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Original content: You can use content you've created yourself</li>
                      <li>Licensed content: You must have proper licenses for any third-party content</li>
                      <li>Fair use: Limited use of copyrighted material may qualify as fair use for educational purposes, but this has strict limitations</li>
                    </ul>
                    <p className="mt-2">Acceptable sources for content:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Creative Commons licensed materials (with proper attribution)</li>
                      <li>Purchased stock photos, videos, music with proper licenses</li>
                      <li>Public domain materials</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">When in doubt, create your own materials or get written permission from copyright holders.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Technical FAQs Tab */}
        <TabsContent value="technical">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2 text-[#3F2B96]" />
                Technical Support
              </CardTitle>
              <CardDescription>
                Technical issues, platform features, and troubleshooting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="tech-1">
                  <AccordionTrigger className="text-[#3F2B96] hover:text-[#3F2B96]">Why are my videos taking too long to upload?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Several factors can affect video upload speed:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Internet connection: Upload speeds are typically slower than download speeds</li>
                      <li>File size: Larger videos take longer to upload</li>
                      <li>File format: Some formats are more efficient than others</li>
                      <li>Server traffic: During peak times, uploads may be slower</li>
                    </ul>
                    <p className="mt-2">Recommendations to improve upload speed:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Compress videos before uploading (aim for 720p or 1080p resolution)</li>
                      <li>Use MP4 format with H.264 encoding for best results</li>
                      <li>Use a wired internet connection instead of WiFi if possible</li>
                      <li>Upload during off-peak hours</li>
                      <li>Split very large videos into smaller segments</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="tech-2">
                  <AccordionTrigger className="text-[#3F2B96] hover:text-[#3F2B96]">How can I improve video playback quality for students?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">To ensure the best video playback experience:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Record in high quality (1080p recommended, 720p minimum)</li>
                      <li>Use proper lighting to avoid shadows or glare</li>
                      <li>Ensure clear audio with minimal background noise</li>
                      <li>Use our native video player rather than external links</li>
                      <li>Keep videos under 30 minutes for better streaming performance</li>
                      <li>Maintain aspect ratio of 16:9 for optimal display</li>
                    </ul>
                    <p className="mt-2">Recommended video specifications:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Format: MP4 with H.264 codec</li>
                      <li>Audio: AAC codec, 44.1kHz or 48kHz</li>
                      <li>Frame rate: 24, 30, or 60 fps</li>
                      <li>Bitrate: 2-5 Mbps for 1080p</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="tech-3">
                  <AccordionTrigger className="text-[#3F2B96] hover:text-[#3F2B96]">How do I embed external resources in my course?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">You can embed various external resources:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>In the lesson editor, click "Embed Content" or the "+" icon</li>
                      <li>Select the type of content to embed (website, YouTube, Google Docs, etc.)</li>
                      <li>Paste the URL or embed code</li>
                      <li>Adjust display settings if needed</li>
                      <li>Save your changes</li>
                    </ol>
                    <p className="mt-2">Supported platforms for embedding include:</p>
                    <ul className="list-disc list-inside grid grid-cols-2 gap-1">
                      <li>YouTube</li>
                      <li>Vimeo</li>
                      <li>Google Docs</li>
                      <li>Google Slides</li>
                      <li>Google Sheets</li>
                      <li>GitHub Gists</li>
                      <li>Figma</li>
                      <li>Canva</li>
                      <li>Kahoot</li>
                      <li>CodePen</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">When embedding external content, ensure it's accessible to students and doesn't require additional logins when possible.</p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="tech-4">
                  <AccordionTrigger className="text-[#3F2B96] hover:text-[#3F2B96]">What browsers and devices are supported?</AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-2">Our platform supports these browsers (latest two versions):</p>
                    <ul className="list-disc list-inside grid grid-cols-2 gap-1">
                      <li>Google Chrome</li>
                      <li>Mozilla Firefox</li>
                      <li>Safari</li>
                      <li>Microsoft Edge</li>
                      <li>Opera</li>
                    </ul>
                    <p className="mt-2">Supported devices:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Desktop/laptop computers (Windows, macOS, Linux)</li>
                      <li>Tablets (iPad, Android tablets)</li>
                      <li>Smartphones (iPhone, Android phones)</li>
                    </ul>
                    <p className="mt-2">For the best experience when creating courses, we recommend:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Using a desktop or laptop computer</li>
                      <li>Google Chrome or Mozilla Firefox browser</li>
                      <li>A stable internet connection (10+ Mbps)</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Can't find what you're looking for?</CardTitle>
          <CardDescription>
            Our support team is here to help with any additional questions
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <Button className="flex-1" variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
          
        </CardContent>
        <CardFooter className="border-t pt-6 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 mr-2" /> 
          Our support team typically responds within 24 hours during business days
        </CardFooter>
      </Card>
    </div>
  );
};

export default FAQ;
