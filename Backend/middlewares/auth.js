import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';  

const auth = async (req, res, next) => {
  try {
 
    const token = req.header('Authorization');

 
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const cleanedToken = token.replace('Bearer ', '');

 
    const decoded = jwt.verify(cleanedToken, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

  
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

  
    req.user = user;

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default auth;
