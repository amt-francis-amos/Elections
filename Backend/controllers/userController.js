
import User from '../models/userModel.js'
import bcrypt from 'bcrypt'
import nodemailer from '../config/nodemailer.js'

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
      `
    };

    nodemailer.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("❌ Failed to send welcome email:", err);
      } else {
        console.log("✅ Welcome email sent:", info.response);
      }
    });

 
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
