
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
  level: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  image: string;
  courseAccess: boolean;
  skills: string[];
  roadmap: RoadmapDay[];
  instructor: string;
  students?: number;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
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

// Mock data for courses
const mockCourses = [
  {
    _id: '1',
    title: 'Web Development Fundamentals',
    description: 'Learn the basics of web development with HTML, CSS, and JavaScript',
    longDescription: 'This comprehensive course covers everything you need to know to get started with web development.',
    duration: '8 weeks',
    level: 'Beginner',
    category: 'Web Development',
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

// API hooks
export const useInstructorCourses = () => {
  return useQuery({
    queryKey: ['instructor-courses'],
    queryFn: async () => {
      // In a real app, this would be an API call
      // return await axios.get('/api/instructor/courses');
      return mockCourses;
    }
  });
};

export const useCourseDetails = (courseId?: string) => {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!courseId) return null;
      // In a real app, this would be an API call
      // return await axios.get(`/api/courses/${courseId}`);
      return mockCourses.find(course => course._id === courseId) || null;
    },
    enabled: !!courseId
  });
};

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
      // In a real app, this would be an API call
      // return await axios.post('/api/courses', courseData);
      
      // Mock implementation
      const newCourse = {
        ...courseData,
        _id: Math.random().toString(36).substring(2, 15),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return newCourse;
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
      // In a real app, this would be an API call
      // return await axios.put(`/api/courses/${courseId}`, courseData);
      
      // Mock implementation
      const updatedCourse = {
        ...mockCourses.find(course => course._id === courseId),
        ...courseData,
        updatedAt: new Date().toISOString()
      };
      
      return updatedCourse;
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
      // In a real app, this would be an API call
      // return await axios.delete(`/api/courses/${courseId}`);
      
      // Mock implementation
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
    }
  });
};
