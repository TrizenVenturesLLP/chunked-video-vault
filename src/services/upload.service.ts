
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
  // Use much smaller chunks to improve reliability (256KB)
  const chunkSize = 256 * 1024; // 256KB chunks for more reliable uploads
  const chunks = Math.ceil(file.size / chunkSize);
  const uploadedChunks = new Set<number>();
  let attemptedChunks = 0;
  let lastProgressUpdate = Date.now();
  const progressUpdateInterval = 500; // Update progress max every 500ms
  
  try {
    console.log(`Starting upload of ${file.name} in ${chunks} chunks`);
    
    // For very large files, we'll upload in batches to prevent memory issues
    const maxConcurrentChunks = 3;
    const maxChunksInMemory = 10;
    const pendingChunks: Array<{chunkNumber: number; start: number}> = [];
    
    // Fill initial batch of chunks
    for (let i = 0; i < Math.min(chunks, maxChunksInMemory); i++) {
      pendingChunks.push({
        chunkNumber: i,
        start: i * chunkSize
      });
    }
    
    // Process chunks in controlled batches
    let activeUploads = 0;
    let nextChunkToQueue = maxChunksInMemory;
    
    while (pendingChunks.length > 0 || activeUploads > 0) {
      // Start new uploads if below concurrent limit and chunks are available
      while (activeUploads < maxConcurrentChunks && pendingChunks.length > 0) {
        const { chunkNumber, start } = pendingChunks.shift()!;
        activeUploads++;
        
        // Upload this chunk
        uploadChunk(chunkNumber, start).then(() => {
          activeUploads--;
          
          // Queue next chunk if available
          if (nextChunkToQueue < chunks) {
            pendingChunks.push({
              chunkNumber: nextChunkToQueue,
              start: nextChunkToQueue * chunkSize
            });
            nextChunkToQueue++;
          }
        });
      }
      
      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Verify all chunks were uploaded successfully
    if (uploadedChunks.size !== chunks) {
      const missingChunks = [];
      for (let i = 0; i < chunks; i++) {
        if (!uploadedChunks.has(i)) {
          missingChunks.push(i);
        }
      }
      
      throw new Error(`Upload incomplete. Missing chunks: ${missingChunks.length > 10 ? 
        `${missingChunks.slice(0, 10).join(', ')}... and ${missingChunks.length - 10} more` : 
        missingChunks.join(', ')}`);
    }
    
    // Signal upload completion
    finishUpload();
    
    async function uploadChunk(chunkNumber: number, start: number) {
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      const formData = new FormData();
      
      formData.append("video", chunk, file.name);
      formData.append("chunk", chunkNumber.toString());
      formData.append("totalChunks", chunks.toString());
      formData.append("originalname", file.name);
      formData.append("chunkSize", chunkSize.toString());
      
      attemptedChunks++;
      
      // Update progress more reasonably to avoid UI freezes
      const now = Date.now();
      if (now - lastProgressUpdate > progressUpdateInterval) {
        const estimatedProgress = (attemptedChunks / chunks) * 90; // Cap at 90% until fully complete
        onProgress(Math.min(estimatedProgress, 90));
        lastProgressUpdate = now;
      }
      
      try {
        let attempts = 0;
        const maxAttempts = 5;
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
            
            // Mark this chunk as successfully uploaded
            uploadedChunks.add(chunkNumber);
            success = true;
            
            // If this is the final chunk, we'll handle that in finishUpload
          } catch (retryError) {
            if (attempts >= maxAttempts) {
              throw retryError;
            }
            console.log(`Chunk ${chunkNumber} upload attempt ${attempts} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 2000 * attempts)); // Exponential backoff
          }
        }
      } catch (error) {
        console.error(`Error uploading chunk ${chunkNumber}:`, error);
        throw error;
      }
    }
    
    async function finishUpload() {
      try {
        // Send a completion request to finalize the upload
        const finalizeData = new FormData();
        finalizeData.append("originalname", file.name);
        finalizeData.append("totalChunks", chunks.toString());
        finalizeData.append("action", "finalize");
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for finalization
        
        const finalizeResponse = await fetch(`${API_URL}/upload/finalize`, {
          method: "POST",
          body: finalizeData,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!finalizeResponse.ok) {
          const errorData = await finalizeResponse.json().catch(() => ({ error: "Finalization failed" }));
          throw new Error(errorData.error || "Failed to finalize upload");
        }
        
        const responseData = await finalizeResponse.json();
        
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
          throw new Error("Invalid response from server after finalization");
        }
      } catch (error) {
        console.error("Error in upload finalization:", error);
        onError(error instanceof Error ? error : new Error("Unknown error during upload finalization"));
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
