import axiosInstance from '@/lib/axios';

export interface ProfileData {
  _id: string;
  name: string;
  email: string;
  role: string;
  displayName: string;
  status: 'pending' | 'approved' | 'rejected';
  bio: string;
  timezone: string;
  isActive: boolean;
  referralCount: number;
  notificationPreferences: {
    courseUpdates: boolean;
    assignmentReminders: boolean;
    discussionReplies: boolean;
  };
  connectedDevices: Array<{
    id: string;
    name: string;
    type: string;
    browser: string;
    lastActive: Date;
  }>;
  twoFactorAuth: {
    enabled: boolean;
    method: 'app' | 'sms';
  };
  instructorProfile: {
    specialty: string;
    experience: number;
    courses: string[];
    rating: number;
    totalReviews: number;
    bio: string;
    phone: string;
    location: string;
    avatar?: string;
    socialLinks: {
      linkedin: string;
      twitter: string;
      website: string;
    };
    teachingHours: number;
  };
  createdAt: string;
  updatedAt: string;
  userId: string;
  profilePicture?: string;
}

export const fetchProfile = async (): Promise<ProfileData> => {
  try {
    const response = await axiosInstance.get('/api/auth/me');
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const updateProfile = async (profileData: Partial<ProfileData>): Promise<ProfileData> => {
  try {
    const response = await axiosInstance.put('/api/user/profile', profileData);
    return response.data.user;
  } catch (error: any) {
    throw error;
  }
};

export const uploadProfilePicture = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await axiosInstance.post('/api/auth/upload-profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.profilePicture;
  } catch (error: any) {
    throw error;
  }
}; 