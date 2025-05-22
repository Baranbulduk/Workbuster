import jwt from 'jsonwebtoken';

export const getAdminId = (req) => {
  // First try to get admin ID from header
  const adminId = req.headers['x-admin-id'];
  if (adminId) return adminId;

  // If not in header, try to get from token
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return decoded.user.id;
  } catch (error) {
    return null;
  }
};

export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = decoded.user;
      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: 'Access denied. Admin role required.' });
      }
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
}; 