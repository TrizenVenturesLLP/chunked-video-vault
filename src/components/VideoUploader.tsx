
import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileVideo, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadVideo, validateVideoFile } from "@/services/upload.service";
import { cn } from "@/lib/utils";

export interface UploadedFile {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  videoUrl: string;
  baseURL: string;
}

interface VideoUploaderProps {
  onUploadComplete?: (fileInfo: UploadedFile, usingFallback?: boolean) => void;
  onUploadError?: (error: Error) => void;
}

const VideoUploader = ({ onUploadComplete, onUploadError }: VideoUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const errorMessage = validateVideoFile(file);
      
      if (errorMessage) {
        toast.error(errorMessage);
        return;
      }
      
      setSelectedFile(file);
      setUploadedFile(null);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a video file");
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    await uploadVideo(
      selectedFile,
      (progress) => {
        setUploadProgress(progress);
      },
      (fileInfo) => {
        setIsUploading(false);
        setUploadProgress(100);
        setUploadedFile(fileInfo);
        
        // Check if the response contains a message indicating fallback storage
        const usingFallback = fileInfo.videoUrl.includes('localhost') || 
                              fileInfo.videoUrl.includes('127.0.0.1') || 
                              fileInfo.message?.includes('fallback') ||
                              fileInfo.message?.includes('local storage');
        
        if (onUploadComplete) {
          onUploadComplete(fileInfo, usingFallback);
        }
      },
      (error) => {
        setIsUploading(false);
        toast.error(`Upload encountered an issue: ${error.message}`);
        // If we have an error handler prop, call it
        if (onUploadError) {
          onUploadError(error);
        }
      }
    );
  };
  
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const errorMessage = validateVideoFile(file);
      
      if (errorMessage) {
        toast.error(errorMessage);
        return;
      }
      
      setSelectedFile(file);
      setUploadedFile(null);
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Video</CardTitle>
          <CardDescription>Upload and store your videos securely</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-4 transition-colors text-center",
                dragActive ? "border-primary bg-primary/5" : "border-border",
                isUploading && "opacity-50 pointer-events-none"
              )}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="video/*"
                className="hidden"
              />
              
              <div className="flex flex-col items-center justify-center space-y-2 cursor-pointer">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm">
                    {selectedFile ? 'Change video file' : 'Upload a video file'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Drag and drop or click to upload (max 1000MB)
                  </p>
                </div>
              </div>
            </div>
            
            {selectedFile && !uploadedFile && (
              <div className="flex items-center p-3 bg-secondary/50 rounded-md">
                <FileVideo className="h-6 w-6 mr-4 flex-shrink-0 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
            )}
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {uploadedFile && (
              <div className="flex items-center bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 mr-3" />
                <div>
                  <p className="font-medium text-sm">Upload Complete</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {uploadedFile.originalName}
                  </p>
                  {(uploadedFile.videoUrl.includes('localhost') || uploadedFile.videoUrl.includes('127.0.0.1')) && (
                    <p className="text-xs text-amber-600 mt-1">
                      Using local storage (fallback method)
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <Button 
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading || !!uploadedFile} 
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadedFile ? 'Uploaded' : 'Upload Video'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
        
        {uploadedFile && (
          <CardFooter className="flex flex-col items-start">
            <p className="text-sm text-muted-foreground mb-2">
              Your video is now available at:
            </p>
            <a 
              href={uploadedFile.videoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary underline break-all"
            >
              {uploadedFile.videoUrl}
            </a>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default VideoUploader;
