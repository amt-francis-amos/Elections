import User from './models/userModel.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixExistingAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
   
    const result = await User.updateMany(
      { email: "admin@election.com" },
      { $set: { role: "admin" } }
    );
    
    console.log("✅ Admin role update results:");
    console.log("Matched documents:", result.matchedCount);
    console.log("Modified documents:", result.modifiedCount);
    
   
    const superAdminResult = await User.updateMany(
      { 
        $or: [
          { name: { $regex: /admin/i } },
          { name: "Super Admin" },
          { email: { $regex: /admin/i } }
        ]
      },
      { $set: { role: "admin" } }
    );
    
    console.log("✅ Super Admin role update results:");
  
    const adminUsers = await User.find({ role: "admin" }, { password: 0 });
    console.log("✅ Current admin users:", adminUsers);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing admin roles:", error);
    process.exit(1);
  }
};

fixExistingAdmins();