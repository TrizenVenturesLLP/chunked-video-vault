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
  UserCircle2,
  Activity,
  CalendarDays,
  Filter,
  RefreshCcw,
  Download
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useInstructorCourses, useEnrolledUsers } from '@/services/courseService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import StudentPageGuide from '@/components/instructor/StudentPageGuide';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Students = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTab, setSelectedTab] = useState('all');
  
  // Fetch course and enrollment data
  const { data: instructorCourses, isLoading: isLoadingCourses } = useInstructorCourses();
  const { 
    data: enrollmentData, 
    isLoading: isLoadingEnrollments,
    error: enrollmentError,
    refetch: refetchEnrollments
  } = useEnrolledUsers(courseId);

  // Get current course details
  const currentCourse = instructorCourses?.find(c => c._id === courseId);
  
  // Filter enrolled users based on search, status and tab
  const filteredStudents = React.useMemo(() => {
    if (!enrollmentData?.enrolledUsers) return [];
    
    return enrollmentData.enrolledUsers.filter(enrollment => {
      // Filter by search query
      const matchesSearch = 
        enrollment.userId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enrollment.userId.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by status
      const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
      
      // Filter by tab
      const matchesTab = selectedTab === 'all' || 
        (selectedTab === 'active' && enrollment.status === 'started') ||
        (selectedTab === 'completed' && enrollment.status === 'completed') ||
        (selectedTab === 'inactive' && enrollment.status === 'enrolled');
      
      return matchesSearch && matchesStatus && matchesTab;
    });
  }, [enrollmentData, searchQuery, statusFilter, selectedTab]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'started':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'enrolled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  // Function to handle course selection change
  const handleCourseChange = (selectedCourseId: string) => {
      navigate(`/instructor/courses/${selectedCourseId}/students`);
  };

  // Calculate course statistics
  const courseStats = React.useMemo(() => {
    if (!enrollmentData?.enrolledUsers?.length) return {
      totalEnrolled: 0,
      avgProgress: 0,
      avgDaysCompleted: 0,
      activeStudents: 0,
      completedStudents: 0
    };
    
    const totalEnrolled = enrollmentData.enrolledUsers.length;
    const avgProgress = Math.round(
      enrollmentData.enrolledUsers.reduce((acc, user) => acc + (user.progress || 0), 0) / totalEnrolled
    );
    const avgDaysCompleted = Math.round(
      enrollmentData.enrolledUsers.reduce((acc, user) => acc + (user.completedDays?.length || 0), 0) / totalEnrolled
    );
    const activeStudents = enrollmentData.enrolledUsers.filter(u => u.status === 'started').length;
    const completedStudents = enrollmentData.enrolledUsers.filter(u => u.status === 'completed').length;

    return { totalEnrolled, avgProgress, avgDaysCompleted, activeStudents, completedStudents };
  }, [enrollmentData]);

  if (isLoadingCourses || isLoadingEnrollments) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading students...</span>
      </div>
    );
  }

  if (enrollmentError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load student data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/instructor/courses')}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Students</h1>
            <p className="text-sm text-muted-foreground">
              Manage and track your course students
            </p>
          </div>
        </div>
        
        {/* Course selector */}
          <Select 
          value={courseId} 
            onValueChange={handleCourseChange}
            disabled={isLoadingCourses}
          >
          <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {instructorCourses?.map((course) => (
                <SelectItem key={course._id} value={course._id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
      </div>

      <StudentPageGuide />

      {courseId && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <UserCircle2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-xl font-bold">{courseStats.totalEnrolled}</p>
                  <p className="text-xs text-muted-foreground">Enrolled in course</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <Activity className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                  <p className="text-xl font-bold">{courseStats.activeStudents}</p>
                  <p className="text-xs text-muted-foreground">Currently learning</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <CalendarDays className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-xl font-bold">{courseStats.completedStudents}</p>
                  <p className="text-xs text-muted-foreground">Finished course</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <Activity className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Progress</p>
                  <p className="text-xl font-bold">{courseStats.avgProgress}%</p>
                  <p className="text-xs text-muted-foreground">Course completion</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <CardTitle className="text-lg">Student Management</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                {courseId ? `Showing students enrolled in ${currentCourse?.title}` : 'Select a course to view enrolled students'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchEnrollments()}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Tabs 
              value={selectedTab} 
              onValueChange={setSelectedTab} 
              className="w-full"
            >
              <div className="bg-slate-50 rounded-md p-1">
                <TabsList className="w-full grid grid-cols-4 gap-4 bg-transparent">
                  <TabsTrigger 
                    value="all" 
                    className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-none text-slate-600 font-medium"
                  >
                    All Students
                  </TabsTrigger>
                  <TabsTrigger 
                    value="active"
                    className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-none text-slate-600 font-medium"
                  >
                    Active
                  </TabsTrigger>
                  <TabsTrigger 
                    value="completed"
                    className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-none text-slate-600 font-medium"
                  >
                    Completed
                  </TabsTrigger>
                  <TabsTrigger 
                    value="inactive"
                    className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-none text-slate-600 font-medium"
                  >
                    Inactive
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="mt-4">
                <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                  <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                      placeholder="Search students by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
              />
            </div>
            </div>
          </div>

              <TabsContent value="all" className="mt-4">
                {courseId ? (
                  filteredStudents.length > 0 ? (
                    <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Days Completed</TableHead>
                            <TableHead>Last Active</TableHead>
                            <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                          {filteredStudents.map((enrollment) => (
                            <TableRow key={enrollment._id}>
                      <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={enrollment.userId.avatar} />
                                    <AvatarFallback>
                                      {enrollment.userId.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{enrollment.userId.name}</span>
                                    <span className="text-xs text-muted-foreground">{enrollment.userId.email}</span>
                          </div>
                        </div>
                      </TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(enrollment.status)}>
                                  {enrollment.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                                      className="h-full bg-primary transition-all duration-300" 
                                      style={{ width: `${enrollment.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-sm">{enrollment.progress}%</span>
                        </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium">{enrollment.completedDays?.length || 0}</span>
                              </TableCell>
                              <TableCell>
                        <span className="text-sm text-muted-foreground">
                                  {formatDistanceToNow(new Date(enrollment.lastAccessedAt), { addSuffix: true })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                      <Mail className="mr-2 h-4 w-4" />
                                      <span>Email Student</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                      <MessageSquare className="mr-2 h-4 w-4" />
                                      <span>Send Message</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">
                                      Remove from Course
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <UserCircle2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <h3 className="mt-4 text-lg font-medium">No students found</h3>
                      <p className="text-sm text-muted-foreground">
                        No students match your current filters.
                      </p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-10">
                    <UserCircle2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">Select a course</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose a course from the dropdown to view enrolled students.
                    </p>
            </div>
          )}
              </TabsContent>

              <TabsContent value="active" className="mt-4">
                {/* Similar content as "all" but filtered for active students */}
              </TabsContent>

              <TabsContent value="completed" className="mt-4">
                {/* Similar content as "all" but filtered for completed students */}
              </TabsContent>

              <TabsContent value="inactive" className="mt-4">
                {/* Similar content as "all" but filtered for inactive students */}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Students;
