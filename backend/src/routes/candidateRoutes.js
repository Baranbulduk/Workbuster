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
//const transporter = nodemailer.createTransport({
//  service: 'gmail',
//  auth: {
//    user: 'rexettit@gmail.com',
//    pass: 'prmursgwotixwilt'
//  }, debug: true});


// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'rexettit@gmail.com',
    pass: 'prmursgwotixwilt'
  },
  debug: true
});


// Generate a random password
const generatePassword = () => {
  return crypto.randomBytes(8).toString('hex');
};

// Send update notification email
const sendUpdateNotificationEmail = async (email, firstName) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Your Rexett Profile Has Been Updated',
    html: `
      <h1>Hello ${firstName}!</h1>
      <p>Your profile information has been updated in the Rexett system.</p>
      <p>If you did not request these changes, please contact our support team immediately.</p>
      <p>Best regards,<br>The Rexett Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Update notification email sent successfully');
  } catch (error) {
    console.error('Error sending update notification email:', error);
    throw new Error('Failed to send update notification email');
  }
};

// Send deletion notification email
const sendDeletionNotificationEmail = async (email, firstName) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Your Rexett Account Has Been Deleted',
    html: `
      <h1>Hello ${firstName}!</h1>
      <p>We are writing to inform you that your account has been deleted from the Rexett system.</p>
      <p>If you did not request this deletion, please contact our support team immediately.</p>
      <p>Best regards,<br>The Rexett Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Deletion notification email sent successfully');
  } catch (error) {
    console.error('Error sending deletion notification email:', error);
    throw new Error('Failed to send deletion notification email');
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
    const userPassword = generatePassword();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userPassword, salt);
    
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
      if (process.env.GMAIL_USER && process.env.GOOGLE_APP_PASSWORD) {
        await sendWelcomeEmail(newCandidate.email, newCandidate.firstName, userPassword);
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

    // Handle education data
    if (formData.education) {
      // If education is a string, try to parse it into an object
      if (typeof formData.education === 'string') {
        const educationLines = formData.education.split('\n').filter(line => line.trim());
        formData.education = {
          degree: educationLines[0] || '',
          field: educationLines[1] || '',
          institution: educationLines[2] || '',
          graduationYear: parseInt(educationLines[3]) || new Date().getFullYear()
        };
      }
    }
    
    // Handle resume file
    if (req.file) {
      formData.resume = path.relative(path.join(__dirname, '../../'), req.file.path);
    }

    Object.assign(candidate, formData);
    const updatedCandidate = await candidate.save();

    // Try to send update notification email, but don't fail if it doesn't work
    try {
      if (process.env.GMAIL_USER && process.env.GOOGLE_APP_PASSWORD) {
        await sendUpdateNotificationEmail(updatedCandidate.email, updatedCandidate.firstName);
      } else {
        console.log('Email credentials not configured. Skipping update notification email.');
      }
    } catch (emailError) {
      console.error('Error sending update notification email:', emailError);
      // Don't throw the error, just log it
    }

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

    // Store candidate info before deletion for email
    const candidateInfo = {
      email: candidate.email,
      firstName: candidate.firstName
    };

    await candidate.deleteOne();

    // Try to send deletion notification email, but don't fail if it doesn't work
    try {
      if (process.env.GMAIL_USER && process.env.GOOGLE_APP_PASSWORD) {
        await sendDeletionNotificationEmail(candidateInfo.email, candidateInfo.firstName);
      } else {
        console.log('Email credentials not configured. Skipping deletion notification email.');
      }
    } catch (emailError) {
      console.error('Error sending deletion notification email:', emailError);
      // Don't throw the error, just log it
    }

    res.json({ message: 'Candidate deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Import candidates from CSV
router.post('/import', async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        message: 'Invalid input. Expected an array of candidate items.' 
      });
    }

    const results = {
      success: [],
      failed: []
    };

    for (const item of items) {
      try {
        // Generate a unique personId for each candidate
        const personId = `CAND-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Generate password and hash it
        const userPassword = generatePassword();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userPassword, salt);
        
        // Create candidate object
        const candidateData = {
          firstName: item.firstName || '',
          lastName: item.lastName || '',
          email: item.email || '',
          phone: item.phone || '',
          location: {
            city: item.city || '',
            state: item.state || '',
            country: item.country || ''
          },
          skills: item.skills ? item.skills.split(',').map(skill => skill.trim()) : [],
          experience: parseInt(item.experience) || 0,
          currentRole: item.position || item.currentRole || '',
          expectedSalary: parseInt(item.expectedSalary || item.salary || 0),
          noticePeriod: parseInt(item.noticePeriod || 30),
          availability: item.availability || '2-weeks',
          status: item.status || 'active',
          notes: item.notes || '',
          password: hashedPassword,
          personId: personId
        };
        
        // Create and save the candidate
        const candidate = new Candidate(candidateData);
        const newCandidate = await candidate.save();
        
        // Try to send welcome email
        try {
          if (process.env.GMAIL_USER && process.env.GOOGLE_APP_PASSWORD) {
            await sendWelcomeEmail(newCandidate.email, newCandidate.firstName, userPassword);
          } else {
            console.log('Email credentials not configured. Skipping welcome email.');
          }
        } catch (emailError) {
          console.error('Error sending welcome email:', emailError);
          // Don't throw the error, just log it
        }
        
        results.success.push(newCandidate);
      } catch (itemError) {
        console.error('Error importing candidate item:', itemError);
        results.failed.push({
          item,
          error: itemError.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Imported ${results.success.length} candidates. ${results.failed.length} failed.`,
      results
    });
  } catch (error) {
    console.error('Error importing candidates:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

export default router; 