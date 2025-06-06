import React, { useState, useMemo, useEffect } from 'react';
import { useInstructorCourses, useEnrolledUsers, useAllEnrolledUsers } from '@/services/courseService';
import { useQuizSubmissions, calculateStudentQuizAverage } from '@/services/quizService';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Trophy, Medal, Crown, BookOpen, GraduationCap, BookOpenCheck, Brain, Users, BarChart3 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface LeaderboardMetrics {
  userId: string;
  name: string;
  avatar?: string;
  rank: number;
  metrics: {
    coursesEnrolled: number;
    coursePoints: number;
    quizPoints: number;
    totalPoints: number;
    daysCompleted?: string;
  };
}

// Helper function to get default avatar
const getDefaultAvatarUrl = (name: string) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
};

// Podium Card Component
const PodiumCard = ({ student, position }: { student: any; position: number }) => {
  const colorByRank = {
    1: {
      border: "border-yellow-400",
      ring: "ring-yellow-400",
      bg: "from-yellow-500/30 to-yellow-400/10",
      text: "text-yellow-500",
      glow: "shadow-[0_0_15px_rgba(234,179,8,0.3)]",
      height: "h-[320px]",
      transform: "-translate-y-6"
    },
    2: {
      border: "border-blue-400",
      ring: "ring-blue-400",
      bg: "from-blue-500/30 to-blue-400/10",
      text: "text-blue-500",
      glow: "shadow-[0_0_15px_rgba(59,130,246,0.3)]",
      height: "h-[300px]",
      transform: "-translate-y-3"
    },
    3: {
      border: "border-emerald-400",
      ring: "ring-emerald-400",
      bg: "from-emerald-500/30 to-emerald-400/10",
      text: "text-emerald-500",
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]",
      height: "h-[280px]",
      transform: "translate-y-0"
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 400,
        damping: 25,
        delay: position * 0.1 
      }}
      className={cn(
        "flex flex-col items-center relative",
        colorByRank[position].transform
      )}
    >
      {position === 1 && (
        <motion.div
          initial={{ y: -10, rotate: -15, opacity: 0 }}
          animate={{ 
            y: [-10, -5, -10],
            rotate: [-15, 0, -15],
            opacity: 1
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 z-30"
        >
          <Crown className="h-6 w-6 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
        </motion.div>
      )}

      <div className="relative z-20 -mb-8">
        <div className="relative">
          <Avatar className={cn(
            "h-16 w-16 ring-4 ring-opacity-60 shadow-xl",
            colorByRank[position].ring
          )}>
            <AvatarImage 
              src={student.avatar || getDefaultAvatarUrl(student.name)} 
              alt={student.name} 
            />
            <AvatarFallback className="text-lg font-semibold bg-gray-800 text-white">
              {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className={cn(
            "absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gray-800 shadow-lg flex items-center justify-center border-2",
            colorByRank[position].border
          )}>
            <span className={cn("text-xs font-bold", colorByRank[position].text)}>#{position}</span>
          </div>
        </div>
      </div>

      <motion.div 
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className={cn(
          "w-[200px] relative rounded-xl bg-gray-800/90 shadow-xl border border-opacity-30 backdrop-blur-sm",
          colorByRank[position].border,
          colorByRank[position].glow,
          colorByRank[position].height
        )}
      >
        <div className={cn(
          "h-16 rounded-t-xl bg-gradient-to-b",
          colorByRank[position].bg
        )} />

        <div className="p-3 text-center mt-4">
          <div className="font-semibold text-gray-100 mb-1 text-sm leading-tight min-h-[32px] flex items-center justify-center">
            <span className="break-words hyphens-auto px-1">
              {student.name}
            </span>
          </div>

          <div className={cn("text-2xl font-bold mb-4", colorByRank[position].text)}>
            {student.metrics.totalPoints}%
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-700/50 rounded-lg p-2 backdrop-blur-sm">
              <div className={cn("text-base font-semibold", colorByRank[position].text)}>
                {student.metrics.coursePoints}%
              </div>
              <div className="text-xs text-gray-300 font-medium">
                Course
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-2 backdrop-blur-sm">
              <div className={cn("text-base font-semibold", colorByRank[position].text)}>
                {student.metrics.quizPoints}%
              </div>
              <div className="text-xs text-gray-300 font-medium">
                Quiz
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Leaderboard = () => {
  const { data: courses = [], isLoading: isLoadingCourses } = useInstructorCourses();
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  
  // Set the first course as default when courses are loaded
  useEffect(() => {
    if (courses.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0]._id);
    }
  }, [courses]);

  const courseIds = courses.map((course) => course._id);

  const { data: allEnrollments, isLoading: isLoadingAll } = useAllEnrolledUsers(courseIds);
  const { data: courseData, isLoading: isLoadingCourse } = useEnrolledUsers(selectedCourse);

  // Get the courseUrl for the selected course
  const selectedCourseUrl = useMemo(() => {
    if (selectedCourse === 'all') return undefined;
    const course = courses.find(c => c._id === selectedCourse);
    console.log('Selected course:', course);
    return course?.courseUrl;
  }, [selectedCourse, courses]);

  // Fetch quiz submissions for the selected course
  const { data: quizSubmissions = [], isLoading: isLoadingQuizzes } = useQuizSubmissions(selectedCourseUrl);
  console.log('Fetched quiz submissions:', quizSubmissions);

  const isLoading = isLoadingCourses || isLoadingAll || isLoadingQuizzes || 
                   (selectedCourse !== 'all' && isLoadingCourse);

  const calculatePoints = (daysCompleted: string) => {
    if (!daysCompleted) return 0;
    const [completed, total] = daysCompleted.split('/').map(Number);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const leaderboardData: LeaderboardMetrics[] = useMemo(() => {
    if (!courseData?.enrolledUsers || !selectedCourseUrl) return [];
      
      const entries = courseData.enrolledUsers.map((enrollment) => {
      const coursePoints = calculatePoints(enrollment.daysCompletedPerDuration);
      const quizPoints = calculateStudentQuizAverage(
        quizSubmissions,
        enrollment.userId._id
      );

      // Calculate total as sum of course progress and quiz average
      const totalPoints = coursePoints + quizPoints;

        return {
          userId: enrollment.userId._id,
          name: enrollment.userId.name,
          avatar: enrollment.userId.avatar,
          rank: 0,
          metrics: {
            coursesEnrolled: 1,
          coursePoints,
          quizPoints,
          totalPoints,
            daysCompleted: enrollment.daysCompletedPerDuration
          }
        };
      });

      entries.sort((a, b) => b.metrics.totalPoints - a.metrics.totalPoints);
      return entries.map((item, index) => ({ ...item, rank: index + 1 }));
  }, [courseData, quizSubmissions, selectedCourseUrl]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading leaderboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 relative z-0">
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header with Course Selection */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 shadow-lg border border-purple-100/50">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Course Leaderboard
                </h1>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-purple-500" />
                  <span>Track student progress and performance</span>
                </p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-[280px]">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full bg-white/80 backdrop-blur-sm border-purple-200 hover:border-purple-300 transition-colors">
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Podium Section */}
        <div className="relative min-h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-100/50 via-transparent to-gray-100/50 rounded-2xl" />
          <div className="relative flex items-end justify-center gap-6 max-w-4xl mx-auto py-12 px-4">
            {/* Second Place */}
            <div className="flex justify-center z-[2]">
              {leaderboardData[1] && <PodiumCard student={leaderboardData[1]} position={2} />}
            </div>

            {/* First Place */}
            <div className="flex justify-center z-[3]">
              {leaderboardData[0] && <PodiumCard student={leaderboardData[0]} position={1} />}
            </div>

            {/* Third Place */}
            <div className="flex justify-center z-[1]">
              {leaderboardData[2] && <PodiumCard student={leaderboardData[2]} position={3} />}
            </div>
          </div>
        </div>

        {/* Rankings Table */}
        <Card className="overflow-hidden border-purple-100 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
          <CardHeader className="py-4 px-6 border-b border-purple-100/50 bg-gradient-to-r from-purple-50 via-white to-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-xl font-bold">Student Rankings</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-purple-50 text-purple-600">
                {leaderboardData.length} Students
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-purple-100/50">
                  <TableHead className="w-[60px]">Rank</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-right">Course Score</TableHead>
                  <TableHead className="text-right">Quiz Score</TableHead>
                  <TableHead className="text-right">Total Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {leaderboardData.map((item, index) => (
                    <motion.tr
                      key={item.userId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.03 }}
                      className="group hover:bg-purple-50/50 transition-all duration-200"
                    >
                      <TableCell>
                        <Badge className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center text-sm",
                          item.rank <= 3 
                            ? item.rank === 1 
                              ? "bg-yellow-100 text-yellow-700"
                              : item.rank === 2
                                ? "bg-gray-100 text-gray-700"
                                : "bg-amber-100 text-amber-700"
                            : "bg-purple-100 text-purple-700"
                        )}>
                          {item.rank}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={item.avatar || getDefaultAvatarUrl(item.name)} />
                            <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="font-medium text-sm">{item.name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                          {item.metrics.coursePoints}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="bg-green-50 text-green-700">
                          {item.metrics.quizPoints}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <Badge variant="secondary" className={cn(
                          "text-sm",
                          item.rank <= 3 
                            ? item.rank === 1 
                              ? "bg-yellow-100 text-yellow-700"
                              : item.rank === 2
                                ? "bg-gray-100 text-gray-700"
                                : "bg-amber-100 text-amber-700"
                            : "bg-purple-100 text-purple-700"
                        )}>
                          {item.metrics.totalPoints}%
                        </Badge>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard; 