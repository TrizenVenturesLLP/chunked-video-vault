
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Edit,
  Eye, 
  MoreVertical,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Course } from '@/services/courseService';

interface CourseCardProps {
  course: Course;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

const CourseCard = ({ course, onEdit, onDelete, isDeleting }: CourseCardProps) => {
  const navigate = useNavigate();

  const handleEditCourse = () => {
    if (onEdit) {
      onEdit();
    } else {
      navigate(`/instructor/courses/${course._id}/content`);
    }
  };

  const handlePreviewCourse = () => {
    // For now just navigate to course content
    navigate(`/instructor/courses/${course._id}/content`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        <img 
          src={course.image || "https://placehold.co/600x400?text=Course+Image"} 
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80 rounded-full hover:bg-white">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditCourse}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Course
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePreviewCourse}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete Course"}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 truncate">{course.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {course.description}
        </p>
        <div className="flex items-center text-sm text-muted-foreground">
          <div className="flex items-center mr-4">
            <Users className="h-4 w-4 mr-1" />
            <span>{course.students || 0}</span>
          </div>
          <span>{course.level} • {course.duration}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={handlePreviewCourse}
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button 
          size="sm" 
          className="flex-1"
          onClick={handleEditCourse}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
