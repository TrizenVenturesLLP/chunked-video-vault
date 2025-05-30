import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';

// Define types
export interface MCQOption {
  text: string;
  isCorrect: boolean;
}

export interface MCQQuestion {
  question: string;
  options: MCQOption[];
  explanation?: string;
}

export interface RoadmapDay {
  day: number;
  topics: string;
  video: string;
  transcript?: string;
  notes?: string;
  mcqs: MCQQuestion[];
  code?: string;
  language?: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  longDescription?: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Beginner to Intermediate";
  category: string;
  language: string;
  image: string;
  courseAccess: boolean;
  skills: string[];
  roadmap: RoadmapDay[];
  instructor: string;
  instructorId?: string;
  students?: number;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
  modules?: string[];
  reviews?: any[];
  courses?: any[];
  testimonials?: any[];
}

// Student types
export interface Student {
  id: string;
  name: string;
  email: string;
  status: string;
  progress: number;
  enrolledDate: string;
  lastActive: string;
  courseTitle?: string;
}

export interface CourseStudents {
  id: string;
  _id: string;
  title: string;
  students: Student[];
}

// API hooks
export const useInstructorCourses = () => {
  return useQuery({
    queryKey: ['instructor-courses'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/instructor/courses');
        return response.data;
      } catch (error) {
        console.error('Error fetching instructor courses:', error);
        throw error;
      }
    }
  });
};

export const useCourseDetails = (courseId?: string) => {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!courseId) return null;
      try {
        const response = await axios.get(`/api/courses/${courseId}`);
        return response.data;
      } catch (error) {
        return mockCourses.find(course => course._id === courseId) || null;
      }
    },
    enabled: !!courseId
  });
};

// Mock data for courses as fallback
const mockCourses: Course[] = [
  {
    _id: '1',
    title: 'Web Development Fundamentals',
    description: 'Learn the basics of web development with HTML, CSS, and JavaScript',
    longDescription: 'This comprehensive course covers everything you need to know to get started with web development.',
    duration: '8 weeks',
    level: 'Beginner',
    category: 'Web Development',
    language: 'English',
    image: 'https://placehold.co/600x400',
    courseAccess: true,
    skills: ['HTML', 'CSS', 'JavaScript'],
    roadmap: [
      {
        day: 1,
        topics: 'Introduction to HTML',
        video: 'https://example.com/video1',
        mcqs: []
      }
    ],
    instructor: 'John Doe',
    students: 120,
    rating: 4.5
  },
  {
    _id: '2',
    title: 'Advanced JavaScript',
    description: 'Take your JavaScript skills to the next level',
    longDescription: 'This course covers advanced JavaScript concepts and modern ES6+ features.',
    duration: '6 weeks',
    level: 'Intermediate',
    category: 'Web Development',
    language: 'English',
    image: 'https://placehold.co/600x400',
    courseAccess: true,
    skills: ['JavaScript', 'ES6', 'Async/Await'],
    roadmap: [
      {
        day: 1,
        topics: 'Modern JavaScript Features',
        video: 'https://example.com/video2',
        mcqs: []
      }
    ],
    instructor: 'Jane Smith',
    students: 85,
    rating: 4.8
  }
];

// Mock data for students
const mockStudents: Record<string, Student[]> = {
  '1': [
    {
      id: '101',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      status: 'completed',
      progress: 100,
      enrolledDate: '2023-01-15',
      lastActive: '3 days ago'
    },
    {
      id: '102',
      name: 'Bob Smith',
      email: 'bob@example.com',
      status: 'started',
      progress: 45,
      enrolledDate: '2023-02-10',
      lastActive: 'Today'
    },
    {
      id: '103',
      name: 'Charlie Davis',
      email: 'charlie@example.com',
      status: 'enrolled',
      progress: 0,
      enrolledDate: '2023-03-05',
      lastActive: '1 week ago'
    }
  ],
  '2': [
    {
      id: '201',
      name: 'Diana Evans',
      email: 'diana@example.com',
      status: 'started',
      progress: 75,
      enrolledDate: '2023-01-20',
      lastActive: 'Yesterday'
    },
    {
      id: '202',
      name: 'Edward Wilson',
      email: 'edward@example.com',
      status: 'started',
      progress: 30,
      enrolledDate: '2023-02-15',
      lastActive: '2 days ago'
    }
  ]
};

// Course students hooks
export const useCourseStudents = (courseId?: string) => {
  return useQuery({
    queryKey: ['course-students', courseId],
    queryFn: async () => {
      if (!courseId) return null;
      // In a real app, this would be an API call
      // return await axios.get(`/api/courses/${courseId}/students`);
      
      const course = mockCourses.find(c => c._id === courseId);
      if (!course) throw new Error('Course not found');
      
      return {
        id: course._id,
        _id: course._id,
        title: course.title,
        students: mockStudents[course._id] || []
      };
    },
    enabled: !!courseId
  });
};

export const useAllCourseStudents = () => {
  return useQuery({
    queryKey: ['all-students'],
    queryFn: async () => {
      // In a real app, this would be an API call
      // return await axios.get('/api/instructor/students');
      
      return mockCourses.map(course => ({
        id: course._id,
        _id: course._id,
        title: course.title,
        students: mockStudents[course._id] || []
      }));
    }
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (courseData: Partial<Course>) => {
      try {
        // Check authentication token
        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('Authentication required. Please log in.');
        }

        // Format the course data
        const formattedCourseData = {
          ...courseData,
          rating: 0,
          students: 0,
          skills: courseData.skills || [],
          courses: [],
          testimonials: [],
          modules: [],
          reviews: [],
          courseAccess: courseData.courseAccess ?? true
        };

        const response = await axios.post('/api/courses', formattedCourseData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        return response.data.course;
      } catch (error: any) {
        console.error('Failed to create course:', error);
        throw new Error(error.response?.data?.message || error.message || 'Failed to create course');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
    }
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ courseId, courseData }: { courseId: string, courseData: Partial<Course> }) => {
      try {
        const response = await axios.put(`/api/courses/${courseId}`, courseData);
        return response.data.course;
      } catch (error) {
        console.error('Failed to update course:', error);
        throw new Error('Failed to update course. Please try again.');
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
    }
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (courseId: string) => {
      try {
        await axios.delete(`/api/courses/${courseId}`);
        return { success: true };
      } catch (error) {
        console.error('Failed to delete course:', error);
        throw new Error('Failed to delete course. Please try again.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
    }
  });
};

export const checkTitleAvailability = async (title: string): Promise<boolean> => {
  try {
    const response = await axios.get(`/api/courses/check-title/${encodeURIComponent(title)}`);
    return response.data.available;
  } catch (error) {
    console.error('Failed to check title availability:', error);
    return false;
  }
};

export interface EnrolledUser {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  progress: number;
  status: 'pending' | 'enrolled' | 'started' | 'completed';
  enrolledAt: string;
  lastAccessedAt: string;
  completedDays: number[];
}

export interface CourseEnrollments {
  courseId: string;
  enrolledUsers: EnrolledUser[];
}

export const useEnrolledUsers = (courseId?: string) => {
  return useQuery({
    queryKey: ['enrolled-users', courseId],
    queryFn: async () => {
      if (!courseId || courseId === 'all') return null;
      try {
        const response = await axios.get(`/api/courses/${courseId}/enrolled-users`);
        return response.data as CourseEnrollments;
      } catch (error) {
        console.error('Error fetching enrolled users:', error);
        throw error;
      }
    },
    enabled: !!courseId && courseId !== 'all'
  });
};

export const useAllEnrolledUsers = (courseIds: string[]) => {
  return useQuery({
    queryKey: ['all-enrolled-users', courseIds],
    queryFn: async () => {
      if (!courseIds.length) return [];
      try {
        // Fetch enrolled users for all courses in parallel
        const responses = await Promise.all(
          courseIds.map(async (courseId) => {
            const response = await axios.get(`/api/courses/${courseId}/enrolled-users`);
            const data = response.data as CourseEnrollments;
            // Add courseTitle from the course data
            return {
              ...data,
              enrolledUsers: data.enrolledUsers.map(user => ({
                ...user,
                courseId: data.courseId
              }))
            };
          })
        );
        
        // Combine all enrolled users into a single array
        return responses.reduce((acc, curr) => {
          return [...acc, ...curr.enrolledUsers];
        }, [] as (EnrolledUser & { courseId: string })[]);
      } catch (error) {
        console.error('Error fetching all enrolled users:', error);
        throw error;
      }
    },
    enabled: courseIds.length > 0
  });
};
