import User from './models/userModel.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixExistingAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
  
    const specificUserResult = await User.updateOne(
      { _id: "6884ff0b92410d7c3c3832b3" },
      { $set: { role: "admin" } }
    );
    
    console.log("✅ Specific user update results:");
    console.log("Matched documents:", specificUserResult.matchedCount);
    console.log("Modified documents:", specificUserResult.modifiedCount);
    

    const emailResult = await User.updateMany(
      { email: "admin@election.com" },
      { $set: { role: "admin" } }
    );
    
    console.log("✅ Admin email update results:");
    console.log("Matched documents:", emailResult.matchedCount);
    console.log("Modified documents:", emailResult.modifiedCount);
    

    const nameResult = await User.updateMany(
      { 
        $or: [
          { name: { $regex: /admin/i } },
          { name: "Super Admin" },
          { email: { $regex: /admin/i } }
        ]
      },
      { $set: { role: "admin" } }
    );
    
    console.log("✅ Admin name update results:");
    console.log("Matched documents:", nameResult.matchedCount);
    console.log("Modified documents:", nameResult.modifiedCount);
    
   
    const adminUsers = await User.find({ role: "admin" }, { password: 0 });
    console.log("✅ Current admin users:", adminUsers.length);
    adminUsers.forEach(admin => {
      console.log(`- ${admin.name} (${admin.email}) - Role: ${admin.role}`);
    });
    
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing admin roles:", error);
    process.exit(1);
  }
};

fixExistingAdmins();