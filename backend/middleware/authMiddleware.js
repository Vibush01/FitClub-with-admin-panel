const jwt = require('jsonwebtoken');

  const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Token received:', token);

    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
      req.user = decoded;
      next();
    } catch (err) {
      console.error('Token verification error:', err.message);
      res.status(401).json({ message: 'Invalid token, authorization denied' });
    }
  };

  const restrictTo = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied: insufficient permissions' });
      }
      next();
    };
  };

  console.log('Exporting authMiddleware functions:', { authMiddleware, restrictTo });

  module.exports = { authMiddleware, restrictTo };