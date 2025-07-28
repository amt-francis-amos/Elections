import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const auth = async (req, res, next) => {
  try {
    console.log('🔐 Auth middleware triggered');
    console.log('📥 Headers:', req.headers);

    const authHeader = req.headers.authorization || req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('⛔ Authorization token missing or malformed');
      return res.status(401).json({ message: 'Authorization token missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Extracted token:', token.substring(0, 20) + '...');

    if (!process.env.JWT_SECRET) {
      console.warn('JWT_SECRET not set in environment variables');
      return res.status(500).json({ message: 'Server configuration error (missing JWT secret)' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', { id: decoded.id, iat: decoded.iat, exp: decoded.exp });

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.log('User not found for ID:', decoded.id);
      return res.status(401).json({ message: 'Access denied. User not found.' });
    }

    console.log('✅ User authenticated:', user._id, user.email || user.username);
    req.user = user;
    next();
  } catch (error) {
    console.error('❗ Auth error:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Authentication failed.' });
    } else if (error.name === 'NotBeforeError') {
      return res.status(401).json({ message: 'Token not active yet' });
    } else {
      return res.status(500).json({ message: 'Authentication error', error: error.message });
    }
  }
};

export default auth;
