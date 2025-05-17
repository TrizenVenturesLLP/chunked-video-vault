
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Video, Users } from 'lucide-react';

const LiveSessions = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0 sm:space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/instructor/dashboard')}
          className="p-2 sm:p-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Live Sessions</h1>
      </div>

      <Card className="mt-4 sm:mt-6">
        <CardHeader className="text-center">
          <div className="flex flex-col items-center space-y-4">
            <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
            <CardTitle className="text-xl sm:text-2xl">Coming Soon!</CardTitle>
            <CardDescription className="text-base sm:text-lg">
              Live Sessions feature is currently under development
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
            <p className="text-sm sm:text-base text-muted-foreground">
              We're working hard to bring you an amazing live teaching experience. Soon you'll be able to:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 sm:mt-6">
              <Card className="p-4">
                <div className="flex flex-col items-center space-y-2 text-center">
                  <Video className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  <h3 className="font-medium">Host Live Classes</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Conduct interactive live sessions with your students
                  </p>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex flex-col items-center space-y-2 text-center">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  <h3 className="font-medium">Schedule Sessions</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Plan and organize your teaching schedule
                  </p>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex flex-col items-center space-y-2 text-center">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  <h3 className="font-medium">Engage Students</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Real-time interaction with your students
                  </p>
                </div>
              </Card>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6">
              Stay tuned for updates! We'll notify you when this feature becomes available.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveSessions;
