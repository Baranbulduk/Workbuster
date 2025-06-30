import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to check if user is an admin
export const requireAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.user.id);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token has expired. Please log in again.',
        expired: true,
        expiredAt: error.expiredAt
      });
    }
    
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check if user is an employee
export const requireEmployee = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.user.id);

    if (!user || user.role !== 'employee') {
      return res.status(403).json({ message: 'Access denied. Employee role required.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Employee auth error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token has expired. Please log in again.',
        expired: true,
        expiredAt: error.expiredAt
      });
    }
    
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Helper function to get admin ID from request
export const getAdminId = (req) => {
  return req.user?.role === 'admin' ? req.user._id : req.user?.createdBy;
}; 