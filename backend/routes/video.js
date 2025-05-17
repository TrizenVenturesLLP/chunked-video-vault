
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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPathChunks);
  },
  filename: (req, file, cb) => {
    const baseFileName = file.originalname.replace(/\s+/g, '');

    fs.readdir(uploadPathChunks, (err, files) => {
      if (err) {
        return cb(err);
      }

      // Filter files that match the base filename
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
      cb(null, fileName);
    });
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000 * 1024 * 1024 }, // 1000MB limit
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
    const chunkNumber = Number(req.body.chunk);
    const totalChunks = Number(req.body.totalChunks);
    const fileName = req.body.originalname.replace(/\s+/g, '');

    // Log upload progress
    console.log(`Processing chunk ${chunkNumber + 1}/${totalChunks} of ${fileName}`);

    if (chunkNumber === totalChunks - 1) {
      try {
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
            
            // Use a more reliable upload method with smaller chunks
            const filePath = path.join(uploadPath, fileName);
            const fileStats = await fs.stat(filePath);
            
            if (fileStats.size > 50 * 1024 * 1024) {
              console.log('File is large, using chunked upload to MinIO');
              
              // Use direct PutObject for smaller files to avoid streaming issues
              try {
                const UPLOAD_TIMEOUT = 15000; // 15 seconds timeout
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
                console.error('MinIO upload error:', uploadError);
                throw uploadError;
              }
            } else {
              // For smaller files, read the file and use putObject
              try {
                const fileContent = await fs.readFile(filePath);
                await minioClient.putObject(bucketName, fileName, fileContent);
                uploadedToCloud = true;
                storageMode = 'cloud';
                console.log(`File ${fileName} uploaded to MinIO successfully (small file method)`);
              } catch (smallFileError) {
                console.error('MinIO small file upload error:', smallFileError);
                throw smallFileError;
              }
            }
            
            // Generate a presigned URL for the uploaded video
            if (uploadedToCloud) {
              try {
                videoUrl = await minioClient.presignedGetObject(bucketName, fileName, 24 * 60 * 60); // 24 hour expiry
                console.log('Generated presigned URL:', videoUrl);
              } catch (urlError) {
                console.error('Error generating presigned URL:', urlError);
                videoUrl = `${baseURL}${fileName}`;
                console.log('Fallback URL:', videoUrl);
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

// Merge chunks helper function with improved error handling
const MAX_RETRIES = 5;
const RETRY_DELAY = 1000; // 1 second
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function mergeChunks(fileName, totalChunks) {
  console.log(`Starting to merge ${totalChunks} chunks for ${fileName}`);
  const writeStream = fs.createWriteStream(path.join(uploadPath, fileName));

  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = path.join(uploadPathChunks, `${fileName}.part_${i}`);
    let retries = 0;

    console.log(`Processing chunk ${i + 1}/${totalChunks} from ${chunkPath}`);
    
    // Check if chunk exists before attempting to read
    if (!fs.existsSync(chunkPath)) {
      console.error(`Chunk file not found: ${chunkPath}`);
      throw new Error(`Chunk file ${i} not found`);
    }

    while (retries < MAX_RETRIES) {
      try {
        const chunkStream = fs.createReadStream(chunkPath);
        await new Promise((resolve, reject) => {
          chunkStream.pipe(writeStream, { end: false });
          chunkStream.on('end', resolve);
          chunkStream.on('error', reject);
        });
        console.log(`Chunk ${i} merged successfully`);
        await fs.promises.unlink(chunkPath);
        console.log(`Chunk ${i} deleted successfully`);
        break; // Success, move to next chunk
      } catch (error) {
        if (error.code === 'EBUSY') {
          console.log(
            `Chunk ${i} is busy, retrying... (${retries + 1}/${MAX_RETRIES})`
          );
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
      writeStream.end();
      throw new Error(`Failed to merge chunk ${i}`);
    }
  }

  writeStream.end();
  console.log('All chunks merged successfully');
}

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.log('Multer error:', err.message);
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    fs.readdir(uploadPathChunks, (err, files) => {
      if (err) {
        return console.error('Unable to scan directory: ' + err);
      } 
  
      // Iterate over the files and delete each one
      files.forEach(file => {
        const filePath = path.join(uploadPathChunks, file);
  
        fs.promises.unlink(filePath, err => {
          if (err) {
            console.error('Error deleting file:', filePath, err);
          } else {
            console.log('Successfully deleted file:', filePath);
          }
        });
      });
    });
    console.log('General error:', err.message);
    return res.status(500).json({ error: err.message });
  }
  next();
});

export default router;
