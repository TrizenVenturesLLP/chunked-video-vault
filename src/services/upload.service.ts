
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
  // Use 10MB chunks for optimal performance
  const chunkSize = 10 * 1024 * 1024; // 10MB chunks
  const chunks = Math.ceil(file.size / chunkSize);
  let lastProgressUpdate = Date.now();
  const progressUpdateInterval = 300; // Update progress frequently
  const uploadedChunks = new Set<number>();
  const failedChunks = new Set<number>();
  const maxConcurrentUploads = 3; // Limit concurrent uploads
  
  try {
    console.log(`Starting upload of ${file.name} in ${chunks} chunks (${chunkSize/1024/1024}MB each)`);
    
    // Function to upload a single chunk
    const uploadChunk = async (chunkIndex: number): Promise<boolean> => {
      // Skip already uploaded chunks
      if (uploadedChunks.has(chunkIndex)) {
        return true;
      }
      
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      const formData = new FormData();
      
      // Send important metadata with each chunk
      formData.append("video", chunk, file.name);
      formData.append("chunk", chunkIndex.toString());
      formData.append("totalChunks", chunks.toString());
      formData.append("originalname", file.name);
      formData.append("mimeType", file.type);
      
      // Update progress reasonably to avoid UI freezes
      const now = Date.now();
      if (now - lastProgressUpdate > progressUpdateInterval) {
        const estimatedProgress = ((uploadedChunks.size + 1) / chunks) * 100;
        onProgress(Math.min(estimatedProgress, 95)); // Cap at 95% until fully complete
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
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
            
            console.log(`Uploading chunk ${chunkIndex} (${Math.round((end-start)/1024/1024 * 100) / 100}MB), attempt ${attempts}`);
            
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
            uploadedChunks.add(chunkIndex);
            console.log(`Chunk ${chunkIndex} uploaded successfully`);
            
            return true;
          } catch (retryError) {
            if (attempts >= maxAttempts) {
              console.error(`Failed to upload chunk ${chunkIndex} after ${attempts} attempts`);
              failedChunks.add(chunkIndex);
              return false;
            }
            console.log(`Chunk ${chunkIndex} upload attempt ${attempts} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 2000 * attempts)); // Exponential backoff
          }
        }
        
        return success;
      } catch (error) {
        console.error(`Error uploading chunk ${chunkIndex}:`, error);
        failedChunks.add(chunkIndex);
        return false;
      }
    };
    
    // Upload chunks with limited concurrency
    const uploadChunks = async () => {
      // Start with first chunk for sequential processing
      await uploadChunk(0);
      
      // Then upload the rest in batches
      for (let batchStart = 1; batchStart < chunks; batchStart += maxConcurrentUploads) {
        const batchPromises = [];
        
        for (let i = 0; i < maxConcurrentUploads && batchStart + i < chunks; i++) {
          batchPromises.push(uploadChunk(batchStart + i));
        }
        
        await Promise.all(batchPromises);
        
        // Update overall progress
        const uploadedCount = uploadedChunks.size;
        const progress = (uploadedCount / chunks) * 95; // Cap at 95% until finalization
        onProgress(progress);
      }
    };
    
    // Start the upload process
    await uploadChunks();
    
    // Check if any chunks failed
    if (failedChunks.size > 0) {
      console.log(`${failedChunks.size} chunks failed to upload. Attempting to finalize with available chunks.`);
      onProgress(96);
    } else {
      console.log("All chunks uploaded successfully");
      onProgress(97);
    }
    
    // Try to finalize even if some chunks failed
    try {
      onProgress(98);
      console.log("Finalizing upload...");
      
      const finalizeResponse = await fetch(`${API_URL}/upload/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalname: file.name,
          totalChunks: chunks,
          availableChunks: Array.from(uploadedChunks),
          mimeType: file.type
        }),
      });
      
      if (!finalizeResponse.ok) {
        const errorData = await finalizeResponse.json();
        throw new Error(errorData.error || `Finalization failed with status: ${finalizeResponse.status}`);
      }
      
      const responseData = await finalizeResponse.json();
      
      onProgress(100);
      onComplete(responseData.file);
      
      if (responseData.file.storageMode === 'cloud') {
        toast.success("Video uploaded to MinIO cloud storage successfully");
      } else {
        toast.info("Video uploaded to local storage", {
          duration: 5000
        });
      }
      
    } catch (finalizeError) {
      console.error("Error finalizing upload:", finalizeError);
      onError(finalizeError instanceof Error ? finalizeError : new Error("Unknown error during finalization"));
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
