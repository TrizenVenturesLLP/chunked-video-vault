
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Loader2 } from 'lucide-react';
import CourseCard from '@/components/instructor/CourseCard';
import { useInstructorCourses, useDeleteCourse } from '@/services/courseService';
import { toast } from 'sonner';

const InstructorCourses = () => {
  const navigate = useNavigate();
  const { data: courses, isLoading, error } = useInstructorCourses();
  const { mutate: deleteCourse, isPending: isDeleting } = useDeleteCourse();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = () => {
    navigate('/instructor/create-course');
  };

  const handleEdit = (courseId: string) => {
    navigate(`/instructor/edit-course/${courseId}`);
  };

  const handleDelete = (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      setDeletingId(courseId);
      deleteCourse(courseId, {
        onSuccess: () => {
          toast.success('Course deleted successfully');
          setDeletingId(null);
        },
        onError: (error) => {
          toast.error(`Failed to delete course: ${(error as Error).message}`);
          setDeletingId(null);
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading courses...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <h3 className="text-lg font-semibold text-destructive">Error Loading Courses</h3>
        <p className="mt-2">Failed to load your courses. Please try again later.</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Courses</h1>
        <Button onClick={handleCreate} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Create New Course
        </Button>
      </div>

      {courses?.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium">No courses created yet</h3>
          <p className="mt-2 text-muted-foreground">Start creating engaging courses for your students.</p>
          <Button onClick={handleCreate} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Course
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onEdit={() => handleEdit(course._id)}
              onDelete={() => handleDelete(course._id)}
              isDeleting={deletingId === course._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorCourses;
