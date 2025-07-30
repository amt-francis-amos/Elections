import express from 'express';
import { registerUser, loginUser, getAllUsers } from '../controllers/userController.js';
import auth from '../middlewares/auth.js'; 
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = express.Router();


router.post('/register', registerUser);
router.post('/login', loginUser);


router.get('/profile', auth, (req, res) => {
  try {
    res.json({
      success: true,
      message: `Welcome, ${req.user.name}. This is your profile.`,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

router.get('/users', auth, authorizeRoles('admin'), getAllUsers);

router.get('/admin-dashboard', auth, authorizeRoles('admin'), (req, res) => {
  try {
    res.json({ 
      success: true,
      message: 'Welcome to the admin dashboard.',
      user: {
        name: req.user.name,
        role: req.user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error accessing admin dashboard',
      error: error.message
    });
  }
});

router.get('/voting-area', auth, authorizeRoles('admin', 'voter'), (req, res) => {
  try {
    res.json({ 
      success: true,
      message: 'Voting area accessible by admin and voter.',
      userRole: req.user.role,
      canVote: req.user.role === 'voter' || req.user.role === 'admin'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error accessing voting area',
      error: error.message
    });
  }
});

router.put('/profile', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Profile update endpoint - implement in userController.js'
  });
});

router.post('/logout', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;