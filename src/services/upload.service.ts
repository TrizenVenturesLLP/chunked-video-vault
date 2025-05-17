
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
  // Use even smaller chunks to prevent buffer overflows
  const chunkSize = 1 * 1024 * 1024; // 1MB chunks for more reliable uploads
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
        
        // Add timeout and retry logic
        let attempts = 0;
        const maxAttempts = 3;
        let success = false;
        
        while (!success && attempts < maxAttempts) {
          try {
            attempts++;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
            
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
            
            // Calculate accurate progress
            const currentProgress = ((start + chunk.size) / file.size) * 100;
            onProgress(Math.min(currentProgress, 99)); // Cap at 99% until fully complete
            
            // If this is the final chunk, get the complete file info
            if (Math.floor(start / chunkSize) === chunks - 1) {
              const responseData = await response.json();
              console.log("Final chunk response:", responseData);
              
              if (responseData.file && responseData.file.videoUrl) {
                // Check storage mode
                const isLocalStorage = responseData.storageMode === 'local' || 
                                      responseData.message?.includes('local storage') ||
                                      responseData.file.usingFallback;
                
                // Add storage mode info if not already present
                if (!responseData.file.storageMode) {
                  responseData.file.storageMode = isLocalStorage ? 'local' : 'cloud';
                }
                if (responseData.file.usingFallback === undefined) {
                  responseData.file.usingFallback = isLocalStorage;
                }
                
                onComplete(responseData.file);
                onProgress(100); // Ensure we show 100% when complete
                
                // Show appropriate toast message
                if (isLocalStorage) {
                  toast.info("Video uploaded to local storage (Cloud storage unavailable)", {
                    duration: 5000
                  });
                } else {
                  toast.success("Video uploaded to cloud storage successfully");
                }
              } else {
                throw new Error("Invalid response from server for the final chunk");
              }
            }
          } catch (retryError) {
            if (attempts >= maxAttempts) {
              throw retryError;
            }
            console.log(`Chunk upload attempt ${attempts} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds before retry
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
