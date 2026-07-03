import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authorization token is missing.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'pizzapilot_jwt_secret_key_98765';
    const decoded = jwt.verify(token, secret);
    
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User profile not found.',
      });
    }

    next();
  } catch (error) {
    console.error(`[AUTH MIDDLEWARE] Token validation error: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Access denied. Invalid or expired token.',
    });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.',
    });
  }
};
