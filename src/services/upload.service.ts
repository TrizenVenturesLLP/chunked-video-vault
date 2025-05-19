
import { toast } from "sonner";

const API_URL = "http://localhost:3000/api";

export interface UploadProgressCallback {
  (progress: number): void;
}

export interface UploadCompleteCallback {
  (fileInfo: any, usingFallback?: boolean): void;
}

export interface UploadErrorCallback {
  (error: Error): void;
}

export const uploadVideo = async (
  file: File,
  onProgress: UploadProgressCallback,
  onComplete: UploadCompleteCallback,
  onError: UploadErrorCallback
) => {
  const chunkSize = 5 * 1024 * 1024; // 10MB chunks
  const chunks = Math.ceil(file.size / chunkSize);
  
  try {
    for (let start = 0; start < file.size; start += chunkSize) {
      const chunk = file.slice(start, start + chunkSize);
      const formData = new FormData();
      
      formData.append("video", chunk, file.name);
      formData.append("chunk", Math.floor(start / chunkSize).toString());
      formData.append("totalChunks", chunks.toString());
      formData.append("originalname", file.name);

      try {
        console.log(`Uploading chunk ${Math.floor(start / chunkSize) + 1}/${chunks}`);
        const response = await fetch(`${API_URL}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Chunk upload failed with status: ${response.status}`);
        }

        // Calculate accurate progress
        const currentProgress = ((start + chunk.size) / file.size) * 100;
        onProgress(Math.min(currentProgress, 100));
        
        // If this is the final chunk, get the complete file info
        if (Math.floor(start / chunkSize) === chunks - 1) {
          const responseData = await response.json();
          console.log("Final chunk response:", responseData);
          
          // Determine if we're using the fallback storage
          const usingFallback = responseData.message && (
            responseData.message.includes("local storage") || 
            responseData.message.includes("fallback") ||
            (responseData.file && responseData.file.videoUrl && (
              responseData.file.videoUrl.includes('localhost') || 
              responseData.file.videoUrl.includes('127.0.0.1')
            ))
          );
          
          if (responseData.file && responseData.file.videoUrl) {
            // Pass along the entire response data so we can detect if this was a fallback
            const fileInfo = {
              ...responseData.file,
              message: responseData.message
            };
            onComplete(fileInfo, usingFallback);
            onProgress(100); // Ensure we show 100% when complete
          } else {
            throw new Error("Invalid response from server for the final chunk");
          }
        }
      } catch (error) {
        console.error("Error uploading chunk:", error);
        onError(error instanceof Error ? error : new Error("Unknown error during upload"));
        return;
      }
    }
  } catch (error) {
    console.error("Error in upload process:", error);
    onError(error instanceof Error ? error : new Error("Unknown error during upload"));
  }
};

export const validateVideoFile = (file: File): string | null => {
  if (!file) {
    return "Please select a video file";
  }

  if (!file.type.startsWith("video/")) {
    return "Please select a valid video file";
  }

  // 1000MB limit
  if (file.size > 1000 * 1024 * 1024) {
    return "The file size exceeds 1000MB. Please upload a smaller file.";
  }

  return null;
};
