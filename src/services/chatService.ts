
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';

interface SendMessageParams {
  receiverId: string;
  courseId: string;
  content: string;
}

// Mock function for sending a message
const sendMessage = async (params: SendMessageParams) => {
  // Validate required fields
  if (!params.receiverId || !params.courseId || !params.content) {
    throw new Error('Missing required fields');
  }

  // Mock implementation - in a real app this would be an API call
  // return await axios.post('/api/messages', params);
  
  // Let's simulate the API call with a delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Return a mock response
  return {
    _id: Math.random().toString(36).substring(2, 15),
    senderId: { id: 'current-user', name: 'Instructor' },
    receiverId: { id: params.receiverId, name: 'Student' },
    content: params.content,
    courseId: params.courseId,
    createdAt: new Date().toISOString(),
    read: false
  };
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (data, variables) => {
      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['messages', variables.receiverId, variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
