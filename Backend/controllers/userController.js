import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import nodemailer from '../config/nodemailer.js';
import jwt from 'jsonwebtoken';


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};


export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    // Basic validations
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

    // Check for existing user with same email or name
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const existingName = await User.findOne({ name: name.trim() });
    if (existingName) {
      return res.status(400).json({ success: false, message: "Name already taken" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
    });

    const token = generateToken(user._id);

    // Send welcome email
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Your App" <no-reply@yourapp.com>',
      to: user.email,
      subject: "Welcome to Our Platform!",
      html: `
        <div style="font-family: sans-serif; line-height: 1.6">
          <h2>Hello ${user.name},</h2>
          <p>Welcome to our platform! Your account has been successfully created.</p>
          <p>We're excited to have you onboard. You can now log in and start using our services.</p>
          <br/>
          <p>Best regards,<br/>The Team</p>
        </div>
      `,
    };

    nodemailer.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("❌ Failed to send welcome email:", err);
      } else {
        console.log("✅ Welcome email sent:", info.response);
      }
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
};



export const loginUser = async (req, res) => {
  try {
    const { id, email } = req.body;

    if (!id || !email) {
      return res.status(400).json({ success: false, message: "ID and email are required" });
    }

    const user = await User.findOne({ _id: id, email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found or credentials invalid" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};
