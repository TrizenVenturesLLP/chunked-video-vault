
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, User, BookOpen, Calendar, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const PendingApproval = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-indigo-700">TRIZEN</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="bg-yellow-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">Application Under Review</CardTitle>
            <CardDescription>
              Thank you for applying to be an instructor at Trizen
            </CardDescription>
            <Badge variant="outline" className="mt-2 bg-yellow-50 text-yellow-700 border-yellow-200">
              Status: Pending Approval
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/40 rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Your Application Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="ml-2 font-medium">{user?.email}</span>
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Name:</span>
                  <span className="ml-2 font-medium">{user?.name}</span>
                </div>
                {user?.instructorProfile && (
                  <>
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Specialty:</span>
                      <span className="ml-2 font-medium">{user.instructorProfile.specialty}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Experience:</span>
                      <span className="ml-2 font-medium">{user.instructorProfile.experience} years</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <Separator />

            <div className="bg-secondary/20 rounded-lg p-6">
              <h3 className="font-semibold mb-2">What happens next?</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <span>Our team will review your application within 2-3 business days</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <span>You'll receive an email notification about your application status</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <span>Once approved, you can start creating and publishing courses</span>
                </li>
              </ul>
            </div>

            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  Logout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm">© 2025 Trizen. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PendingApproval;
