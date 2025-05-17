
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  PlusCircle, 
  Search, 
  Users, 
  Eye, 
  MoreVertical, 
  Edit, 
  BookOpen 
} from 'lucide-react';
import { useInstructorCourses } from '@/services/courseService';
import CourseCard from '@/components/instructor/CourseCard';
import { useToast } from '@/hooks/use-toast';

const Courses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch instructor courses
  const { data: courses = [], isLoading, error } = useInstructorCourses();
  
  // Filter courses based on search query
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCourse = () => {
    navigate('/instructor/courses/create');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <Button onClick={handleCreateCourse}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New Course
        </Button>
      </div>
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Courses Grid */}
      {isLoading ? (
        <div className="text-center py-10">Loading courses...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">
          Error loading courses. Please try again.
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          {searchQuery ? 'No courses match your search.' : 'You have not created any courses yet.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
