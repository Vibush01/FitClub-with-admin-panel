const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adds user id and role to req
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token, authorization denied' });
  }
};

// Optional: Role-based middleware
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

module.exports = { authMiddleware, restrictTo };