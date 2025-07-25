import mongoose from "mongoose";

if (mongoose.models.User) {
  delete mongoose.models.User;
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userId: { type: String, required: true, unique: true },
    role: { type: String, enum: ['voter', 'admin'], default: 'voter' }
  },
  { timestamps: true }
);

userSchema.index({ userId: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
export default User;