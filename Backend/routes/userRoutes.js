import express from 'express';
import {
  registerUser,
  loginUser,
  getAllUsers,
} from '../controllers/userController.js';

import { authenticateToken } from '../middlewares/authenticateToken.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = express.Router();


router.post('/register', registerUser);
router.post('/login', loginUser);


router.get('/users', authenticateToken, authorizeRoles('admin'), getAllUsers);
router.get('/admin-dashboard', authenticateToken, authorizeRoles('admin'), (req, res) => {
  res.json({ message: 'Welcome to the admin dashboard.' });
});


router.get('/voting-area', authenticateToken, authorizeRoles('admin', 'voter'), (req, res) => {
  res.json({ message: 'Voting area accessible by admin and voter.' });
});


router.get('/profile', authenticateToken, (req, res) => {
  res.json({
    message: `Welcome, ${req.user?.name || 'User'}. This is your profile.`,
    user: req.user,
  });
});

export default router;
