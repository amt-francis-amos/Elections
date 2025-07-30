import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

function generateUserId() {
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `USR-${randomStr}`;
}

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const isValidExt = allowedTypes.test(file.originalname.toLowerCase());
  const isValidMime = allowedTypes.test(file.mimetype);

  if (isValidExt && isValidMime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter
});

const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: 'profile-pictures',
      resource_type: 'image',
      transformation: [
        { width: 300, height: 300, crop: 'fill', gravity: 'face' },
        { quality: 'auto' }
      ],
      ...options
    };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
};

const deleteFromCloudinary = (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    if (name.length < 2) {
      return res.status(400).json({ success: false, message: "Name must be at least 2 characters long" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }

    const existingName = await User.findOne({ name: name.trim() });
    if (existingName) {
      return res.status(400).json({ success: false, message: "Name already taken" });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 12);

    let userId = generateUserId();
    while (await User.findOne({ userId })) {
      userId = generateUserId();
    }

    const normalizedEmail = email.toLowerCase().trim();
    const role = (normalizedEmail === 'admin@election.com' || 
                  normalizedEmail.includes('admin@') || 
                  name.toLowerCase().includes('admin')) ? 'admin' : 'voter';

    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      userId,
      role,
      profilePicture: null,
      cloudinaryPublicId: null,
    };

    const user = await User.create(userData);

    const token = generateToken({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      userId: user.userId,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userId: user.userId,
        role: user.role,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
      token,
    });

  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return res.status(400).json({ success: false, message: "User ID and password are required" });
    }

    const user = await User.findOne({ userId: id });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      userId: user.userId,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userId: user.userId,
        role: user.role,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users,
      total: users.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
      error: error.message,
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userId: user.userId,
        role: user.role,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
      error: error.message,
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: "Name must be at least 2 characters long" 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide a valid email address" 
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const trimmedName = name.trim();

    const existingUser = await User.findOne({ 
      email: normalizedEmail,
      _id: { $ne: req.user.id } 
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is already registered by another user" 
      });
    }

    const existingName = await User.findOne({ 
      name: trimmedName,
      _id: { $ne: req.user.id } 
    });

    if (existingName) {
      return res.status(400).json({ 
        success: false, 
        message: "Name is already taken by another user" 
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    user.name = trimmedName;
    user.email = normalizedEmail;
    await user.save();

    const updatedUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      userId: user.userId,
      role: user.role,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    };

    const newToken = generateToken({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      userId: user.userId,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
      token: newToken
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error updating profile",
      error: error.message,
    });
  }
};

export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(user.cloudinaryPublicId);
      } catch (deleteError) {
        console.error('Error deleting old profile picture from Cloudinary:', deleteError);
      }
    }

    const cloudinaryResult = await uploadToCloudinary(req.file.buffer, {
      public_id: `profile-${user.userId}-${Date.now()}`
    });

    user.profilePicture = cloudinaryResult.secure_url;
    user.cloudinaryPublicId = cloudinaryResult.public_id;
    await user.save();

    const newToken = generateToken({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      userId: user.userId,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    });

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePictureUrl: cloudinaryResult.secure_url,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userId: user.userId,
        role: user.role,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
      token: newToken
    });

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error during image upload',
      error: error.message
    });
  }
};

export const removeProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(user.cloudinaryPublicId);
      } catch (deleteError) {
        console.error('Error deleting profile picture from Cloudinary:', deleteError);
      }
    }

    user.profilePicture = null;
    user.cloudinaryPublicId = null;
    await user.save();

    const newToken = generateToken({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      userId: user.userId,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
    });

    res.status(200).json({ 
      success: true, 
      message: 'Profile picture removed successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userId: user.userId,
        role: user.role,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
      token: newToken
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error removing profile picture',
      error: error.message 
    });
  }
};