
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

// Setup MinIO client with better error handling
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'lmsbackendminio-api.llp.trizenventures.com',
  port: parseInt(process.env.MINIO_PORT) || 443,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'b72084650d4c21dd04b801f0',
  secretKey: process.env.MINIO_SECRET_KEY || 'be2339a15ee0544de0796942ba3a85224cc635'
});

// Ensure the bucket exists
const bucketName = process.env.MINIO_BUCKET || 'video-bucket';

// Create bucket with more robust error handling
(async function initializeBucket() {
  try {
    console.log('Checking if bucket exists:', bucketName);
    const bucketExists = await minioClient.bucketExists(bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket ${bucketName} does not exist. Creating it...`);
      await minioClient.makeBucket(bucketName);
      console.log(`Created bucket: ${bucketName}`);
      
      // Set bucket policy to public (optional - only if you want public access)
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
  } catch (err) {
    console.error('Error checking/creating bucket:', err);
    console.log('Will attempt to create bucket on first upload if needed.');
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
        
        // Before uploading to MinIO, make sure the bucket exists (double-check)
        let bucketExists = false;
        try {
          bucketExists = await minioClient.bucketExists(bucketName);
        } catch (bucketError) {
          console.error('Error checking bucket existence:', bucketError);
        }
        
        // Create bucket if it still doesn't exist
        if (!bucketExists) {
          try {
            console.log(`Bucket ${bucketName} does not exist, creating it now...`);
            await minioClient.makeBucket(bucketName);
            console.log(`Created bucket: ${bucketName}`);
          } catch (makeBucketError) {
            console.error('Error creating bucket:', makeBucketError);
            return res.status(500).json({ 
              error: 'Failed to create storage bucket', 
              details: makeBucketError.message 
            });
          }
        }
        
        // Upload to MinIO after merging chunks
        const filePath = path.join(uploadPath, fileName);
        console.log(`Uploading ${filePath} to MinIO bucket ${bucketName}`);
        
        try {
          await minioClient.fPutObject(bucketName, fileName, filePath);
          console.log(`File ${fileName} uploaded to MinIO successfully`);
        } catch (minioError) {
          console.error('Error uploading to MinIO:', minioError);
          
          // Provide fallback URL if MinIO upload fails
          const fallbackUrl = `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}/${bucketName}/${fileName}`;
          
          return res.status(200).json({
            message: 'File processed but cloud storage unavailable. Using local storage.',
            file: {
              filename: fileName,
              originalName: req.body.originalname,
              size: req.file.size,
              mimetype: req.file.mimetype,
              baseURL: `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}/${bucketName}/`,
              videoUrl: fallbackUrl,
            }
          });
        }
      } catch (mergeError) {
        console.error('Error merging chunks:', mergeError);
        return res.status(500).json({ 
          error: 'Failed to process uploaded file chunks', 
          details: mergeError.message 
        });
      }
    }

    // Generate a presigned URL for the uploaded video
    let videoUrl = '';
    try {
      if (chunkNumber === totalChunks - 1) { 
        videoUrl = await minioClient.presignedGetObject(bucketName, fileName, 24 * 60 * 60); // 24 hour expiry
        console.log('Generated presigned URL:', videoUrl);
      }
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      videoUrl = `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}/${bucketName}/${fileName}`;
      console.log('Fallback URL:', videoUrl);
    }

    const fileInfo = {
      filename: fileName,
      originalName: req.body.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      baseURL: `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}/${bucketName}/`,
      videoUrl: videoUrl || `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}/${bucketName}/${fileName}`,
    };

    console.log('Sending response for chunk:', chunkNumber, 'of', totalChunks);
    
    if (chunkNumber === totalChunks - 1) {
      console.log('File info for final chunk:', fileInfo);
    }

    res.status(200).json({
      message: 'Chunk uploaded successfully',
      file: fileInfo,
    });
  } catch (error) {
    console.error('Error during file upload:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while uploading the video.' });
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
