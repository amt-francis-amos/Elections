
import User from './models/userModel.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixExistingAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const result = await User.updateOne(
      { email: "admin@election.com" },
      { $set: { role: "admin" } }
    );
    
    if (result.matchedCount > 0) {
      console.log("✅ Admin role updated successfully!");
      console.log("Modified documents:", result.modifiedCount);
    } else {
      console.log("❌ Admin user not found with email: admin@election.com");
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing admin role:", error);
    process.exit(1);
  }
};

fixExistingAdmin();