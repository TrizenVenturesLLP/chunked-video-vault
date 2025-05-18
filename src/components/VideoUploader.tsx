
import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileVideo, CheckCircle, Loader2, AlertCircle, Cloud, HardDrive, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { uploadVideo, validateVideoFile } from "@/services/upload.service";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export interface UploadedFile {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  videoUrl: string;
  baseURL: string;
  storageMode?: 'local' | 'cloud';
  usingFallback?: boolean;
}

interface VideoUploaderProps {
  onUploadComplete?: (fileInfo: UploadedFile) => void;
}

const VideoUploader = ({ onUploadComplete }: VideoUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [attemptingRetry, setAttemptingRetry] = useState(false);
  
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
      setUploadError(null);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a video file");
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setAttemptingRetry(false);
    
    try {
      await uploadVideo(
        selectedFile,
        (progress) => {
          setUploadProgress(progress);
        },
        (fileInfo) => {
          setIsUploading(false);
          setUploadProgress(100);
          setUploadedFile(fileInfo);
          setUploadError(null);
          setAttemptingRetry(false);
          
          if (onUploadComplete) {
            onUploadComplete(fileInfo);
          }
        },
        (error) => {
          setIsUploading(false);
          setUploadError(error.message);
          toast.error(`Upload failed: ${error.message}`);
        }
      );
    } catch (error) {
      console.error("Upload error:", error);
      setIsUploading(false);
      const errorMessage = error instanceof Error ? error.message : "Unknown upload error";
      setUploadError(errorMessage);
      toast.error(`Upload error: ${errorMessage}`);
    }
  };
  
  const handleRetry = async () => {
    setAttemptingRetry(true);
    
    try {
      // First try to clean up any existing chunks on the server
      await fetch(`${process.env.VITE_API_URL || "http://localhost:3000/api"}/upload/cleanup`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          filename: selectedFile?.name,
        })
      });
      
      // Wait a moment for cleanup to complete
      setTimeout(() => {
        setAttemptingRetry(false);
        setUploadError(null);
        handleUpload();
      }, 1000);
    } catch (error) {
      console.error("Cleanup error:", error);
      setAttemptingRetry(false);
      // Try upload anyway
      handleUpload();
    }
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
    <div className="w-full max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Upload Video</CardTitle>
          <CardDescription>Upload and store your videos securely</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 transition-colors text-center",
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
              
              <div className="flex flex-col items-center justify-center space-y-4 cursor-pointer">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="font-medium">
                    {selectedFile ? 'Change video file' : 'Upload a video file'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop or click to upload (max 1000MB)
                  </p>
                </div>
              </div>
            </div>
            
            {selectedFile && !uploadedFile && (
              <div className="flex items-center p-3 bg-secondary/50 rounded-md">
                <FileVideo className="h-8 w-8 mr-4 flex-shrink-0 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)} • {Math.ceil(selectedFile.size / (256 * 1024))} chunks
                  </p>
                </div>
              </div>
            )}
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading{uploadProgress > 0 && uploadProgress < 90 ? " chunks" : 
                         uploadProgress >= 90 && uploadProgress < 100 ? " (finalizing)" : 
                         "..."}</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground mt-2">
                  {uploadProgress < 90 ? "Uploading file chunks..." : 
                   uploadProgress >= 90 && uploadProgress < 100 ? "Processing and finalizing..." : 
                   "Upload complete!"}
                </p>
              </div>
            )}
            
            {uploadError && !isUploading && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                      Upload Error
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                      {uploadError}
                    </p>
                    <div className="flex space-x-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
                        onClick={() => setUploadError(null)}
                      >
                        Dismiss
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-amber-700 border-amber-300 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/30"
                        onClick={handleRetry}
                        disabled={attemptingRetry}
                      >
                        {attemptingRetry ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Cleaning up...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1" /> Retry Upload
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {uploadedFile && (
              <div className="flex items-center bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-500 mr-4" />
                <div className="flex-1">
                  <p className="font-medium">Upload Complete</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {uploadedFile.originalName}
                  </p>
                  <div className="flex items-center mt-1 text-xs">
                    {uploadedFile.storageMode === 'local' || uploadedFile.usingFallback ? (
                      <>
                        <HardDrive className="h-3 w-3 mr-1 text-amber-500" />
                        <span className="text-amber-600 dark:text-amber-400">Using local storage (cloud unavailable)</span>
                      </>
                    ) : (
                      <>
                        <Cloud className="h-3 w-3 mr-1 text-blue-500" />
                        <span className="text-blue-600 dark:text-blue-400">Stored in cloud</span>
                      </>
                    )}
                  </div>
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
                  {uploadProgress < 90 ? "Uploading" : 
                   uploadProgress >= 90 && uploadProgress < 100 ? "Finalizing" : 
                   "Processing"}
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
            
            {(uploadedFile.storageMode === 'local' || uploadedFile.usingFallback) && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md w-full">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Local Storage Mode
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                      Cloud storage is currently unavailable. Your video is stored locally and might 
                      not be accessible from other devices or locations.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default VideoUploader;
