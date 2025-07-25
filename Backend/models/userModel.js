import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: false, unique: true, sparse: true }, 
    password: { type: String, required: true },
    userId: { type: String, required: true, unique: true },
    role: { type: String, enum: ['voter', 'admin'], default: 'voter' }
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;