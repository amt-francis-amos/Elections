import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import nodemailer from '../config/nodemailer.js';
import jwt from 'jsonwebtoken';

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

    const normalizedEmail = email.toLowerCase().trim();

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    if (name.length < 2) {
      return res.status(400).json({ success: false, message: "Name must be at least 2 characters long" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }

    const existingEmail = await User.findOne({ email: normalizedEmail });
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

    const adminEmails = ['admin@example.com', 'superadmin@elections.com'];
    const role = adminEmails.includes(normalizedEmail) ? 'admin' : 'voter';

    console.log("✅ Creating user with role:", role); 

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
      userId,
      role,
    });

    const token = generateToken({
      id: user._id,
      name: user.name,
      role: user.role,
      email: user.email,
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Your App" <nsbt@Elections.com>',
      to: user.email,
      subject: "Welcome to Our Platform!",
      html: `
        <div style="font-family: sans-serif; line-height: 1.6">
          <h2>Hello ${user.name},</h2>
          <p>Welcome to our platform! Your account has been successfully created.</p>
          <p><strong>Your User ID is:</strong> <code>${user.userId}</code></p>
          <p><strong>Your Role is:</strong> <code>${user.role}</code></p>
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
      console.error("Failed to send welcome email:", emailErr.message);
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
    const { id, email, password } = req.body;

    console.log("Login attempt:", { id, email }); 

  
    if (!id || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID, email, and password are required" 
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    
    const user = await User.findOne({ 
      userId: id, 
      email: normalizedEmail 
    });

    if (!user) {
      console.log("User not found with ID:", id, "and email:", normalizedEmail);
      return res.status(400).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for user:", id);
      return res.status(400).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

  
    const token = generateToken({
      id: user._id,
      name: user.name,
      role: user.role,
      email: user.email,
    });

    console.log("✅ Login successful for user:", user.name, "Role:", user.role);

   
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
    console.error("Login error:", error);
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
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
      error: error.message,
    });
  }
};