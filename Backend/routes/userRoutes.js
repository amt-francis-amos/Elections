import express from 'express';

import {
  registerUser,
  loginUser,
  getAllUsers,
  updateUserProfile,
  uploadProfilePicture,
  removeProfilePicture
} from '../controllers/userController.js';
import auth from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = express.Router();




router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/profile', auth, (req, res) => {
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
});

router.put('/profile', auth, updateUserProfile);
router.post('/logout', auth, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});
router.get('/users', auth, authorizeRoles('admin'), getAllUsers);
router.get('/admin-dashboard', auth, authorizeRoles('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the admin dashboard.',
    user: {
      name: req.user.name,
      role: req.user.role
    }
  });
});
router.get('/voting-area', auth, authorizeRoles('admin', 'voter'), (req, res) => {
  res.json({
    success: true,
    message: 'Voting area accessible by admin and voter.',
    userRole: req.user.role,
    canVote: req.user.role === 'voter' || req.user.role === 'admin'
  });
});


router.post('/upload-profile-picture', auth, upload.single('profilePicture'), uploadProfilePicture);

router.delete('/remove-profile-picture', auth, removeProfilePicture);

export default router;
