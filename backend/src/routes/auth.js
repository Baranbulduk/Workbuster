import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      firstName,
      lastName,
      email,
      password,
      role: role || 'user' // Use provided role or default to 'user'
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user
    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }, // Extended to 7 days like employee tokens
      (err, token) => {
        if (err) throw err;
        res.json({ token, role: user.role });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password });

    // Check if user exists
    const user = await User.findOne({ email });
    console.log('User found:', user ? user.email : 'No user');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Log user role
    console.log('User role:', user.role);

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }, // Extended to 7 days like employee tokens
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          role: user.role,
          adminId: user._id,
          admin: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
          }
        });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify and refresh admin token
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ valid: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.user.id);

    if (!user || user.role !== 'admin') {
      return res.status(401).json({ valid: false, message: 'Invalid token' });
    }

    // Check if token is about to expire (less than 1 day remaining)
    const tokenExp = decoded.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeUntilExpiry = tokenExp - now;
    const oneDay = 24 * 60 * 60 * 1000;

    let newToken = null;
    if (timeUntilExpiry < oneDay) {
      // Generate new token
      const payload = {
        user: {
          id: user._id,
          role: user.role
        }
      };
      newToken = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
    }

    res.status(200).json({
      valid: true,
      token: newToken || token,
      admin: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error verifying admin token:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        valid: false,
        expired: true,
        message: 'Token has expired'
      });
    }
    res.status(500).json({ valid: false, message: 'Error verifying token' });
  }
});

// Update password
router.put('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  })
], async (req, res) => {
  try {
    console.log('--- [CHANGE PASSWORD] Endpoint hit ---');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Token:', token);

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token and get user
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('Decoded JWT:', decoded);
    } catch (err) {
      console.log('JWT verification error:', err);
      return res.status(401).json({ message: 'Invalid token' });
    }
    const user = await User.findById(decoded.user.id);
    console.log('User found:', !!user, user ? user.email : null);

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    console.log('Current password valid:', isCurrentPasswordValid);
    if (!isCurrentPasswordValid) {
      console.log('Current password is incorrect');
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedNewPassword;
    await user.save();
    console.log('Password updated successfully for user:', user.email);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 