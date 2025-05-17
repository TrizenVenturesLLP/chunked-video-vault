
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LifeBuoy, 
  HeadphonesIcon, 
  Mail, 
  Clock
} from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const Support = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center">
          <LifeBuoy className="w-8 h-8 mr-2 text-primary" />
          Instructor Support
        </h1>
      </div>
      
      <Alert>
        <HeadphonesIcon className="h-4 w-4" />
        <AlertTitle>Need immediate assistance?</AlertTitle>
        <AlertDescription>
          Our support team is available Monday-Friday, 9am-5pm ET. 
          For urgent issues outside these hours, email <a href="mailto:projects.trizen@gmail.com" className="text-primary hover:underline">projects.trizen@gmail.com</a>
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="contact" className="space-y-4">
        <TabsList className="grid grid-cols-1 mb-4">
          <TabsTrigger value="contact">Contact Us</TabsTrigger>
        </TabsList>
        
        {/* CONTACT TAB */}
        <TabsContent value="contact">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Instructor Support Team</CardTitle>
                <CardDescription>
                  Our dedicated support team is here to help you succeed as an instructor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Technical Support</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      For platform, course creation, and technical issues
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                        <a href="mailto:projects.trizen@gmail.com" className="text-primary hover:underline">
                          projects.trizen@gmail.com
                        </a>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>Response within 24 hours</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Course Quality Team</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      For guidance on creating high-quality course content
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                        <a href="mailto:courses@trizenventures.com" className="text-primary hover:underline">
                        courses@trizenventures.com
                        </a>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>Response within 48 hours</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Payments & Finance</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      For questions about payments, revenues, and taxes
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                        <a href="mailto:projects.trizen@gmail.com" className="text-primary hover:underline">
                          projects.trizen@gmail.com
                        </a>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>Response within 2-3 business days</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Instructor Success Team</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      For career development and general guidance
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                        <a href="mailto:projects.trizen@gmail.com" className="text-primary hover:underline">
                          projects.trizen@gmail.com
                        </a>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>Response within 48 hours</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Office Hours</CardTitle>
                <CardDescription>
                  When our support team is available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Monday - Friday</span>
                    <span>9:00 AM - 5:00 PM ET</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Saturday</span>
                    <span>10:00 AM - 2:00 PM ET</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Sunday</span>
                    <span>Closed</span>
                  </div>
                  
                  <div className="pt-3">
                    <h4 className="font-medium mb-1">Holiday Closures</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>New Year's Day - January 1</li>
                      <li>Memorial Day - Last Monday in May</li>
                      <li>Independence Day - July 4</li>
                      <li>Labor Day - First Monday in September</li>
                      <li>Thanksgiving - Fourth Thursday in November</li>
                      <li>Christmas Day - December 25</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Support;
