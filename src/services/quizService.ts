import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';

export interface QuizSubmission {
  _id: string;
  courseUrl: string;
  userId: string;
  dayNumber: number;
  title: string;
  score: number;
  submittedDate: string;
  attemptNumber: number;
}

// Fetch quiz submissions for a specific course
export const useQuizSubmissions = (courseUrl?: string) => {
  return useQuery({
    queryKey: ['quiz-submissions', courseUrl],
    queryFn: async () => {
      if (!courseUrl) return [];
      try {
        console.log('Fetching quiz submissions for courseUrl:', courseUrl);
        const { data } = await axios.get(`/api/quizSubmissions/${courseUrl}`);
        console.log('Received quiz submissions:', data);
        return data;
      } catch (error) {
        console.error('Error fetching quiz submissions:', error);
        return [];
      }
    },
    enabled: !!courseUrl
  });
};

// Calculate average quiz score for a student (all attempts, not grouped by day)
export const calculateStudentQuizAverage = (submissions: QuizSubmission[], studentId: string) => {
  // Filter submissions for this student
  const studentSubmissions = submissions.filter(sub => sub.userId.toString() === studentId.toString());

  if (studentSubmissions.length === 0) {
    return 0;
  }

  // Sum all scores and divide by number of attempts
  const totalScore = studentSubmissions.reduce((sum, sub) => sum + sub.score, 0);
  const averageScore = Number((totalScore / studentSubmissions.length).toFixed(1));
  return averageScore;
};