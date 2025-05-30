import { useNavigate } from 'react-router-dom';
import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  BookOpen,
  Users,
  BarChart2,
  Calendar,
  Video,
  CheckSquare,
  FileText,
  Award,
  MessageSquare,
  Lightbulb,
  HelpCircle,
  Zap,
  Settings
} from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const InstructorGuidelines = () => {
  const guidelinesRef = useRef<HTMLDivElement>(null);
  
  const handleDownloadPDF = () => {
    // Create a new window
    const printWindow = window.open('', '_blank');
    if (!printWindow || !guidelinesRef.current) return;
    
    // Clone the node to avoid modifying the actual DOM
    const contentClone = guidelinesRef.current.cloneNode(true) as HTMLElement;
    
    // Find all tab contents in the clone and make them visible
    const tabContents = contentClone.querySelectorAll('[role="tabpanel"]');
    tabContents.forEach(tabContent => {
      // Override the hidden attribute and display style
      (tabContent as HTMLElement).style.display = 'block';
      (tabContent as HTMLElement).hidden = false;
      (tabContent as HTMLElement).removeAttribute('hidden');
      (tabContent as HTMLElement).setAttribute('data-state', 'active');
    });
    
    // Remove the tab triggers as they're not needed in the PDF
    const tabTriggers = contentClone.querySelectorAll('[role="tablist"]');
    tabTriggers.forEach(tabList => {
      tabList.parentNode?.removeChild(tabList);
    });
    
    // Get the modified HTML content
    const content = contentClone.innerHTML;
    
    // Add some styling to make it look better for printing
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Instructor Guidelines</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              padding: 20px;
              max-width: 1000px;
              margin: 0 auto;
            }
            h1 {
              color: #3F2B96;
              font-size: 28px;
              margin-bottom: 20px;
              text-align: center;
              padding-bottom: 10px;
              border-bottom: 2px solid #3F2B96;
            }
            h2, h3, h4 {
              color: #3F2B96;
              margin-top: 20px;
            }
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            ul, ol {
              margin-left: 20px;
            }
            li {
              margin-bottom: 8px;
            }
            .tip {
              background-color: #f0f0ff;
              border-left: 4px solid #3F2B96;
              padding: 10px;
              margin: 15px 0;
            }
            [data-state="active"] {
              display: block !important;
            }
            .section-title {
              background-color: #3F2B96;
              color: white;
              padding: 10px 15px;
              margin-top: 30px;
              margin-bottom: 15px;
              font-size: 18px;
              font-weight: bold;
              border-radius: 4px;
              page-break-before: always;
            }
            .section-content {
              padding: 0 10px;
            }
            @media print {
              body {
                padding: 0;
              }
              button, [role="tab"], [role="tablist"] {
                display: none !important;
              }
              [role="tabpanel"] {
                display: block !important;
                visibility: visible !important;
                height: auto !important;
                overflow: visible !important;
              }
              .section-title {
                page-break-before: always;
              }
            }
          </style>
        </head>
        <body>
          <h1>Instructor Guidelines</h1>
          
          <div class="section-title">1. Getting Started</div>
          <div class="section-content">
            ${tabContents[0]?.innerHTML || ''}
          </div>
          
          <div class="section-title">2. Creating Courses</div>
          <div class="section-content">
            ${tabContents[1]?.innerHTML || ''}
          </div>
          
          <div class="section-title">3. Teaching Techniques</div>
          <div class="section-content">
            ${tabContents[2]?.innerHTML || ''}
          </div>
          
          <div class="section-title">4. Student Management</div>
          <div class="section-content">
            ${tabContents[3]?.innerHTML || ''}
          </div>
          
          <div class="section-title">5. Best Practices</div>
          <div class="section-content">
            ${tabContents[4]?.innerHTML || ''}
          </div>
        </body>
      </html>
    `;
    
    // Write to the new window
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      // The user can save as PDF from the print dialog
    };
  };
  
  return (
    <div className="m-0 p-0">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
          <Lightbulb className="w-8 h-8 mr-2 text-[#3F2B96]" />
          Instructor Guidelines
        </h1>
        <Button 
          className="w-full sm:w-auto mt-4 sm:mt-0 bg-[#3F2B96] hover:bg-[#5b44ad] text-white"
          onClick={handleDownloadPDF}
        >
          <FileText className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>
      
      <Alert className="flex items-start space-x-2 border-[#3F2B96]/20 bg-[#3F2B96]/5 mt-4">
        <HelpCircle className="h-4 w-4 text-[#3F2B96]" />
        <div>
          <AlertTitle>Comprehensive Guide</AlertTitle>
          <AlertDescription>
            This page provides detailed instructions and best practices for being an effective instructor on our platform.
          </AlertDescription>
        </div>
      </Alert>
      
      <div ref={guidelinesRef}>
        <Tabs defaultValue="getting-started" className="space-y-4 mt-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-16 bg-[#3F2B96]/10">
            <TabsTrigger value="getting-started" className="data-[state=active]:bg-[#3F2B96] data-[state=active]:text-white">Getting Started</TabsTrigger>
            <TabsTrigger value="creating-courses" className="data-[state=active]:bg-[#3F2B96] data-[state=active]:text-white">Creating Courses</TabsTrigger>
            <TabsTrigger value="teaching" className="data-[state=active]:bg-[#3F2B96] data-[state=active]:text-white">Teaching</TabsTrigger>
            <TabsTrigger value="student-management" className="data-[state=active]:bg-[#3F2B96] data-[state=active]:text-white">Student Management</TabsTrigger>
            <TabsTrigger value="best-practices" className="data-[state=active]:bg-[#3F2B96] data-[state=active]:text-white">Best Practices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="getting-started">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Getting Started as an Instructor</CardTitle>
              <CardDescription>
                Follow these steps to begin your teaching journey on our platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                      <div className="bg-[#3F2B96] text-white rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">1</div>
                    <div>
                      <h3 className="font-semibold text-lg">Complete Your Profile</h3>
                      <p className="text-muted-foreground">
                        A complete profile builds credibility with students. Add your professional experience, 
                        qualifications, teaching philosophy, and a high-quality profile photo.
                      </p>
                        <div className="mt-2 bg-[#3F2B96]/5 border border-[#3F2B96]/20 p-3 rounded-md">
                          <p className="text-sm font-medium text-[#3F2B96]">Pro Tip</p>
                        <p className="text-sm">Focus on credentials relevant to what you'll be teaching.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                      <div className="bg-[#3F2B96] text-white rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">2</div>
                    <div>
                      <h3 className="font-semibold text-lg">Choose Your Teaching Area</h3>
                      <p className="text-muted-foreground">
                        Select topics where you have expertise and passion. Your enthusiasm will come through in your teaching.
                      </p>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="border border-[#3F2B96]/20 rounded-md p-2">
                            <h4 className="text-sm font-medium text-[#3F2B96]">What you know well</h4>
                          <p className="text-xs text-muted-foreground">Topics where you have formal training or extensive experience</p>
                        </div>
                          <div className="border border-[#3F2B96]/20 rounded-md p-2">
                            <h4 className="text-sm font-medium text-[#3F2B96]">What you're passionate about</h4>
                          <p className="text-xs text-muted-foreground">Subjects you enjoy discussing and teaching</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                      <div className="bg-[#3F2B96] text-white rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">3</div>
                    <div>
                      <h3 className="font-semibold text-lg">Understand Platform Tools</h3>
                      <p className="text-muted-foreground">
                        Familiarize yourself with our course creation tools, student management features, 
                        and analytics dashboard before you start building your first course.
                      </p>
                      <div className="mt-2 flex flex-col gap-4">
                          <Button variant="outline" size="sm" className="w-full border-[#3F2B96] text-[#3F2B96] hover:bg-[#3F2B96]/5">
                          Watch Tutorial
                        </Button>
                          <Button variant="outline" size="sm" className="w-full border-[#3F2B96] text-[#3F2B96] hover:bg-[#3F2B96]/5">
                          Join Webinar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="creating-courses">
          <Card>
            <CardHeader>
              <CardTitle>Creating Effective Courses</CardTitle>
              <CardDescription>
                Learn how to design, build, and publish engaging educational content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="course-structure">
                  <AccordionTrigger>Course Structure and Organization</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>A well-structured course helps students progress logically through the material:</p>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Recommended Structure</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Introduction module that sets expectations and previews content</li>
                        <li>Core content organized in logical modules (4-10 modules recommended)</li>
                        <li>Each module should contain 3-7 lessons focused on specific learning objectives</li>
                        <li>Mix of content types: video lectures, reading materials, exercises, quizzes</li>
                        <li>Conclusion module with summary and next steps</li>
                      </ul>
                    </div>
                    
                    <div className="bg-muted p-4 rounded-md">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                        Example Course Structure
                      </h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Welcome and Course Overview (2-3 short lessons)</li>
                        <li>Fundamentals (5-6 core concept lessons)</li>
                        <li>Intermediate Techniques (4-5 more advanced lessons)</li>
                        <li>Practical Applications (3-4 real-world examples)</li>
                        <li>Advanced Topics (3-4 specialized lessons)</li>
                        <li>Final Project or Assessment</li>
                        <li>Conclusion and Further Resources</li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="content-creation">
                  <AccordionTrigger>Creating Engaging Content</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Video Best Practices</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Keep videos concise (5-10 minutes per topic is ideal)</li>
                        <li>Ensure good lighting and clear audio</li>
                        <li>Use visual aids to illustrate complex concepts</li>
                        <li>Speak clearly and maintain an enthusiastic tone</li>
                        <li>Include captions for accessibility</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Written Materials</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Provide downloadable resources (PDF guides, workbooks)</li>
                        <li>Format text for readability with headings, bullet points</li>
                        <li>Include diagrams and images to support learning</li>
                        <li>Offer cheat sheets and quick reference guides</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Interactive Elements</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Incorporate quizzes after each module</li>
                        <li>Design practical exercises that apply concepts</li>
                        <li>Create discussion prompts for student engagement</li>
                        <li>Include projects that build throughout the course</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="publishing">
                  <AccordionTrigger>Publishing and Promoting Your Course</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Pre-Launch Checklist</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Review all content for accuracy and completeness</li>
                        <li>Test all links, downloads, and interactive elements</li>
                        <li>Verify that videos play correctly</li>
                        <li>Proofread all written materials</li>
                        <li>Check that assessments are functioning properly</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Course Promotion Strategies</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Craft a compelling course description highlighting key benefits</li>
                        <li>Create a professional course thumbnail image</li>
                        <li>Share previews on your social media channels</li>
                        <li>Offer a limited-time launch discount</li>
                        <li>Ask colleagues to review and share your course</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="teaching">
          <Card>
            <CardHeader>
              <CardTitle>Effective Teaching Techniques</CardTitle>
              <CardDescription>
                Strategies for engaging students and delivering high-quality education.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Award className="w-5 h-5 text-yellow-500 mr-3 mt-1" />
                    <div>
                      <h3 className="font-medium text-lg">Instructional Methods</h3>
                      <p className="text-muted-foreground text-sm">
                        Mix different teaching approaches to accommodate various learning styles:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                        <li>Visual demonstrations for visual learners</li>
                        <li>Detailed explanations for auditory learners</li>
                        <li>Hands-on exercises for kinesthetic learners</li>
                        <li>Case studies for contextual learners</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MessageSquare className="w-5 h-5 text-blue-500 mr-3 mt-1" />
                    <div>
                      <h3 className="font-medium text-lg">Communication Skills</h3>
                      <p className="text-muted-foreground text-sm">
                        Effective communication is key to successful teaching:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                        <li>Speak clearly and at an appropriate pace</li>
                        <li>Use concrete examples to illustrate abstract concepts</li>
                        <li>Check for understanding frequently</li>
                        <li>Ask open-ended questions to promote critical thinking</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-green-500 mr-3 mt-1" />
                    <div>
                      <h3 className="font-medium text-lg">Building Community</h3>
                      <p className="text-muted-foreground text-sm">
                        Create a supportive learning environment:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                        <li>Encourage discussion and peer learning</li>
                        <li>Recognize and celebrate student achievements</li>
                        <li>Create opportunities for collaboration</li>
                        <li>Be responsive to questions and concerns</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Settings className="w-5 h-5 text-purple-500 mr-3 mt-1" />
                    <div>
                      <h3 className="font-medium text-lg">Technical Setup</h3>
                      <p className="text-muted-foreground text-sm">
                        Ensure your teaching environment is professional:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                        <li>Use a high-quality camera and microphone</li>
                        <li>Ensure proper lighting for video content</li>
                        <li>Minimize background noise and distractions</li>
                        <li>Test all equipment before live sessions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <Alert className="bg-blue-50 border-blue-200">
                <Lightbulb className="h-4 w-4 text-blue-500" />
                <AlertTitle>Teaching Tip</AlertTitle>
                <AlertDescription>
                  Research shows that students learn best when material is chunked into manageable segments with practice opportunities between concepts. Consider breaking long lessons into shorter, focused units.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="student-management">
          <Card>
            <CardHeader>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>
                Tools and strategies for monitoring student progress and providing support.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg flex items-center">
                    <Users className="w-5 h-5 mr-2 text-primary" />
                    Student Dashboard Overview
                  </h3>
                  <p className="text-muted-foreground">
                    The Students page provides comprehensive tools to track and support your students:
                  </p>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium text-sm mb-2">Course Selection</h4>
                      <p className="text-sm text-muted-foreground">
                        Use the dropdown menu at the top to quickly switch between your courses and view student data for each one.
                      </p>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium text-sm mb-2">Progress Tracking</h4>
                      <p className="text-sm text-muted-foreground">
                        Monitor individual student progress through visual progress bars showing percentage of course completion.
                      </p>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium text-sm mb-2">Student Filtering</h4>
                      <p className="text-sm text-muted-foreground">
                        Filter students by name, email, or status (Active, Completed, Inactive) to quickly find who you're looking for.
                      </p>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium text-sm mb-2">Direct Communication</h4>
                      <p className="text-sm text-muted-foreground">
                        Contact students directly via email or in-platform messaging for personalized support and feedback.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg flex items-center">
                    <CheckSquare className="w-5 h-5 mr-2 text-green-500" />
                    Best Practices for Student Support
                  </h3>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-100 text-green-800 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0">1</div>
                      <div>
                        <h4 className="font-medium">Regular Communication</h4>
                        <p className="text-sm text-muted-foreground">
                          Send weekly updates or check-ins to keep students engaged and motivated throughout the course.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-100 text-green-800 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0">2</div>
                      <div>
                        <h4 className="font-medium">Prompt Feedback</h4>
                        <p className="text-sm text-muted-foreground">
                          Aim to respond to student questions within 24-48 hours. Timely feedback helps maintain momentum.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-100 text-green-800 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0">3</div>
                      <div>
                        <h4 className="font-medium">Proactive Intervention</h4>
                        <p className="text-sm text-muted-foreground">
                          Reach out to students who show signs of disengagement or falling behind to offer additional support.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-100 text-green-800 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0">4</div>
                      <div>
                        <h4 className="font-medium">Celebrate Achievements</h4>
                        <p className="text-sm text-muted-foreground">
                          Acknowledge milestones and completion with congratulatory messages to reinforce positive learning behavior.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="best-practices">
          <Card>
            <CardHeader>
              <CardTitle>Instructor Best Practices</CardTitle>
              <CardDescription>
                Tips and strategies from our top-performing instructors.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-2 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                      Course Design
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckSquare className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                        <span>Create a clear learning path with step-by-step progression</span>
                      </li>
                      <li className="flex items-start">
                        <CheckSquare className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                        <span>Include practical, real-world examples and applications</span>
                      </li>
                      <li className="flex items-start">
                        <CheckSquare className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                        <span>Design assignments that build skills progressively</span>
                      </li>
                      <li className="flex items-start">
                        <CheckSquare className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                        <span>Update course content regularly to keep it current</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Video className="w-5 h-5 mr-2 text-blue-500" />
                      Content Delivery
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckSquare className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                        <span>Speak with enthusiasm and vary your vocal tone</span>
                      </li>
                      <li className="flex items-start">
                        <CheckSquare className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                        <span>Use storytelling to make concepts memorable</span>
                      </li>
                      <li className="flex items-start">
                        <CheckSquare className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                        <span>Break complex topics into digestible chunks</span>
                      </li>
                      <li className="flex items-start">
                        <CheckSquare className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                        <span>Provide downloadable resources and cheat sheets</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Users className="w-5 h-5 mr-2 text-purple-500" />
                      Student Engagement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckSquare className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                        <span>Respond to questions and discussions promptly</span>
                      </li>
                      <li className="flex items-start">
                        <CheckSquare className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                        <span>Host regular live Q&A sessions or office hours</span>
                      </li>
                      <li className="flex items-start">
                        <CheckSquare className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                        <span>Create a community space for peer interaction</span>
                      </li>
                      <li className="flex items-start">
                        <CheckSquare className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                        <span>Share student success stories as motivation</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default InstructorGuidelines;
