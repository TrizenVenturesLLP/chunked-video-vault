import express from 'express';
import mongoose from 'mongoose';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get quiz submissions for a specific course
router.get('/quizSubmissions/:courseUrl', authenticate, async (req, res) => {
  try {
    const { courseUrl } = req.params;
    console.log('Fetching quiz submissions for courseUrl:', courseUrl);

    // Get all quiz submissions for this course from the quizsubmissions collection
    const submissions = await mongoose.connection.db.collection('quizsubmissions')
      .find({ 
        courseUrl: courseUrl 
      })
      .toArray();

    console.log(`Found ${submissions.length} submissions`);
    if (submissions.length > 0) {
      console.log('Sample submission:', submissions[0]);
    }

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching quiz submissions:', error);
    res.status(500).json({ 
      message: 'Error fetching quiz submissions',
      error: error.message 
    });
  }
});

export default router; 