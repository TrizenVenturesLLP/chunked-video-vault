
import { useQuery } from "@tanstack/react-query";

// Define assessment types
export interface Assessment {
  _id: string;
  title: string;
  type: "Quiz" | "Assignment" | "Exam";
  dueDate: string;
  assignedDays: string;
  status: "Active" | "Draft" | "Scheduled";
  courseId?: string;
}

// Mock data for assessments
const mockAssessments: Assessment[] = [];

// Function to get all assessments
export const fetchAssessments = async (): Promise<Assessment[]> => {
  // In a real app, this would be an API call
  // For now, return mock data
  return mockAssessments;
};

// Hook to get assessments with React Query
export const useAssessments = () => {
  return useQuery({
    queryKey: ["assessments"],
    queryFn: fetchAssessments,
  });
};

// Function to get assessment by ID
export const fetchAssessmentById = async (id: string): Promise<Assessment | undefined> => {
  // In a real app, this would be an API call
  // For now, search in mock data
  return mockAssessments.find(assessment => assessment._id === id);
};

// Hook to get assessment by ID with React Query
export const useAssessment = (id: string) => {
  return useQuery({
    queryKey: ["assessments", id],
    queryFn: () => fetchAssessmentById(id),
    enabled: !!id,
  });
};
