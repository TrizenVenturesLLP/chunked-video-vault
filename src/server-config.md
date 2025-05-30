
# Backend Server Configuration

This frontend application connects to a Node.js backend server that handles chunked video uploads and stores them in MinIO S3. Follow these steps to set up the backend:

## Backend Setup Instructions

1. Navigate to the backend directory: `cd backend`

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your MinIO server (if not already running):
   - Download and install MinIO from https://min.io/download
   - Start the MinIO server locally or use a cloud-hosted instance

4. Configure environment variables in `backend/.env`:
   ```
   MINIO_ENDPOINT=your-minio-server
   MINIO_PORT=9000
   MINIO_USE_SSL=false
   MINIO_ACCESS_KEY=your-access-key
   MINIO_SECRET_KEY=your-secret-key
   MINIO_BUCKET=video-bucket
   PORT=3000
   ```

5. Start the backend server:
   ```
   npm start
   ```

## Features Implemented

The backend server provides:
- Express server handling chunked file uploads
- Multer configuration for processing file chunks
- File reassembly logic with retry mechanism
- MinIO S3 integration for video storage
- Presigned URLs for secure video access

## Folder Structure

```
backend/
  ├── server.js         # Main server entry point
  ├── routes/           # Express routes
  │   └── video.js      # Video upload route handlers
  ├── .env              # Environment configuration
  ├── uploads/          # Temporary storage for merged files
  ├── chunks/           # Temporary storage for file chunks
  └── package.json      # Backend dependencies
```

Make sure the backend server is running on http://localhost:3000 before attempting to upload videos from the frontend.
