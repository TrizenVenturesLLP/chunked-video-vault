import mongoose from 'mongoose';

const mcqOptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

const mcqQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [mcqOptionSchema],
  explanation: String
});

const quizSubmissionSchema = new mongoose.Schema({
  courseUrl: { 
    type: String, 
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  dayNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  questions: [mcqQuestionSchema],
  selectedAnswers: [{
    type: Number,
    required: true
  }],
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  submittedDate: {
    type: Date,
    default: Date.now
  },
  attemptNumber: {
    type: Number,
    required: true,
    default: 1
  }
}, {
  timestamps: true
});

// Create compound index for courseUrl and userId
quizSubmissionSchema.index({ courseUrl: 1, userId: 1 });

const QuizSubmission = mongoose.model('QuizSubmission', quizSubmissionSchema);

export default QuizSubmission; 