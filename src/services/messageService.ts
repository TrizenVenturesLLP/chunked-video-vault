
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

// Mock data for conversations and messages
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

const mockStudents = [
  { _id: '1', name: 'John Doe', email: 'john@example.com', course: { _id: '101', title: 'Web Development Basics' } },
  { _id: '2', name: 'Jane Smith', email: 'jane@example.com', course: { _id: '102', title: 'Advanced JavaScript' } }
];

// API hooks
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

export const useMessages = (conversationId: string, courseId: string) => {
  return useQuery({
    queryKey: ['messages', conversationId, courseId],
    queryFn: async () => {
      if (!conversationId || !courseId) return [];
      // In a real app, this would be an API call
      // return await axios.get(`/api/messages/${conversationId}?courseId=${courseId}`);
      return mockMessages;
    },
    enabled: !!conversationId && !!courseId
  });
};

export const useEnrolledStudents = () => {
  return useQuery({
    queryKey: ['enrolled-students'],
    queryFn: async () => {
      // In a real app, this would be an API call
      // return await axios.get('/api/students/enrolled');
      return mockStudents;
    }
  });
};
