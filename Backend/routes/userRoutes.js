import express from 'express';
import { registerUser, loginUser, getAllUsers } from '../controllers/userController.js';
import { createVoter, getAllVoters, promoteToAdmin, deleteUser } from '../controllers/adminController.js';
import auth from '../middlewares/auth.js'; 
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
import User from '../models/userModel.js';

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


router.post('/admin/create-voter', auth, authorizeRoles('admin'), createVoter);
router.get('/admin/voters', auth, authorizeRoles('admin'), getAllVoters);
router.post('/admin/promote', auth, authorizeRoles('admin'), promoteToAdmin);
router.delete('/admin/users/:id', auth, authorizeRoles('admin'), deleteUser);


router.put('/admin/users/:id', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

   
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters long"
      });
    }

    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address"
        });
      }

     
      const existingEmail = await User.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: id }
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already taken by another user"
        });
      }
    }


    const existingName = await User.findOne({ 
      name: name.trim(),
      _id: { $ne: id }
    });
    if (existingName) {
      return res.status(400).json({
        success: false,
        message: "Name already taken by another user"
      });
    }


    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    
    if (user._id.toString() === req.user.id.toString() && role && role !== user.role) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role"
      });
    }

   
    user.name = name.trim();
    if (email && email.trim()) {
      user.email = email.toLowerCase().trim();
    }
    if (role && ['voter', 'admin'].includes(role)) {
      user.role = role;
    }

    await user.save();

    console.log(`✅ User updated by admin ${req.user.name}:`, user.name);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userId: user.userId,
        role: user.role,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error("Update user error:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating user",
      error: error.message
    });
  }
});


router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;


    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters long"
      });
    }

    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address"
        });
      }

     
      const existingEmail = await User.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: userId }
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already taken"
        });
      }
    }

   
    const existingName = await User.findOne({ 
      name: name.trim(),
      _id: { $ne: userId }
    });
    if (existingName) {
      return res.status(400).json({
        success: false,
        message: "Name already taken"
      });
    }

    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.name = name.trim();
    if (email && email.trim()) {
      user.email = email.toLowerCase().trim();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userId: user.userId,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
      error: error.message
    });
  }
});

router.post('/logout', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;