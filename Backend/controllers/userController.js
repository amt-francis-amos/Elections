import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from '../config/nodemailer.js';

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

function generateUserId() {
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `USR-${randomStr}`;
}

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, email, and password are required" 
      });
    }

    if (name.length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: "Name must be at least 2 characters long" 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide a valid email address" 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters long" 
      });
    }

    const existingName = await User.findOne({ name: name.trim() });
    if (existingName) {
      return res.status(400).json({ 
        success: false, 
        message: "Name already taken" 
      });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already registered" 
      });
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
      email: normalizedEmail,
      password: hashed,
      userId,
      role,
    };

    const user = await User.create(userData);

    const token = generateToken({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    if (email && email.trim()) {
      const mailOptions = {
        from: `"Election Platform" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Your Voter Account Credentials",
        html: `
          <h2>Welcome, ${user.name}</h2>
          <p>Your voter account has been created. Use the following credentials to log in:</p>
          <ul>
            <li><strong>User ID:</strong> ${userId}</li>
            <li><strong>Password:</strong> ${password}</li>
          </ul>
          <p>Please keep your credentials safe and secure.</p>
          <p>Thank you.</p>
        `
      };

      try {
        await nodemailer.sendMail(mailOptions);
      } catch (emailError) {
        console.error("Email sending error:", emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userId: user.userId,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    });

  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const fieldName = field === 'email' ? 'Email' : field;
      return res.status(400).json({
        success: false,
        message: `${fieldName} already exists`,
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
      return res.status(400).json({ 
        success: false, 
        message: "User ID and password are required" 
      });
    }

    const user = await User.findOne({ userId: id });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    const token = generateToken({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
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
    const users = await User.find({}, {
      password: 0 
    }).sort({ createdAt: -1 });

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
