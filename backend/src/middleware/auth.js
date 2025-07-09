import jwt from 'jsonwebtoken';

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
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token has expired. Please log in again.',
        expired: true,
        expiredAt: error.expiredAt
      });
    }
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
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token has expired. Please log in again.',
          expired: true,
          expiredAt: error.expiredAt
        });
      }
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
}; 