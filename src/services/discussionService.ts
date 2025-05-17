
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { Discussion } from '@/types/discussion';

// Mock data
const mockDiscussions = [
  {
    _id: '1',
    title: 'Welcome to Web Development Basics',
    content: 'Hello everyone! Welcome to the course. Please introduce yourselves in this thread.',
    userId: { _id: 'instructor-1', name: 'Dr. Jane Smith' },
    courseId: { _id: '101', title: 'Web Development Basics' },
    isPinned: true,
    replies: [
      {
        _id: 'r1',
        content: 'Hi everyone! I\'m John and I\'m excited to learn web development.',
        userId: { _id: '1', name: 'John Doe' },
        createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      }
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
  },
  {
    _id: '2',
    title: 'Question about Assignment #2',
    content: 'I\'m having trouble understanding the requirements for the second assignment. Can someone clarify?',
    userId: { _id: '2', name: 'Jane Smith' },
    courseId: { _id: '101', title: 'Web Development Basics' },
    isPinned: false,
    replies: [],
    createdAt: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
  }
];

// API hooks
export const useInstructorDiscussions = () => {
  return useQuery({
    queryKey: ['instructor-discussions'],
    queryFn: async () => {
      // In a real app, this would be an API call
      // return await axios.get('/api/instructor/discussions');
      return mockDiscussions;
    }
  });
};

export const useAddReply = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ discussionId, content }: { discussionId: string, content: string }) => {
      // In a real app, this would be an API call
      // return await axios.post(`/api/discussions/${discussionId}/replies`, { content });
      
      // Mock implementation
      return {
        _id: Math.random().toString(36).substring(2, 15),
        content,
        userId: { _id: 'instructor-1', name: 'Dr. Jane Smith' },
        createdAt: new Date().toISOString()
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-discussions'] });
    }
  });
};

export const useCreateDiscussion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ courseId, data }: { courseId: string, data: Partial<Discussion> }) => {
      // In a real app, this would be an API call
      // return await axios.post(`/api/courses/${courseId}/discussions`, data);
      
      // Mock implementation
      return {
        _id: Math.random().toString(36).substring(2, 15),
        ...data,
        userId: { _id: 'instructor-1', name: 'Dr. Jane Smith' },
        courseId: { _id: courseId, title: 'Web Development Basics' },
        replies: [],
        createdAt: new Date().toISOString()
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-discussions'] });
    }
  });
};

export const useDeleteDiscussion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ discussionId, courseId }: { discussionId: string, courseId: string }) => {
      // In a real app, this would be an API call
      // return await axios.delete(`/api/courses/${courseId}/discussions/${discussionId}`);
      
      // Mock implementation
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-discussions'] });
    }
  });
};
