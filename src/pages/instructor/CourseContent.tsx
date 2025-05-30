
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Plus, 
  GripVertical, 
  Video, 
  FileText, 
  Link,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CourseContent = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [newSection, setNewSection] = useState({ title: '', description: '' });
  const [newLesson, setNewLesson] = useState({
    title: '',
    type: 'video',
    duration: '',
    description: ''
  });

  // Mock data - replace with actual API calls
  const course = {
    id: courseId,
    title: 'Web Development Bootcamp',
    sections: [
      {
        id: 1,
        title: 'Introduction to Web Development',
        description: 'Learn the basics of web development',
        lessons: [
          {
            id: 1,
            title: 'What is Web Development?',
            type: 'video',
            duration: '15:00',
            status: 'published'
          },
          {
            id: 2,
            title: 'Setting Up Your Development Environment',
            type: 'text',
            duration: '10:00',
            status: 'draft'
          }
        ]
      },
      {
        id: 2,
        title: 'HTML Fundamentals',
        description: 'Master HTML basics',
        lessons: [
          {
            id: 3,
            title: 'HTML Structure and Elements',
            type: 'video',
            duration: '20:00',
            status: 'published'
          }
        ]
      }
    ]
  };

  const handleAddSection = () => {
    // Handle section creation
    console.log('New section:', newSection);
    setIsAddingSection(false);
    setNewSection({ title: '', description: '' });
  };

  const handleAddLesson = () => {
    // Handle lesson creation
    console.log('New lesson:', newLesson);
    setIsAddingLesson(false);
    setNewLesson({
      title: '',
      type: 'video',
      duration: '',
      description: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/instructor/courses')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>
        <h1 className="text-3xl font-bold">{course.title}</h1>
      </div>

      <div className="flex justify-end">
        <Dialog open={isAddingSection} onOpenChange={setIsAddingSection}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Section</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="section-title">Section Title</Label>
                <Input
                  id="section-title"
                  value={newSection.title}
                  onChange={(e) => setNewSection(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter section title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section-description">Description</Label>
                <Textarea
                  id="section-description"
                  value={newSection.description}
                  onChange={(e) => setNewSection(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter section description"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddingSection(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddSection}>
                  Add Section
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {course.sections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GripVertical className="w-5 h-5 text-muted-foreground" />
                  <CardTitle>{section.title}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Section
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Section
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-sm text-muted-foreground">{section.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {section.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                        {lesson.type === 'video' ? (
                          <Video className="w-5 h-5 text-primary" />
                        ) : lesson.type === 'text' ? (
                          <FileText className="w-5 h-5 text-primary" />
                        ) : (
                          <Link className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{lesson.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {lesson.duration} • {lesson.status}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Lesson
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Lesson
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}

                <Dialog open={isAddingLesson} onOpenChange={setIsAddingLesson}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Lesson
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Lesson</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="lesson-title">Lesson Title</Label>
                        <Input
                          id="lesson-title"
                          value={newLesson.title}
                          onChange={(e) => setNewLesson(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter lesson title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lesson-type">Lesson Type</Label>
                        <Select
                          value={newLesson.type}
                          onValueChange={(value) => setNewLesson(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="link">External Link</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lesson-duration">Duration (mm:ss)</Label>
                        <Input
                          id="lesson-duration"
                          value={newLesson.duration}
                          onChange={(e) => setNewLesson(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="Enter duration"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lesson-description">Description</Label>
                        <Textarea
                          id="lesson-description"
                          value={newLesson.description}
                          onChange={(e) => setNewLesson(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter lesson description"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingLesson(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleAddLesson}>
                          Add Lesson
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CourseContent;
