import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const auth = async (req, res, next) => {
  try {
 
    const isDev = process.env.NODE_ENV !== 'production';

    if (isDev) {
      console.log('🔐 Auth middleware triggered');
      console.log('📥 Headers:', req.headers);
    }

    const authHeader = req.headers.authorization || req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (isDev) console.log('⛔ Authorization token missing or malformed');
      return res.status(401).json({ message: 'Authorization token missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    if (isDev) console.log('🔑 Token (first 20 chars):', token.substring(0, 20) + '...');

    if (!process.env.JWT_SECRET) {
      console.warn('❗ JWT_SECRET not set in environment variables');
      return res.status(500).json({ message: 'Server configuration error: missing JWT secret' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (isDev) {
      console.log('✅ Token decoded:', {
        id: decoded.id,
        iat: new Date(decoded.iat * 1000).toISOString(),
        exp: new Date(decoded.exp * 1000).toISOString(),
      });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      if (isDev) console.log('❌ User not found for ID:', decoded.id);
      return res.status(401).json({ message: 'Access denied. User not found.' });
    }

    if (isDev) console.log('✅ User authenticated:', { id: user._id, email: user.email });

    req.user = user;
    next();
  } catch (error) {
    console.error('❗ Auth error:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Authentication failed.' });
    }

    if (error.name === 'NotBeforeError') {
      return res.status(401).json({ message: 'Token not active yet.' });
    }

    return res.status(500).json({
      message: 'Authentication error',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
};

export default auth;
