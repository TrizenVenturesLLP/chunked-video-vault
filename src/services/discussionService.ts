import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';

interface Discussion {
  _id: string;
    courseId: {
    _id: string;
    title: string;
  };
        userId: {
    _id: string;
    name: string;
    role: string;
  };
  title: string;
  content: string;
  isPinned: boolean;
  likes: string[];
  replies: Array<{
    _id: string;
    userId: {
      _id: string;
      name: string;
      role: string;
    };
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface CreateDiscussionData {
  courseId: string;
  title: string;
  content: string;
  isPinned?: boolean;
}

interface AddReplyData {
  discussionId: string;
  content: string;
}

// Get all discussions for a course
export const useDiscussions = (courseId?: string) => {
  return useQuery({
    queryKey: ['discussions', courseId],
    queryFn: async () => {
      try {
        if (!courseId || courseId === 'all') return [];
        const { data } = await axios.get(`/api/discussions/${courseId}`);
        return data as Discussion[];
      } catch (error) {
        console.error('Error fetching discussions:', error);
        throw error;
      }
    },
    enabled: !!courseId && courseId !== 'all',
    retry: false
  });
};

// Get all discussions for an instructor
export const useInstructorDiscussions = () => {
  return useQuery({
    queryKey: ['instructor-discussions'],
    queryFn: async () => {
      try {
        const { data } = await axios.get('/api/discussions/instructor');
        return data as Discussion[];
      } catch (error) {
        console.error('Error fetching instructor discussions:', error);
        throw error;
      }
    },
    retry: false // Don't retry on failure
  });
};

// Create a new discussion
export const useCreateDiscussion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateDiscussionData) => {
      const response = await axios.post('/api/discussions', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-discussions'] });
    }
  });
};

// Add a reply to a discussion
export const useAddReply = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: AddReplyData) => {
      const response = await axios.post(`/api/discussions/${data.discussionId}/replies`, {
        content: data.content
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-discussions'] });
    }
  });
};

// Delete a discussion
export const useDeleteDiscussion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ discussionId }: { discussionId: string; courseId: string }) => {
      try {
        const response = await axios.delete(`/api/discussions/${discussionId}`);
        return response.data;
      } catch (error: any) {
        console.error('Error deleting discussion:', error);
        const errorMessage = error.response?.data?.message || 'Failed to delete discussion';
        if (error.response?.data?.debug) {
          console.debug('Permission debug info:', error.response.data.debug);
      }
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      // Invalidate both queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-discussions'] });
    }
  });
};
