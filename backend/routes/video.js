
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

// Setup MinIO client with better configuration
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'lmsbackendminio-api.llp.trizenventures.com',
  port: parseInt(process.env.MINIO_PORT) || 443,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'b72084650d4c21dd04b801f0',
  secretKey: process.env.MINIO_SECRET_KEY || 'be2339a15ee0544de0796942ba3a85224cc635'
});

// Ensure the bucket exists
const bucketName = process.env.MINIO_BUCKET || 'video-bucket';
let minioAvailable = false;

// Check MinIO connection status
(async function checkMinioConnection() {
  try {
    console.log('Testing MinIO connection...');
    await minioClient.listBuckets();
    console.log('MinIO connection successful');
    minioAvailable = true;
    
    // Create bucket if it doesn't exist
    try {
      const bucketExists = await minioClient.bucketExists(bucketName);
      if (!bucketExists) {
        await minioClient.makeBucket(bucketName);
        console.log(`Created bucket: ${bucketName}`);
        
        // Set bucket policy to public (optional)
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucketName}/*`]
            }
          ]
        };
        
        try {
          await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
          console.log(`Set public read policy on bucket: ${bucketName}`);
        } catch (policyError) {
          console.error('Error setting bucket policy (non-fatal):', policyError);
        }
      } else {
        console.log(`Bucket ${bucketName} already exists.`);
      }
    } catch (bucketErr) {
      console.error('Error checking/creating bucket:', bucketErr);
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
        const baseURL = `http://${process.env.MINIO_ENDPOINT || 'lmsbackendminio-api.llp.trizenventures.com'}:${process.env.MINIO_PORT || 443}/${bucketName}/`;
        
        // Only attempt cloud upload if MinIO is available
        if (minioAvailable) {
          try {
            console.log(`Uploading ${fileName} to MinIO bucket ${bucketName}`);
            
            // Read file buffer and upload with timeout
            const filePath = path.join(uploadPath, fileName);
            const fileBuffer = await fs.promises.readFile(filePath);
            
            // Set a timeout for MinIO operations
            const UPLOAD_TIMEOUT = 30000; // 30 seconds
            
            // Try to upload with a timeout
            await Promise.race([
              minioClient.putObject(bucketName, fileName, fileBuffer),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('MinIO upload timeout')), UPLOAD_TIMEOUT)
              )
            ]);
            
            uploadedToCloud = true;
            console.log(`File ${fileName} uploaded to MinIO successfully`);
            
            // Generate a presigned URL for the uploaded video
            try {
              videoUrl = await minioClient.presignedGetObject(bucketName, fileName, 24 * 60 * 60); // 24 hour expiry
              console.log('Generated presigned URL:', videoUrl);
            } catch (urlError) {
              console.error('Error generating presigned URL:', urlError);
              videoUrl = `${baseURL}${fileName}`;
              console.log('Fallback URL:', videoUrl);
            }
          } catch (minioError) {
            console.error('Error uploading to MinIO:', minioError);
            uploadedToCloud = false;
          }
        }
        
        // If cloud upload failed, use local storage fallback
        if (!uploadedToCloud) {
          console.log('Using local storage fallback');
          videoUrl = `http://${req.get('host')}/uploads/${fileName}`;
          
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
              usingFallback: true
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
            usingFallback: false
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
      const baseURL = `http://${process.env.MINIO_ENDPOINT || 'lmsbackendminio-api.llp.trizenventures.com'}:${process.env.MINIO_PORT || 443}/${bucketName}/`;
      
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

// Add a route to serve files from the uploads directory
router.use('/uploads', express.static(uploadPath));

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
