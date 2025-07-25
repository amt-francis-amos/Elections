import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Better way to handle model re-compilation in development
const User = mongoose.models.User || mongoose.model("User", createUserSchema());

function createUserSchema() {
  const userSchema = new mongoose.Schema(
    {
      username: { 
        type: String, 
        required: [true, 'Username is required'], 
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters']
      },
      password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
      },
      userId: { 
        type: String, 
        required: [true, 'User ID is required'], 
        unique: true,
        trim: true
      },
      role: { 
        type: String, 
        enum: {
          values: ['voter', 'admin'],
          message: 'Role must be either voter or admin'
        }, 
        default: 'voter' 
      }
    },
    { 
      timestamps: true,
      // Add some useful schema options
      toJSON: {
        transform: function(doc, ret) {
          delete ret.password; // Don't return password in JSON
          return ret;
        }
      }
    }
  );

  userSchema.index({ userId: 1 }, { unique: true });
  userSchema.index({ username: 1 }, { unique: true });
  userSchema.index({ role: 1 });


  userSchema.pre('save', async function (next) {
    
    if (!this.isModified('password')) return next();
    
    try {
     
      const hashedPassword = await bcrypt.hash(this.password, 12);
      this.password = hashedPassword;
      next();
    } catch (error) {
      next(error);
    }
  });

  // Instance method to check password
  userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      throw error;
    }
  };

  // Static method to find user by credentials
  userSchema.statics.findByCredentials = async function (username, password) {
    const user = await this.findOne({ username });
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    
    return user;
  };

  return userSchema;
}

export default User;