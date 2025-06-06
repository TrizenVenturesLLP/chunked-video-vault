import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';

interface Activity {
  type: 'enrollment' | 'review' | 'completion';
  studentName?: string;
  courseTitle: string;
  rating?: number;
  date: Date;
}

interface CourseStatus {
  title: string;
  enrolledStudents: number;
  completionRate: number;
}

export interface DashboardOverview {
  activeCourses: number;
  totalStudents: number;
  newStudents: number;
  averageRating: number;
  ratingChange: number;
  teachingHours: number;
  teachingHoursChange: number;
  recentActivity: Activity[];
  courseStatus: CourseStatus[];
}

export interface InstructorStats {
  totalStudents: number;
  newStudentsThisMonth: number;
}

export interface InstructorRatings {
  averageRating: number;
  ratingChange: number;
  totalCourses: number;
  ratedCourses: number;
}

export interface InstructorReferrals {
  totalReferrals: number;
  newReferralsThisMonth: number;
  referralCode: string;
}

// Mock data fetching function
const fetchDashboardOverview = async (): Promise<DashboardOverview> => {
  // Simulate API call with timeout
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
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
      });
    }, 800); // Simulate network delay
  });
};

// React Query hook for dashboard data
export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ['dashboardOverview'],
    queryFn: fetchDashboardOverview
  });
};

export const useInstructorTotalStudents = () => {
  return useQuery<InstructorStats>({
    queryKey: ['instructor-total-students'],
    queryFn: async () => {
      const response = await axios.get('/api/instructor/total-students');
      return response.data;
    }
  });
};

export const useInstructorRatings = () => {
  return useQuery<InstructorRatings>({
    queryKey: ['instructor-ratings'],
    queryFn: async () => {
      const response = await axios.get('/api/instructor/ratings');
      return response.data;
    }
  });
};

export const useInstructorReferrals = () => {
  return useQuery<InstructorReferrals>({
    queryKey: ['instructor-referrals'],
    queryFn: async () => {
      const response = await axios.get('/api/instructor/referrals');
      return response.data;
    }
  });
};
