import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Users, 
  BookOpen, 
  Star,
  UserPlus,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  GraduationCap,
  Mail,
  Activity,
  UserCircle2,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useDashboardOverview, useInstructorTotalStudents, useInstructorRatings, useInstructorReferrals } from '@/services/instructorService';
import { useInstructorCourses, useEnrolledUsers, useAllEnrolledUsers } from '@/services/courseService';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

// Loading skeleton for stats card
const StatCardSkeleton = () => (
  <Card className="relative overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-center justify-between space-x-4">
        <div className="space-y-3">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-7 w-[60px]" />
          <Skeleton className="h-3 w-[80px]" />
        </div>
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    </CardContent>
  </Card>
);

// Loading skeleton for table
const TableRowSkeleton = ({ columns }: { columns: number }) => (
  <TableRow>
    {Array(columns).fill(0).map((_, i) => (
      <TableCell key={i}>
        <Skeleton className="h-8 w-full" />
      </TableCell>
    ))}
  </TableRow>
);

type TrendType = 'up' | 'down' | 'neutral';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: string;
  description?: string;
  trend: TrendType;
  gradient: string;
  onClick?: () => void;
}

const StatCard = ({ title, value, icon: Icon, change, description, trend, gradient, onClick }: StatCardProps) => (
  <Card 
    className={cn(
      "relative overflow-hidden transition-all duration-300 hover:scale-[1.02]",
      "hover:shadow-[0_0_30px_rgba(63,43,150,0.2)] dark:hover:shadow-[0_0_30px_rgba(63,43,150,0.1)]",
      "before:absolute before:inset-0 before:opacity-5 before:bg-[#3F2B96]",
      "bg-background cursor-pointer",
      gradient
    )}
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.();
      }
    }}
  >
    <CardContent className="p-6 relative">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight text-[#3F2B96]">{value}</h3>
          {change && (
            <div className="flex items-center gap-1">
              {trend === 'up' && <TrendingUp className="h-4 w-4 text-[#3F2B96]" />}
              {trend === 'down' && <TrendingDown className="h-4 w-4 text-destructive" />}
              {trend === 'neutral' && <Minus className="h-4 w-4 text-muted-foreground" />}
              <p className="text-xs text-muted-foreground">{change}</p>
            </div>
          )}
          {description && title !== 'Total Referrals' && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className={cn(
          "p-4 rounded-full transition-transform duration-300 group-hover:scale-110",
          "bg-[#3F2B96]/10 shadow-lg shadow-[#3F2B96]/10"
        )}>
          <Icon className="h-6 w-6 text-[#3F2B96]" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading: isDashboardLoading, isError: isDashboardError } = useDashboardOverview();
  const { data: totalStudentsData, isLoading: isTotalStudentsLoading } = useInstructorTotalStudents();
  const { data: ratingsData, isLoading: isRatingsLoading } = useInstructorRatings();
  const { data: referralsData, isLoading: isReferralsLoading } = useInstructorReferrals();
  const { 
    data: instructorCourses, 
    isLoading: isCoursesLoading,
    isError: isCoursesError 
  } = useInstructorCourses();
  const [selectedCourse, setSelectedCourse] = React.useState<string>("all");
  const { 
    data: enrolledUsers, 
    isLoading: isEnrolledUsersLoading,
  } = useEnrolledUsers(selectedCourse !== "all" ? selectedCourse : undefined);

  const {
    data: allEnrolledUsers,
    isLoading: isAllEnrolledUsersLoading
  } = useAllEnrolledUsers(
    selectedCourse === "all" && instructorCourses 
      ? instructorCourses.map(course => course._id)
      : []
  );

  // Get displayed students based on selection
  const getDisplayedStudents = () => {
    if (selectedCourse === "all") {
      return allEnrolledUsers || [];
    }
    return enrolledUsers?.enrolledUsers || [];
  };

  // Calculate statistics based on the current view
  const calculateStats = () => {
    const students = getDisplayedStudents();
    const totalEnrolled = students.length;

    if (totalEnrolled === 0) {
      return { totalEnrolled: 0, avgProgress: 0, avgDaysCompleted: 0, totalDays: 0 };
    }

    const avgProgress = Math.round(
      students.reduce((acc, student) => acc + (student.progress || 0), 0) / totalEnrolled
    );

    if (selectedCourse === "all") {
      const avgDaysCompleted = Math.round(
        students.reduce((acc, student) => acc + (student.completedDays?.length || 0), 0) / totalEnrolled
      );
      const totalDays = instructorCourses?.reduce((acc, course) => acc + (course.roadmap?.length || 0), 0) || 0;
      return { totalEnrolled, avgProgress, avgDaysCompleted, totalDays };
    } else {
      const currentCourse = instructorCourses?.find(c => c._id === selectedCourse);
      const avgDaysCompleted = Math.round(
        students.reduce((acc, student) => acc + (student.completedDays?.length || 0), 0) / totalEnrolled
      );
      const totalDays = currentCourse?.roadmap?.length || 0;
      return { totalEnrolled, avgProgress, avgDaysCompleted, totalDays };
    }
  };

  const stats = calculateStats();
  const displayedStudents = getDisplayedStudents();

  const isLoading = isDashboardLoading || isCoursesLoading || 
                   (selectedCourse === "all" ? isAllEnrolledUsersLoading : isEnrolledUsersLoading) ||
                   isTotalStudentsLoading || isRatingsLoading || isReferralsLoading;

  // Function to handle referral card click
  const handleReferralClick = () => {
    // Navigate to instructor profile page
    navigate('/instructor/profile#referrals');
    
    // Add a small delay to ensure the navigation has completed
    setTimeout(() => {
      // Find the referral section and scroll to it smoothly
      const referralSection = document.getElementById('referrals');
      if (referralSection) {
        referralSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  // Stats for the overview cards with enhanced change indicators
  const overviewStats = [
    { 
      title: 'Active Courses', 
      value: instructorCourses?.length || '0',
      icon: BookOpen,
      change: instructorCourses?.length ? `+${instructorCourses.length}` : '0',
      trend: 'up' as const,
      gradient: "from-primary/10 to-primary/5",
      onClick: () => navigate('/instructor/courses')
    },
    { 
      title: 'Total Students', 
      value: totalStudentsData?.totalStudents || '0',
      icon: Users,
      change: totalStudentsData?.newStudentsThisMonth ? `+${totalStudentsData.newStudentsThisMonth} this month` : '0',
      trend: (totalStudentsData?.newStudentsThisMonth || 0) > 0 ? 'up' as const : 'neutral' as const,
      gradient: "from-primary/10 to-primary/5",
      onClick: () => navigate('/instructor/students')
    },
    { 
      title: 'Average Rating', 
      value: ratingsData?.averageRating || '0.0',
      icon: Star,
      change: ratingsData?.ratingChange ? `${ratingsData.ratingChange >= 0 ? '+' : ''}${ratingsData.ratingChange}` : '0',
      description: ratingsData?.ratedCourses ? `Based on ${ratingsData.ratedCourses} courses` : '',
      trend: (ratingsData?.ratingChange || 0) > 0 ? 'up' as const : 
             (ratingsData?.ratingChange || 0) < 0 ? 'down' as const : 
             'neutral' as const,
      gradient: "from-primary/10 to-primary/5"
    },
    { 
      title: 'Total Referrals', 
      value: referralsData?.totalReferrals || '0',
      icon: UserPlus,
      change: referralsData?.newReferralsThisMonth ? `+${referralsData.newReferralsThisMonth} this month` : '0',
      trend: (referralsData?.newReferralsThisMonth || 0) > 0 ? 'up' as const : 'neutral' as const,
      gradient: "from-primary/10 to-primary/5",
      onClick: handleReferralClick
    }
  ];

  const [sortOrder, setSortOrder] = useState<'progress-desc' | 'progress-asc' | 'recent'>('recent');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'started' | 'enrolled'>('all');

  const sortedAndFilteredStudents = useMemo(() => {
    let filteredStudents = [...displayedStudents];

    // Apply status filter
    if (statusFilter !== 'all') {
      filteredStudents = filteredStudents.filter(student => student.status === statusFilter);
    }

    // Apply sorting
    return filteredStudents.sort((a, b) => {
      switch (sortOrder) {
        case 'progress-desc':
          return (b.progress || 0) - (a.progress || 0);
        case 'progress-asc':
          return (a.progress || 0) - (b.progress || 0);
        case 'recent':
          return new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime();
        default:
          return 0;
      }
    });
  }, [displayedStudents, sortOrder, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 h-full w-full">
      <div className="h-full p-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="p-2 bg-[#3F2B96]/10 rounded-full shadow-lg shadow-[#3F2B96]/10">
              <GraduationCap className="h-8 w-8 text-[#3F2B96]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#3F2B96]">Instructor Dashboard</h1>
              <p className="text-muted-foreground">Monitor your courses and student progress</p>
            </div>
          </motion.div>
          <div className="flex flex-wrap gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-[#3F2B96] hover:bg-[#3F2B96]/90 transition-all shadow-lg shadow-[#3F2B96]/20 hover:shadow-[#3F2B96]/30"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = '/instructor/live-sessions';
                    }}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="sm:inline">Schedule Session</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Schedule a live session with your students</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="border-[#3F2B96] hover:bg-[#3F2B96]/10 transition-all text-[#3F2B96] hover:shadow-lg hover:shadow-[#3F2B96]/20"
                    onClick={() => navigate('/instructor/create-course')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Course
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create a new course</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <AnimatePresence>
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: i * 0.1 }}
                  className="hover:shadow-[0_0_30px_rgba(63,43,150,0.1)]"
                >
                  <StatCardSkeleton />
                </motion.div>
              ))
            ) : (
              overviewStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  className="group"
                >
                  <StatCard {...stat} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Course Engagement Card */}
        <Card className="mb-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(63,43,150,0.1)]">
          <CardHeader className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#3F2B96]/10 rounded-full shadow-lg shadow-[#3F2B96]/10">
                  <Activity className="h-5 w-5 text-[#3F2B96]" />
                </div>
                <CardTitle className="text-lg sm:text-xl text-[#3F2B96]">Course Engagement</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="space-y-6">
              {/* Course Selection and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Select
                  value={selectedCourse}
                  onValueChange={(value) => {
                    setSelectedCourse(value);
                  }}
                >
                  <SelectTrigger className="w-full md:w-[300px] border-[#3F2B96]/20 focus:ring-[#3F2B96]/20">
                    <SelectValue placeholder="Select your course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {instructorCourses?.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                  <Select
                    value={sortOrder}
                    onValueChange={(value: 'progress-desc' | 'progress-asc' | 'recent') => setSortOrder(value)}
                  >
                    <SelectTrigger className="w-full sm:w-[180px] border-[#3F2B96]/20 focus:ring-[#3F2B96]/20">
                      <div className="flex items-center gap-2">
                        {sortOrder === 'progress-desc' && <ChevronDown className="h-4 w-4" />}
                        {sortOrder === 'progress-asc' && <ChevronUp className="h-4 w-4" />}
                        <SelectValue placeholder="Sort by" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="progress-desc">Progress (High to Low)</SelectItem>
                      <SelectItem value="progress-asc">Progress (Low to High)</SelectItem>
                      <SelectItem value="recent">Most Recent</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={statusFilter}
                    onValueChange={(value: 'all' | 'completed' | 'started' | 'enrolled') => setStatusFilter(value)}
                  >
                    <SelectTrigger className="w-full sm:w-[180px] border-[#3F2B96]/20 focus:ring-[#3F2B96]/20">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Filter status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="started">In Progress</SelectItem>
                      <SelectItem value="enrolled">Not Started</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Engagement Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card rounded-lg p-6 border hover:shadow-lg hover:shadow-[#3F2B96]/10 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#3F2B96]/10 rounded-full shadow-lg shadow-[#3F2B96]/10">
                      <Users className="h-5 w-5 text-[#3F2B96]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Enrolled Students</p>
                      <p className="text-2xl font-bold text-[#3F2B96]">{stats.totalEnrolled}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedCourse === "all" ? "Across all courses" : "Total enrolled"}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-card rounded-lg p-6 border hover:shadow-lg hover:shadow-[#3F2B96]/10 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#3F2B96]/10 rounded-full shadow-lg shadow-[#3F2B96]/10">
                      <Activity className="h-5 w-5 text-[#3F2B96]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Average Progress</p>
                      <p className="text-2xl font-bold text-[#3F2B96]">{stats.avgProgress}%</p>
                      <div className="mt-2 w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500 ease-out bg-[#3F2B96]" 
                          style={{ width: `${stats.avgProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="bg-card rounded-lg p-6 border hover:shadow-lg hover:shadow-[#3F2B96]/10 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#3F2B96]/10 rounded-full shadow-lg shadow-[#3F2B96]/10">
                      <CalendarDays className="h-5 w-5 text-[#3F2B96]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Avg. Days Completed</p>
                      <p className="text-2xl font-bold text-[#3F2B96]">
                        {stats.avgDaysCompleted} / {stats.totalDays}
                      </p>
                      <div className="mt-2 w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500 ease-out bg-[#3F2B96]" 
                          style={{ width: `${(stats.avgDaysCompleted / (stats.totalDays || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Students Table */}
              <div className="rounded-lg border bg-card shadow-lg shadow-[#3F2B96]/5 hover:shadow-[#3F2B96]/10 transition-all duration-300">
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#3F2B96]/5">
                        <TableHead className="py-4">Student</TableHead>
                        {selectedCourse === "all" && <TableHead className="py-4">Course</TableHead>}
                        <TableHead className="py-4">Status</TableHead>
                        <TableHead className="py-4">Progress</TableHead>
                        <TableHead className="py-4">Days Completed</TableHead>
                        <TableHead className="py-4">Last Active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedCourse === "all" ? isAllEnrolledUsersLoading : isEnrolledUsersLoading) ? (
                        Array(5).fill(0).map((_, i) => (
                          <TableRowSkeleton key={i} columns={selectedCourse === "all" ? 6 : 5} />
                        ))
                      ) : sortedAndFilteredStudents.length > 0 ? (
                        sortedAndFilteredStudents.map((student: any, index) => {
                          const course = instructorCourses?.find(c => c._id === student.courseId);
                          const totalDays = course?.roadmap?.length || 0;
                          
                          return (
                            <motion.tr
                              key={`${student._id}-${student.courseId || ''}`}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className="hover:bg-muted/50 transition-colors group"
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10 transition-transform group-hover:scale-110 ring-2 ring-offset-2 ring-offset-background ring-primary/20">
                                    <AvatarImage src={student.userId.avatar} />
                                    <AvatarFallback className="bg-primary/10">
                                      <UserCircle2 className="h-5 w-5 text-primary" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{student.userId.name}</span>
                                    <span className="text-xs text-muted-foreground">{student.userId.email}</span>
                                  </div>
                                </div>
                              </TableCell>
                              {selectedCourse === "all" && (
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-primary/10 rounded-full">
                                      <BookOpen className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="font-medium">{course?.title || 'Unknown Course'}</span>
                                  </div>
                                </TableCell>
                              )}
                              <TableCell>
                                <span className={cn(
                                  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                                  student.status === 'completed' && "bg-[#3F2B96]/20 text-[#3F2B96]",
                                  student.status === 'started' && "bg-[#3F2B96]/10 text-[#3F2B96]",
                                  student.status === 'enrolled' && "bg-muted text-muted-foreground"
                                )}>
                                  <Sparkles className="h-3.5 w-3.5" />
                                  {student.status}
                                </span>
                              </TableCell>
                              <TableCell>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-2">
                                        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                                          <div 
                                            className="h-full rounded-full transition-all duration-500 ease-out bg-[#3F2B96]" 
                                            style={{ width: `${student.progress || 0}%` }}
                                          ></div>
                                        </div>
                                        <span className="text-sm font-medium">
                                          {student.progress || 0}%
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Course progress: {student.progress || 0}% completed</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                              <TableCell>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-2">
                                        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                                          <div 
                                            className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-emerald-600 to-teal-600" 
                                            style={{ 
                                              width: `${((student.completedDays?.length || 0) / totalDays) * 100}%` 
                                            }}
                                          ></div>
                                        </div>
                                        <span className="text-sm font-medium">
                                          {student.completedDays?.length || 0} / {totalDays}
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{student.completedDays?.length || 0} out of {totalDays} days completed</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-muted rounded-full">
                                    <Activity className="h-3.5 w-3.5 text-primary" />
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(new Date(student.lastAccessedAt), { addSuffix: true })}
                                  </span>
                                </div>
                              </TableCell>
                            </motion.tr>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell 
                            colSpan={selectedCourse === "all" ? 6 : 5} 
                            className="h-[200px] text-center"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="p-3 bg-[#3F2B96]/10 rounded-full shadow-lg shadow-[#3F2B96]/10">
                                <Users className="h-8 w-8 text-[#3F2B96]" />
                              </div>
                              <p className="text-lg font-medium">No students found</p>
                              <p className="text-sm text-muted-foreground">
                                {statusFilter !== 'all' 
                                  ? `No ${statusFilter} students found`
                                  : `No students enrolled in ${selectedCourse === "all" ? "any courses" : "this course"} yet`}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstructorDashboard;
