
import { toast } from "sonner";

const API_URL = "http://localhost:3000/api";

export interface UploadProgressCallback {
  (progress: number): void;
}

export interface UploadCompleteCallback {
  (fileInfo: any): void;
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
  // Use 500KB chunks for reliable uploads
  const chunkSize = 500 * 1024; // 500KB chunks
  const chunks = Math.ceil(file.size / chunkSize);
  let lastProgressUpdate = Date.now();
  const progressUpdateInterval = 500; // Update progress max every 500ms
  
  try {
    console.log(`Starting upload of ${file.name} in ${chunks} chunks`);
    
    // Upload chunks sequentially to avoid memory issues and ensure order
    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      const formData = new FormData();
      
      formData.append("video", chunk, file.name);
      formData.append("chunk", i.toString());
      formData.append("totalChunks", chunks.toString());
      formData.append("originalname", file.name);
      
      // Update progress more reasonably to avoid UI freezes
      const now = Date.now();
      if (now - lastProgressUpdate > progressUpdateInterval) {
        const estimatedProgress = ((i + 1) / chunks) * 100;
        onProgress(Math.min(estimatedProgress, 100));
        lastProgressUpdate = now;
      }
      
      try {
        let attempts = 0;
        const maxAttempts = 3;
        let success = false;
        
        while (!success && attempts < maxAttempts) {
          try {
            attempts++;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout per chunk
            
            const response = await fetch(`${API_URL}/upload`, {
              method: "POST",
              body: formData,
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
              throw new Error(errorData.error || `Chunk upload failed with status: ${response.status}`);
            }

            success = true;
            
            const responseData = await response.json();
            
            // If this was the last chunk, the server already merged the file and we can complete
            if (i === chunks - 1 && responseData.file) {
              onComplete(responseData.file);
              onProgress(100);
              
              // Show appropriate toast message based on storage mode
              const isLocalStorage = responseData.file.storageMode === 'local' || responseData.file.usingFallback;
              if (isLocalStorage) {
                toast.info("Video uploaded to local storage", {
                  duration: 5000
                });
              } else {
                toast.success("Video uploaded to cloud storage successfully");
              }
            }
            
          } catch (retryError) {
            if (attempts >= maxAttempts) {
              throw retryError;
            }
            console.log(`Chunk ${i} upload attempt ${attempts} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 2000 * attempts)); // Exponential backoff
          }
        }
      } catch (error) {
        console.error(`Error uploading chunk ${i}:`, error);
        throw error;
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
