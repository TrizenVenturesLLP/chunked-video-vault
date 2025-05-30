
import { useState } from "react";
import VideoUploader from "@/components/VideoUploader";
import { VideoFile } from "@/types/video.types";
import { Separator } from "@/components/ui/separator";
import { ArrowDown, FileVideo } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";

const Index = () => {
  const [uploadedVideos, setUploadedVideos] = useState<VideoFile[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);

  const handleUploadComplete = (fileInfo: any) => {
    const newVideo: VideoFile = {
      filename: fileInfo.filename,
      originalName: fileInfo.originalName,
      size: fileInfo.size,
      mimetype: fileInfo.mimetype,
      videoUrl: fileInfo.videoUrl,
      uploadedAt: new Date(),
    };
    
    setUploadedVideos([newVideo, ...uploadedVideos]);
    setSelectedVideo(newVideo);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Chunked Video Upload
          </h1>
          <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
            Upload large video files with automatic chunking and MinIO S3 storage
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <VideoUploader onUploadComplete={handleUploadComplete} />
          
          {selectedVideo && (
            <div className="mt-8">
              <div className="flex items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Current Video
                </h2>
                <Separator className="flex-grow ml-4" />
              </div>
              <VideoPlayer videoUrl={selectedVideo.videoUrl} title={selectedVideo.originalName} />
            </div>
          )}
          
          {uploadedVideos.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Uploaded Videos
                </h2>
                <Separator className="flex-grow ml-4" />
              </div>
              
              <div className="space-y-4">
                {uploadedVideos.map((video, index) => (
                  <div 
                    key={index} 
                    className="flex items-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="h-12 w-12 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-4">
                      <FileVideo className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {video.originalName}
                      </h3>
                      <div className="flex text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className="truncate">
                          {new Intl.DateTimeFormat('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          }).format(video.uploadedAt)}
                        </span>
                        <span className="mx-2">•</span>
                        <span>
                          {formatFileSize(video.size)}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      className={`ml-4 px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        selectedVideo && selectedVideo.videoUrl === video.videoUrl 
                          ? "bg-primary text-primary-foreground" 
                          : "text-primary bg-primary/10 hover:bg-primary/20"
                      }`}
                    >
                      {selectedVideo && selectedVideo.videoUrl === video.videoUrl ? "Playing" : "Play"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              How It Works
            </h2>
            <div className="space-y-6">
              <div className="flex">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                  1
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Client-Side Chunking
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Large video files are automatically split into smaller chunks (10MB each) in your browser
                  </p>
                </div>
              </div>
              
              <ArrowDown className="h-6 w-6 mx-auto text-blue-500" />
              
              <div className="flex">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                  2
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Server Processing
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Each chunk is uploaded separately and then reassembled on the server
                  </p>
                </div>
              </div>
              
              <ArrowDown className="h-6 w-6 mx-auto text-blue-500" />
              
              <div className="flex">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                  3
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    MinIO S3 Storage
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Completed videos are stored in MinIO S3 object storage for reliable access
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default Index;

