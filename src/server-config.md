
# Backend Server Configuration

This frontend application expects a Node.js backend server configured with Express, Multer for file uploads, and MinIO S3 for storage. Below is a summary of the required backend setup:

## Server Requirements

1. Express server that handles chunked file uploads
2. MinIO S3 bucket configuration for video storage
3. File reassembly logic as shown in the user-provided code

## Example Server Code

The code provided in the request already contains most of the necessary server implementation:

- Express server setup with proper CORS configuration
- Multer configuration for handling file uploads
- Chunk reassembly logic with retry mechanism
- Error handling for upload failures

## MinIO S3 Integration (to be added)

To fully implement the MinIO S3 storage, you would need to:

1. Install the MinIO JavaScript client:
   ```
   npm install minio
   ```

2. Configure the MinIO client:
   ```javascript
   import { Client } from 'minio';

   const minioClient = new Client({
     endPoint: 'your-minio-server',
     port: 9000,
     useSSL: true,
     accessKey: 'your-access-key',
     secretKey: 'your-secret-key'
   });
   ```

3. Modify the file upload handler to store files in MinIO after reassembly:
   ```javascript
   // After mergeChunks successfully completes
   const fileBuffer = await fs.promises.readFile(path.join(uploadPath, fileName));
   await minioClient.putObject('video-bucket', fileName, fileBuffer);
   
   // Update the videoUrl to point to the MinIO object
   const videoUrl = await minioClient.presignedGetObject('video-bucket', fileName, 24*60*60); // 24 hour expiry
   ```

4. Configure proper bucket policies and lifecycle rules in MinIO for your video storage needs

## Running the Backend

Make sure your backend server is running on the expected URL (`http://localhost:3000` by default) before using this frontend application.
