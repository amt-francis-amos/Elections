import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const loginAttempts = new Map();

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
  
};

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const checkRateLimit = (ip, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const now = Date.now();
  const info = loginAttempts.get(ip) || { count: 0, resetTime: now + windowMs };
  if (now > info.resetTime) {
    info.count = 0;
    info.resetTime = now + windowMs;
  }
  if (info.count >= maxAttempts) {
    return { allowed: false, resetTime: info.resetTime };
  }
  info.count++;
  loginAttempts.set(ip, info);
  return { allowed: true, attemptsLeft: maxAttempts - info.count };
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }
    
    if (name.length < 2) {
      return res.status(400).json({ success: false, message: "Name must be at least 2 characters long" });
    }
    
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }
    
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ 
      name: name.trim(), 
      email: email.toLowerCase().trim(), 
      password: hashed 
    });
    
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        createdAt: user.createdAt, 
        profilePicture: user.profilePicture 
      },
      token
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    const rate = checkRateLimit(ip);
    if (!rate.allowed) {
      const mins = Math.ceil((rate.resetTime - Date.now()) / 60000);
      return res.status(429).json({ 
        success: false, 
        message: `Too many login attempts. Try again in ${mins} minutes.` 
      });
    }
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    }
    
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    
    loginAttempts.delete(ip);
    user.lastLogin = new Date();
    await user.save();
    
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      message: "Login successful",
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        lastLogin: user.lastLogin, 
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching profile" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const id = req.user._id;
    
    if (!name && !email) {
      return res.status(400).json({ success: false, message: "At least one field is required" });
    }
    
    const data = {};
    if (name) {
      if (name.length < 2) {
        return res.status(400).json({ success: false, message: "Name must be at least 2 characters long" });
      }
      data.name = name.trim();
    }
    
    if (email) {
      if (!validateEmail(email)) {
        return res.status(400).json({ success: false, message: "Please enter a valid email address" });
      }
      const other = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: id } });
      if (other) {
        return res.status(400).json({ success: false, message: "Email already taken by another user" });
      }
      data.email = email.toLowerCase().trim();
    }
    
    const user = await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Server error while updating profile" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const id = req.user._id;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Current password and new password are required" 
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "New password must be at least 6 characters long" 
      });
    }
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }
    
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    
    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ success: false, message: "Server error while changing password" });
  }
};


export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No image file provided" 
      });
    }

   
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed." 
      });
    }

    
    const maxSize = 5 * 1024 * 1024; 
    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        success: false, 
        message: "File too large. Maximum size allowed is 5MB." 
      });
    }

   
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const bufferStream = streamifier.createReadStream(req.file.buffer);
    
    const streamUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { 
            folder: "profile_pictures", 
            resource_type: "image",
            public_id: `user_${req.user._id}_${Date.now()}`, 
            transformation: [
              { 
                width: 400, 
                height: 400, 
                crop: "fill", 
                gravity: "face", 
                quality: "auto:good" 
              },
              { format: "auto" } 
            ],
          
            invalidate: true, 
            overwrite: true,
            notification_url: null 
          }, 
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(new Error(`Image upload failed: ${error.message}`));
            } else {
              resolve(result);
            }
          }
        );
        
      
        bufferStream.on('error', (error) => {
          console.error("Stream error:", error);
          reject(new Error('File processing failed'));
        });
        
        bufferStream.pipe(stream);
      });
    };

   
    const uploadResult = await streamUpload();
    

    if (currentUser.profilePicture) {
      try {
      
        const urlParts = currentUser.profilePicture.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicId = `profile_pictures/${filename.split('.')[0]}`;
        
        await cloudinary.uploader.destroy(publicId);
        console.log(`Old profile picture deleted: ${publicId}`);
      } catch (deleteError) {
        console.warn("Could not delete old profile picture:", deleteError.message);
       
      }
    }
    
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, 
      { 
        profilePicture: uploadResult.secure_url,
        profilePicturePublicId: uploadResult.public_id
      }, 
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
     
      try {
        await cloudinary.uploader.destroy(uploadResult.public_id);
      } catch (cleanupError) {
        console.error("Failed to cleanup uploaded image:", cleanupError);
      }
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
   
    res.json({
      success: true,
      message: "Profile picture uploaded successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
        createdAt: updatedUser.createdAt,
        lastLogin: updatedUser.lastLogin
      }
    });

  } catch (error) {
    console.error("Profile picture upload error:", error);
    
    
    let errorMessage = "Server error while uploading profile picture";
    
    if (error.message.includes('Invalid image')) {
      errorMessage = "Invalid image file";
    } else if (error.message.includes('File too large')) {
      errorMessage = "File size exceeds maximum limit";
    } else if (error.message.includes('upload failed')) {
      errorMessage = "Image upload service temporarily unavailable";
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage 
    });
  }
};