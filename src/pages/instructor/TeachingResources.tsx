
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  PenTool, 
  Video, 
  MessageSquare, 
  FileText, 
  AlertCircle, 
  Search, 
  GraduationCap,
  Calendar,
  Award,
  Clock,
  FilePlus,
  Users,
  BarChart,
  CheckCircle,
  InfoIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const TeachingResources = () => {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center">
          <BookOpen className="w-8 h-8 mr-2 text-primary" />
          Teaching Resources
        </h1>
      </div>
      
      <Alert className="bg-blue-50 border-blue-200">
        <InfoIcon className="h-4 w-4 text-blue-500" />
        <AlertTitle className="text-blue-700">Resources Coming Soon!</AlertTitle>
        <AlertDescription className="text-blue-600">
          Our teaching resources are not yet available. We're actively developing comprehensive materials to support your teaching journey. Please check back soon!
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default TeachingResources;
