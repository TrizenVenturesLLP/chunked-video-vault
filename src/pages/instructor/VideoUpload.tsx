
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, InfoIcon } from 'lucide-react';
import VideoUploader from '@/components/VideoUploader';
import { UploadedFile } from '@/components/VideoUploader';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const VideoUpload = () => {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const handleUploadComplete = (fileInfo: UploadedFile, usingFallback: boolean = false) => {
    setUploadedFiles(prev => [...prev, fileInfo]);
    setIsUsingFallback(usingFallback);
    
    if (usingFallback) {
      toast.success("Video processed successfully (using local storage)");
      setUploadError("Cloud storage unavailable. Using local storage as fallback. Your videos are accessible but may have limited durability.");
    } else {
      toast.success("Video uploaded successfully to cloud storage");
      // Clear any previous errors when a successful upload happens
      setUploadError(null);
    }
  };

  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error);
    setUploadError("There was a problem with the video storage service. Your video was processed but may be using a fallback URL.");
    toast.error("Upload encountered an issue");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/instructor/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Video Upload</h1>
      </div>

      {uploadError && (
        <Alert variant="destructive" className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Storage Service Warning</AlertTitle>
          <AlertDescription>
            {uploadError}
          </AlertDescription>
        </Alert>
      )}

      {isUsingFallback && !uploadError && (
        <Alert className="bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Using Local Storage</AlertTitle>
          <AlertDescription>
            Your videos are being stored locally instead of in cloud storage. They will be accessible through the provided URLs but may have limited durability.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <VideoUploader 
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recently Uploaded Videos</CardTitle>
              <CardDescription>
                Videos you've uploaded in this session
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploadedFiles.length > 0 ? (
                <div className="space-y-4">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{file.originalName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / (1024 * 1024)).toFixed(2)}MB
                          </p>
                        </div>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          file.videoUrl.includes('localhost') || file.videoUrl.includes('127.0.0.1') 
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {file.videoUrl.includes('localhost') || file.videoUrl.includes('127.0.0.1') 
                            ? 'Local Storage' 
                            : 'Cloud Storage'}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Video URL:</p>
                        <input 
                          type="text" 
                          value={file.videoUrl} 
                          readOnly
                          className="w-full text-xs p-2 border rounded bg-gray-50"
                          onClick={(e) => {
                            (e.target as HTMLInputElement).select();
                            navigator.clipboard.writeText(file.videoUrl);
                            toast.info("URL copied to clipboard");
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No videos uploaded yet</p>
                  <p className="text-sm">Videos you upload will appear here</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                You can use these video URLs in your course content
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Video Upload Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>Use MP4 format for best compatibility</li>
              <li>Keep videos under 1GB for faster uploads</li>
              <li>Recommended resolution: 720p or 1080p</li>
              <li>Clear audio improves student engagement</li>
              <li>Add descriptive filenames to stay organized</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VideoUpload;
