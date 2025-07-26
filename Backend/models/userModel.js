import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    unique: true,
    required: true,
  },
  role: {
    type: String,
    default: 'voter',
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
export default User;
                                                                                                                                                                                                                                                                                                                                        