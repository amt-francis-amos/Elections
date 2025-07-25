

import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import connectDb from '../config/connectDb.js';  
import User from '../models/userModel.js';       

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDb();

    const existingAdmin = await User.findOne({ email: 'admin@election.com' });
    if (existingAdmin) {
      console.log("🚫 Admin already exists.");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    const adminUser = new User({
      name: 'Super Admin',
      email: 'admin@election.com',
      password: hashedPassword,
      userId: 'USR-ADMIN001',
      role: 'admin',
    });

    await adminUser.save();
    console.log("✅ Admin created successfully.");
    process.exit();
  } catch (error) {
    console.error("❌ Failed to create admin:", error.message);
    process.exit(1);
  }
};

createAdmin();
