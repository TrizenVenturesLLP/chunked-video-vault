
import React, { useState } from 'react';
import { 
  Search, 
  Plus,
  FileText,
  Calendar,
  Eye,
  Edit,
  Trash
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAssessments } from '@/services/assessmentService';

const Assessments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  // Fetch assessments data
  const { data: assessments = [], isLoading } = useAssessments();
  
  // Filter assessments based on search query
  const filteredAssessments = assessments.filter(assessment => 
    assessment.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateAssessment = () => {
    toast({
      title: "Coming Soon",
      description: "Assessment creation will be available soon."
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Assessments</h1>
        <Button onClick={handleCreateAssessment}>
          <Plus className="h-4 w-4 mr-2" />
          Create Assessment
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">All Assessments</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search assessments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-10">Loading assessments...</div>
          ) : filteredAssessments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {searchQuery ? 'No assessments match your search.' : 'No assessments found. Create your first assessment!'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Assigned Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssessments.map((assessment) => (
                  <TableRow key={assessment._id}>
                    <TableCell className="font-medium flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-primary" />
                      {assessment.title}
                    </TableCell>
                    <TableCell>{assessment.type}</TableCell>
                    <TableCell>{assessment.dueDate}</TableCell>
                    <TableCell>{assessment.assignedDays}</TableCell>
                    <TableCell>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                        assessment.status === 'Active' 
                          ? 'bg-green-100 text-green-800'
                          : assessment.status === 'Draft' 
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {assessment.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assessments;
