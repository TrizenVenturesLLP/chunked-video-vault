import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';

// Define types
interface MessageSettings {
  notifications: boolean;
  sound: boolean;
  desktop: boolean;
  preview: boolean;
}

interface MessageStore {
  settings: MessageSettings;
  updateSettings: (settings: Partial<MessageSettings>) => void;
}

// Create store with persistence
export const useMessageStore = create<MessageStore>()(
  persist(
    (set) => ({
      settings: {
        notifications: true,
        sound: true,
        desktop: false,
        preview: true,
      },
      updateSettings: (newSettings) => 
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        })),
    }),
    {
      name: 'message-settings',
    }
  )
);

// API hooks
export const useMessages = (receiverId: string, courseId: string) => {
  return useQuery({
    queryKey: ['messages', receiverId, courseId],
    queryFn: async () => {
      if (!receiverId || !courseId) return [];
      const { data } = await axios.get(`/api/messages/${receiverId}/${courseId}`);
      return data;
    },
    enabled: !!receiverId && !!courseId,
    refetchInterval: 5000 // Poll for new messages every 5 seconds
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['unread-messages'],
    queryFn: async () => {
      const { data } = await axios.get('/api/messages/unread/count');
      return data.count;
    },
    refetchInterval: 10000 // Poll for unread count every 10 seconds
  });
};

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data } = await axios.get('/api/messages/conversations');
      return data;
    },
    refetchInterval: 10000 // Poll for conversations every 10 seconds
  });
};

export const useEnrolledStudents = (courseId?: string) => {
  return useQuery({
    queryKey: ['enrolled-students', courseId],
    queryFn: async () => {
      if (!courseId) return [];  // no course selected
      const { data } = await axios.get(`/api/courses/${courseId}/enrolled-users`);
      // data.enrolledUsers is an array of { userId: { _id, name, email, avatar }, ... }
      return data.enrolledUsers;
    },
    enabled: !!courseId
  });
};
