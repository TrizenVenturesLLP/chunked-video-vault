
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

// Configure multer for chunk uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPathChunks);
  },
  filename: (req, file, cb) => {
    try {
      const baseFileName = file.originalname.replace(/\s+/g, '');
      // Use the actual chunk number from the request body
      const chunkNumber = req.body.chunk || '0';
      const fileName = `${baseFileName}.part_${chunkNumber}`;
      console.log(`Creating filename for chunk: ${fileName}`);
      cb(null, fileName);
    } catch (error) {
      console.error('Error in filename generation:', error);
      cb(error);
    }
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Reduced to 100MB limit per chunk
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

router.post('/upload', upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file uploaded.' });
  }

  try {
    const chunkNumber = parseInt(req.body.chunk || '0', 10);
    const totalChunks = parseInt(req.body.totalChunks || '1', 10);
    const fileName = req.body.originalname.replace(/\s+/g, '');

    // Log upload progress with more details
    console.log(`Processing chunk ${chunkNumber + 1}/${totalChunks} of ${fileName}`);
    console.log(`Saved chunk file: ${req.file.path}`);
    
    // Check file size and disk space
    try {
      const stats = await fs.stat(req.file.path);
      console.log(`Chunk size: ${stats.size} bytes`);
    } catch (statErr) {
      console.error(`Error checking chunk file stats: ${statErr.message}`);
    }

    // For the last chunk, attempt to merge all chunks
    if (chunkNumber === totalChunks - 1) {
      try {
        // Verify all chunks exist before merging
        const missingChunks = await checkAllChunksExist(fileName, totalChunks);
        
        if (missingChunks.length > 0) {
          console.error(`Missing chunks detected: ${missingChunks.join(', ')}`);
          return res.status(500).json({ 
            error: 'Some chunks are missing. Upload may need to be restarted.',
            details: `Missing chunks: ${missingChunks.join(', ')}`
          });
        }
        
        console.log('All chunks verified. Beginning merge process...');
        await mergeChunks(fileName, totalChunks);
        console.log(`All chunks merged for ${fileName}`);
        
        // Setup variables for storing upload status
        let uploadedToCloud = false;
        let videoUrl = '';
        let storageMode = 'local';
        const localVideoUrl = `http://${req.get('host')}/uploads/${fileName}`;
        const baseURL = `https://lmsbackendminio-api.llp.trizenventures.com/${bucketName}/`;
        
        // Only attempt cloud upload if MinIO is available
        if (minioAvailable) {
          try {
            console.log(`Attempting to upload ${fileName} to MinIO bucket ${bucketName}`);
            const filePath = path.join(uploadPath, fileName);
            
            if (fs.existsSync(filePath)) {
              // Try direct file upload with timeout
              try {
                const UPLOAD_TIMEOUT = 30000; // 30 seconds timeout
                const uploadPromise = minioClient.fPutObject(bucketName, fileName, filePath);
                
                // Create a timeout promise
                const timeoutPromise = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('MinIO upload timeout')), UPLOAD_TIMEOUT)
                );
                
                // Race the upload against the timeout
                await Promise.race([uploadPromise, timeoutPromise]);
                uploadedToCloud = true;
                storageMode = 'cloud';
                console.log(`File ${fileName} uploaded to MinIO successfully`);
              } catch (uploadError) {
                console.error('MinIO fPutObject error:', uploadError);
                
                // Fall back to smaller chunks for upload if file is large
                try {
                  const fileStats = await fs.stat(filePath);
                  if (fileStats.size < 5 * 1024 * 1024) { // For small files (<5MB)
                    const fileContent = await fs.readFile(filePath);
                    await minioClient.putObject(bucketName, fileName, fileContent);
                    uploadedToCloud = true;
                    storageMode = 'cloud';
                    console.log(`Small file ${fileName} uploaded to MinIO successfully`);
                  } else {
                    throw new Error('File too large for small file method');
                  }
                } catch (smallFileError) {
                  console.error('MinIO upload timed out or failed:', smallFileError);
                  throw smallFileError;
                }
              }
            } else {
              throw new Error(`File not found at ${filePath}`);
            }
            
            // Generate a presigned URL if upload was successful
            if (uploadedToCloud) {
              try {
                videoUrl = await minioClient.presignedGetObject(bucketName, fileName, 24 * 60 * 60); // 24 hour expiry
                console.log('Generated presigned URL');
              } catch (urlError) {
                console.error('Error generating presigned URL:', urlError);
                videoUrl = `${baseURL}${fileName}`;
                console.log('Using fallback URL:', videoUrl);
              }
            }
          } catch (minioError) {
            console.error('Error uploading to MinIO:', minioError);
            uploadedToCloud = false;
          }
        } else {
          console.log('MinIO is not available, using local storage');
        }
        
        // If cloud upload failed, use local storage fallback
        if (!uploadedToCloud) {
          console.log('Using local storage fallback');
          videoUrl = localVideoUrl;
          
          return res.status(200).json({
            message: 'File processed but cloud storage unavailable. Using local storage.',
            storageMode: 'local',
            file: {
              filename: fileName,
              originalName: req.body.originalname,
              size: req.file.size,
              mimetype: req.file.mimetype,
              baseURL: baseURL,
              videoUrl: videoUrl,
              usingFallback: true,
              storageMode: 'local'
            }
          });
        }
        
        // Successful cloud upload response
        return res.status(200).json({
          message: 'File uploaded to cloud storage successfully',
          storageMode: 'cloud',
          file: {
            filename: fileName,
            originalName: req.body.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            baseURL: baseURL,
            videoUrl: videoUrl,
            usingFallback: false,
            storageMode: 'cloud'
          }
        });
      } catch (mergeError) {
        console.error('Error merging chunks:', mergeError);
        return res.status(500).json({ 
          error: 'Failed to process uploaded file chunks', 
          details: mergeError.message 
        });
      }
    } else {
      // For intermediate chunks, return simple success response
      const baseURL = `https://lmsbackendminio-api.llp.trizenventures.com/${bucketName}/`;
      
      res.status(200).json({
        message: 'Chunk uploaded successfully',
        chunkNumber: chunkNumber,
        totalChunks: totalChunks,
        file: {
          filename: fileName,
          originalName: req.body.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          baseURL: baseURL,
          videoUrl: ''
        }
      });
    }
  } catch (error) {
    console.error('Error during file upload:', error);
    res.status(500).json({ error: 'An error occurred while uploading the video.' });
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
    if (!await fs.pathExists(chunkPath)) {
      console.error(`Missing chunk at index ${i}: ${chunkPath}`);
      missingChunks.push(i);
    }
  }
  
  return missingChunks;
}

// Merge chunks helper function with improved error handling
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
          const chunkData = await fs.readFile(chunkPath);
          console.log(`Successfully read chunk ${i}, size: ${chunkData.length} bytes`);
          
          await new Promise((resolve, reject) => {
            writeStream.write(chunkData, (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
          
          console.log(`Chunk ${i} merged successfully`);
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
    }

    writeStream.end();
    console.log('All chunks merged successfully');
  } catch (error) {
    writeStream.end();
    console.error('Error during merge operation:', error);
    
    // Clean up the partially created file if an error occurs
    try {
      if (fs.existsSync(outputFilePath)) {
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
