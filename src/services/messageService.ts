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
      // In a real app, this would be an API call
      // return await axios.get('/api/messages/conversations');
      return mockConversations;
    }
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

// Mock data for conversations and messages for now
const mockConversations = [
  {
    partner: { _id: '1', name: 'John Doe' },
    course: { _id: '101', title: 'Web Development Basics' },
    lastMessage: 'Hi, I had a question about the assignment',
    unreadCount: 2,
    updatedAt: new Date().toISOString()
  },
  {
    partner: { _id: '2', name: 'Jane Smith' },
    course: { _id: '102', title: 'Advanced JavaScript' },
    lastMessage: 'Thanks for the feedback on my project',
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  }
];

const mockMessages = [
  {
    _id: '1',
    senderId: { id: '1', name: 'John Doe' },
    receiverId: { id: 'current-user', name: 'Instructor' },
    content: 'Hi, I had a question about the assignment',
    courseId: '101',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    read: false
  },
  {
    _id: '2',
    senderId: { id: 'current-user', name: 'Instructor' },
    receiverId: { id: '1', name: 'John Doe' },
    content: 'Sure, what do you need help with?',
    courseId: '101',
    createdAt: new Date(Date.now() - 3500000).toISOString(), // 58 minutes ago
    read: true
  }
];
