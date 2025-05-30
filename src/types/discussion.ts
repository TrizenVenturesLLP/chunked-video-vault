
export interface Discussion {
  _id: string;
  title: string;
  content: string;
  userId: {
    _id: string;
    name: string;
  };
  courseId: {
    _id: string;
    title: string;
  };
  isPinned: boolean;
  replies: Array<{
    _id: string;
    content: string;
    userId: {
      _id: string;
      name: string;
    };
    createdAt: string;
  }>;
  createdAt: string;
}
