import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Search,
  Send,
  Plus,
  Star,
  Filter,
  Loader2,
  ArrowLeft,
  Mail,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useInstructorDiscussions, useAddReply, useCreateDiscussion, useDeleteDiscussion, useDiscussions } from '@/services/discussionService';
import { useInstructorCourses } from '@/services/courseService';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Discussion } from '@/types/discussion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConversations, useMessages, useEnrolledStudents } from '@/services/messageService';
import { useSendMessage } from '@/services/chatService';
import { cn } from '@/lib/utils';
import { isValidObjectId } from '@/utils/validation';
import { useAuth } from '@/contexts/AuthContext';
import { ContentLoader } from '@/components/loaders';

interface Course {
  _id: string;
  title: string;
}

interface MessageItemProps {
  message: any;
  isInstructor: boolean;
  user: any;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isInstructor, user }) => {
  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isInstructor ? "justify-end" : "justify-start"
      )}
    >
      {!isInstructor && (
        <div className="flex-shrink-0 mr-2">
          <Avatar className="h-8 w-8 border border-border">
            <AvatarFallback>
              {message.senderId.name?.split(' ').map(n => n[0]).join('') || '??'}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      <div className={cn(
        "flex flex-col max-w-[70%]",
        isInstructor ? "items-end" : "items-start"
      )}>
        <div
          className={cn(
            "px-4 py-2 rounded-2xl break-words w-full",
            isInstructor 
              ? "bg-primary text-primary-foreground ml-auto" 
              : "bg-muted"
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        <span className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
        </span>
      </div>

      {isInstructor && (
        <div className="flex-shrink-0 ml-2">
          <Avatar className="h-8 w-8 border border-primary/20">
            <AvatarFallback>
              {user?.name?.split(' ').map(n => n[0]).join('') || '??'}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
};

const DiscussionTab = () => {
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [newDiscussionContent, setNewDiscussionContent] = useState('');
  const [isCreatingDiscussion, setIsCreatingDiscussion] = useState(false);

  const { data: courses = [], isLoading: isLoadingCourses } = useInstructorCourses();
  const { data: discussions = [], isLoading: isLoadingDiscussions } = useDiscussions(selectedCourse);
  const { user } = useAuth();
  const { toast } = useToast();
  const createDiscussionMutation = useCreateDiscussion();
  const deleteDiscussionMutation = useDeleteDiscussion();

  const handleCreateDiscussion = () => {
    if (!newDiscussionTitle.trim() || !newDiscussionContent.trim() || selectedCourse === 'all') {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select a course.",
        variant: "destructive"
      });
      return;
    }

    createDiscussionMutation.mutate({
      courseId: selectedCourse,
      title: newDiscussionTitle,
      content: newDiscussionContent,
      isPinned: false
    }, {
      onSuccess: () => {
        toast({ 
          title: 'Discussion created successfully!',
          description: 'Your discussion has been posted.'
        });
        setNewDiscussionTitle('');
        setNewDiscussionContent('');
        setIsCreatingDiscussion(false);
      },
      onError: () => {
        toast({ 
          title: 'Failed to create discussion', 
          description: 'Please try again.',
          variant: 'destructive' 
        });
      },
    });
  };

  const handleDeleteDiscussion = async (discussionId: string, courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this discussion?')) {
      return;
    }

    try {
      await deleteDiscussionMutation.mutateAsync(
        { discussionId, courseId },
        {
          onSuccess: () => {
            toast({ 
              title: 'Discussion deleted successfully',
              variant: 'default'
            });
          },
          onError: (error: any) => {
            toast({ 
              title: 'Failed to delete discussion',
              description: error.message || 'Please try again',
              variant: 'destructive'
            });
          }
        }
      );
    } catch (error) {
      console.error('Error deleting discussion:', error);
    }
  };

  const filteredDiscussions = discussions.filter(discussion =>
    discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    discussion.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Section - Discussions List */}
      <div className="flex-1">
        <div className="bg-primary rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-semibold text-primary-foreground mb-2">Course Discussions</h1>
          <p className="text-primary-foreground/80">Share your thoughts and connect with peers</p>
          
          <div className="mt-4">
            <Select
              value={selectedCourse}
              onValueChange={setSelectedCourse}
            >
              <SelectTrigger className="w-full bg-primary-foreground text-primary">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full bg-background"
          />
        </div>

        <div className="space-y-4">
          {isLoadingDiscussions ? (
            <ContentLoader message="Loading discussions..." size="md" />
          ) : filteredDiscussions.length === 0 ? (
            <div className="text-center py-8">
              {selectedCourse === 'all' ? (
                <>
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Please select a course to view discussions</p>
                </>
              ) : (
                <>
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No discussions found in this course</p>
                  <Button
                    onClick={() => setIsCreatingDiscussion(true)}
                    variant="link"
                    className="mt-2"
                  >
                    Start a new discussion
                  </Button>
                </>
              )}
            </div>
          ) : (
            filteredDiscussions.map((discussion) => (
              <div
                key={discussion._id}
                className="bg-card rounded-lg p-4 shadow-sm border"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {discussion.userId.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{discussion.title}</h3>
                        {discussion.userId.role === 'instructor' && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-xs">
                            Instructor
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {discussion.userId.name} · {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
                      </p>
                      <p className="mt-2 text-sm">{discussion.content}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                          <MessageSquare className="h-4 w-4" />
                          {discussion.replies.length} Replies
                        </button>
                      </div>
                    </div>
                  </div>
                  {(user?.role === 'instructor' || discussion.userId._id === user?.id) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDiscussion(discussion._id, discussion.courseId._id)}
                      disabled={deleteDiscussionMutation.isPending}
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    >
                      {deleteDiscussionMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Section - Create Discussion */}
      <div className="w-full lg:w-[400px]">
        <Card>
          <CardHeader>
            <CardTitle>Start a Discussion</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateDiscussion();
            }} className="space-y-4">
              <Select
                value={selectedCourse}
                onValueChange={setSelectedCourse}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Discussion title"
                value={newDiscussionTitle}
                onChange={(e) => setNewDiscussionTitle(e.target.value)}
              />

              <Textarea
                placeholder="What would you like to discuss?"
                value={newDiscussionContent}
                onChange={(e) => setNewDiscussionContent(e.target.value)}
                rows={6}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={createDiscussionMutation.isPending || selectedCourse === 'all'}
              >
                {createDiscussionMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Post Discussion
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Course Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">Active Today</span>
                </div>
                <span className="font-medium">{filteredDiscussions.filter(d => 
                  new Date(d.createdAt).toDateString() === new Date().toDateString()
                ).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-sm">Your Posts</span>
                </div>
                <span className="font-medium">{filteredDiscussions.filter(d => 
                  d.userId._id === user?.id
                ).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Messages = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [newDiscussionContent, setNewDiscussionContent] = useState('');
  const [isCreatingDiscussion, setIsCreatingDiscussion] = useState(false);
  
  // Direct message states
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedCourseForDM, setSelectedCourseForDM] = useState<string | null>(null);
  const [newDirectMessage, setNewDirectMessage] = useState('');
  const [dmSearchQuery, setDmSearchQuery] = useState('');
  
  const { data: discussions = [], isLoading: isLoadingDiscussions } = useInstructorDiscussions();
  const { data: courses = [], isLoading: isLoadingCourses } = useInstructorCourses();
  const { data: conversations = [], isLoading: isLoadingConversations } = useConversations();
  const { data: enrolledStudents = [], isLoading: isLoadingStudents } = useEnrolledStudents(
    selectedCourse !== 'all' ? selectedCourse : undefined
  );
  const { data: messages = [], isLoading: isLoadingMessages } = useMessages(selectedConversation || '', selectedCourseForDM || '');
  
  const addReplyMutation = useAddReply();
  const createDiscussionMutation = useCreateDiscussion();
  const deleteDiscussionMutation = useDeleteDiscussion();
  const sendMessageMutation = useSendMessage();

  // Get the current user ID (from user object or default to 'instructor1')
  const currentUserId = user?.id || 'instructor1'; 

  // Add error states
  const [sendError, setSendError] = useState<string | null>(null);

  // Set default course when courses are loaded
  useEffect(() => {
    if (courses.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0]._id);
      setSelectedCourseForDM(courses[0]._id);
    }
  }, [courses, selectedCourse]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedDiscussion) return;

    addReplyMutation.mutate({
      discussionId: selectedDiscussion._id,
      content: newMessage,
    }, {
      onSuccess: () => {
        toast({ title: 'Reply sent successfully!' });
        setNewMessage('');
      },
      onError: () => {
        toast({ title: 'Failed to send reply', variant: 'destructive' });
      },
    });
  };

  const handleSendDirectMessage = () => {
    if (!newDirectMessage.trim() || !selectedConversation || !selectedCourseForDM) {
      setSendError('Please select a student and type a message');
      return;
    }

    // Clear any previous errors
    setSendError(null);

    // Clear the input immediately for better UX
    const messageContent = newDirectMessage.trim();
    setNewDirectMessage('');

    sendMessageMutation.mutate(
      {
        receiverId: selectedConversation,
        courseId: selectedCourseForDM,
        content: messageContent,
      },
      {
        onSuccess: () => {
          toast({ 
            title: 'Message sent',
            variant: 'default',
          });
        },
        onError: (error: any) => {
          // Restore the message content on error
          setNewDirectMessage(messageContent);
          setSendError(error?.response?.data?.message || 'Failed to send message');

          toast({ 
            title: 'Error sending message',
            description: error?.response?.data?.message || 'Please try again',
            variant: 'destructive',
          });
        },
      }
    );
  };

  // Filter conversations based on search
  const filteredConversations = React.useMemo(() => {
    let filtered = conversations;

    // Filter by course if selected
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(conv => conv.course._id === selectedCourse);
    }

    // Filter by search query
    if (dmSearchQuery) {
      filtered = filtered.filter(conv => 
        conv.partner.name.toLowerCase().includes(dmSearchQuery.toLowerCase()) ||
        conv.course.title.toLowerCase().includes(dmSearchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [conversations, dmSearchQuery, selectedCourse]);

  return (
    <div className="w-full h-full">
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Messages</CardTitle>
          <CardDescription>
            Communicate with your students directly through course-specific messages
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="discussions" className="w-full">
            <TabsList className="w-full flex mb-4">
              <TabsTrigger value="discussions" className="flex-1 flex items-center justify-center gap-2 px-2 sm:px-4 min-w-0">
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline truncate">Discussions</span>
                <span className="sm:hidden">Forum</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex-1 flex items-center justify-center gap-2 px-2 sm:px-4 min-w-0">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline truncate">Direct Messages</span>
                <span className="sm:hidden">DMs</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discussions">
              <DiscussionTab />
            </TabsContent>

            <TabsContent value="messages" className="mt-0">
              <div className="flex flex-col lg:flex-row h-[500px] gap-4">
                {/* Left sidebar: Conversations list */}
                <Card className="w-full lg:w-80 flex flex-col bg-white">
                  <div className="p-4 border-b space-y-2">
                    <Select
                      value={selectedCourse}
                      onValueChange={setSelectedCourse}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by course" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* <SelectItem value="all">All Courses</SelectItem> */}
                        {courses.map(course => (
                          <SelectItem key={course._id} value={course._id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search messages..."
                        value={dmSearchQuery}
                        onChange={(e) => setDmSearchQuery(e.target.value)}
                        className="pl-9 w-full"
                      />
                    </div>
                  </div>
                  
                  <ScrollArea className="flex-1">
                    {selectedCourse !== 'all' ? (
                      isLoadingStudents ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : enrolledStudents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                          <p className="text-sm text-muted-foreground">No enrolled students in this course</p>
                        </div>
                      ) : (
                        <div className="space-y-2 p-2">
                          {enrolledStudents.map(student => (
                            <div
                              key={student.userId._id}
                              className={cn(
                                "p-3 rounded-lg cursor-pointer transition-colors",
                                selectedConversation === student.userId._id
                                  ? "bg-primary/10"
                                  : "hover:bg-muted"
                              )}
                              onClick={() => {
                                setSelectedConversation(student.userId._id);
                                setSelectedCourseForDM(selectedCourse);
                                setSendError(null); // Clear any previous errors
                              }}
                            >
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarFallback>
                                    {student.userId.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{student.userId.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {student.userId.email}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                        <p className="text-sm text-muted-foreground">Select a course to view enrolled students</p>
                      </div>
                    )}
                  </ScrollArea>
                </Card>

                {/* Main Chat Area */}
                <Card className="flex-1 flex flex-col bg-white overflow-hidden">
                  {selectedConversation && selectedCourseForDM ? (
                    <>
                      {/* Chat Header */}
                      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                            <AvatarFallback>
                              {enrolledStudents.find(s => s.userId._id === selectedConversation)?.userId.name.split(' ').map(n => n[0]).join('') || '??'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h2 className="font-semibold text-sm sm:text-base">
                              {enrolledStudents.find(s => s.userId._id === selectedConversation)?.userId.name || 'Loading...'}
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {courses.find(c => c._id === selectedCourseForDM)?.title || 'Loading...'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="lg:hidden"
                          onClick={() => {
                            setSelectedConversation(null);
                            setSelectedCourseForDM(null);
                            setSendError(null);
                          }}
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Messages Area */}
                      <ScrollArea className="flex-1 p-4">
                        <div className="space-y-2 flex flex-col">
                          {isLoadingMessages ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                          ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                              <MessageSquare className="h-12 w-12 text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">No messages yet</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Send a message to start the conversation
                              </p>
                            </div>
                          ) : (
                            messages.map((message) => {
                              const isInstructor = message.senderId._id.toString() === user?.id?.toString();
                              return (
                                <MessageItem
                                key={message._id}
                                  message={message}
                                  isInstructor={isInstructor}
                                  user={user}
                                />
                              );
                            })
                          )}
                        </div>
                      </ScrollArea>

                      {/* Message Input */}
                      <div className="p-4 border-t">
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSendDirectMessage();
                          }} 
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                          <div className="flex-1 relative">
                            <Input
                                placeholder="Type your message..."
                              value={newDirectMessage}
                              onChange={(e) => setNewDirectMessage(e.target.value)}
                                className="w-full bg-background border-border focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full px-4 py-2 min-h-[44px]"
                            />
                          </div>
                          <Button 
                            type="submit"
                            size="icon"
                              className="h-11 w-11 rounded-full"
                            disabled={!newDirectMessage.trim() || sendMessageMutation.isPending}
                          >
                            {sendMessageMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                          </div>
                          {sendError && (
                            <p className="text-sm text-destructive">{sendError}</p>
                          )}
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Conversation Selected</h3>
                      <p className="text-sm text-muted-foreground">
                        Select a student from the list to start messaging
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;
