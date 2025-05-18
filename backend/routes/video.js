
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

// Setup MinIO client
const minioClient = new Client({
  endPoint: 'lmsbackendminio-api.llp.trizenventures.com',
  port: 443,
  useSSL: true,
  accessKey: 'b72084650d4c21dd04b801f0',
  secretKey: 'be2339a15ee0544de0796942ba3a85224cc635'
});

// Ensure the bucket exists
const bucketName = 'video-bucket';
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

// Helper function to sanitize filenames
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
      // Get the chunk number from request body
      const chunkNumber = req.body.chunk;
      const safeFilename = sanitizeFilename(file.originalname || req.body.originalname).replace(/\s+/g, '');
      
      if (chunkNumber !== undefined) {
        const fileName = `${safeFilename}.part_${chunkNumber}`;
        console.log(`Creating filename for chunk: ${fileName}`);
        cb(null, fileName);
      } else {
        cb(new Error('Chunk number not provided'));
      }
    } catch (error) {
      console.error('Error in filename generation:', error);
      cb(error);
    }
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit per chunk
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/') || file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new Error('Not a video file. Please upload only videos.'));
    }
  },
});

// Handle chunk uploads
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
    
    // Return success response without trying to merge immediately
    // Merging will be done at the /complete endpoint
    const baseURL = minioAvailable 
      ? `https://lmsbackendminio-api.llp.trizenventures.com/${bucketName}/` 
      : `http://${req.get('host')}/uploads/`;
    
    res.status(200).json({
      message: 'Chunk uploaded successfully', 
      file: {
        filename: fileName,
        originalName: req.body.originalname,
        size: req.file.size,
        mimetype: req.body.mimeType || req.file.mimetype,
        baseURL: baseURL,
        videoUrl: `${baseURL}${fileName}`,
        storageMode: minioAvailable ? 'cloud' : 'local'
      },
      chunkNumber: chunkNumber,
      totalChunks: totalChunks
    });
  } catch (error) {
    console.error('Error during file upload:', error);
    res.status(500).json({ error: 'An error occurred while uploading the video chunk.' });
  }
});

// Complete upload and merge chunks
router.post('/upload/complete', async (req, res) => {
  try {
    const fileName = sanitizeFilename(req.body.originalname).replace(/\s+/g, '');
    const totalChunks = parseInt(req.body.totalChunks || '0', 10);
    const availableChunks = req.body.availableChunks || [];
    const mimeType = req.body.mimeType || 'video/mp4';
    
    console.log(`Finalizing upload for ${fileName} with ${availableChunks.length} available chunks out of ${totalChunks}`);
    
    if (availableChunks.length === 0) {
      return res.status(400).json({ error: 'No chunks available to merge' });
    }
    
    // Sort the chunks to ensure correct order
    const sortedChunks = [...availableChunks].sort((a, b) => a - b);
    
    // Merge the chunks
    const mergedFilePath = path.join(uploadPath, fileName);
    try {
      // Merge chunks to local file first
      await mergeChunks(fileName, sortedChunks);
      console.log(`Local merge complete for ${fileName}`);
      
      let storageMode = 'local';
      let videoUrl = `http://${req.get('host')}/uploads/${fileName}`;
      let baseURL = `http://${req.get('host')}/uploads/`;
      let usingFallback = false;
      
      // If MinIO is available, upload the merged file to MinIO
      if (minioAvailable) {
        try {
          console.log(`Uploading merged file to MinIO: ${fileName}`);
          
          await minioClient.fPutObject(
            bucketName,
            fileName,
            mergedFilePath,
            { 'Content-Type': mimeType }
          );
          
          console.log(`Successfully uploaded ${fileName} to MinIO bucket ${bucketName}`);
          
          // Update URL to point to MinIO
          storageMode = 'cloud';
          baseURL = `https://lmsbackendminio-api.llp.trizenventures.com/${bucketName}/`;
          videoUrl = `${baseURL}${fileName}`;
          
          // Make the object public
          try {
            const policy = {
              Version: '2012-10-17',
              Statement: [
                {
                  Effect: 'Allow',
                  Principal: { AWS: ['*'] },
                  Action: ['s3:GetObject'],
                  Resource: [`arn:aws:s3:::${bucketName}/${fileName}`]
                }
              ]
            };
            
            await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
            console.log(`Made ${fileName} publicly accessible in bucket ${bucketName}`);
          } catch (policyErr) {
            console.error('Error setting bucket policy:', policyErr);
          }
          
        } catch (minioErr) {
          console.error('Error uploading to MinIO:', minioErr);
          usingFallback = true;
          storageMode = 'local';
          videoUrl = `http://${req.get('host')}/uploads/${fileName}`;
          baseURL = `http://${req.get('host')}/uploads/`;
        }
      } else {
        usingFallback = true;
      }
      
      const fileInfo = {
        filename: fileName,
        originalName: req.body.originalname,
        videoUrl: videoUrl,
        baseURL: baseURL,
        storageMode: storageMode,
        usingFallback: usingFallback
      };
      
      return res.status(200).json({
        message: 'File processed successfully with available chunks',
        file: fileInfo
      });
      
    } catch (mergeError) {
      console.error('Error merging chunks:', mergeError);
      return res.status(500).json({ error: `Error merging chunks: ${mergeError.message}` });
    }
  } catch (error) {
    console.error('Error during file completion:', error);
    res.status(500).json({ error: 'An error occurred while finalizing the video.' });
  }
});

// Cleanup endpoint for removing partial uploads
router.post('/upload/cleanup', async (req, res) => {
  try {
    const fileName = sanitizeFilename(req.body.filename).replace(/\s+/g, '');
    console.log(`Cleaning up any chunks for ${fileName}`);
    
    const files = await fs.readdir(uploadPathChunks);
    const matchingFiles = files.filter(file => file.startsWith(fileName));
    
    let deletedCount = 0;
    for (const file of matchingFiles) {
      try {
        await fs.unlink(path.join(uploadPathChunks, file));
        deletedCount++;
      } catch (unlinkErr) {
        console.error(`Error deleting chunk ${file}:`, unlinkErr);
      }
    }
    
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

// Function to merge available chunks
async function mergeChunks(fileName, chunkIndices) {
  if (chunkIndices.length === 0) {
    throw new Error('No chunks available to merge');
  }
  
  console.log(`Starting to merge ${chunkIndices.length} chunks for ${fileName}`);
  const outputFilePath = path.join(uploadPath, fileName);
  const writeStream = fs.createWriteStream(outputFilePath);
  
  try {
    for (const chunkIndex of chunkIndices) {
      const chunkPath = path.join(uploadPathChunks, `${fileName}.part_${chunkIndex}`);
      
      console.log(`Processing chunk ${chunkIndex} from ${chunkPath}`);
      
      // Check if the chunk exists before trying to read it
      if (!await fs.pathExists(chunkPath)) {
        console.error(`Chunk file not found, skipping: ${chunkPath}`);
        continue; // Skip this chunk and continue with others
      }
      
      // Read and write the chunk
      await new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(chunkPath);
        readStream.pipe(writeStream, { end: false });
        readStream.on('end', resolve);
        readStream.on('error', reject);
      });
      
      console.log(`Chunk ${chunkIndex} merged successfully`);
      
      // Delete the chunk file after merging
      try {
        await fs.unlink(chunkPath);
        console.log(`Chunk ${chunkIndex} deleted successfully`);
      } catch (unlinkError) {
        console.error(`Error deleting chunk ${chunkIndex}:`, unlinkError);
      }
      
      // Free up memory periodically
      if (chunkIndex % 10 === 0 && global.gc) {
        global.gc();
      }
    }
    
    // End the write stream
    await new Promise((resolve, reject) => {
      writeStream.end(err => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log(`Successfully merged ${chunkIndices.length} chunks for ${fileName}`);
    return outputFilePath;
  } catch (error) {
    // Close the write stream if there's an error
    writeStream.end();
    console.error('Error during merge:', error);
    
    // Clean up the partially merged file
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
