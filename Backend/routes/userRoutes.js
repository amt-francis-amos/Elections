import express from 'express';
import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  removeProfilePicture,
  upload
} from '../controllers/userController.js';
import auth from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = express.Router();


router.post('/register', registerUser);
router.post('/login', loginUser);


router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);


router.post('/logout', auth, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});


router.post('/upload-profile-picture', auth, upload.single('profilePicture'), uploadProfilePicture);
router.delete('/remove-profile-picture', auth, removeProfilePicture);


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

export default router;