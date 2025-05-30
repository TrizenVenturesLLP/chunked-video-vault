import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';

interface SendMessageParams {
  receiverId: string;
  courseId: string;
  content: string;
}

// Send a message to a student
const sendMessage = async (params: SendMessageParams) => {
  // Validate required fields
  if (!params.receiverId || !params.courseId || !params.content) {
    throw new Error('Missing required fields');
  }

  // Make the actual API call
  const response = await axios.post('/api/messages', params);
  return response.data;
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
    onError: (error: any) => {
      console.error('Failed to send message:', error);
      throw error;
    }
  });
};
