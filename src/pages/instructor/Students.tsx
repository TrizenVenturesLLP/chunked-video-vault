
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Search, 
  Mail, 
  MessageSquare,
  MoreVertical,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCourseStudents, useInstructorCourses, useAllCourseStudents } from '@/services/courseService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import StudentPageGuide from '@/components/instructor/StudentPageGuide';

const Students = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Fetch data based on whether we're viewing all students or a specific course
  const isAllStudents = !courseId || courseId === 'all';
  const { data: allStudentsData, isLoading: isLoadingAllStudents } = useAllCourseStudents();
  const { data: courseData, isLoading: isLoadingCourse, error: courseError } = useCourseStudents(isAllStudents ? undefined : courseId);
  const { data: instructorCourses, isLoading: isLoadingCourses } = useInstructorCourses();

  // Combine loading states
  const isLoading = isAllStudents ? isLoadingAllStudents : isLoadingCourse;
  const error = courseError;

  // Process data based on view type
  const processedData = React.useMemo(() => {
    if (isAllStudents && allStudentsData) {
      // Combine students from all courses
      return {
        id: 'all',
        title: 'All Enrolled Students',
        students: allStudentsData.reduce((allStudents, course) => {
          return [...allStudents, ...course.students.map(student => ({
            ...student,
            courseTitle: course.title
          }))];
        }, [])
      };
    }
    return courseData;
  }, [isAllStudents, allStudentsData, courseData]);
  
  // Filter students based on search and status
  const filteredStudents = React.useMemo(() => {
    if (!processedData?.students) return [];
    
    return processedData.students.filter(student => {
      // Filter by search query
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by status
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'enrolled' && ['enrolled', 'started', 'completed'].includes(student.status)) ||
        student.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [processedData, searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'enrolled':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Function to handle course selection change
  const handleCourseChange = (selectedCourseId: string) => {
    if (selectedCourseId === 'all') {
      navigate('/instructor/students');
    } else {
      navigate(`/instructor/courses/${selectedCourseId}/students`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/instructor/courses')}
            className="p-2 sm:p-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back to Courses</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>
        
        {/* Course selector */}
        <div className="w-full sm:w-auto">
          <Select 
            value={courseId || 'all'} 
            onValueChange={handleCourseChange}
            disabled={isLoadingCourses}
          >
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              {instructorCourses?.map((course) => (
                <SelectItem key={course._id} value={course._id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <h1 className="text-2xl sm:text-3xl font-bold">
        {isLoading ? 'Loading...' : processedData?.title || 'Course Students'}
      </h1>

      <StudentPageGuide />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Students</CardTitle>
              {isAllStudents && (
                <p className="text-sm text-muted-foreground mt-1">
                  Showing all students enrolled across your courses
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 mb-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="started">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="h-32 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
              <p>Loading students...</p>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>
                Failed to load students. Please try again.
              </AlertDescription>
            </Alert>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              {searchQuery || statusFilter !== 'all' 
                ? 'No students match your filters.' 
                : 'No students enrolled in this course yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    {isAllStudents && <TableHead className="hidden md:table-cell">Course</TableHead>}
                    <TableHead className="hidden sm:table-cell">Enrolled Date</TableHead>
                    <TableHead className="hidden sm:table-cell">Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={`${student.id}-${student.courseTitle || ''}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {student.email}
                          </div>
                          {/* Mobile view info */}
                          <div className="sm:hidden space-y-2 mt-2">
                            <div className="text-sm">
                              Enrolled: {new Date(student.enrolledDate).toLocaleDateString()}
                            </div>
                            <div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                                <div
                                  className="bg-primary h-2.5 rounded-full"
                                  style={{ width: `${student.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                Progress: {student.progress}%
                              </span>
                            </div>
                            {isAllStudents && (
                              <div className="text-sm text-muted-foreground">
                                Course: {student.courseTitle}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      {isAllStudents && <TableCell className="hidden md:table-cell">{student.courseTitle}</TableCell>}
                      <TableCell className="hidden sm:table-cell">{new Date(student.enrolledDate).toLocaleDateString()}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-primary h-2.5 rounded-full"
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {student.progress}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${getStatusColor(student.status)} whitespace-nowrap`}
                        >
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{student.lastActive}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Mail className="w-4 h-4 mr-2" />
                              <span className="hidden sm:inline">Send Email</span>
                              <span className="sm:hidden">Email</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              <span className="hidden sm:inline">Send Message</span>
                              <span className="sm:hidden">Message</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Students;
