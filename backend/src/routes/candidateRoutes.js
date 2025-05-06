import express from 'express';
import Candidate from '../models/Candidate.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const router = express.Router();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate a random password
const generatePassword = () => {
  return crypto.randomBytes(8).toString('hex');
};

// Send welcome email with password
const sendWelcomeEmail = async (email, firstName, password) => {
  console.log(process.env.EMAIL_USER);
  console.log(email);
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to Rexett - Your Account Details',
    html: `
      <h1>Welcome to Rexett, ${firstName}!</h1>
      <p>Your account has been created successfully. Here are your login credentials:</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p>Please change your password after your first login.</p>
      <p>Best regards,<br>The Rexett Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};

// Get all candidates
router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single candidate
router.get('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get candidate's resume
router.get('/:id/resume', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    if (!candidate.resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    const resumePath = path.join(__dirname, '../../', candidate.resume);
    res.sendFile(resumePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new candidate
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    // Parse form data
    const formData = req.body;
    
    // Generate password and hash it
    const plainPassword = generatePassword();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    // Convert experience and expectedSalary to numbers
    formData.experience = parseInt(formData.experience, 10);
    formData.expectedSalary = parseInt(formData.expectedSalary, 10);
    
    // Handle location data
    if (formData['location[city]']) {
      formData.location = {
        city: formData['location[city]'],
        state: formData['location[state]'] || '',
        country: formData['location[country]'] || ''
      };
      // Remove the individual location fields
      delete formData['location[city]'];
      delete formData['location[state]'];
      delete formData['location[country]'];
    }
    
    // Handle resume file
    if (req.file) {
      formData.resume = path.relative(path.join(__dirname, '../../'), req.file.path);
    }

    // Add hashed password to form data
    formData.password = hashedPassword;

    const candidate = new Candidate(formData);
    const newCandidate = await candidate.save();

    // Try to send welcome email, but don't fail if it doesn't work
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        await sendWelcomeEmail(newCandidate.email, newCandidate.firstName, plainPassword);
      } else {
        console.log('Email credentials not configured. Skipping welcome email.');
      }
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't throw the error, just log it
    }

    res.status(201).json(newCandidate);
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a candidate
router.put('/:id', upload.single('resume'), async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Parse form data
    const formData = req.body;
    
    // Convert experience and expectedSalary to numbers
    formData.experience = parseInt(formData.experience, 10);
    formData.expectedSalary = parseInt(formData.expectedSalary, 10);
    
    // Handle location data
    if (formData['location[city]']) {
      formData.location = {
        city: formData['location[city]'],
        state: formData['location[state]'] || '',
        country: formData['location[country]'] || ''
      };
      // Remove the individual location fields
      delete formData['location[city]'];
      delete formData['location[state]'];
      delete formData['location[country]'];
    }
    
    // Handle resume file
    if (req.file) {
      formData.resume = path.relative(path.join(__dirname, '../../'), req.file.path);
    }

    Object.assign(candidate, formData);
    const updatedCandidate = await candidate.save();
    res.json(updatedCandidate);
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a candidate
router.delete('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    await candidate.deleteOne();
    res.json({ message: 'Candidate deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 