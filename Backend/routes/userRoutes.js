import express from 'express';
import { registerUser, loginUser, getAllUsers } from '../controllers/userController.js';
import { auth } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', auth, authorizeRoles('admin'), getAllUsers);

router.get('/profile', auth, (req, res) => {
 res.json({
   message: `Welcome, ${req.user.name}. This is your profile.`,
   user: req.user,
 });
});

router.get('/admin-dashboard', authenticateToken, authorizeRoles('admin'), (req, res) => {
 res.json({ message: 'Welcome to the admin dashboard.' });
});

router.get('/voting-area', authenticateToken, authorizeRoles('admin', 'voter'), (req, res) => {
 res.json({ message: 'Voting area accessible by admin and voter.' });
});

export default router;