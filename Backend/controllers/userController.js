import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import nodemailer from '../config/nodemailer.js';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (name.length < 2 || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters and password at least 6 characters"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      userId,
    });

    const token = generateToken(user._id);

    // Send welcome email
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"App" <no-reply@app.com>',
      to: user.email,
      subject: "Welcome!",
      html: `<h2>Welcome ${user.name}!</h2><p>Your account was created successfully.</p>`,
    };

    try {
      await nodemailer.sendMail(mailOptions);
    } catch (emailErr) {
      console.error("Failed to send email:", emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: "User registered",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userId: user.userId,
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Server error" });
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
    res.status(500).json({ success: false, message: "Server error" });
  }
};
