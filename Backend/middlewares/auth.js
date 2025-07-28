import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware triggered');
    console.log('All headers:', req.headers);
    
    
    const token = req.header('Authorization') || req.headers.authorization;
    
    console.log('Raw token:', token);

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

  
    let cleanedToken;
    if (token.startsWith('Bearer ')) {
      cleanedToken = token.replace('Bearer ', '');
    } else {
      cleanedToken = token;
    }

    console.log('Cleaned token:', cleanedToken.substring(0, 20) + '...');

   
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not found in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

   
    const decoded = jwt.verify(cleanedToken, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', { id: decoded.id, iat: decoded.iat, exp: decoded.exp });

    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('User not found for decoded ID:', decoded.id);
      return res.status(401).json({ message: 'Access denied. User not found.' });
    }

    console.log('User authenticated successfully:', user._id, user.email || user.username);
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token is not valid' });
    } else if (error.name === 'NotBeforeError') {
      return res.status(401).json({ message: 'Token not active yet' });
    } else {
      return res.status(500).json({ message: 'Authentication error', error: error.message });
    }
  }
};

export default auth;