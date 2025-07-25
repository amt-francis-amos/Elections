import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import nodemailer from '../config/nodemailer.js';
import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};


const generateUserId = () => {
  const prefix = "USR";
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}-${random}`;
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
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const existingName = await User.findOne({ name: name.trim() });
    if (existingName) {
      return res.status(400).json({ success: false, message: "Name already taken" });
    }

    const hashed = await bcrypt.hash(password, 12);

   
    let userId = generateUserId();
    while (await User.findOne({ userId })) {
      userId = generateUserId();
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      userId,
    });

    const token = generateToken(user._id);

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Your App" <nsbt@Elections.com>',
      to: user.email,
      subject: "Welcome to Our Platform!",
      html: `
        <div style="font-family: sans-serif; line-height: 1.6">
          <h2>Hello ${user.name},</h2>
          <p>Welcome to our platform! Your account has been successfully created.</p>
          <p><strong>Your User ID is:</strong> <code>${user.userId}</code></p>
          <p>Please keep this ID safe. You may need it for login or support.</p>
          <br/>
          <p>Best regards,<br/>The Team</p>
        </div>
      `,
    };

    try {
      await nodemailer.sendMail(mailOptions);
      console.log("✅ Welcome email sent successfully");
    } catch (emailErr) {
      console.error("❌ Failed to send welcome email:", emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userId: user.userId,
        createdAt: user.createdAt,
      },
      token,
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userId: user.userId,
      },
      token,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};


// Add this to your controller file
export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users but exclude passwords
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      users: users
    });
    
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users"
    });
  }
};