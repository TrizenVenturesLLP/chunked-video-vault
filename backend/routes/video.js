import express from 'express';
import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';
import { Client } from 'minio';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const uploadPath = path.join(process.cwd(), 'uploads');
const uploadPathChunks = path.join(process.cwd(), 'chunks');

// Ensure the upload directories exist
await fs.mkdir(uploadPath, { recursive: true });
await fs.mkdir(uploadPathChunks, { recursive: true });

// Setup MinIO client with fixed credentials for testing
const minioClient = new Client({
  // Use hardcoded credentials for testing if environment variables are not set
  endPoint: 'lmsbackendminio-api.llp.trizenventures.com',
  port: 443,
  useSSL: true,
  accessKey: 'b72084650d4c21dd04b801f0',
  secretKey: 'be2339a15ee0544de0796942ba3a85224cc635'
});

// Ensure the bucket exists
const bucketName = 'webdevbootcamp1';
let minioAvailable = false;

// Check MinIO connection status
(async function checkMinioConnection() {
  try {
    console.log('Testing MinIO connection...');
    const connectionTestTimeout = setTimeout(() => {
      console.error('MinIO connection test timed out');
      minioAvailable = false;
    }, 5000);
    
    await minioClient.listBuckets();
    clearTimeout(connectionTestTimeout);
    console.log('MinIO connection successful');
    minioAvailable = true;
    
    // Create bucket if it doesn't exist
    try {
      const bucketExists = await minioClient.bucketExists(bucketName);
      if (!bucketExists) {
        await minioClient.makeBucket(bucketName);
        console.log(`Created bucket: ${bucketName}`);
      } else {
        console.log(`Bucket ${bucketName} already exists.`);
      }
    } catch (bucketErr) {
      console.error('Error checking/creating bucket:', bucketErr);
      minioAvailable = false;
    }
  } catch (error) {
    console.error('MinIO connection failed:', error.message);
    minioAvailable = false;
    console.log('Will use local storage fallback for video uploads');
  }
})();

// Helper function to sanitize filenames to prevent path traversal
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
};

// Configure multer for chunk uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPathChunks);
  },
  filename: (req, file, cb) => {
    try {
      // Sanitize the base file name
      const safeFilename = sanitizeFilename(file.originalname);
      const baseFileName = safeFilename.replace(/\s+/g, '');
      
      fs.readdir(uploadPathChunks, (err, files) => {
        if (err) {
          return cb(err);
        }
  
        // Get the chunk number from request body if provided
        if (req.body.chunk !== undefined) {
          const chunkNumber = req.body.chunk;
          const fileName = `${baseFileName}.part_${chunkNumber}`;
          console.log(`Creating filename for specified chunk: ${fileName}`);
          cb(null, fileName);
          return;
        }
  
        // Otherwise, determine the next available chunk number
        const matchingFiles = files.filter((f) => f.startsWith(baseFileName));
  
        let chunkNumber = 0;
        if (matchingFiles.length > 0) {
          // Extract the highest chunk number
          const highestChunk = Math.max(
            ...matchingFiles.map((f) => {
              const match = f.match(/\.part_(\d+)$/);
              return match ? parseInt(match[1], 10) : -1;
            })
          );
          chunkNumber = highestChunk + 1;
        }
  
        const fileName = `${baseFileName}.part_${chunkNumber}`;
        console.log(`Creating filename for chunk: ${fileName}`);
        cb(null, fileName);
      });
    } catch (error) {
      console.error('Error in filename generation:', error);
      cb(error);
    }
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit per chunk
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith('video/') ||
      file.mimetype === 'application/octet-stream'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Not a video file. Please upload only videos.'));
    }
  },
});

// Regular chunk upload endpoint
router.post('/upload', upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file uploaded.' });
  }

  try {
    const chunkNumber = parseInt(req.body.chunk || '0', 10);
    const totalChunks = parseInt(req.body.totalChunks || '1', 10);
    const fileName = sanitizeFilename(req.body.originalname).replace(/\s+/g, '');

    console.log(`Processing chunk ${chunkNumber + 1}/${totalChunks} of ${fileName}`);
    console.log(`Saved chunk file: ${req.file.path}`);
    
    // If this is the last chunk, merge all chunks
    if (chunkNumber === totalChunks - 1) {
      try {
        await mergeChunks(fileName, totalChunks);
        console.log(`All chunks merged for ${fileName}`);
      } catch (mergeError) {
        console.error('Error merging chunks:', mergeError);
        return res.status(500).json({ error: `Error merging chunks: ${mergeError.message}` });
      }
    }

    // Return success response
    const baseURL = minioAvailable 
      ? `https://lmsbackendminio-api.llp.trizenventures.com/${bucketName}/` 
      : `http://${req.get('host')}/uploads/`;
    
    const videoUrl = minioAvailable
      ? `${baseURL}${fileName}`
      : `http://${req.get('host')}/uploads/${fileName}`;
    
    const fileInfo = {
      filename: fileName,
      originalName: req.body.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      baseURL: baseURL,
      videoUrl: videoUrl,
      storageMode: minioAvailable ? 'cloud' : 'local',
      usingFallback: !minioAvailable
    };

    res.status(200).json({
      message: chunkNumber === totalChunks - 1 
        ? 'All chunks uploaded and merged successfully' 
        : 'Chunk uploaded successfully',
      file: fileInfo,
    });
  } catch (error) {
    console.error('Error during file upload:', error);
    res.status(500).json({ error: 'An error occurred while uploading the video chunk.' });
  }
});

// Keep upload/finalize endpoint for backward compatibility
router.post('/upload/finalize', async (req, res) => {
  try {
    const totalChunks = parseInt(req.body.totalChunks || '1', 10);
    const fileName = sanitizeFilename(req.body.originalname).replace(/\s+/g, '');
    
    console.log(`Finalizing upload for ${fileName} with ${totalChunks} chunks`);
    
    // Verify all chunks exist before merging
    const missingChunks = await checkAllChunksExist(fileName, totalChunks);
    
    if (missingChunks.length > 0) {
      console.error(`Missing chunks detected: ${missingChunks.join(', ')}`);
      return res.status(500).json({ 
        error: 'Some chunks are missing. Upload may need to be restarted.',
        details: `Missing chunks: ${missingChunks.join(', ')}`,
        missingChunks: missingChunks
      });
    }
    
    console.log('All chunks verified. Beginning merge process...');
    await mergeChunks(fileName, totalChunks);
    console.log(`All chunks merged for ${fileName}`);
    
    const videoUrl = `http://${req.get('host')}/uploads/${fileName}`;
    const baseURL = `https://lmsbackendminio-api.llp.trizenventures.com/${bucketName}/`;
    
    return res.status(200).json({
      message: 'File processed successfully',
      storageMode: 'local',
      file: {
        filename: fileName,
        originalName: req.body.originalname,
        size: 0, // We don't have this info in the finalize request
        mimetype: 'video/mp4',
        baseURL: baseURL,
        videoUrl: videoUrl,
        usingFallback: true,
        storageMode: 'local'
      }
    });
  } catch (error) {
    console.error('Error during file finalization:', error);
    res.status(500).json({ error: 'An error occurred while finalizing the video upload.' });
  }
});

// Cleanup endpoint to remove partial uploads
router.post('/upload/cleanup', async (req, res) => {
  try {
    const fileName = sanitizeFilename(req.body.filename).replace(/\s+/g, '');
    console.log(`Cleaning up any chunks for ${fileName}`);
    
    // Read all files in the chunks directory
    const files = await fs.readdir(uploadPathChunks);
    
    // Filter for files that match this filename's pattern
    const matchingFiles = files.filter(file => file.startsWith(fileName));
    
    // Delete each matching file
    let deletedCount = 0;
    for (const file of matchingFiles) {
      try {
        await fs.unlink(path.join(uploadPathChunks, file));
        deletedCount++;
      } catch (unlinkErr) {
        console.error(`Error deleting chunk ${file}:`, unlinkErr);
      }
    }
    
    // Also check if a partial merged file exists and delete it
    const mergedFilePath = path.join(uploadPath, fileName);
    try {
      if (await fs.pathExists(mergedFilePath)) {
        await fs.unlink(mergedFilePath);
        console.log(`Deleted partial merged file: ${fileName}`);
        deletedCount++;
      }
    } catch (unlinkErr) {
      console.error(`Error deleting partial merged file:`, unlinkErr);
    }
    
    console.log(`Cleanup complete. Deleted ${deletedCount} files.`);
    res.status(200).json({ 
      message: 'Cleanup complete',
      deletedFiles: deletedCount
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({ error: 'An error occurred during cleanup.' });
  }
});

// Serve uploaded files
router.use('/uploads', express.static(uploadPath));

// New function to check if all chunks exist before merging
async function checkAllChunksExist(fileName, totalChunks) {
  console.log(`Verifying all ${totalChunks} chunks exist for ${fileName}`);
  const missingChunks = [];
  
  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = path.join(uploadPathChunks, `${fileName}.part_${i}`);
    try {
      if (!await fs.pathExists(chunkPath)) {
        console.error(`Missing chunk at index ${i}: ${chunkPath}`);
        missingChunks.push(i);
      }
    } catch (err) {
      console.error(`Error checking chunk ${i}:`, err);
      missingChunks.push(i);
    }
  }
  
  return missingChunks;
}

// Merge chunks helper function with improved error handling and memory management
const MAX_RETRIES = 5;
const RETRY_DELAY = 1000; // 1 second
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function mergeChunks(fileName, totalChunks) {
  console.log(`Starting to merge ${totalChunks} chunks for ${fileName}`);
  const outputFilePath = path.join(uploadPath, fileName);
  const writeStream = fs.createWriteStream(outputFilePath);
  
  try {
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(uploadPathChunks, `${fileName}.part_${i}`);
      let retries = 0;

      console.log(`Processing chunk ${i + 1}/${totalChunks} from ${chunkPath}`);
      
      // Double-check if chunk exists before attempting to read
      if (!await fs.pathExists(chunkPath)) {
        console.error(`Chunk file not found: ${chunkPath}`);
        throw new Error(`Chunk file ${i} not found`);
      }

      while (retries < MAX_RETRIES) {
        try {
          // Use streams for better memory management
          const chunkStream = fs.createReadStream(chunkPath);
          await new Promise((resolve, reject) => {
            chunkStream.pipe(writeStream, { end: false });
            chunkStream.on('end', resolve);
            chunkStream.on('error', reject);
          });
          
          console.log(`Chunk ${i} merged successfully`);
          
          // Delete the chunk file after it's been merged
          try {
            await fs.unlink(chunkPath);
            console.log(`Chunk ${i} deleted successfully`);
          } catch (unlinkError) {
            console.error(`Error deleting chunk ${i}:`, unlinkError);
            // Continue even if deletion fails
          }
          
          break; // Success, move to next chunk
        } catch (error) {
          if (error.code === 'EBUSY') {
            console.log(`Chunk ${i} is busy, retrying... (${retries + 1}/${MAX_RETRIES})`);
            await delay(RETRY_DELAY);
            retries++;
          } else {
            console.error(`Error processing chunk ${i}:`, error);
            throw error; // Unexpected error, rethrow
          }
        }
      }

      if (retries === MAX_RETRIES) {
        console.error(`Failed to merge chunk ${i} after ${MAX_RETRIES} retries`);
        throw new Error(`Failed to merge chunk ${i} after multiple attempts`);
      }
      
      // Free up memory periodically
      if (i % 10 === 0 && global.gc) {
        global.gc();
      }
    }

    // Ensure all data is flushed to disk
    await new Promise((resolve, reject) => {
      writeStream.end(err => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('All chunks merged successfully');
  } catch (error) {
    // Close the write stream if it's still open
    writeStream.end();
    console.error('Error during merge operation:', error);
    
    // Clean up the partially created file if an error occurs
    try {
      if (await fs.pathExists(outputFilePath)) {
        await fs.unlink(outputFilePath);
        console.log('Cleaned up incomplete merged file');
      }
    } catch (cleanupError) {
      console.error('Error cleaning up incomplete file:', cleanupError);
    }
    
    throw error;
  }
}

// Error handling middleware
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.log('Multer error:', err.message);
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    // Clean up chunks on error
    try {
      fs.readdir(uploadPathChunks, (readErr, files) => {
        if (readErr) {
          console.error('Unable to scan directory: ' + readErr);
          return;
        } 
    
        // Iterate over the files and delete each one
        files.forEach(file => {
          const filePath = path.join(uploadPathChunks, file);
    
          fs.unlink(filePath, unlinkErr => {
            if (unlinkErr) {
              console.error('Error deleting file:', filePath, unlinkErr);
            } else {
              console.log('Successfully deleted file:', filePath);
            }
          });
        });
      });
    } catch (cleanupErr) {
      console.error('Error cleaning up chunks:', cleanupErr);
    }
    
    console.log('General error:', err.message);
    return res.status(500).json({ error: err.message });
  }
  next();
});

export default router;
