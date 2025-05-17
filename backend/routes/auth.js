
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Configure nodemailer
let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

// Authentication middleware
export const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if instructor account is approved
    if (user.role === 'instructor' && user.status === 'pending') {
      return res.status(403).json({ 
        message: 'Your instructor application is still pending approval'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        displayName: user.displayName,
        instructorProfile: user.role === 'instructor' ? user.instructorProfile : undefined
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role = 'student' } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user object
    const userData = {
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      displayName: name
    };

    // Initialize instructor profile with defaults if role is instructor
    if (role === 'instructor') {
      userData.instructorProfile = {
        specialty: req.body.specialty || 'General',
        experience: Number(req.body.experience) || 0,
        rating: 0,
        totalReviews: 0,
        courses: []
      };
    }

    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Instructor signup route
router.post('/instructor-signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const specialty = req.body.specialty || 'General';
    const experience = Number(req.body.experience) || 0;

    // Validate required fields - only name, email, password are truly required now
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new instructor with default values for missing fields
    const instructor = new User({
      name,
      email,
      password: hashedPassword,
      role: 'instructor',
      status: 'pending',
      displayName: name,
      instructorProfile: {
        specialty,
        experience,
        rating: 0,
        totalReviews: 0,
        courses: []
      }
    });

    await instructor.save();

    // Create token
    const token = jwt.sign({ id: instructor._id, role: instructor.role }, JWT_SECRET, { expiresIn: '1d' });

    // Send welcome email if transporter is configured
    if (transporter) {
      try {
        const mailOptions = {
          from: `"Trizen Team" <${process.env.EMAIL_USER}>`,
          to: instructor.email,
          subject: 'Welcome to Trizen - Instructor Application Received',
          html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <h2 style="color: #007BFF;">Welcome to Trizen!</h2>
              <p>Dear ${name},</p>
              <p>Thank you for applying to become an instructor at Trizen. We're excited to have you join our teaching community!</p>
              <p>Your application is currently under review. Here's what happens next:</p>
              <ul>
                <li>Our team will review your application and credentials</li>
                <li>You'll receive an email once your application is approved</li>
                <li>After approval, you can start creating and publishing courses</li>
              </ul>
              <p>While you wait, you can:</p>
              <ul>
                <li>Complete your instructor profile</li>
                <li>Prepare your course materials</li>
                <li>Review our instructor guidelines</li>
              </ul>
              <p>If you have any questions, feel free to contact our support team.</p>
              <p>Best regards,<br>The Trizen Team</p>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Continue with the signup process even if email fails
      }
    }

    // Send response
    res.status(201).json({
      message: 'Instructor application submitted successfully',
      token,
      user: {
        id: instructor._id,
        name: instructor.name,
        email: instructor.email,
        role: instructor.role,
        status: instructor.status
      }
    });

  } catch (error) {
    console.error('Instructor signup error:', error);
    res.status(500).json({ 
      message: 'Failed to create instructor account. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current user route (protected)
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        displayName: user.displayName,
        instructorProfile: user.role === 'instructor' ? user.instructorProfile : undefined
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
