
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Discussion } from '@/types/discussion';
import axios from '@/lib/axios';

// Mock discussions data
const mockDiscussions: Discussion[] = [
  {
    _id: '1',
    title: 'Welcome to Web Development Fundamentals',
    content: 'Hello everyone! Welcome to our course. Please introduce yourselves in the comments!',
    userId: {
      _id: 'instructor1',
      name: 'John Instructor',
    },
    courseId: {
      _id: '1',
      title: 'Web Development Fundamentals',
    },
    isPinned: true,
    replies: [
      {
        _id: 'r1',
        content: 'Hi, I\'m James. Excited to be here!',
        userId: {
          _id: 'student1',
          name: 'James Student',
        },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'r2',
        content: 'Looking forward to this course!',
        userId: {
          _id: 'student2',
          name: 'Sarah Student',
        },
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '2',
    title: 'Week 1 Assignment Questions',
    content: 'If you have any questions about the Week 1 assignment, please post them here.',
    userId: {
      _id: 'instructor1',
      name: 'John Instructor',
    },
    courseId: {
      _id: '1',
      title: 'Web Development Fundamentals',
    },
    isPinned: false,
    replies: [],
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
];

// API hooks
export const useInstructorDiscussions = () => {
  return useQuery({
    queryKey: ['instructor-discussions'],
    queryFn: async () => {
      // In a real app, this would be an API call
      // return await axios.get('/api/instructor/discussions');
      return mockDiscussions;
    },
  });
};

export const useAddReply = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ discussionId, content }: { discussionId: string; content: string }) => {
      // In a real app, this would be an API call
      // return await axios.post(`/api/discussions/${discussionId}/replies`, { content });
      
      // Mock implementation
      const newReply = {
        _id: Math.random().toString(36).substring(2, 15),
        content,
        userId: {
          _id: 'instructor1',
          name: 'John Instructor',
        },
        createdAt: new Date().toISOString(),
      };
      
      // Find and update the discussion in our mock data
      const discussionIndex = mockDiscussions.findIndex(d => d._id === discussionId);
      if (discussionIndex !== -1) {
        mockDiscussions[discussionIndex].replies.push(newReply);
      }
      
      return newReply;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-discussions'] });
    },
  });
};

export const useCreateDiscussion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      courseId, 
      data 
    }: { 
      courseId: string; 
      data: { title: string; content: string; isPinned?: boolean } 
    }) => {
      // In a real app, this would be an API call
      // return await axios.post(`/api/courses/${courseId}/discussions`, data);
      
      // Mock implementation
      const newDiscussion: Discussion = {
        _id: Math.random().toString(36).substring(2, 15),
        title: data.title,
        content: data.content,
        userId: {
          _id: 'instructor1',
          name: 'John Instructor',
        },
        courseId: {
          _id: courseId,
          title: mockDiscussions.find(d => d.courseId._id === courseId)?.courseId.title || 'Course',
        },
        isPinned: data.isPinned || false,
        replies: [],
        createdAt: new Date().toISOString(),
      };
      
      mockDiscussions.unshift(newDiscussion);
      
      return newDiscussion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-discussions'] });
    },
  });
};

export const useDeleteDiscussion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      discussionId, 
      courseId 
    }: { 
      discussionId: string; 
      courseId: string 
    }) => {
      // In a real app, this would be an API call
      // return await axios.delete(`/api/courses/${courseId}/discussions/${discussionId}`);
      
      // Mock implementation
      const discussionIndex = mockDiscussions.findIndex(d => d._id === discussionId);
      if (discussionIndex !== -1) {
        mockDiscussions.splice(discussionIndex, 1);
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-discussions'] });
    },
  });
};
