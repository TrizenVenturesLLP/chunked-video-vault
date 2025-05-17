
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  Star,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Temporary mock data until we integrate with a real API
const mockDashboardData = {
  activeCourses: 5,
  totalStudents: 128,
  newStudents: 12,
  averageRating: 4.7,
  ratingChange: 0.2,
  teachingHours: 86,
  teachingHoursChange: 8,
  recentActivity: [
    {
      type: 'enrollment',
      studentName: 'Alex Johnson',
      courseTitle: 'Introduction to React',
      date: new Date(Date.now() - 1000 * 60 * 60 * 2)
    },
    {
      type: 'review',
      courseTitle: 'Advanced JavaScript Patterns',
      rating: 5,
      date: new Date(Date.now() - 1000 * 60 * 60 * 8)
    },
    {
      type: 'completion',
      studentName: 'Maya Williams',
      courseTitle: 'Web Development Fundamentals',
      date: new Date(Date.now() - 1000 * 60 * 60 * 12)
    }
  ],
  courseStatus: [
    {
      title: 'Introduction to React',
      enrolledStudents: 45,
      completionRate: 78
    },
    {
      title: 'Advanced JavaScript Patterns',
      enrolledStudents: 32,
      completionRate: 62
    },
    {
      title: 'Web Development Fundamentals',
      enrolledStudents: 51,
      completionRate: 91
    }
  ]
};

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Using the mock data for now
  const dashboardData = mockDashboardData;
  const isLoading = false;
  const isError = false;

  // Stats for the overview cards
  const stats = [
    { 
      title: 'Active Courses', 
      value: dashboardData?.activeCourses || '0',
      icon: BookOpen,
      change: dashboardData?.activeCourses > 0 ? `+${dashboardData.activeCourses}` : '0'
    },
    { 
      title: 'Total Students', 
      value: dashboardData?.totalStudents || '0',
      icon: Users,
      change: dashboardData?.newStudents ? `+${dashboardData.newStudents} this month` : '0'
    },
    { 
      title: 'Average Rating', 
      value: dashboardData?.averageRating?.toFixed(1) || '0.0',
      icon: Star,
      change: dashboardData?.ratingChange ? `${dashboardData.ratingChange > 0 ? '+' : ''}${dashboardData.ratingChange}` : '0'
    },
    { 
      title: 'Teaching Hours', 
      value: dashboardData?.teachingHours || '0',
      icon: Clock,
      change: dashboardData?.teachingHoursChange ? `+${dashboardData.teachingHoursChange} this month` : '0'
    }
  ];

  // Format the recent activity data
  const getRecentActivities = () => {
    if (!dashboardData?.recentActivity) return [];

    return dashboardData.recentActivity.map(activity => ({
      type: activity.type,
      message: activity.type === 'enrollment' 
        ? `New student ${activity.studentName} enrolled in ${activity.courseTitle}`
        : activity.type === 'review'
        ? `New ${activity.rating}-star review received for ${activity.courseTitle}`
        : `Student ${activity.studentName} completed ${activity.courseTitle}`,
      time: formatDistanceToNow(new Date(activity.date), { addSuffix: true })
    }));
  };

  const recentActivities = getRecentActivities();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        <AlertCircle className="h-8 w-8 mr-2" />
        Failed to load dashboard data
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-8 md:px-8">
      {/* Header section with responsive layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Instructor Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/sessions')}>
            <Calendar className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Schedule</span> Session
          </Button>
          <Button size="sm" onClick={() => navigate('/courses/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
        </div>
      </div>

      {/* Stats Grid - responsive layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between space-x-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-xl sm:text-2xl font-bold">{stat.value}</h3>
                  {stat.change && (
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  )}
                </div>
                <stat.icon className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity and Course Status - responsive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="mt-1 flex-shrink-0">
                      {activity.type === 'enrollment' ? (
                        <Users className="h-4 w-4 text-primary" />
                      ) : activity.type === 'review' ? (
                        <Star className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Course Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg sm:text-xl">Course Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.courseStatus?.map((course, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{course.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {course.enrolledStudents} students enrolled
                    </p>
                  </div>
                  <div className="sm:text-right mt-1 sm:mt-0">
                    <p className="font-medium">{course.completionRate}%</p>
                    <p className="text-sm text-muted-foreground">completion rate</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
