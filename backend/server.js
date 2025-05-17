
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import videoRouter from './routes/video.js';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();

app.use(express.json({
  limit: '500MB',
}));

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(cors());
app.use(morgan('dev'));

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).send('File size limit exceeded (max 500MB).');
    }
  }
  res.status(500).send(err.message);
});

app.use(express.static('public'));

// Route for the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.use('/api', videoRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`app running on port: ${port}`);
});
